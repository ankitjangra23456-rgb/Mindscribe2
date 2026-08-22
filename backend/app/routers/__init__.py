from app.routers.auth import router as auth_router
from app.routers.questions import router as questions_router
from app.routers.exams import router as exams_router
from app.routers.attempts import router as attempts_router
from app.routers.pwa_sync import router as pwa_sync_router
from app.routers.viva import router as viva_router
from app.routers.sci import router as sci_router
from app.routers.ledger import router as ledger_router
from app.routers.telemetry import router as telemetry_router
from app.routers.ai import router as ai_router
from app.routers.websocket import router as websocket_router

__all__ = [
    "auth_router", "questions_router", "exams_router",
    "attempts_router", "pwa_sync_router", "viva_router",
    "sci_router", "ledger_router", "telemetry_router", "ai_router",
    "websocket_router"
]

