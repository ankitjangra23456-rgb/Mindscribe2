from typing import List
from fastapi import APIRouter, Depends, HTTPException, status  # pyrefly: ignore [missing-import] # type: ignore
from sqlalchemy.orm import Session  # pyrefly: ignore [missing-import] # type: ignore

from app.database import get_db  # pyrefly: ignore [missing-import] # type: ignore
from app.models.exam import Exam  # pyrefly: ignore [missing-import] # type: ignore
from app.models.question import Question  # pyrefly: ignore [missing-import] # type: ignore
from app.models.user import User  # pyrefly: ignore [missing-import] # type: ignore
from app.schemas.exam import ExamCreate, ExamUpdate, ExamResponse  # pyrefly: ignore [missing-import] # type: ignore
from app.core.dependencies import get_current_user, require_permission  # pyrefly: ignore [missing-import] # type: ignore
from app.core.audit import log_audit_event  # pyrefly: ignore [missing-import] # type: ignore

router = APIRouter(prefix="/api/exams", tags=["Exam Scheduling CRUD"])

@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_exam(
    exam_in: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("exam:create"))
):
    if exam_in.end_time <= exam_in.start_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End time must be after start time")

    # Fetch associated questions
    questions = []
    if exam_in.question_ids:
        questions = db.query(Question).filter(Question.id.in_(exam_in.question_ids)).all()

    new_exam = Exam(
        title=exam_in.title,
        description=exam_in.description,
        start_time=exam_in.start_time,
        end_time=exam_in.end_time,
        duration_minutes=exam_in.duration_minutes,
        created_by=current_user.id,
        alpha=exam_in.alpha,
        beta=exam_in.beta,
        gamma=exam_in.gamma
    )
    new_exam.questions = questions

    db.add(new_exam)
    log_audit_event(db, action=f"EXAM_CREATE: {new_exam.title}", user_id=current_user.id)
    db.commit()
    db.refresh(new_exam)
    return new_exam

@router.get("", response_model=List[ExamResponse])
def list_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exams = db.query(Exam).order_by(Exam.start_time.desc()).all()
    return exams

@router.get("/{exam_id}", response_model=ExamResponse)
def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    return exam

@router.put("/{exam_id}", response_model=ExamResponse)
def update_exam(
    exam_id: int,
    exam_in: ExamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("exam:create"))
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    if exam_in.title is not None:
        exam.title = exam_in.title
    if exam_in.description is not None:
        exam.description = exam_in.description
    if exam_in.start_time is not None:
        exam.start_time = exam_in.start_time
    if exam_in.end_time is not None:
        exam.end_time = exam_in.end_time
    if exam_in.duration_minutes is not None:
        exam.duration_minutes = exam_in.duration_minutes
    if exam_in.alpha is not None:
        exam.alpha = exam_in.alpha
    if exam_in.beta is not None:
        exam.beta = exam_in.beta
    if exam_in.gamma is not None:
        exam.gamma = exam_in.gamma

    if exam_in.question_ids is not None:
        questions = db.query(Question).filter(Question.id.in_(exam_in.question_ids)).all()
        exam.questions = questions

    db.commit()
    db.refresh(exam)
    return exam

@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("exam:create"))
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    db.delete(exam)
    db.commit()
    return None
