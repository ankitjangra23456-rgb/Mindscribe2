import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

logger = logging.getLogger("mindscribe.database")
Base = declarative_base()

db_url = settings.DATABASE_URL
connect_args = {}
if "sqlite" in db_url:
    connect_args["check_same_thread"] = False

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        connect_args=connect_args,
        echo=settings.DEBUG
    )
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
except Exception as e:
    logger.warning(f"Primary database connection failed ({e}). Falling back to local SQLite database.")
    db_url = "sqlite:///./mindscribe_dev.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False}, echo=settings.DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def check_db_connection() -> dict:
    """Executes a lightweight query to confirm DB connectivity."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "connected": True,
            "details": f"Database connection successful ({engine.name})",
            "engine_type": engine.name
        }
    except Exception as e:
        return {
            "connected": False,
            "details": str(e),
            "engine_type": engine.name
        }


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
