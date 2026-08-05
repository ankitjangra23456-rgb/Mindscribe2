import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PaperLedger(Base):
    __tablename__ = 'PaperLedger'

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)
    exam_id = Column(Integer, ForeignKey('Exams.id', ondelete="CASCADE"), nullable=False)
    actor_user_id = Column(Integer, ForeignKey('Users.id', ondelete="CASCADE"), nullable=False)
    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False)
    payload_data = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    exam = relationship("Exam")
    actor = relationship("User")
