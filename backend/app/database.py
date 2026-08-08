from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

Base = declarative_base()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def check_db_connection() -> dict:
    """Executes a lightweight query to confirm DB connectivity."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "connected": True,
            "details": "PostgreSQL (Supabase) connection successful",
            "engine_type": "PostgreSQL"
        }
    except Exception as e:
        return {
            "connected": False,
            "details": str(e),
            "engine_type": "PostgreSQL"
        }


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
