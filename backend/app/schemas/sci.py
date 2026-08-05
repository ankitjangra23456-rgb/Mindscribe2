from pydantic import BaseModel
from datetime import datetime

class SkillConfidenceRecordResponse(BaseModel):
    id: int
    attempt_id: int
    student_id: int
    exam_id: int
    ep_score: float
    vp_score: float
    delta_gap: float
    sci_score: float
    alpha: float
    beta: float
    gamma: float
    created_at: datetime

    class Config:
        from_attributes = True
