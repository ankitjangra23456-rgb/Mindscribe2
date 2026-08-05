import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AttemptTelemetry(Base):
    __tablename__ = 'AttemptTelemetry'

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey('Attempts.id', ondelete="CASCADE"), nullable=False, unique=True)
    mean_flight_time_ms = Column(Float, nullable=False)
    std_dev_flight_time = Column(Float, nullable=False)
    mouse_distance_px = Column(Float, default=0.0, nullable=False)
    typing_burst_count = Column(Integer, default=0, nullable=False)
    anomaly_score = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    attempt = relationship("Attempt")
