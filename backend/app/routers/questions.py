from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query  # pyrefly: ignore [missing-import] # type: ignore
from sqlalchemy.orm import Session  # pyrefly: ignore [missing-import] # type: ignore

from app.database import get_db  # pyrefly: ignore [missing-import] # type: ignore
from app.models.question import Question, QuestionOption  # pyrefly: ignore [missing-import] # type: ignore
from app.models.user import User  # pyrefly: ignore [missing-import] # type: ignore
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse  # pyrefly: ignore [missing-import] # type: ignore
from app.core.dependencies import require_permission  # pyrefly: ignore [missing-import] # type: ignore

router = APIRouter(prefix="/api/questions", tags=["Question Bank CRUD"])

@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    q_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("question:manage"))
):
    new_q = Question(
        text=q_in.text,
        question_type=q_in.question_type,
        difficulty=q_in.difficulty,
        marks=q_in.marks
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)

    # If objective type and options provided, add options
    if q_in.question_type == "objective" and q_in.options:
        for opt in q_in.options:
            new_opt = QuestionOption(
                question_id=new_q.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct
            )
            db.add(new_opt)
        db.commit()
        db.refresh(new_q)

    return new_q

@router.get("", response_model=List[QuestionResponse])
def list_questions(
    question_type: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("question:manage"))
):
    query = db.query(Question)
    if question_type:
        query = query.filter(Question.question_type == question_type)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    
    return query.all()

@router.get("/{q_id}", response_model=QuestionResponse)
def get_question(
    q_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("question:manage"))
):
    q = db.query(Question).filter(Question.id == q_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return q

@router.put("/{q_id}", response_model=QuestionResponse)
def update_question(
    q_id: int,
    q_in: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("question:manage"))
):
    q = db.query(Question).filter(Question.id == q_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    if q_in.text is not None:
        q.text = q_in.text
    if q_in.question_type is not None:
        q.question_type = q_in.question_type
    if q_in.difficulty is not None:
        q.difficulty = q_in.difficulty
    if q_in.marks is not None:
        q.marks = q_in.marks

    if q_in.options is not None:
        # Clear existing options and set new ones
        db.query(QuestionOption).filter(QuestionOption.question_id == q.id).delete()
        for opt in q_in.options:
            new_opt = QuestionOption(
                question_id=q.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct
            )
            db.add(new_opt)

    db.commit()
    db.refresh(q)
    return q

@router.delete("/{q_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    q_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("question:manage"))
):
    q = db.query(Question).filter(Question.id == q_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    db.delete(q)
    db.commit()
    return None
