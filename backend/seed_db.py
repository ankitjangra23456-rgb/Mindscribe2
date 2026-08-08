import sys
import os
import hashlib
import json
from datetime import datetime, timedelta

# Append current directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base, check_db_connection
import app.models as models
from app.core.security import get_password_hash

def seed_database():
    print("[Seed] Initializing SQL database schema...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("[Seed] Seeding Roles & Permissions...")
        # 1. Permissions & Roles
        permissions_data = [
            ("exam:create", "Create exams"),
            ("exam:publish", "Publish exams"),
            ("question:manage", "Manage question bank"),
            ("results:view_own", "View own exam results"),
            ("results:view_all", "View all exam results"),
            ("user:manage", "Manage system users"),
        ]
        
        perm_map = {}
        for p_name, p_desc in permissions_data:
            perm = db.query(models.Permission).filter(models.Permission.name == p_name).first()
            if not perm:
                perm = models.Permission(name=p_name, description=p_desc)
                db.add(perm)
                db.flush()
            perm_map[p_name] = perm

        roles_mapping = {
            "Admin": ["exam:create", "exam:publish", "question:manage", "results:view_own", "results:view_all", "user:manage"],
            "Faculty": ["exam:create", "exam:publish", "question:manage", "results:view_own", "results:view_all"],
            "Student": ["results:view_own"],
            "Recruiter": ["results:view_all"]
        }

        role_map = {}
        for r_name, p_list in roles_mapping.items():
            role = db.query(models.Role).filter(models.Role.name == r_name).first()
            if not role:
                role = models.Role(name=r_name, description=f"{r_name} System Role")
                db.add(role)
                db.flush()
            for p_name in p_list:
                if p_name in perm_map and perm_map[p_name] not in role.permissions:
                    role.permissions.append(perm_map[p_name])
            role_map[r_name] = role

        print("[Seed] Seeding Users...")
        # 2. Users
        pwd_hash = get_password_hash("password123")
        pwd_hash_alt = get_password_hash("password")

        users_data = [
            ("admin@cu.ac.in", "Admin User", "Admin", pwd_hash_alt),
            ("admin@mindscribe.ai", "System Administrator", "Admin", pwd_hash),
            ("priya.singh@cu.ac.in", "Dr. Priya Singh", "Faculty", pwd_hash_alt),
            ("faculty@mindscribe.ai", "Prof. Vikram Sharma", "Faculty", pwd_hash),
            ("ankit@example.com", "Ankit Sharma", "Student", pwd_hash_alt),
            ("student@mindscribe.ai", "Rohan Verma", "Student", pwd_hash),
            ("student2@mindscribe.ai", "Sneha Patel", "Student", pwd_hash),
            ("rahul@techcorp.com", "Rahul Verma", "Recruiter", pwd_hash_alt),
            ("recruiter@mindscribe.ai", "Amit Kumar", "Recruiter", pwd_hash),
        ]

        user_map = {}
        for email, full_name, role_name, h_pwd in users_data:
            usr = db.query(models.User).filter(models.User.email == email).first()
            if not usr:
                usr = models.User(
                    email=email,
                    full_name=full_name,
                    hashed_password=h_pwd,
                    is_active=True
                )
                usr.roles.append(role_map[role_name])
                db.add(usr)
                db.flush()
            user_map[email] = usr

        db.commit()

        print("[Seed] Seeding Questions & Options...")
        # 3. Questions
        questions_pool = [
            {
                "text": "What is the time complexity of binary search on a sorted array?",
                "type": "objective", "difficulty": "easy", "marks": 2,
                "options": [
                    ("O(n)", False), ("O(log n)", True), ("O(n log n)", False), ("O(1)", False)
                ]
            },
            {
                "text": "Which data structure operates on a Last In First Out (LIFO) basis?",
                "type": "objective", "difficulty": "easy", "marks": 2,
                "options": [
                    ("Queue", False), ("Array", False), ("Stack", True), ("Tree", False)
                ]
            },
            {
                "text": "What is the worst-case time complexity of Quick Sort algorithm?",
                "type": "objective", "difficulty": "hard", "marks": 2,
                "options": [
                    ("O(n)", False), ("O(n log n)", False), ("O(n^2)", True), ("O(log n)", False)
                ]
            },
            {
                "text": "Which algorithm is used to find the shortest path in a weighted graph with non-negative edge weights?",
                "type": "objective", "difficulty": "medium", "marks": 2,
                "options": [
                    ("Kruskal's Algorithm", False), ("Prim's Algorithm", False), ("Dijkstra's Algorithm", True), ("Bellman-Ford Algorithm", False)
                ]
            },
            {
                "text": "What is a Foreign Key constraint in Relational Database Management Systems?",
                "type": "objective", "difficulty": "easy", "marks": 2,
                "options": [
                    ("Primary identifier of a record", False),
                    ("Cross-table reference maintaining referential integrity", True),
                    ("Unique value constraint across rows", False),
                    ("Check constraint for non-null values", False)
                ]
            },
            {
                "text": "Explain Binary Search Tree (BST) insertion and balance mechanisms (e.g. AVL rotations or Red-Black trees).",
                "type": "subjective", "difficulty": "medium", "marks": 5,
                "options": []
            },
            {
                "text": "Describe the TCP 3-way handshake process and how connection establishment ensures reliability.",
                "type": "subjective", "difficulty": "medium", "marks": 5,
                "options": []
            },
            {
                "text": "Explain the architecture of Transformer neural networks and self-attention mechanism.",
                "type": "subjective", "difficulty": "hard", "marks": 10,
                "options": []
            }
        ]

        q_objs = []
        for q_data in questions_pool:
            q = db.query(models.Question).filter(models.Question.text == q_data["text"]).first()
            if not q:
                q = models.Question(
                    text=q_data["text"],
                    question_type=q_data["type"],
                    difficulty=q_data["difficulty"],
                    marks=q_data["marks"]
                )
                db.add(q)
                db.flush()
                for opt_text, is_corr in q_data["options"]:
                    opt = models.QuestionOption(
                        question_id=q.id,
                        option_text=opt_text,
                        is_correct=is_corr
                    )
                    db.add(opt)
                db.flush()
            q_objs.append(q)

        db.commit()

        print("[Seed] Seeding Exams...")
        # 4. Exams
        faculty_user = user_map["priya.singh@cu.ac.in"]
        admin_user = user_map["admin@mindscribe.ai"]

        now = datetime.utcnow()
        exams_data = [
            {
                "title": "Data Structures & System Design Mid-Term",
                "description": "Comprehensive evaluation covering linear/non-linear data structures, algorithm complexity, and AI Viva follow-up questioning.",
                "start_time": now - timedelta(days=1),
                "end_time": now + timedelta(days=30),
                "duration_minutes": 60,
                "creator": faculty_user,
                "alpha": 0.4, "beta": 0.4, "gamma": 0.2,
                "questions": q_objs
            },
            {
                "title": "Database Systems & SQL Optimization",
                "description": "Core concepts of RDBMS, indexing, query execution plans, and 3NF normalization.",
                "start_time": now - timedelta(days=2),
                "end_time": now + timedelta(days=15),
                "duration_minutes": 45,
                "creator": faculty_user,
                "alpha": 0.5, "beta": 0.3, "gamma": 0.2,
                "questions": [q for q in q_objs if q.question_type == "objective"]
            },
            {
                "title": "Advanced Artificial Intelligence & Deep Learning Viva",
                "description": "Advanced viva exam evaluating candidate AI conceptual mastery and dynamic follow-up defense.",
                "start_time": now - timedelta(hours=5),
                "end_time": now + timedelta(days=7),
                "duration_minutes": 90,
                "creator": admin_user,
                "alpha": 0.35, "beta": 0.45, "gamma": 0.2,
                "questions": q_objs
            }
        ]

        exam_objs = []
        for e_data in exams_data:
            ex = db.query(models.Exam).filter(models.Exam.title == e_data["title"]).first()
            if not ex:
                ex = models.Exam(
                    title=e_data["title"],
                    description=e_data["description"],
                    start_time=e_data["start_time"],
                    end_time=e_data["end_time"],
                    duration_minutes=e_data["duration_minutes"],
                    created_by=e_data["creator"].id,
                    alpha=e_data["alpha"],
                    beta=e_data["beta"],
                    gamma=e_data["gamma"]
                )
                ex.questions = e_data["questions"]
                db.add(ex)
                db.flush()
            exam_objs.append(ex)

        db.commit()

        print("[Seed] Seeding Student Exam Attempts...")
        # 5. Attempts
        student_user = user_map["ankit@example.com"]
        student_user2 = user_map["student@mindscribe.ai"]
        target_exam = exam_objs[0]

        att1 = db.query(models.Attempt).filter(
            models.Attempt.exam_id == target_exam.id,
            models.Attempt.student_id == student_user.id
        ).first()

        if not att1:
            att1 = models.Attempt(
                exam_id=target_exam.id,
                student_id=student_user.id,
                start_time=now - timedelta(hours=2),
                submit_time=now - timedelta(hours=1),
                is_submitted=True,
                objective_score=6.0,
                total_objective_marks=8.0,
                status="completed"
            )
            db.add(att1)
            db.flush()

            # Record answers
            for q in target_exam.questions:
                if q.question_type == "objective":
                    correct_opt = next((opt for opt in q.options if opt.is_correct), q.options[0] if q.options else None)
                    db_ans = models.AttemptAnswer(
                        attempt_id=att1.id,
                        question_id=q.id,
                        selected_option_id=correct_opt.id if correct_opt else None,
                        is_correct=True,
                        marks_obtained=q.marks
                    )
                    db.add(db_ans)
                else:
                    text_resp = (
                        "Binary Search Tree insertion recursively compares target value with root. "
                        "If target is smaller, insert into left subtree; if larger, right subtree. "
                        "AVL trees perform single or double rotations (LL, RR, LR, RL) when height balance factor exceeds 1."
                        if "Binary Search Tree" in q.text else
                        "TCP 3-way handshake consists of SYN from client, SYN-ACK from server, and ACK from client to establish a full-duplex socket session."
                    )
                    db_ans = models.AttemptAnswer(
                        attempt_id=att1.id,
                        question_id=q.id,
                        text_answer=text_resp,
                        is_correct=None,
                        marks_obtained=q.marks
                    )
                    db.add(db_ans)
            db.flush()

        db.commit()

        print("[Seed] Seeding AI Viva Sessions & Responses...")
        # 6. Viva Session
        viva_sess = db.query(models.VivaSession).filter(models.VivaSession.attempt_id == att1.id).first()
        if not viva_sess:
            viva_sess = models.VivaSession(
                attempt_id=att1.id,
                student_id=student_user.id,
                status="completed"
            )
            db.add(viva_sess)
            db.flush()

            # Viva Questions
            subj_q = next((q for q in target_exam.questions if q.question_type == "subjective"), None)
            if subj_q:
                v_q = models.VivaQuestion(
                    viva_session_id=viva_sess.id,
                    original_question_id=subj_q.id,
                    subjective_answer_text="Binary Search Tree insertion recursively compares target value with root. AVL trees use rotations to maintain balance.",
                    generated_followup_prompt="Can you explain how an AVL LR rotation works step-by-step when a node is inserted into the right subtree of the left child?"
                )
                db.add(v_q)
                db.flush()

                v_resp = models.VivaResponse(
                    viva_question_id=v_q.id,
                    student_viva_reply="An LR rotation is a double rotation. First, a left rotation is performed on the left child node to convert the imbalance into an LL pattern, followed by a right rotation on the parent node.",
                    consistency_score=0.92
                )
                db.add(v_resp)
                db.flush()

        db.commit()

        print("[Seed] Seeding Adaptive State Logs...")
        # 7. Adaptive State Logs
        adaptive_log = db.query(models.AdaptiveStateLog).filter(models.AdaptiveStateLog.attempt_id == att1.id).first()
        if not adaptive_log:
            logs_data = [
                (q_objs[0].id, True, "easy", "medium", "Correct answer on easy question. Escalating to medium."),
                (q_objs[3].id, True, "medium", "hard", "High accuracy streak. Escalating to hard difficulty."),
                (q_objs[2].id, False, "hard", "medium", "Incorrect response on hard question. Reducing to medium.")
            ]
            for qid, corr, prev_d, next_d, reas in logs_data:
                alog = models.AdaptiveStateLog(
                    attempt_id=att1.id,
                    question_id=qid,
                    is_correct=corr,
                    previous_difficulty=prev_d,
                    next_difficulty=next_d,
                    shift_reason=reas
                )
                db.add(alog)

        print("[Seed] Seeding Skill Confidence Index (SCI) Records...")
        # 8. SCI Records
        sci_rec = db.query(models.SkillConfidenceRecord).filter(models.SkillConfidenceRecord.attempt_id == att1.id).first()
        if not sci_rec:
            # Ep = 0.75, Vp = 0.92, alpha=0.4, beta=0.4, gamma=0.2
            ep = 0.85
            vp = 0.92
            alpha, beta, gamma = 0.4, 0.4, 0.2
            sci_val = (alpha * ep) + (beta * vp) - (gamma * abs(ep - vp))
            sci_rec = models.SkillConfidenceRecord(
                attempt_id=att1.id,
                student_id=student_user.id,
                exam_id=target_exam.id,
                ep_score=ep,
                vp_score=vp,
                delta_gap=abs(ep - vp),
                sci_score=sci_val,
                alpha=alpha,
                beta=beta,
                gamma=gamma
            )
            db.add(sci_rec)

        print("[Seed] Seeding Paper Hash Ledger...")
        # 9. Paper Ledger
        ledger_entry = db.query(models.PaperLedger).filter(models.PaperLedger.exam_id == target_exam.id).first()
        if not ledger_entry:
            genesis_hash = "0000000000000000000000000000000000000000000000000000000000000000"
            payload = json.dumps({"exam_id": target_exam.id, "title": target_exam.title, "question_ids": [q.id for q in target_exam.questions]})
            curr_hash = hashlib.sha256(f"{genesis_hash}{payload}".encode('utf-8')).hexdigest()
            
            p_ledger = models.PaperLedger(
                event_type="EXAM_PAPER_PUBLISHED",
                exam_id=target_exam.id,
                actor_user_id=faculty_user.id,
                previous_hash=genesis_hash,
                current_hash=curr_hash,
                payload_data=payload
            )
            db.add(p_ledger)

        print("[Seed] Seeding Telemetry & Audit Logs...")
        # 10. Telemetry & Audit
        telemetry_rec = db.query(models.AttemptTelemetry).filter(models.AttemptTelemetry.attempt_id == att1.id).first()
        if not telemetry_rec:
            telem = models.AttemptTelemetry(
                attempt_id=att1.id,
                mean_flight_time_ms=145.2,
                std_dev_flight_time=24.1,
                mouse_distance_px=3420.5,
                typing_burst_count=18,
                anomaly_score=0.03
            )
            db.add(telem)

        audit_rec = db.query(models.AuditLog).filter(models.AuditLog.user_id == student_user.id).first()
        if not audit_rec:
            audit = models.AuditLog(
                user_id=student_user.id,
                action="EXAM_SUBMISSION_COMPLETED",
                ip_address="127.0.0.1"
            )
            db.add(audit)

        db.commit()
        print("[Seed] Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[Seed Error] Failed to seed database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    db_status = check_db_connection()
    print(f"[DB Status] Connected: {db_status.get('connected')}, Engine: {db_status.get('engine_type')}")
    seed_database()
