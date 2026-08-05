import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SkillConfidenceRecord(Base):
    __tablename__ = 'SkillConfidenceRecords'

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey('Attempts.id', ondelete="CASCADE"), nullable=False, unique=True)
    student_id = Column(Integer, ForeignKey('Users.id', ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey('Exams.id', ondelete="CASCADE"), nullable=False)

    ep_score = Column(Float, nullable=False)
    vp_score = Column(Float, nullable=False)
    delta_gap = Column(Float, nullable=False)
    sci_score = Column(Float, nullable=False)

    alpha = Column(Float, nullable=False)
    beta = Column(Float, nullable=False)
    gamma = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    attempt = relationship("Attempt")
    student = relationship("User")
    exam = relationship("Exam")
