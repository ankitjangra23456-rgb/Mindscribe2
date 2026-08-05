import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class VivaSession(Base):
    __tablename__ = 'VivaSessions'

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey('Attempts.id', ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey('Users.id', ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    status = Column(String(50), default="in_progress", nullable=False)

    attempt = relationship("Attempt")
    student = relationship("User")
    viva_questions = relationship("VivaQuestion", back_populates="viva_session", cascade="all, delete-orphan")

class VivaQuestion(Base):
    __tablename__ = 'VivaQuestions'

    id = Column(Integer, primary_key=True, index=True)
    viva_session_id = Column(Integer, ForeignKey('VivaSessions.id', ondelete="CASCADE"), nullable=False)
    original_question_id = Column(Integer, ForeignKey('Questions.id', ondelete="CASCADE"), nullable=False)
    subjective_answer_text = Column(Text, nullable=False)
    generated_followup_prompt = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    viva_session = relationship("VivaSession", back_populates="viva_questions")
    original_question = relationship("Question")
