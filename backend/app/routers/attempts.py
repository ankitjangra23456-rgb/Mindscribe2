from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status  # pyrefly: ignore [missing-import] # type: ignore
from sqlalchemy.orm import Session  # pyrefly: ignore [missing-import] # type: ignore

from app.database import get_db  # pyrefly: ignore [missing-import] # type: ignore
from app.models.exam import Exam  # pyrefly: ignore [missing-import] # type: ignore
from app.models.question import Question, QuestionOption  # pyrefly: ignore [missing-import] # type: ignore
from app.models.attempt import Attempt, AttemptAnswer  # pyrefly: ignore [missing-import] # type: ignore
from app.models.adaptive import AdaptiveStateLog  # pyrefly: ignore [missing-import] # type: ignore
from app.models.user import User  # pyrefly: ignore [missing-import] # type: ignore
from app.schemas.attempt import AttemptStartResponse, AttemptSubmitRequest, AttemptResultResponse  # pyrefly: ignore [missing-import] # type: ignore
from app.schemas.adaptive import SingleQuestionEvaluateRequest, AdaptiveLogResponse  # pyrefly: ignore [missing-import] # type: ignore
from app.core.dependencies import get_current_user, require_permission  # pyrefly: ignore [missing-import] # type: ignore
from app.services.adaptive_engine import log_adaptive_shift  # pyrefly: ignore [missing-import] # type: ignore

router = APIRouter(prefix="/api/attempts", tags=["Exam Delivery & Attempts"])

@router.post("/start/{exam_id}", response_model=AttemptStartResponse, status_code=status.HTTP_201_CREATED)
def start_exam_attempt(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    now = datetime.utcnow()
    if now < exam.start_time or now > exam.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Exam is not currently active. Available window: {exam.start_time} to {exam.end_time}"
        )

    existing_attempt = db.query(Attempt).filter(
        Attempt.exam_id == exam_id,
        Attempt.student_id == current_user.id,
        Attempt.is_submitted == False
    ).first()

    if existing_attempt:
        return AttemptStartResponse(
            attempt_id=existing_attempt.id,
            exam_id=exam.id,
            start_time=existing_attempt.start_time,
            duration_minutes=exam.duration_minutes,
            questions=exam.questions
        )

    new_attempt = Attempt(
        exam_id=exam.id,
        student_id=current_user.id,
        start_time=now,
        is_submitted=False,
        status="in_progress"
    )
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)

    return AttemptStartResponse(
        attempt_id=new_attempt.id,
        exam_id=exam.id,
        start_time=new_attempt.start_time,
        duration_minutes=exam.duration_minutes,
        questions=exam.questions
    )

@router.post("/{attempt_id}/evaluate-question", response_model=AdaptiveLogResponse)
def evaluate_single_question_adaptive(
    attempt_id: int,
    req: SingleQuestionEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = db.query(Attempt).filter(
        Attempt.id == attempt_id,
        Attempt.student_id == current_user.id
    ).first()

    if not attempt or attempt.is_submitted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or completed attempt session")

    question = db.query(Question).filter(Question.id == req.question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    is_correct = False
    if question.question_type == "objective" and req.selected_option_id:
        selected_opt = db.query(QuestionOption).filter(QuestionOption.id == req.selected_option_id).first()
        if selected_opt and selected_opt.is_correct:
            is_correct = True

    log_entry = log_adaptive_shift(
        db=db,
        attempt_id=attempt.id,
        question_id=question.id,
        is_correct=is_correct,
        current_difficulty=question.difficulty
    )

    return log_entry

@router.get("/{attempt_id}/adaptive-logs", response_model=List[AdaptiveLogResponse])
def get_attempt_adaptive_logs(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_permissions = {p.name for r in current_user.roles for p in r.permissions}
    query = db.query(AdaptiveStateLog).join(Attempt).filter(AdaptiveStateLog.attempt_id == attempt_id)
    if "results:view_all" not in user_permissions:
        query = query.filter(Attempt.student_id == current_user.id)
    logs = query.order_by(AdaptiveStateLog.timestamp.asc()).all()
    return logs

@router.post("/{attempt_id}/submit", response_model=AttemptResultResponse)
def submit_exam_attempt(
    attempt_id: int,
    submit_in: AttemptSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = db.query(Attempt).filter(
        Attempt.id == attempt_id,
        Attempt.student_id == current_user.id
    ).first()

    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt session not found")

    if attempt.is_submitted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attempt has already been submitted")

    total_obj_score = 0.0
    total_obj_possible = 0.0

    db.query(AttemptAnswer).filter(AttemptAnswer.attempt_id == attempt.id).delete()

    for ans_item in submit_in.answers:
        q = db.query(Question).filter(Question.id == ans_item.question_id).first()
        if not q:
            continue

        is_correct = None
        marks_obtained = 0.0

        if q.question_type == "objective":
            total_obj_possible += float(q.marks)
            if ans_item.selected_option_id:
                selected_opt = db.query(QuestionOption).filter(QuestionOption.id == ans_item.selected_option_id).first()
                if selected_opt and selected_opt.is_correct:
                    is_correct = True
                    marks_obtained = float(q.marks)
                    total_obj_score += marks_obtained
                else:
                    is_correct = False
                    marks_obtained = 0.0

        log_adaptive_shift(
            db=db,
            attempt_id=attempt.id,
            question_id=q.id,
            is_correct=bool(is_correct),
            current_difficulty=q.difficulty
        )

        answer_record = AttemptAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            selected_option_id=ans_item.selected_option_id,
            text_answer=ans_item.text_answer,
            is_correct=is_correct,
            marks_obtained=marks_obtained
        )
        db.add(answer_record)

    attempt.is_submitted = True
    attempt.submit_time = datetime.utcnow()
    attempt.objective_score = total_obj_score
    attempt.total_objective_marks = total_obj_possible
    attempt.status = "completed"

    db.commit()
    db.refresh(attempt)
    return attempt

@router.get("/student/me", response_model=List[AttemptResultResponse])
def get_my_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("results:view_own"))
):
    attempts = db.query(Attempt).filter(Attempt.student_id == current_user.id).all()
    return attempts

@router.get("/{attempt_id}", response_model=AttemptResultResponse)
def get_attempt_detail(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_permissions = {p.name for r in current_user.roles for p in r.permissions}
    query = db.query(Attempt).filter(Attempt.id == attempt_id)
    if "results:view_all" not in user_permissions:
        query = query.filter(Attempt.student_id == current_user.id)

    attempt = query.first()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found or access denied")
    return attempt
