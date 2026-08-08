# GameSphere Platform API Documentation

Base URL (backend): `http://localhost:3000/api`

## Authentication Overview
- Use `Authorization: Bearer <accessToken>` header for protected routes.
- Obtain JWT tokens via `POST /api/auth/register` or `POST /api/auth/login`.
- Refresh expired access tokens via `POST /api/auth/refresh`.

---

## Auth Endpoints
- `POST /api/auth/register` — Create new user account.
- `POST /api/auth/login` — Authenticate user and receive JWT access/refresh tokens.
- `POST /api/auth/refresh` — Issue fresh access token using valid refresh token.
- `POST /api/auth/logout` (auth required) — Invalidate current auth session.

## System Health
- `GET /api/health` — Platform status check.

## Gamer Profiles (auth required)
- `POST /api/profiles` — Create gamer profile.
- `GET /api/profiles/me` — Get authenticated user's profile.
- `PATCH /api/profiles/me` — Update gamer profile details.
- `PATCH /api/profiles/me/availability` — Update weekly gaming schedule.
- `POST /api/profiles/me/accounts` — Link external gaming account (Steam, Riot, Epic).
- `DELETE /api/profiles/me/accounts/:provider` — Unlink gaming account.

## Matchmaking (auth required)
- `POST /api/matchmaking/requests` — Queue for a match (`gameId`, `region`, `skill`, `pingMs`).
- `GET /api/matchmaking/sessions/me` — Fetch user's match history (`?status=completed|active|pending`).
- `POST /api/matchmaking/sessions/:sessionId/accept` — Accept match invitation.
- `POST /api/matchmaking/sessions/:sessionId/decline` — Decline match invitation.

## Chat System (auth required)
- `GET /api/chat/rooms/:roomId/messages` — Fetch historical messages for a room on join.
*Note: Real-time chat message transmission is handled via WebSocket gateway (`socket.emit("chat.send")`). Legacy REST POST endpoint has been decommissioned.*

Room ID formats:
- `match:<matchSessionId>` — Temporary match room.
- `clan:<clanId>` — Clan text channel (e.g. `clan:<clanId>:general-chat`).

## Tournaments (auth required)
- `POST /api/tournaments` — Create tournament.
- `GET /api/tournaments` — List all tournaments.
- `GET /api/tournaments/:tournamentId` — Get tournament details & bracket.
- `POST /api/tournaments/:tournamentId/join` — Register for tournament.
- `POST /api/tournaments/:tournamentId/leave` — Deregister from tournament.
- `POST /api/tournaments/:tournamentId/bracket` — Generate single-elimination bracket (organizer).
- `POST /api/tournaments/:tournamentId/results` — Submit match result (participant).
- `POST /api/tournaments/:tournamentId/verify` (organizer/admin) — Verify match winner. Returns match details along with explicit reward status feedback (`badgeAwarded: boolean`, `badgeError?: string`).

## Clans (auth required)
- `POST /api/clans` — Create clan.
- `POST /api/clans/:clanId/invite` — Send clan invite.
- `POST /api/clans/:clanId/join` — Join public clan.
- `POST /api/clans/:clanId/leave` — Leave clan.
- `POST /api/clans/:clanId/kick` — Kick clan member (owner/admin).
- `PATCH /api/clans/:clanId/role` — Update member role.
- `POST /api/clans/:clanId/events` — Schedule clan event.
- `GET /api/clans/:clanId/events` — List clan events.

## AI Recommendation Proxy (auth required)
- `POST /api/ai/recommend` — Fetch AI-powered teammate & match recommendations.

---

## WebSocket Gateway (Socket.IO)
Connect to WebSocket server at `http://localhost:3000`. Provide auth token via `Authorization: Bearer <token>` header or `auth: { token: "<token>" }`.

### Socket Events:
- `chat.join` `{ roomId: string }` -> Emits `chat.joined`. Joins socket room channel.
- `chat.send` `{ roomId: string, content: string }` -> Emits `chat.message` broadcast to room.
- `chat.typing` `{ roomId: string, isTyping: boolean }` -> Emits `chat.typing` status to room.
- `presence.subscribe` -> Emits `presence.snapshot` and `presence.update`.
- `match.offer`, `match.accepted`, `match.declined`, `match.started` -> Matchmaking lifecycle events.

---

## AI Microservice (FastAPI)
Base URL: `http://localhost:8000`
- `GET /health` — Service health check.
- `POST /matchmaking/score` — Compute match compatibility score between players.
- `POST /recommend` — Rank candidates for teammate recommendations.
