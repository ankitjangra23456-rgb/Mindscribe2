import datetime
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_audit_event(db: Session, action: str, user_id: int | None = None, ip_address: str | None = None):
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            ip_address=ip_address,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(entry)
        db.commit()
        return entry
    except Exception as err:
        print(f"[Audit Log Error] Failed to write log: {err}")
        return None
