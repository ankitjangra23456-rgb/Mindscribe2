from typing import List
from fastapi import APIRouter, Depends, HTTPException, status  # pyrefly: ignore [missing-import] # type: ignore
from sqlalchemy.orm import Session  # pyrefly: ignore [missing-import] # type: ignore

from app.database import get_db  # pyrefly: ignore [missing-import] # type: ignore
from app.models.ledger import PaperLedger  # pyrefly: ignore [missing-import] # type: ignore
from app.models.user import User  # pyrefly: ignore [missing-import] # type: ignore
from app.schemas.ledger import LedgerLogRequest, LedgerRecordResponse  # pyrefly: ignore [missing-import] # type: ignore
from app.core.dependencies import get_current_user, require_permission  # pyrefly: ignore [missing-import] # type: ignore
from app.services.ledger_service import log_paper_ledger_event, verify_paper_ledger_chain  # pyrefly: ignore [missing-import] # type: ignore

router = APIRouter(prefix="/api/ledger", tags=["Paper Hash-Chain Ledger"])

@router.post("/log", response_model=LedgerRecordResponse, status_code=status.HTTP_201_CREATED)
def create_ledger_event(
    req: LedgerLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = log_paper_ledger_event(
        db=db,
        event_type=req.event_type,
        exam_id=req.exam_id,
        actor_user_id=current_user.id,
        payload_data=req.payload_data
    )
    return record

@router.get("/verify")
def verify_ledger_integrity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("results:view_all"))
):
    result = verify_paper_ledger_chain(db)
    return result

@router.get("/records", response_model=List[LedgerRecordResponse])
def get_ledger_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("results:view_all"))
):
    records = db.query(PaperLedger).order_by(PaperLedger.id.asc()).all()
    return records
