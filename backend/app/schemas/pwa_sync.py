from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class OfflineSyncPayload(BaseModel):
    attempt_id: int
    payload: Any

class OfflineSyncResponse(BaseModel):
    id: int
    attempt_id: int
    status: str
    created_at: datetime
    synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True
