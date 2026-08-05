import datetime
from sqlalchemy import Column, Integer, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class VivaResponse(Base):
    __tablename__ = 'VivaResponses'

    id = Column(Integer, primary_key=True, index=True)
    viva_question_id = Column(Integer, ForeignKey('VivaQuestions.id', ondelete="CASCADE"), nullable=False)
    student_viva_reply = Column(Text, nullable=False)
    consistency_score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    viva_question = relationship("VivaQuestion")
