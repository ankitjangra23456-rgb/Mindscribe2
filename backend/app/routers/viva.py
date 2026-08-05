from typing import List
from fastapi import APIRouter, Depends, HTTPException, status  # pyrefly: ignore [missing-import] # type: ignore
from sqlalchemy.orm import Session  # pyrefly: ignore [missing-import] # type: ignore

from app.database import get_db  # pyrefly: ignore [missing-import] # type: ignore
from app.models.attempt import Attempt, AttemptAnswer  # pyrefly: ignore [missing-import] # type: ignore
from app.models.question import Question  # pyrefly: ignore [missing-import] # type: ignore
from app.models.viva import VivaSession, VivaQuestion  # pyrefly: ignore [missing-import] # type: ignore
from app.models.viva_scoring import VivaResponse  # pyrefly: ignore [missing-import] # type: ignore
from app.models.user import User  # pyrefly: ignore [missing-import] # type: ignore
from app.schemas.viva import VivaSessionResponse  # pyrefly: ignore [missing-import] # type: ignore
from app.schemas.viva_scoring import VivaReplyRequest, VivaResponseResult  # pyrefly: ignore [missing-import] # type: ignore
from app.core.dependencies import get_current_user  # pyrefly: ignore [missing-import] # type: ignore

router = APIRouter(prefix="/api/viva", tags=["AI Viva Engine"])

@router.post("/generate/{attempt_id}", response_model=VivaSessionResponse, status_code=status.HTTP_201_CREATED)
def trigger_viva_generation(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt session not found")

    existing_session = db.query(VivaSession).filter(VivaSession.attempt_id == attempt_id).first()
    if existing_session:
        return existing_session

    new_session = VivaSession(
        attempt_id=attempt.id,
        student_id=attempt.student_id,
        status="in_progress"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    subjective_answers = db.query(AttemptAnswer).join(Question).filter(
        AttemptAnswer.attempt_id == attempt_id,
        Question.question_type == "subjective"
    ).all()

    for ans in subjective_answers:
        if ans.text_answer and ans.text_answer.strip():
            followup = generate_viva_followup(
                question_prompt=ans.question.text,
                student_answer=ans.text_answer
            )
            v_q = VivaQuestion(
                viva_session_id=new_session.id,
                original_question_id=ans.question_id,
                subjective_answer_text=ans.text_answer,
                generated_followup_prompt=followup
            )
            db.add(v_q)

    db.commit()
    db.refresh(new_session)
    return new_session

@router.post("/reply", response_model=VivaResponseResult, status_code=status.HTTP_201_CREATED)
def submit_viva_reply(
    req: VivaReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    viva_q = db.query(VivaQuestion).filter(VivaQuestion.id == req.viva_question_id).first()
    if not viva_q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viva question prompt not found")

    # Compute semantic consistency between original subjective answer and viva reply
    consistency_score = calculate_semantic_consistency(
        original_answer=viva_q.subjective_answer_text,
        viva_reply=req.student_viva_reply
    )

    new_response = VivaResponse(
        viva_question_id=viva_q.id,
        student_viva_reply=req.student_viva_reply,
        consistency_score=consistency_score
    )
    db.add(new_response)
    db.commit()
    db.refresh(new_response)

    return new_response

@router.get("/session/{attempt_id}", response_model=VivaSessionResponse)
def get_viva_session(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_permissions = {p.name for r in current_user.roles for p in r.permissions}
    query = db.query(VivaSession).filter(VivaSession.attempt_id == attempt_id)
    if "results:view_all" not in user_permissions:
        query = query.filter(VivaSession.student_id == current_user.id)

    session = query.first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viva session not found or access denied")
    return session
