from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.question import QuestionResponse

class AnswerSubmitItem(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    text_answer: Optional[str] = None

class AttemptSubmitRequest(BaseModel):
    answers: List[AnswerSubmitItem]

class AttemptAnswerResponse(BaseModel):
    id: int
    question_id: int
    selected_option_id: Optional[int] = None
    text_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    marks_obtained: float

    class Config:
        from_attributes = True

class AttemptStartResponse(BaseModel):
    attempt_id: int
    exam_id: int
    start_time: datetime
    duration_minutes: int
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True

class AttemptResultResponse(BaseModel):
    attempt_id: int
    exam_id: int
    student_id: int
    start_time: datetime
    submit_time: Optional[datetime] = None
    is_submitted: bool
    objective_score: float
    total_objective_marks: float
    status: str
    answers: List[AttemptAnswerResponse] = []

    class Config:
        from_attributes = True
