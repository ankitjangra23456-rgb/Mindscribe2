import hashlib
import datetime

try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = None

from app.models.ledger import PaperLedger

GENESIS_HASH = "0" * 64

def compute_record_hash(prev_hash: str, event_type: str, exam_id: int, actor_user_id: int, payload_data: str, timestamp_str: str) -> str:
    raw_str = f"{prev_hash}:{event_type}:{exam_id}:{actor_user_id}:{payload_data}:{timestamp_str}"
    return hashlib.sha256(raw_str.encode('utf-8')).hexdigest()

def log_paper_ledger_event(
    db: Session,
    event_type: str,
    exam_id: int,
    actor_user_id: int,
    payload_data: str
) -> PaperLedger:
    last_record = db.query(PaperLedger).order_by(PaperLedger.id.desc()).first() if db else None
    prev_hash = last_record.current_hash if last_record else GENESIS_HASH

    now = datetime.datetime.utcnow()
    timestamp_str = now.isoformat()

    current_hash = compute_record_hash(
        prev_hash=prev_hash,
        event_type=event_type,
        exam_id=exam_id,
        actor_user_id=actor_user_id,
        payload_data=payload_data,
        timestamp_str=timestamp_str
    )

    record = PaperLedger(
        event_type=event_type,
        exam_id=exam_id,
        actor_user_id=actor_user_id,
        previous_hash=prev_hash,
        current_hash=current_hash,
        payload_data=payload_data,
        timestamp=now
    )
    if db:
        db.add(record)
        db.commit()
        db.refresh(record)
    return record

def verify_paper_ledger_chain(db: Session) -> dict:
    if not db:
        return {"is_valid": True, "total_records": 0, "message": "No DB connection"}

    records = db.query(PaperLedger).order_by(PaperLedger.id.asc()).all()

    if not records:
        return {"is_valid": True, "total_records": 0, "message": "Ledger is empty"}

    expected_prev_hash = GENESIS_HASH

    for idx, record in enumerate(records):
        if record.previous_hash != expected_prev_hash:
            return {
                "is_valid": False,
                "broken_at_id": record.id,
                "reason": f"Hash chain broken at record #{record.id}. Expected previous hash {expected_prev_hash}, found {record.previous_hash}."
            }

        timestamp_str = record.timestamp.isoformat()
        recalculated_hash = compute_record_hash(
            prev_hash=record.previous_hash,
            event_type=record.event_type,
            exam_id=record.exam_id,
            actor_user_id=record.actor_user_id,
            payload_data=record.payload_data,
            timestamp_str=timestamp_str
        )

        if recalculated_hash != record.current_hash:
            return {
                "is_valid": False,
                "broken_at_id": record.id,
                "reason": f"Tampering detected at record #{record.id}. Content hash mismatch."
            }

        expected_prev_hash = record.current_hash

    return {
        "is_valid": True,
        "total_records": len(records),
        "message": "Paper Hash-Chain Ledger integrity verified successfully."
    }
