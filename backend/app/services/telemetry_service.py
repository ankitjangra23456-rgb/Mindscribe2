import math
from sqlalchemy.orm import Session
from app.models.telemetry import AttemptTelemetry

HUMAN_TYPING_MEAN_MIN = 100.0  # ms
HUMAN_TYPING_MEAN_MAX = 350.0  # ms

def compute_telemetry_anomaly(flight_times: list[float], mouse_dist: float) -> tuple[float, float, int, float]:
    """
    Computes statistical mean, std dev, and anomaly score [0.0 - 1.0].
    Detects sudden copy-pasting or automated bot inputs.
    """
    if not flight_times or len(flight_times) < 2:
        return 0.0, 0.0, 0, 0.0

    mean_ms = sum(flight_times) / len(flight_times)
    variance = sum((x - mean_ms) ** 2 for x in flight_times) / len(flight_times)
    std_dev = math.sqrt(variance)

    burst_count = sum(1 for x in flight_times if x < 25.0)

    # Anomaly Scoring logic
    anomaly = 0.0
    if mean_ms < 30.0:  # Extremely fast paste action
        anomaly += 0.7
    elif mean_ms < HUMAN_TYPING_MEAN_MIN:
        anomaly += 0.3

    if burst_count > 5:
        anomaly += 0.3

    if std_dev < 5.0 and len(flight_times) > 10:  # Robotically uniform timing
        anomaly += 0.4

    anomaly = round(max(0.0, min(1.0, anomaly)), 4)
    return round(mean_ms, 2), round(std_dev, 2), burst_count, anomaly

def record_attempt_telemetry(db: Session, attempt_id: int, flight_times: list[float], mouse_dist: float) -> AttemptTelemetry:
    mean_ms, std_dev, bursts, anomaly = compute_telemetry_anomaly(flight_times, mouse_dist)

    existing = db.query(AttemptTelemetry).filter(AttemptTelemetry.attempt_id == attempt_id).first()
    if existing:
        existing.mean_flight_time_ms = mean_ms
        existing.std_dev_flight_time = std_dev
        existing.mouse_distance_px = mouse_dist
        existing.typing_burst_count = bursts
        existing.anomaly_score = anomaly
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_tel = AttemptTelemetry(
            attempt_id=attempt_id,
            mean_flight_time_ms=mean_ms,
            std_dev_flight_time=std_dev,
            mouse_distance_px=mouse_dist,
            typing_burst_count=bursts,
            anomaly_score=anomaly
        )
        db.add(new_tel)
        db.commit()
        db.refresh(new_tel)
        return new_tel
