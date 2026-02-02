# GameSphere

GameSphere is a production-grade, full-stack gamer community platform that integrates AI-powered game recommendations, real-time matchmaking, and tournament management into a unified ecosystem.

Built using React, TypeScript, NestJS, MongoDB, WebSockets, and FastAPI, the platform follows modular architecture and microservice principles to ensure scalability, security, and maintainability. GameSphere demonstrates end-to-end system design, API-driven development, and real-time communication

## Quick Links
- `SETUP.md`: End-to-end setup steps
- `ARCHITECTURE.md`: System overview and data model
- `API.md`: REST + WebSocket reference
- `backend/README.md`, `frontend/README.md`, `ai-service/README.md`, `shared/README.md`

## What This Provides
- Authentication with JWT access + refresh tokens
- Gamer profiles with availability and linked accounts
- Matchmaking requests and match sessions
- Realtime chat for matches and clans
- Tournaments with brackets and verification
- Clan management with roles, invites, and events
- AI-assisted recommendations and scoring

## Repository Layout
- `frontend/`: React + TypeScript + Vite client
- `backend/`: NestJS + TypeScript REST API
- `ai-service/`: FastAPI service for AI scoring and recommendations
- `shared/`: Shared types and constants

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind, Zustand, Axios
- Backend: NestJS, TypeScript, MongoDB, Socket.IO
- AI Service: FastAPI (Python)
- Shared: Framework-agnostic TypeScript types/constants

## Prerequisites
- Node.js 18+ (npm)
- Python 3.11+
- MongoDB 6+

## Local Development
Each service runs independently. For detailed instructions, see `SETUP.md`.

### Backend (NestJS)
1. `cd backend`
2. `npm install`
3. `npm run start:dev`

### AI Service (FastAPI)
1. `cd ai-service`
2. `pip install -r requirements.txt`
3. `uvicorn app.main:app --reload --port 8000`

### Frontend (React + Vite)
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Environment Variables
See the service READMEs for the full list. Commonly used:

### Backend
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- `MATCH_MAX_SKILL_GAP`, `MATCH_MAX_PING_MS`
- `MATCH_REQUEST_TTL_SECONDS`, `MATCH_ACCEPT_TIMEOUT_SECONDS`
- `AI_SERVICE_URL`, `AI_SERVICE_API_KEY`
- `AI_TIMEOUT_MS`, `AI_CACHE_TTL_SECONDS`, `AI_CACHE_MAX`
- `RATE_LIMIT_TTL_SECONDS`, `RATE_LIMIT_MAX`
- `ERROR_TRACKING_DSN`
- `PORT` (default `3000`)

### AI Service
- `AI_API_KEY` (optional): required if set on the AI service

### Frontend
- `VITE_API_BASE_URL` (optional): REST API base URL

## Ports
- Backend: `3000`
- Frontend: `5173`
- AI service: `8000`

## API and Realtime
- REST base URL: `http://localhost:3000/api`
- WebSocket: Socket.IO on the backend host (send auth token in `Authorization` or `auth.token`)
- Full reference: `API.md`

## Useful Scripts
### Backend
- `npm run start`: Run compiled server
- `npm run start:dev`: Run with watch mode
- `npm run build`: Compile TypeScript

### Frontend
- `npm run dev`: Start Vite dev server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
