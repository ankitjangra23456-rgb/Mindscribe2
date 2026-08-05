from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdaptiveLogResponse(BaseModel):
    id: int
    attempt_id: int
    question_id: int
    is_correct: bool
    previous_difficulty: str
    next_difficulty: str
    shift_reason: str
    timestamp: datetime

    class Config:
        from_attributes = True

class SingleQuestionEvaluateRequest(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    text_answer: Optional[str] = None
