# Backend README - Credit Risk App

This document explains the backend service in detail: architecture, modules, APIs, data flow, model lifecycle, environment configuration, testing, and deployment.

## 1. Overview

The backend is a FastAPI application that provides:

- Credit risk prediction (`/api/v1/risk/analyze`)
- Loan workflows (`/api/v1/loan/*`)
- Demo authentication (`/api/v1/auth/*`)
- AI credit coaching and what-if simulation (`/api/v1/credit-coach/*`)
- Health endpoint (`/health`)

Main goals:

- Validate requests with Pydantic schemas
- Run ML inference with a trained scikit-learn pipeline
- Persist loan applications in SQLite
- Support deterministic explainability plus optional Gemini enhancement
- Keep frontend integration stable with consistent response envelopes

## 2. Tech Stack

- Python 3.12 (Docker image)
- FastAPI
- Pydantic v2
- scikit-learn
- pandas
- joblib
- SQLite (for loan applications)
- pytest + httpx + FastAPI TestClient

Dependencies are in `requirements.txt`.

## 3. Backend Structure

Top-level backend files and folders:

- `src/main.py`: app factory, middleware, startup/shutdown lifecycle, router registration
- `src/core/config.py`: settings and `.env` loading
- `src/api/v1/`: route modules
- `src/schemas/`: request and response schemas
- `src/models/inference.py`: ML training/loading/prediction service
- `src/models/loan_application.py`: loan domain dataclass
- `src/services/`: business logic services
- `src/scripts/train_model.py`: model training entrypoint
- `datasets/`: CSV training datasets
- `models/`: persisted model artifacts and sqlite db
- `tests/`: API and schema tests
- `Dockerfile`: container build and run config
- `Procfile`: Heroku-compatible command
- `train_model.py`: top-level shortcut script to train model
- `scripts/keep_warm.py`: optional keep-warm ping script

## 4. Application Lifecycle and Flow

### 4.1 App creation

`src/main.py` builds the app via `create_app()`:

1. Loads settings from `get_settings()`
2. Creates shared services:
- `CreditRiskInferenceService`
- `CreditCoachService`
- `CounterfactualService`
- `LoanApplicationRepository`
3. During startup lifespan:
- Optionally autoloads model (`MODEL_AUTOLOAD=true` by default)
- If model load fails, tries one-time training from dataset
- Initializes loan SQLite table
- Wires service dependencies into routers
- Optionally starts async keep-warm timer task
4. Registers global error handlers and logging middleware
5. Adds CORS middleware
6. Includes `/api/v1` routers and `/health`

### 4.2 Error handling style

Global exception handlers return a consistent shape:

```json
{
  "success": false,
  "error": "..."
}
```

- `HTTPException` uses explicit status code and message extraction
- Validation errors return 422 with first error message
- Unexpected exceptions return 500

### 4.3 Request logging

A middleware logs:

- Request start (method + path)
- Request completion (status + elapsed time in ms)

## 5. Configuration and Environment Variables

Settings are defined in `src/core/config.py`.

The backend loads `.env` from:

1. `backend/.env`
2. project root `.env`

### 5.1 Important env vars

- `APP_ENV` (default: `development`)
- `API_V1_PREFIX` (default: `/api/v1`)
- `DATASET_PATH` (default: `backend/datasets/credit_risk_dataset.csv`)
- `MODEL_PATH` (default: `backend/models/credit_risk_model.joblib`)
- `LOAN_DB_PATH` (default: `backend/models/loan_applications.db`)
- `MODEL_AUTOLOAD` (default: `true`)
- `CORS_ALLOW_ORIGINS` (comma-separated origins)
- `CORS_ALLOW_CREDENTIALS` (default: `true`)
- `CORS_ALLOW_METHODS` (default: `*`)
- `CORS_ALLOW_HEADERS` (default: `*`)
- `ENABLE_KEEP_WARM_TIMER` (default: `false`)
- `KEEP_WARM_INTERVAL_SECONDS` (default: `50`, min enforced: `10`)
- `KEEP_WARM_URL` (required only if keep-warm timer enabled)
- `GOOGLE_API_KEY` (optional; enables Gemini response enhancement)

### 5.2 Notes on paths

`_resolve_project_path` supports both:

- `backend/...`
- direct relative paths like `datasets/...`

This helps across local and Render rootDir setups.

## 6. API Endpoints

Base prefix: `/api/v1`

### 6.1 Health

- `GET /health`
- Returns status, environment, and keep-warm timer state

### 6.2 Risk Analysis

- `POST /api/v1/risk/analyze`
- Router: `src/api/v1/risk.py`
- Request schema: `RiskAnalyzeRequest`
- Response schema envelope: `RiskAnalyzeApiResponse`

Input fields include:

- personal profile (age, income, home ownership, employment length)
- loan attributes (intent, grade, amount, interest rate, percent income)
- credit history indicators (default flag, credit history length)

Output includes:

- `risk_score` (0-100)
- `risk_grade` (`Low` | `Moderate` | `High`)
- `utilization_rate`
- `risk_factors[]`
- `portfolio_risk`

### 6.3 Loan Module

Router: `src/api/v1/loan.py`

- `POST /api/v1/loan/apply`
- `GET /api/v1/loan/categories`
- `GET /api/v1/loan/applications`

Behavior:

- Calculates model-based or fallback risk
- Applies debt-to-income adjustment
- Computes derived `credit_score`
- Computes EMI
- Persists application in SQLite

### 6.4 Demo Auth

Router: `src/api/v1/auth.py`

- `GET /api/v1/auth/demo-users`
- `POST /api/v1/auth/login`

Purpose:

- In-memory demo users for frontend/demo scenarios
- Returns dashboard preview payload for selected user profile

### 6.5 Credit Coach

Router: `src/api/v1/credit_coach.py`

- `POST /api/v1/credit-coach/chat`
- `POST /api/v1/credit-coach/what-if`

Behavior:

- Chat endpoint uses deterministic intent detection + factor extraction
- What-if endpoint simulates profile changes with heuristic counterfactual scoring
- If `GOOGLE_API_KEY` is set, chat may be enhanced by Gemini response generation

## 7. ML Inference and Training

Implemented in `src/models/inference.py`.

### 7.1 Feature handling

The model expects exactly these feature columns:

- `person_age`
- `person_income`
- `person_home_ownership`
- `person_emp_length`
- `loan_intent`
- `loan_grade`
- `loan_amnt`
- `loan_int_rate`
- `loan_percent_income`
- `cb_person_default_on_file`
- `cb_person_cred_hist_length`

### 7.2 Pipeline

Training pipeline:

- Numeric pipeline:
- `SimpleImputer(strategy="median")`
- `StandardScaler()`
- Categorical pipeline:
- `SimpleImputer(strategy="most_frequent")`
- `OneHotEncoder(handle_unknown="ignore")`
- Estimator:
- `LogisticRegression(max_iter=1000, class_weight="balanced")`

Target column in dataset must be: `loan_status`.

### 7.3 Training entrypoints

- `python train_model.py`
- or `python -m src.scripts.train_model`

Both train using configured dataset and persist model to configured model path.

## 8. Loan Domain and Persistence

### 8.1 Domain model

`src/models/loan_application.py` defines a dataclass with:

- identifiers (`id`, `user_id`)
- loan input data
- computed outputs (`risk_score`, `credit_score`, `emi`)
- timestamp

### 8.2 Repository

`src/services/loan_repository.py`:

- SQLite-backed
- thread lock for safe writes
- table auto-creation on startup
- list API sorted by newest (`created_at DESC`)

### 8.3 Loan service logic

`src/services/loan_service.py`:

- validates max tenure per loan category
- computes loan-to-income ratio
- tries ML inference first
- uses fallback probability when model unavailable
- applies income-ratio penalties
- normalizes CIBIL score and blends with risk to create `credit_score`
- computes EMI via amortization formula

## 9. Credit Coach and What-If Engine

### 9.1 CreditCoachService

`src/services/credit_coach_service.py`:

- intent detection (`explain_score`, `improve_score`, `summarize`, `general`)
- risk factor extraction from core profile fields
- deterministic answer generation
- recommendation generation
- optional LLM refinement via `GeminiService`

### 9.2 CounterfactualService

`src/services/counterfactual_service.py`:

- accepts original profile + hypothetical changes
- estimates score delta via interpretable heuristics
- returns impact level and narrative summary
- returns actionable recommendations

### 9.3 GeminiService

`src/services/gemini_service.py`:

- only active when `GOOGLE_API_KEY` exists
- calls Gemini endpoint server-side
- on failure or misconfiguration, gracefully returns `None` and falls back to deterministic answer

## 10. Running Locally

From `backend` directory:

1. Create/activate virtual environment
2. Install dependencies
3. Run API server

Example commands (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

Open docs:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 11. Testing

Tests live in `tests/` and cover:

- risk endpoint contract
- loan endpoints and validation shape
- demo auth behavior
- CORS preflight handling
- schema validation

Run tests from `backend`:

```powershell
pytest -q
```

Current tests set `MODEL_AUTOLOAD=false` where needed to avoid requiring a local model artifact during CI/test runs.

## 12. Deployment Notes

### 12.1 Docker

`Dockerfile`:

- base: `python:3.12-slim`
- installs `requirements.txt`
- exposes port `10000`
- runs `uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-10000}`

### 12.2 Procfile

`Procfile` contains:

- `web: uvicorn src.main:app --host 0.0.0.0 --port $PORT`

Marked as Heroku-compatible; project indicates Render uses `render.yaml` as source of truth.

### 12.3 Keep-warm support

Two options exist:

1. Internal timer in app startup (`ENABLE_KEEP_WARM_TIMER=true` + `KEEP_WARM_URL`)
2. Standalone ping script: `python scripts/keep_warm.py`

The standalone script reads:

- `KEEP_WARM_URL`
- `KEEP_WARM_TIMEOUT_SECONDS` (default 10)

## 13. Example Requests

### 13.1 Risk analyze

```json
{
  "person_age": 30,
  "person_income": 72000,
  "person_home_ownership": "RENT",
  "person_emp_length": 5,
  "loan_intent": "PERSONAL",
  "loan_grade": "B",
  "loan_amnt": 12000,
  "loan_int_rate": 11.4,
  "loan_percent_income": 0.17,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 8
}
```

### 13.2 Loan apply

```json
{
  "user_id": "aarav",
  "loan_amount": 750000,
  "loan_category": "HOME",
  "selected_bank": "SBI",
  "salary": 90000,
  "cibil_score": 780,
  "tenure": 120
}
```

### 13.3 Demo login

```json
{
  "username": "aarav",
  "password": "demo123"
}
```

## 14. Common Issues and Fixes

- Model not found on startup:
- Ensure `DATASET_PATH` exists so auto-train can run, or train manually with `python train_model.py`.

- CORS blocked from frontend:
- Add frontend origin to `CORS_ALLOW_ORIGINS`.

- Gemini response not used:
- Set `GOOGLE_API_KEY`; without it, deterministic responses are expected.

- Loan apply returns 400 for tenure:
- Check category-specific max tenure from `GET /api/v1/loan/categories`.

- SQLite file path issues:
- Verify `LOAN_DB_PATH` and write permissions.

## 15. Development Guidelines

- Keep schema changes synchronized with frontend payload contracts.
- Prefer service-layer logic over route-level business code.
- Keep route handlers thin: validate input, call service, return envelope.
- Maintain deterministic fallback behavior where external integrations exist.
- Update tests whenever endpoint contracts or validations change.

## 16. Quick Reference

- App entrypoint: `src.main:app`
- API base path: `/api/v1`
- Health: `/health`
- Train model: `python train_model.py`
- Run server: `uvicorn src.main:app --reload`
- Run tests: `pytest -q`
