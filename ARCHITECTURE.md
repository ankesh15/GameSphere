# GameSphere Architecture Overview

## System Components
- **Frontend (React + Vite)**: User-facing app with protected routes and Tailwind UI.
- **Backend (NestJS)**: REST API, authentication, matchmaking, tournaments, clans, chat.
- **AI Service (FastAPI)**: Collaborative filtering + NLP-based recommendations.
- **MongoDB**: Primary datastore for users, profiles, matches, tournaments, clans, chat.

## Core Flows
- **Authentication**: JWT access + refresh tokens, stored client-side, validated by guards.
- **Matchmaking**: Requests stored in MongoDB, matched by skill/region/ping, sessions emitted via Socket.IO.
- **Chat**: Match and clan rooms, messages persisted in MongoDB, realtime typing and delivery via Socket.IO.
- **Tournaments**: Brackets generated server-side, results submitted by players, winner verified and badge awarded.
- **AI Recommendations**: Backend proxy calls AI service, caches results, provides fallback logic.

## Security and Reliability
- **Rate limiting**: Global throttling via NestJS Throttler.
- **Input sanitization**: Global sanitization pipe strips unsafe HTML.
- **Error tracking**: Centralized exception filter with tracking hook.
- **API logging**: Middleware logs method, path, status, IP, user-agent, request ID.

## Data Model Highlights
- **Users**: Auth credentials, roles, profile reference.
- **GamerProfiles**: Preferences, availability, linked accounts, badges, privacy settings.
- **MatchRequests / MatchSessions**: Queue and session lifecycle with acceptance flow.
- **Tournaments**: Brackets, match results, verified winners.
- **Clans**: Roles, members, invites, events.
- **ChatMessages**: Room-based messages for match/clan chat.

## Realtime Architecture
- **Socket.IO gateway** handles:
  - Presence (online/offline)
  - Chat join/send/typing
  - Match offer/accept/decline lifecycle events
