# Mindscribe — Next-Gen AI Examination & Skill Evaluation Platform

**Mindscribe** is a high-tech, offline-first exam platform equipped with dynamic AI Viva follow-up questioning, rule-based adaptive difficulty scaling, Skill Confidence Index ($\text{SCI}$) analytics, and tamper-evident paper hash-chain ledgers.

---

## 🛠️ Stack & Architecture Overview

- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide Icons, Glassmorphism UI, Service Worker + IndexedDB PWA Engine.
- **Backend API**: Python FastAPI, SQLAlchemy ORM (`mssql+pyodbc`), Pydantic.
- **Database**: Microsoft SQL Server (ODBC Driver 18).
- **AI Core**: Configurable LLM API integration for AI Viva follow-up generation + `sentence-transformers` vector semantic similarity scoring.
- **Security & Integrity**: JWT + Refresh Token Rotation (RBAC for Admin, Faculty, Student, Recruiter), SHA-256 Paper Hash-Chain Ledger.

---

## 🚀 Local Deployment Guide

### Prerequisites
1. **Python 3.11+** installed.
2. **Node.js 18+ and npm** installed.
3. **Microsoft SQL Server** (Express or Developer Edition) running locally.
4. **Microsoft ODBC Driver 18 for SQL Server** installed on host OS.

---

### Step 1: Database Setup
Ensure SQL Server is running and create a database named `MindscribeDB`:
```sql
CREATE DATABASE MindscribeDB;
```

---

### Step 2: Backend Setup (FastAPI)

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `backend/.env`:
   ```ini
   DATABASE_URL=mssql+pyodbc://@localhost/MindscribeDB?driver=ODBC+Driver+18+for+SQL+Server&trusted_connection=yes&TrustServerCertificate=yes
   APP_ENV=development
   DEBUG=True
   SECRET_KEY=your-super-secret-mindscribe-jwt-key-2026
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # Optional Configurable LLM for AI Viva:
   LLM_API_KEY=your_openai_or_groq_api_key
   LLM_API_URL=https://api.openai.com/v1/chat/completions
   LLM_MODEL_NAME=gpt-3.5-turbo
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will automatically initialize all SQL Server tables on startup.*
   - API Documentation: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

---

### Step 3: Frontend Setup (React Vite PWA)

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   - Application URL: `http://localhost:3000`

---

## 🧪 Running the Test Suite

Execute pytest in the `backend/` folder:
```bash
cd backend
pytest
```

---

## 📄 Key Features Summary

1. **Auth & RBAC**: Multi-role support (`Admin`, `Faculty`, `Student`, `Recruiter`).
2. **Question Bank**: Objective (MCQ) & Subjective questions.
3. **Adaptive Difficulty**: Rule-based difficulty scaling ($E \rightarrow M \rightarrow H$) with `AdaptiveStateLogs`.
4. **Offline-First PWA**: IndexedDB caching + Service Worker for zero-downtime exam delivery during network drops.
5. **AI Viva Engine**: Dynamic LLM follow-up question generation + `sentence-transformers` vector semantic similarity scoring ($V_p$).
6. **Skill Confidence Index (SCI)**:
   $$\text{SCI} = \alpha E_p + \beta V_p - \gamma |E_p - V_p|$$
7. **Paper Hash-Chain Ledger**: SHA-256 tamper-evident log for exam paper access and verification.
