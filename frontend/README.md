# Credit Risk Expo Frontend

This Expo app is connected to the FastAPI backend in this repository.

## Features

- Demo login using backend endpoint: `POST /api/v1/auth/login`
- Shows 3 demo users from: `GET /api/v1/auth/demo-users`
- Displays scenario preview response returned at login
- Runs live backend inference via: `POST /api/v1/risk/analyze`

## Setup

1. Copy `.env.example` to `.env`
2. Set backend URL:

   - Local desktop/web: `EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
   - Android emulator: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api/v1`

3. Install deps:

```bash
npm install
```

4. Start app:

```bash
npm run start
```

## Demo Credentials

- `aarav` / `demo123` (Low Risk)
- `nisha` / `demo123` (Moderate Risk)
- `rohan` / `demo123` (High Risk)
