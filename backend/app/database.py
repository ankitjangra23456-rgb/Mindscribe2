import sys
from app.config import settings

try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker, declarative_base
    SQLALCHEMY_AVAILABLE = True
except ImportError:
    SQLALCHEMY_AVAILABLE = False
    create_engine = None
    text = None
    sessionmaker = None
    declarative_base = object

Base = declarative_base() if SQLALCHEMY_AVAILABLE else object
engine = None
SessionLocal = None
db_engine_type = "none"

def _ensure_mssql_database_exists():
    """Attempt to create the SQL Server database if it does not exist yet."""
    try:
        master_engine = create_engine(
            settings.MASTER_DB_URL,
            isolation_level="AUTOCOMMIT",
            pool_pre_ping=True
        )
        with master_engine.connect() as conn:
            check_sql = text("SELECT database_id FROM sys.databases WHERE name = :dbname")
            res = conn.execute(check_sql, {"dbname": settings.DB_NAME}).fetchone()
            if not res:
                print(f"[DB Setup] Creating database '{settings.DB_NAME}' on SQL Server instance '{settings.DB_SERVER}'...")
                conn.execute(text(f"CREATE DATABASE [{settings.DB_NAME}]"))
                print(f"[DB Setup] Database '{settings.DB_NAME}' created successfully!")
        master_engine.dispose()
    except Exception as err:
        print(f"[DB Setup Note] SQL Server master check: {err}")

def initialize_database():
    global engine, SessionLocal, db_engine_type
    if not SQLALCHEMY_AVAILABLE:
        return

    # First attempt: Connect to target SQL Server
    try:
        _ensure_mssql_database_exists()
        test_engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            echo=settings.DEBUG
        )
        # Test connection
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        engine = test_engine
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db_engine_type = f"SQL Server ({settings.DB_SERVER})"
        print(f"[DB Engine] Connected to SQL Server: {settings.DB_SERVER} -> {settings.DB_NAME}")
        return
    except Exception as mssql_err:
        print(f"[DB Engine Warning] SQL Server connection to '{settings.DB_SERVER}' failed: {mssql_err}")
        print("[DB Engine] Falling back to SQLite local database (mindscribe_dev.db)...")

    # Fallback attempt: SQLite local database for zero-downtime development
    try:
        fallback_url = "sqlite:///./mindscribe_dev.db"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db_engine_type = "SQLite (Local Fallback)"
        print("[DB Engine] Initialized SQLite fallback engine successfully.")
    except Exception as sqlite_err:
        print(f"[DB Engine Error] Failed to initialize SQLite fallback: {sqlite_err}")
        engine = None
        SessionLocal = None

initialize_database()

def check_db_connection() -> dict:
    """
    Executes a lightweight query (SELECT 1) to confirm DB connectivity.
    """
    if engine is None:
        return {"connected": False, "details": "SQLAlchemy engine not initialized", "engine_type": db_engine_type}
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            row = result.fetchone()
            if row and row[0] == 1:
                return {
                    "connected": True,
                    "details": f"Database connection successful ({db_engine_type})",
                    "engine_type": db_engine_type,
                    "server": settings.DB_SERVER,
                    "database": settings.DB_NAME
                }
            return {"connected": False, "details": "Unexpected response from database", "engine_type": db_engine_type}
    except Exception as e:
        return {"connected": False, "details": str(e), "engine_type": db_engine_type}

def get_db():
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
