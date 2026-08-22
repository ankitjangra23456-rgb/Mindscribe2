from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import app.models  # Ensure all SQLAlchemy models are registered
from app.database import engine, Base, check_db_connection
from app.config import settings
from app.routers import (
    auth_router, questions_router, exams_router,
    attempts_router, pwa_sync_router, viva_router,
    sci_router, ledger_router, telemetry_router, ai_router,
    websocket_router
)

# Initialize database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables on startup: {e}")

app = FastAPI(
    title="Mindscribe API Core",
    description="Enterprise Exam & AI Viva Backend",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS — controlled via ALLOWED_ORIGINS env var
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router)
app.include_router(questions_router)
app.include_router(exams_router)
app.include_router(attempts_router)
app.include_router(pwa_sync_router)
app.include_router(viva_router)
app.include_router(sci_router)
app.include_router(ledger_router)
app.include_router(telemetry_router)
app.include_router(ai_router)
app.include_router(websocket_router)

@app.get("/health", summary="Health & DB Connection Check", tags=["Health Check"])
def health_check():
    """
    Health check endpoint verifying backend API availability and SQL Server database connectivity.
    """
    db_status = check_db_connection()
    
    if db_status["connected"]:
        return {
            "status": "healthy",
            "database": db_status,
            "environment": settings.APP_ENV
        }
    else:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": db_status,
                "environment": settings.APP_ENV
            }
        )

@app.get("/", summary="Root Endpoint", tags=["Root"])
def root():
    return {"message": "Welcome to Mindscribe API Core"}
