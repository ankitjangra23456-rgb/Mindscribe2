from pydantic import BaseModel
from datetime import datetime

class LedgerLogRequest(BaseModel):
    event_type: str  # PAPER_GENERATE | PAPER_ACCESS | PAPER_SUBMIT
    exam_id: int
    payload_data: str

class LedgerRecordResponse(BaseModel):
    id: int
    event_type: str
    exam_id: int
    actor_user_id: int
    previous_hash: str
    current_hash: str
    payload_data: str
    timestamp: datetime

    class Config:
        from_attributes = True
