from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.telemetry import TelemetrySubmitRequest, TelemetryRecordResponse
from app.core.dependencies import get_current_user
from app.services.telemetry_service import record_attempt_telemetry

router = APIRouter(prefix="/api/telemetry", tags=["Keystroke & Mouse Telemetry"])

@router.post("/record/{attempt_id}", response_model=TelemetryRecordResponse)
def record_telemetry_event(
    attempt_id: int,
    req: TelemetrySubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = record_attempt_telemetry(
        db=db,
        attempt_id=attempt_id,
        flight_times=req.flight_times_ms,
        mouse_dist=req.mouse_distance_px
    )
    return record
