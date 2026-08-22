import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_websocket_exam_connection():
    """Test student WebSocket connection and progress message broadcast"""
    with client.websocket_connect("/ws/exam/1?client_type=student") as ws_student:
        with client.websocket_connect("/ws/exam/1?client_type=faculty") as ws_faculty:
            # Student sends progress update
            ws_student.send_json({
                "type": "progress_update",
                "student_id": 5,
                "current_question": 3,
                "completed_count": 2
            })
            
            # Faculty should receive broadcast message
            received = ws_faculty.receive_json()
            assert received["type"] == "progress_update"
            assert received["student_id"] == 5
            assert received["exam_id"] == 1
