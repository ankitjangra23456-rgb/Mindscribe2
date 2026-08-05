from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TelemetrySubmitRequest(BaseModel):
    flight_times_ms: List[float] = []
    mouse_distance_px: float = 0.0

class TelemetryRecordResponse(BaseModel):
    id: int
    attempt_id: int
    mean_flight_time_ms: float
    std_dev_flight_time: float
    mouse_distance_px: float
    typing_burst_count: int
    anomaly_score: float
    created_at: datetime

    class Config:
        from_attributes = True
