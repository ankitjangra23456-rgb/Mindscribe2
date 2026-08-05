from typing import List
from fastapi import APIRouter, Depends, HTTPException, status  # pyrefly: ignore [missing-import] # type: ignore
from sqlalchemy.orm import Session  # pyrefly: ignore [missing-import] # type: ignore

from app.database import get_db  # pyrefly: ignore [missing-import] # type: ignore
from app.models.sci import SkillConfidenceRecord  # pyrefly: ignore [missing-import] # type: ignore
from app.models.user import User  # pyrefly: ignore [missing-import] # type: ignore
from app.schemas.sci import SkillConfidenceRecordResponse  # pyrefly: ignore [missing-import] # type: ignore
from app.core.dependencies import get_current_user, require_permission  # pyrefly: ignore [missing-import] # type: ignore
from app.services.sci_engine import calculate_sci_for_attempt  # pyrefly: ignore [missing-import] # type: ignore

router = APIRouter(prefix="/api/sci", tags=["SCI Engine"])

@router.post("/calculate/{attempt_id}", response_model=SkillConfidenceRecordResponse)
def compute_sci_endpoint(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        record = calculate_sci_for_attempt(db, attempt_id)
        return record
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

from app.models.attempt import Attempt

@router.get("/attempt/{attempt_id}", response_model=SkillConfidenceRecordResponse)
def get_sci_for_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_permissions = {p.name for r in current_user.roles for p in r.permissions}
    query = db.query(SkillConfidenceRecord).join(Attempt).filter(SkillConfidenceRecord.attempt_id == attempt_id)
    if "results:view_all" not in user_permissions:
        query = query.filter(Attempt.student_id == current_user.id)

    record = query.first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SCI record not found or access denied")
    return record

@router.get("/exam/{exam_id}", response_model=List[SkillConfidenceRecordResponse])
def list_sci_records_for_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("results:view_all"))
):
    records = db.query(SkillConfidenceRecord).filter(SkillConfidenceRecord.exam_id == exam_id).all()
    return records
