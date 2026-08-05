from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sci import SkillConfidenceRecord
from app.models.user import User
from app.schemas.sci import SkillConfidenceRecordResponse
from app.core.dependencies import get_current_user, RoleChecker
from app.services.sci_engine import calculate_sci_for_attempt

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

@router.get("/attempt/{attempt_id}", response_model=SkillConfidenceRecordResponse)
def get_sci_for_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(SkillConfidenceRecord).filter(SkillConfidenceRecord.attempt_id == attempt_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SCI record not computed for this attempt yet")
    return record

@router.get("/exam/{exam_id}", response_model=List[SkillConfidenceRecordResponse])
def list_sci_records_for_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin", "Faculty", "Recruiter"]))
):
    records = db.query(SkillConfidenceRecord).filter(SkillConfidenceRecord.exam_id == exam_id).all()
    return records
