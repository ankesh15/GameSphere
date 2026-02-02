# GameSphere Setup Guide

## Prerequisites
- Node.js 18+ (npm)
- Python 3.11+
- MongoDB 6+

## Backend (NestJS)
1. Install deps:
   - `cd backend`
   - `npm install`
2. Configure environment variables (examples):
   - `MONGODB_URI=mongodb://localhost:27017/gamesphere`
   - `JWT_SECRET=change_me`
   - `JWT_REFRESH_SECRET=change_me_refresh`
   - `AI_SERVICE_URL=http://localhost:8000`
3. Start API:
   - `npm run start:dev`

## AI Service (FastAPI)
1. Install deps:
   - `cd ai-service`
   - `pip install -r requirements.txt`
2. Optional API key:
   - `AI_API_KEY=change_me`
3. Start service:
   - `uvicorn app.main:app --reload --port 8000`

## Frontend (React + Vite)
1. Install deps:
   - `cd frontend`
   - `npm install`
2. Optional environment:
   - `VITE_API_BASE_URL=http://localhost:3000/api`
3. Start UI:
   - `npm run dev`

## Ports
- Backend: `3000`
- Frontend: `5173`
- AI service: `8000`
