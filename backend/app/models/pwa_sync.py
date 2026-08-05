import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class OfflineSyncQueue(Base):
    __tablename__ = 'OfflineSyncQueue'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('Users.id', ondelete="CASCADE"), nullable=False)
    attempt_id = Column(Integer, ForeignKey('Attempts.id', ondelete="CASCADE"), nullable=False)
    payload_json = Column(Text, nullable=False)
    status = Column(String(50), default="queued", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    synced_at = Column(DateTime, nullable=True)

    student = relationship("User")
    attempt = relationship("Attempt")
