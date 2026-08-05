import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AdaptiveStateLog(Base):
    __tablename__ = 'AdaptiveStateLogs'

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey('Attempts.id', ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey('Questions.id', ondelete="CASCADE"), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    previous_difficulty = Column(String(50), nullable=False)  # easy | medium | hard
    next_difficulty = Column(String(50), nullable=False)      # easy | medium | hard
    shift_reason = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    attempt = relationship("Attempt")
    question = relationship("Question")
