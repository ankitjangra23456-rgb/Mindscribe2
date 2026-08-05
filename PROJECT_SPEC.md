# Mindscribe — Project Spec (locked scope)

## Stack
- Frontend: React (Vite), HTML/CSS/JS where simpler, Tailwind or CSS Modules,
  PWA support (service worker + IndexedDB for offline-first)
- Backend: Python, FastAPI, SQLAlchemy ORM, layered structure
  (routers -> services -> repositories/models). Keep it simple.
- Database: SQL Server, via SQLAlchemy using the `mssql+pyodbc` dialect and
  Microsoft's "ODBC Driver 18 for SQL Server" (a system-level driver, not a
  Python package — if it's missing, stop and tell me, don't silently switch
  databases).
- Auth: JWT + Refresh Token (e.g. `python-jose` or `fastapi-users`),
  Role-Based Access Control (Admin, Faculty, Student)
- Realtime: FastAPI WebSockets for live exam session state / faculty monitoring
- AI / ML: lives directly inside the FastAPI app (e.g. `app/services/viva_ai.py`)
  — no separate microservice. Uses Google Gemini API (via the
  `google-generativeai` Python SDK, key read from `GEMINI_API_KEY` env var)
  for BOTH follow-up question generation AND semantic consistency/divergence
  scoring between the written answer and viva response (scoring done via a
  structured-output prompt returning a JSON score, not a separate embedding
  model — no `sentence-transformers` needed).
- Authorization: permission-based RBAC (not just role string checks) — see
  "Advanced RBAC" section below.

## Core novel mechanism (do not simplify away)
AI Viva: after a student submits a written/subjective answer, generate 1-2
follow-up questions from that specific answer via an LLM call. Student
answers as text. Score semantic consistency between the original answer and
the follow-up response(s).

Skill Confidence Index (SCI):
SCI = alpha * Ep + beta * Vp - gamma * Delta(Ep, Vp)
- Ep = normalized written/objective exam performance
- Vp = normalized AI Viva performance
- Delta(Ep, Vp) = divergence/consistency-gap between written and viva performance
- alpha, beta, gamma = configurable weights per subject/exam, stored in DB,
  not hardcoded
Faculty dashboard must always show Ep, Vp, Delta, and final SCI separately —
never just the final number.

## In scope (build across the sub-steps in this guide)
- Auth & RBAC (Admin / Faculty / Student)
- Question bank (objective + subjective questions)
- Exam scheduling & delivery
- Rule-based adaptive difficulty, logged to AdaptiveStateLogs
- Offline-first PWA delivery & sync
- Hash-chain tamper-evident ledger for papers/attempts (NOT full blockchain)
- AI Viva (text-based)
- SCI engine + faculty breakdown dashboard
- Basic keystroke/mouse-dynamics anomaly signal (optional extra input)

## Explicitly OUT of scope — never build, never suggest building
- Coding assessment sandbox / container-based code execution
- Full webcam or gaze-tracking proctoring (at most a basic presence check)
- Audio/speech-to-text viva
- Recruiter portal, external examiner role, multi-university hierarchy
- QR certificates, blockchain credential ledger
- Notifications system, advanced analytics/reporting suite

## Database (target ~20 tables)
Users, Roles, UserRoles, Permissions, RolePermissions, Courses, Subjects,
Questions, QuestionOptions, Exams, ExamQuestions, Attempts, AttemptAnswers,
AdaptiveStateLogs, VivaSessions, VivaQuestions, VivaResponses,
SkillConfidenceRecords, PaperLedger, OfflineSyncQueue, AuditLogs

## Advanced RBAC (upgrade from basic role checks)
- `Permissions` table: granular permission strings, e.g. `exam:create`,
  `exam:publish`, `question:manage`, `results:view_own`, `results:view_all`,
  `user:manage`.
- `RolePermissions` table: maps each of the 3 roles (Admin, Faculty, Student)
  to its allowed permissions. Only these 3 roles exist — no Recruiter role.
- Every protected FastAPI endpoint must use a dependency-based permission
  check (e.g. `Depends(require_permission("exam:create"))`), not a raw
  `if role == "faculty"` check.
- Every query that returns a specific user's/faculty's own data must filter
  by ownership at the database query level (e.g.
  `WHERE student_id = current_user.id`, `WHERE created_by_faculty_id =
  current_user.id`) — never return all rows and filter in the frontend.
- Sensitive actions (login, exam create/publish, result view, and any
  permission-denied attempt) must be written to `AuditLogs` with user id,
  action, timestamp, and IP.
- Refresh tokens must rotate on use and old ones must be invalidated (no
  reuse of a stale refresh token).

## Working rules for the agent
- Work only on the sub-step specified in the current prompt — nothing from
  earlier or later sub-steps.
- Prefer editing/extending existing files over regenerating whole files.
- Keep explanations short: a bullet list of files changed/created, one line
  each. No long narrative summaries.
- If ambiguous, make the most reasonable assumption, state it in one line,
  and proceed.
- Don't add packages/services outside the stack above without flagging first.
