# GameSphere API Docs

Base URL (backend): `http://localhost:3000/api`

Authentication
- Use `Authorization: Bearer <accessToken>` for protected routes.
- Obtain tokens via `/auth/register` or `/auth/login`.
- Refresh tokens via `/auth/refresh`.

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout` (auth required)

## Health
- `GET /health`

## Gamer Profiles (auth required)
- `POST /profiles`
- `GET /profiles/me`
- `PATCH /profiles/me`
- `PATCH /profiles/me/availability`
- `POST /profiles/me/accounts`
- `DELETE /profiles/me/accounts/:provider`

## Matchmaking (auth required)
- `POST /matchmaking/requests`
- `POST /matchmaking/sessions/:sessionId/accept`
- `POST /matchmaking/sessions/:sessionId/decline`

## Chat (auth required)
- `GET /chat/rooms/:roomId/messages`
- `POST /chat/rooms/:roomId/messages`

Room IDs:
- `match:<matchSessionId>`
- `clan:<clanId>`

## Tournaments (auth required)
- `POST /tournaments`
- `POST /tournaments/:tournamentId/join`
- `POST /tournaments/:tournamentId/leave`
- `POST /tournaments/:tournamentId/bracket`
- `POST /tournaments/:tournamentId/results`
- `POST /tournaments/:tournamentId/verify` (organizer/admin)

## Clans (auth required)
- `POST /clans`
- `POST /clans/:clanId/invite`
- `POST /clans/:clanId/join`
- `POST /clans/:clanId/leave`
- `POST /clans/:clanId/kick`
- `PATCH /clans/:clanId/role`
- `POST /clans/:clanId/events`
- `GET /clans/:clanId/events`

## AI Proxy (auth required)
- `POST /ai/recommend`

## WebSocket (Socket.IO)
Connect to the backend host, send auth token in:
- `Authorization: Bearer <token>` or `auth.token`.

Events:
- `presence.subscribe` -> `presence.snapshot`, `presence.update`
- `chat.join` -> `chat.joined`
- `chat.send` -> `chat.message`
- `chat.typing`
- `match.offer`, `match.accepted`, `match.declined`, `match.started`

## AI Service (FastAPI)
Base URL: `http://localhost:8000`
- `GET /health`
- `POST /matchmaking/score`
- `POST /recommend`

If `AI_API_KEY` is set in the AI service, send `x-api-key`.
