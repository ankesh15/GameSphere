# GameSphere Backend

NestJS + TypeScript REST API for matchmaking and community services.

## Setup
1. Install dependencies:
   - `npm install`
2. Start the API:
   - `npm run start:dev`

## Environment
Required for production and recommended for local development:
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret used to sign access tokens.
- `JWT_EXPIRES_IN`: Token lifespan (e.g. `1h`).
- `JWT_REFRESH_SECRET`: Secret used to sign refresh tokens.
- `JWT_REFRESH_EXPIRES_IN`: Refresh token lifespan (e.g. `7d`).
- `MATCH_MAX_SKILL_GAP`: Max skill rating gap when matching (default: `2`).
- `MATCH_MAX_PING_MS`: Max allowed ping in ms (default: `150`).
- `MATCH_REQUEST_TTL_SECONDS`: Time to keep queued requests (default: `600`).
- `MATCH_ACCEPT_TIMEOUT_SECONDS`: Time to accept a match (default: `90`).
- `AI_SERVICE_URL`: FastAPI base URL (default: `http://localhost:8000`).
- `AI_SERVICE_API_KEY`: API key sent as `x-api-key` (optional).
- `AI_TIMEOUT_MS`: AI request timeout in ms (default: `4000`).
- `AI_CACHE_TTL_SECONDS`: Cache TTL for recommendations (default: `300`).
- `AI_CACHE_MAX`: Cache size limit (default: `500`).
- `RATE_LIMIT_TTL_SECONDS`: Rate limit window in seconds (default: `60`).
- `RATE_LIMIT_MAX`: Max requests per window (default: `120`).
- `ERROR_TRACKING_DSN`: Optional error tracking DSN.
- `PORT`: Optional HTTP port (default: `3000`).

## Endpoints
- `GET /api/health`: Service health
- `POST /api/matchmaking/requests`: Queue a matchmaking request
- `POST /api/matchmaking/sessions/:sessionId/accept`: Accept match offer
- `POST /api/matchmaking/sessions/:sessionId/decline`: Decline match offer
- `POST /api/auth/register`: Create account and issue tokens
- `POST /api/auth/login`: Login and issue tokens
- `POST /api/auth/refresh`: Rotate refresh token
- `POST /api/auth/logout`: Revoke refresh token
- `GET /api/profiles/me`: Get gamer profile
- `POST /api/profiles`: Create gamer profile
- `PATCH /api/profiles/me`: Update gamer profile
- `PATCH /api/profiles/me/availability`: Update availability
- `POST /api/profiles/me/accounts`: Link gaming account
- `DELETE /api/profiles/me/accounts/:provider`: Unlink gaming account
- `GET /api/chat/rooms/:roomId/messages`: List messages in a room
- `POST /api/chat/rooms/:roomId/messages`: Send a message via REST
- `POST /api/tournaments`: Create tournament
- `POST /api/tournaments/:tournamentId/join`: Join tournament
- `POST /api/tournaments/:tournamentId/leave`: Leave tournament
- `POST /api/tournaments/:tournamentId/bracket`: Generate brackets
- `POST /api/tournaments/:tournamentId/results`: Submit match result
- `POST /api/tournaments/:tournamentId/verify`: Verify winner (admin/organizer)
- `POST /api/clans`: Create clan
- `POST /api/clans/:clanId/invite`: Invite member
- `POST /api/clans/:clanId/join`: Join clan
- `POST /api/clans/:clanId/leave`: Leave clan
- `POST /api/clans/:clanId/kick`: Kick member
- `PATCH /api/clans/:clanId/role`: Update clan role
- `POST /api/clans/:clanId/events`: Create clan event
- `GET /api/clans/:clanId/events`: List clan events
- `POST /api/ai/recommend`: Proxy AI recommendations

## Realtime Events (Socket.IO)
- Connect with `Authorization: Bearer <token>` or `auth.token`.
- `presence.subscribe`: Subscribe to presence updates for user IDs.
- `chat.join`: Join `match:<sessionId>` or `clan:<clanId>` rooms.
- `chat.send`: Send message to a room (persists to MongoDB).
- `chat.typing`: Broadcast typing indicator in a room.
- `match.offer`, `match.accepted`, `match.declined`, `match.started`: Match lifecycle notifications.

## Notes
- Global validation is enforced via `ValidationPipe`.
- Errors are standardized via a global exception filter.
- Request logs are emitted by a logging middleware.
