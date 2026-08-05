from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class VivaQuestionResponse(BaseModel):
    id: int
    original_question_id: int
    subjective_answer_text: str
    generated_followup_prompt: str
    created_at: datetime

    class Config:
        from_attributes = True

class VivaSessionResponse(BaseModel):
    id: int
    attempt_id: int
    student_id: int
    status: str
    created_at: datetime
    viva_questions: List[VivaQuestionResponse] = []

    class Config:
        from_attributes = True
