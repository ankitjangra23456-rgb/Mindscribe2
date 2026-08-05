import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pwa_sync import OfflineSyncQueue
from app.models.user import User
from app.schemas.pwa_sync import OfflineSyncPayload, OfflineSyncResponse
from app.core.dependencies import RoleChecker

router = APIRouter(prefix="/api/sync", tags=["Offline PWA Sync"])

@router.post("/queue", response_model=OfflineSyncResponse, status_code=status.HTTP_201_CREATED)
def push_offline_sync(
    item: OfflineSyncPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Student", "Admin"]))
):
    json_data = json.dumps(item.payload)

    sync_record = OfflineSyncQueue(
        student_id=current_user.id,
        attempt_id=item.attempt_id,
        payload_json=json_data,
        status="synced",
        synced_at=datetime.utcnow()
    )
    db.add(sync_record)
    db.commit()
    db.refresh(sync_record)

    return sync_record

@router.get("/queue", response_model=List[OfflineSyncResponse])
def get_my_sync_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Student", "Admin"]))
):
    records = db.query(OfflineSyncQueue).filter(OfflineSyncQueue.student_id == current_user.id).all()
    return records
