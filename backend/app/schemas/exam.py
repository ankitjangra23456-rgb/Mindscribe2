from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.question import QuestionResponse

class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int = 60
    question_ids: List[int] = []
    alpha: float = 0.4
    beta: float = 0.4
    gamma: float = 0.2

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    question_ids: Optional[List[int]] = None
    alpha: Optional[float] = None
    beta: Optional[float] = None
    gamma: Optional[float] = None

class ExamResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    created_by: int
    created_at: datetime
    alpha: float
    beta: float
    gamma: float
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True
