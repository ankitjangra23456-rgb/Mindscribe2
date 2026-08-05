# MINDSCRIBE — Full Step-by-Step Antigravity Build Guide

This is the complete, granular version of the roadmap. Instead of 5 big
phases, it's broken into 18 small sub-steps. Each sub-step is small enough
to finish in one focused Antigravity session without running out of
context/tokens, and each ends in something you can actually test and commit
before moving on.

**Golden rule for the whole project: never ask the agent to do more than one
sub-step at a time.** If you're ever tempted to paste two sub-steps into one
message to "save time," don't — that's exactly what causes a session to run
out of budget partway through and leave you with half-built, unreviewed code.

---

## PART A — One-time setup (do this once, before Sub-step 1)

1. Install prerequisites on your machine (not inside Antigravity):
   - Python 3.11+
   - Node.js + npm (for React/Vite)
   - SQL Server (Express edition is free) + SQL Server Management Studio
   - Microsoft "ODBC Driver 18 for SQL Server" (system-level driver, separate
     from Python — required for SQLAlchemy to talk to SQL Server)
   - Git
2. Create an empty project folder, e.g. `Mindscribe/`.
3. Open that folder in Antigravity (File → Open Folder).
4. Create a file named exactly `PROJECT_SPEC.md` in the root of that folder,
   and paste in the full spec block from **Part B** below. Save it.
5. Run `git init` in the project folder's terminal (inside Antigravity or
   your own terminal) so you can commit after every sub-step.

You only do Part A once. From here on, every sub-step assumes `PROJECT_SPEC.md`
already exists in the repo — you never need to re-paste the spec itself again,
just reference it.

---

## PART B — PROJECT_SPEC.md (paste this into that file, once)

```markdown
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
  — no separate microservice. Use a configurable LLM API (don't hardcode a
  provider) for follow-up question generation, and `sentence-transformers`
  (or similar) for semantic consistency/divergence scoring.

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

## Database (target ~18 tables)
Users, Roles, UserRoles, Courses, Subjects, Questions, QuestionOptions, Exams,
ExamQuestions, Attempts, AttemptAnswers, AdaptiveStateLogs, VivaSessions,
VivaQuestions, VivaResponses, SkillConfidenceRecords, PaperLedger,
OfflineSyncQueue, AuditLogs

## Working rules for the agent
- Work only on the sub-step specified in the current prompt — nothing from
  earlier or later sub-steps.
- Prefer editing/extending existing files over regenerating whole files.
- Keep explanations short: a bullet list of files changed/created, one line
  each. No long narrative summaries.
- If ambiguous, make the most reasonable assumption, state it in one line,
  and proceed.
- Don't add packages/services outside the stack above without flagging first.
```

---

## PART C — The 18 sub-steps

For each sub-step: paste the prompt exactly as written, let the agent finish,
run the **test checklist**, then run the **commit command**, before moving to
the next one. If a sub-step's session feels like it's dragging (agent
re-reading lots of files, long pauses, repeated errors), stop, commit whatever
works, and start a **fresh Antigravity chat session** for the next sub-step —
context resets are free, half-finished work in a clogged session is not.

### Sub-step 1.1 — Backend skeleton + DB connection
```
Read PROJECT_SPEC.md before doing anything else.
Build ONLY: a FastAPI project skeleton with a working SQLAlchemy connection
to SQL Server (mssql+pyodbc), a config file for the DB connection string
(read from an environment variable, not hardcoded), and one health-check
endpoint (GET /health) that confirms the DB connection works.
Do not build auth, question bank, or anything else yet.
Give me a short bullet list of files created and exact steps to run this
locally and confirm /health returns success.
```
**Test:** run the backend, hit `/health`, confirm it reports the DB connection
is working.
**Commit:** `git add . && git commit -m "1.1: backend skeleton + SQL Server connection"`

### Sub-step 1.2 — Auth & RBAC
```
Read PROJECT_SPEC.md before doing anything else. Sub-step 1.1 (backend
skeleton + DB connection) is already done — extend it, don't rebuild it.
Build ONLY: Users/Roles/UserRoles tables, JWT + refresh token auth, password
hashing, RBAC with Admin/Faculty/Student roles, and register/login endpoints.
Do not build question bank, exams, or React UI yet — backend only.
Give me a short bullet list of files created/changed and example curl
commands to test register/login.
```
**Test:** register a user, log in, confirm a JWT is returned, confirm a
protected test route rejects requests without a valid token.
**Commit:** `git commit -am "1.2: auth + RBAC"`

### Sub-step 1.3 — React skeleton + auth UI
```
Read PROJECT_SPEC.md before doing anything else. Backend auth (1.2) is done.
Build ONLY: a React (Vite) project skeleton wired to the backend (base API
client, CORS confirmed working), plus login/register pages and protected
routes per role (Admin/Faculty/Student), using the auth endpoints already
built.
Do not build question bank or exam UI yet.
Give me a short bullet list of files created and how to run the frontend
locally.
```
**Test:** log in through the actual UI as a test user, confirm role-based
route protection works (e.g. a student can't reach an admin-only page).
**Commit:** `git commit -am "1.3: React skeleton + auth UI"`

### Sub-step 1.4 — Question bank CRUD
```
Read PROJECT_SPEC.md before doing anything else. Auth (backend + frontend)
is done.
Build ONLY: Questions and QuestionOptions tables/models, CRUD API endpoints,
and a React admin/faculty UI to create/edit/list questions (objective +
subjective types).
Do not build exam scheduling yet.
Give me a short bullet list of files created and how to test creating a
question through the UI.
```
**Test:** create a few questions of both types through the UI, confirm they
persist and list correctly.
**Commit:** `git commit -am "1.4: question bank CRUD"`

### Sub-step 2.1 — Exam scheduling CRUD
```
Read PROJECT_SPEC.md before doing anything else. Question bank (1.4) is done.
Build ONLY: Exams and ExamQuestions tables/models, CRUD API endpoints, and a
React faculty UI to create an exam, pick questions from the bank, and set a
start/end time window.
Do not build exam delivery/attempt-taking yet.
Give me a short bullet list of files created and how to test scheduling an
exam through the UI.
```
**Test:** schedule an exam with a few questions and a time window, confirm it
saves and lists correctly.
**Commit:** `git commit -am "2.1: exam scheduling CRUD"`

### Sub-step 2.2 — Exam delivery + auto-grading
```
Read PROJECT_SPEC.md before doing anything else. Exam scheduling (2.1) is done.
Build ONLY: Attempts and AttemptAnswers tables/models, the flow for a student
to start an exam within its time window and submit answers, and auto-grading
for objective questions on submission.
Do not build adaptive difficulty or offline sync yet.
Give me a short bullet list of files created and how to test taking an exam
as a student and seeing an auto-graded objective score.
```
**Test:** take a scheduled exam as a student test account, submit, confirm
objective questions are auto-graded correctly.
**Commit:** `git commit -am "2.2: exam delivery + auto-grading"`

### Sub-step 2.3 — Adaptive difficulty engine
```
Read PROJECT_SPEC.md before doing anything else. Exam delivery (2.2) is done.
Build ONLY: the AdaptiveStateLogs table and rule-based adaptive difficulty
logic — after each question, pick the next question's difficulty (wrong
answer -> easier, right answer -> harder) and log the shift.
Do not build offline sync yet.
Give me a short bullet list of files created and how to verify the difficulty
actually shifts during a test attempt.
```
**Test:** take an exam, deliberately answer a few questions wrong and a few
right, confirm the next question's difficulty visibly shifts and is logged.
**Commit:** `git commit -am "2.3: adaptive difficulty engine"`

### Sub-step 2.4 — Offline-first PWA
```
Read PROJECT_SPEC.md before doing anything else. Adaptive difficulty (2.3)
is done.
Build ONLY: PWA support for the exam-taking screen — service worker, caching
the exam paper/questions locally via IndexedDB once loaded, letting a student
answer without connectivity, queuing answers in an OfflineSyncQueue table
(and local storage), and auto-syncing to the server when connectivity
returns, with basic conflict handling.
Do not touch AI Viva or SCI yet.
Give me a short bullet list of files created and exact steps to test this
(e.g. using browser dev tools to simulate offline mode).
```
**Test:** load an exam, turn off network (via browser dev tools), answer a
few questions, turn network back on, confirm answers sync automatically.
**Commit:** `git commit -am "2.4: offline-first PWA sync"`

### Sub-step 3.1 — AI Viva: follow-up question generation
```
Read PROJECT_SPEC.md before doing anything else. Offline-first sync (2.4)
is done.
Build ONLY: VivaSessions and VivaQuestions tables, and a FastAPI module
(app/services/viva_ai.py or similar) that takes a student's submitted
subjective answer and generates 1-2 targeted follow-up questions from it via
a configurable LLM API call. Wire this to trigger automatically after a
subjective answer is submitted during an exam attempt.
Do not build the student response/scoring side yet — just generation.
Give me a short bullet list of files created, the env vars needed for the LLM
API key/endpoint, and how to test that a follow-up question is generated
after submitting a sample answer.
```
**Test:** submit a subjective answer during a test attempt, confirm a
relevant follow-up question appears.
**Commit:** `git commit -am "3.1: AI Viva follow-up question generation"`

### Sub-step 3.2 — AI Viva: response capture + consistency scoring
```
Read PROJECT_SPEC.md before doing anything else. Follow-up generation (3.1)
is done.
Build ONLY: VivaResponses table, the UI/API for a student to submit a text
response to the follow-up question, and a scoring function using a sentence-
embedding model (e.g. sentence-transformers) that returns a 0-1 semantic
consistency score between the original answer and the follow-up response.
Do not build SCI or the faculty dashboard yet.
Give me a short bullet list of files created and how to test with one
consistent answer/response pair and one clearly inconsistent pair, to confirm
the scores differ meaningfully.
```
**Test:** submit a genuine, consistent answer+response pair (expect a high
score) and a deliberately contradictory pair (expect a low score); confirm
the scores differ as expected.
**Commit:** `git commit -am "3.2: viva response capture + consistency scoring"`

### Sub-step 3.3 — AI Viva: error handling
```
Read PROJECT_SPEC.md before doing anything else. Viva scoring (3.2) is done.
Build ONLY: graceful error handling around the LLM API call — retry once on
failure/timeout, then fail without crashing the student's exam attempt (log
the error, let the attempt continue without a viva question for that answer
if generation ultimately fails).
Give me a short bullet list of files changed and how to simulate an LLM API
failure to confirm the attempt doesn't crash.
```
**Test:** temporarily break the LLM API key/endpoint, submit an answer,
confirm the exam attempt continues without crashing and the error is logged.
**Commit:** `git commit -am "3.3: viva error handling"`

### Sub-step 4.1 — SCI engine
```
Read PROJECT_SPEC.md before doing anything else. AI Viva (3.1-3.3) is done.
Build ONLY: the SkillConfidenceRecords table and a service implementing
SCI = alpha * Ep + beta * Vp - gamma * Delta(Ep, Vp), with alpha/beta/gamma
configurable per subject/exam (with sensible defaults), computed
automatically once an attempt's exam and viva scoring are both complete.
Do not build the faculty dashboard UI yet — backend/calculation only.
Give me a short bullet list of files created and how to verify the SCI
calculation with example numbers (e.g. via an API call or test script).
```
**Test:** manually verify the SCI formula output against a hand-calculated
example using known Ep/Vp/Delta values.
**Commit:** `git commit -am "4.1: SCI engine"`

### Sub-step 4.2 — Faculty dashboard
```
Read PROJECT_SPEC.md before doing anything else. SCI engine (4.1) is done.
Build ONLY: a React faculty dashboard showing, per exam, a table of student
attempts with Ep, Vp, Delta, and final SCI shown separately (never just the
final number), plus a detail view for a single attempt with the full
breakdown.
Give me a short bullet list of files created and how to view this as a
faculty test account.
```
**Test:** log in as faculty, view the dashboard for a test exam, confirm all
four values display correctly for at least one completed attempt.
**Commit:** `git commit -am "4.2: faculty dashboard"`

### Sub-step 4.3 — Paper hash-chain ledger
```
Read PROJECT_SPEC.md before doing anything else. Faculty dashboard (4.2) is
done.
Build ONLY: the PaperLedger table implementing a simple hash-chain (each
record stores a hash of its content + the previous record's hash + a
timestamp) logging question paper access/distribution events, plus an
endpoint that walks the chain and verifies no links are broken.
Give me a short bullet list of files created and how to test the integrity
check (including deliberately corrupting one record to confirm it's detected).
```
**Test:** trigger a few paper-access events, run the integrity check
(expect success), then manually alter one DB record and re-run the check
(expect it to detect the break).
**Commit:** `git commit -am "4.3: paper hash-chain ledger"`

### Sub-step 4.4 — Keystroke/mouse-dynamics signal (optional)
```
Read PROJECT_SPEC.md before doing anything else. Paper ledger (4.3) is done.
Build ONLY: basic keystroke/mouse-movement timing capture on the exam-attempt
page in React, sent to the backend, compared against the student's own
session baseline using simple statistical deviation (not a full ML model),
feeding as an optional extra signal into the Delta calculation from 4.1.
Give me a short bullet list of files created and how to test that an
unusually different typing pattern registers as a deviation.
```
**Test:** complete an attempt normally, then simulate an unusual typing
pattern (e.g. very fast paste-like input) and confirm the deviation registers.
**Commit:** `git commit -am "4.4: keystroke/mouse dynamics signal"`

### Sub-step 5.1 — Tests
```
Read PROJECT_SPEC.md before doing anything else. All build sub-steps (1.1
through 4.4) are complete. This is testing only — do not add any new
features, even small ones from the out-of-scope list.
Write unit/integration tests for: auth, exam submission, adaptive difficulty
logging, AI Viva scoring, SCI calculation, and ledger integrity checking.
Give me a short bullet list of test files created and how to run the full
test suite.
```
**Test:** run the full test suite, confirm it passes (or note failures for
sub-step 5.2).
**Commit:** `git commit -am "5.1: test suite"`

### Sub-step 5.2 — Bug fixing pass
```
Read PROJECT_SPEC.md before doing anything else. Test suite (5.1) is done.
This is a bug-fixing pass only — no new features.
Go through the test results and any known issues, fix them, and list each
bug and its fix in one line each.
```
**Test:** re-run the full test suite, confirm previously failing tests now pass.
**Commit:** `git commit -am "5.2: bug fixes"`

### Sub-step 5.3 — Diagrams
```
Read PROJECT_SPEC.md before doing anything else. Bug fixes (5.2) are done.
Generate: an ER diagram (Mermaid or DBML) reflecting the actual tables built,
and a sequence diagram (Mermaid) for the flow: exam submission -> AI Viva
follow-up -> consistency scoring -> SCI calculation.
Give me the diagram files/content directly.
```
**Test:** paste the Mermaid output into a Mermaid live editor (or similar) to
confirm it renders correctly.
**Commit:** `git commit -am "5.3: ER + sequence diagrams"`

### Sub-step 5.4 — Deployment guide
```
Read PROJECT_SPEC.md before doing anything else. Diagrams (5.3) are done.
Write a README section with clear steps to run the full stack (FastAPI
backend, React frontend, SQL Server) locally, including any environment
variables needed (DB connection string, LLM API key/endpoint).
```
**Test:** follow the README from a clean checkout (or at least re-read it
critically) to confirm nothing important is missing.
**Commit:** `git commit -am "5.4: deployment guide"`

---

## PART D — Session hygiene (how to actually avoid running out of tokens)

- **One sub-step per Antigravity session/message.** Never combine two.
- **Start a fresh chat session at the start of each numbered group** (1.x,
  2.x, 3.x, 4.x, 5.x) even if the previous session still has room — this
  keeps each session's context small and focused, and makes it easier to
  spot exactly which sub-step introduced a bug later.
- **Always let the agent read `PROJECT_SPEC.md` itself** rather than pasting
  spec content into chat — pointing at a file is far cheaper than repeating
  text in the conversation.
- **Commit after every sub-step, even small ones.** If a later sub-step goes
  wrong or a session gets confused, you can always roll back to the last
  known-good commit instead of losing the whole session's work.
- **If a session is clearly stuck** (repeating itself, erroring on the same
  thing 3+ times, or the response is visibly slowing down), stop, commit
  whatever partial progress is safe, and open a brand new session for a
  fresh attempt at the same sub-step rather than continuing to push the
  same stuck session.
