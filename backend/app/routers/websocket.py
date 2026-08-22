import json
import logging
from typing import Dict, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database import get_db

logger = logging.getLogger("mindscribe.websocket")

router = APIRouter(prefix="/ws", tags=["Realtime WebSockets"])

class ConnectionManager:
    def __init__(self):
        # Maps exam_id -> set of active WebSockets
        self.exam_rooms: Dict[int, Set[WebSocket]] = {}
        # Maps exam_id -> set of active faculty monitor WebSockets
        self.faculty_rooms: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, exam_id: int, client_type: str = "student"):
        await websocket.accept()
        if client_type == "faculty":
            if exam_id not in self.faculty_rooms:
                self.faculty_rooms[exam_id] = set()
            self.faculty_rooms[exam_id].add(websocket)
        else:
            if exam_id not in self.exam_rooms:
                self.exam_rooms[exam_id] = set()
            self.exam_rooms[exam_id].add(websocket)
        logger.info(f"WebSocket client ({client_type}) connected to exam room {exam_id}")

    def disconnect(self, websocket: WebSocket, exam_id: int, client_type: str = "student"):
        if client_type == "faculty":
            if exam_id in self.faculty_rooms:
                self.faculty_rooms[exam_id].discard(websocket)
                if not self.faculty_rooms[exam_id]:
                    del self.faculty_rooms[exam_id]
        else:
            if exam_id in self.exam_rooms:
                self.exam_rooms[exam_id].discard(websocket)
                if not self.exam_rooms[exam_id]:
                    del self.exam_rooms[exam_id]
        logger.info(f"WebSocket client ({client_type}) disconnected from exam room {exam_id}")

    async def broadcast_to_faculty(self, exam_id: int, message: dict):
        """Broadcasts student updates/telemetry to faculty monitoring rooms"""
        if exam_id in self.faculty_rooms:
            disconnected = set()
            for ws in self.faculty_rooms[exam_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    disconnected.add(ws)
            for ws in disconnected:
                self.faculty_rooms[exam_id].discard(ws)

manager = ConnectionManager()

@router.websocket("/exam/{exam_id}")
async def websocket_exam_endpoint(
    websocket: WebSocket,
    exam_id: int,
    client_type: str = "student"
):
    """
    WebSocket endpoint for real-time exam session monitoring.
    - `client_type=student`: Sends telemetry, answer progress updates, and heartbeats.
    - `client_type=faculty`: Receives live monitoring feeds for all students in exam_id.
    """
    await manager.connect(websocket, exam_id, client_type)
    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
            except json.JSONDecodeError:
                data = {"type": "raw_message", "content": data_text}

            # Enrich message metadata
            data["exam_id"] = exam_id
            data["client_type"] = client_type

            # Broadcast student updates to faculty monitors
            if client_type == "student":
                await manager.broadcast_to_faculty(exam_id, data)
            elif client_type == "faculty" and data.get("type") == "broadcast":
                # Faculty sending command/message to all students in room
                if exam_id in manager.exam_rooms:
                    for s_ws in manager.exam_rooms[exam_id]:
                        try:
                            await s_ws.send_json(data)
                        except Exception:
                            pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, exam_id, client_type)
        if client_type == "student":
            # Notify faculty of student disconnect
            await manager.broadcast_to_faculty(exam_id, {
                "type": "student_disconnected",
                "exam_id": exam_id
            })
