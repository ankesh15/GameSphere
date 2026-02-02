# GameSphere AI Service

FastAPI service responsible for AI-driven scoring and insights.

## Setup
1. Create and activate a virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Start the service:
   - `uvicorn app.main:app --reload --port 8000`

## Endpoints
- `GET /health`: Service health
- `POST /matchmaking/score`: Score a potential match
- `POST /recommend`: Recommend games and teammates

## Environment
- `AI_API_KEY` (optional): If set, clients must send `x-api-key`.
