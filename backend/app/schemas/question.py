from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OptionCreate(BaseModel):
    option_text: str
    is_correct: bool = False

class OptionResponse(BaseModel):
    id: int
    option_text: str
    is_correct: bool

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    text: str
    question_type: str = "objective"  # objective | subjective
    difficulty: str = "medium"       # easy | medium | hard
    marks: int = 1
    options: Optional[List[OptionCreate]] = []

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    question_type: Optional[str] = None
    difficulty: Optional[str] = None
    marks: Optional[int] = None
    options: Optional[List[OptionCreate]] = None

class QuestionResponse(BaseModel):
    id: int
    text: str
    question_type: str
    difficulty: str
    marks: int
    created_at: datetime
    options: List[OptionResponse] = []

    class Config:
        from_attributes = True
