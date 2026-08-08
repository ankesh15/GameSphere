# GameSphere Platform Setup & Production Guide

This guide details environment setup, installation, running, and verification procedures for the GameSphere platform microservices and frontend application.

## 1. Prerequisites
- **Node.js**: v18.x or v20.x
- **npm**: v9.x or higher
- **Python**: v3.11+
- **MongoDB**: v6.0+ (Local instance or MongoDB Atlas URI)

---

## 2. Environment Configuration

### Backend (`/backend`)
Copy `backend/.env.example` to `backend/.env` and update configuration parameters:
```bash
cp backend/.env.example backend/.env
```
Key variables:
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for JWT access tokens.
- `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens.
- `AI_SERVICE_URL`: URL of the FastAPI recommendation service (`http://localhost:8000`).

### Frontend (`/frontend`)
Copy `frontend/.env.example` to `frontend/.env` (if custom host URLs are needed):
```bash
cp frontend/.env.example frontend/.env
```
Key variables:
- `VITE_API_BASE_URL`: NestJS backend API root (`http://localhost:3000`).
- `VITE_WS_URL`: Socket.IO realtime server root (`http://localhost:3000`).

---

## 3. Installation & Running

### A. Backend Service (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
- API Base URL: `http://localhost:3000/api`
- WebSocket Server: `http://localhost:3000`

### B. AI Microservice (FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Base URL: `http://localhost:8000`
- Interactive API Docs: `http://localhost:8000/docs`

### C. Frontend Application (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 4. Verification & Testing

### Running Backend Unit Tests
```bash
cd backend
npx jest
```

### Running Frontend Type Check & Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 5. Security & Handover Checklists
- `.env` files are ignored in Git (`.gitignore`). Never commit production secrets.
- Always use strong, randomly generated secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET` in production environments.
