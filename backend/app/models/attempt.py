import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Attempt(Base):
    __tablename__ = 'Attempts'

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey('Exams.id', ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey('Users.id', ondelete="NO ACTION"), nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    submit_time = Column(DateTime, nullable=True)
    is_submitted = Column(Boolean, default=False, nullable=False)
    objective_score = Column(Float, default=0.0, nullable=False)
    total_objective_marks = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="in_progress", nullable=False)

    exam = relationship("Exam")
    student = relationship("User")
    answers = relationship("AttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")

class AttemptAnswer(Base):
    __tablename__ = 'AttemptAnswers'

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey('Attempts.id', ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey('Questions.id', ondelete="NO ACTION"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey('QuestionOptions.id', ondelete="SET NULL"), nullable=True)
    text_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    marks_obtained = Column(Float, default=0.0, nullable=False)

    attempt = relationship("Attempt", back_populates="answers")
    question = relationship("Question")
    selected_option = relationship("QuestionOption")
