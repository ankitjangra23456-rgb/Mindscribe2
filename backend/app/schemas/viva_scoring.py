from pydantic import BaseModel
from datetime import datetime

class VivaReplyRequest(BaseModel):
    viva_question_id: int
    student_viva_reply: str

class VivaResponseResult(BaseModel):
    id: int
    viva_question_id: int
    student_viva_reply: str
    consistency_score: float
    created_at: datetime

    class Config:
        from_attributes = True
