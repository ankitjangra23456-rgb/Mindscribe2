import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

exam_questions = Table(
    'ExamQuestions',
    Base.metadata,
    Column('exam_id', Integer, ForeignKey('Exams.id', ondelete="CASCADE"), primary_key=True),
    Column('question_id', Integer, ForeignKey('Questions.id', ondelete="CASCADE"), primary_key=True)
)

class Exam(Base):
    __tablename__ = 'Exams'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=60)
    created_by = Column(Integer, ForeignKey('Users.id', ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # SCI Weight Parameters
    alpha = Column(Float, default=0.4, nullable=False)
    beta = Column(Float, default=0.4, nullable=False)
    gamma = Column(Float, default=0.2, nullable=False)

    creator = relationship("User")
    questions = relationship("Question", secondary=exam_questions)
