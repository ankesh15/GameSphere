import { http, HttpResponse } from "msw";

const sampleBracket = [
  {
    round: 1,
    matches: [
      {
        matchId: "m1-r1",
        participantIds: ["user-123", "user-456"],
        scores: [2, 1],
        winnerId: "user-123",
        status: "verified"
      },
      {
        matchId: "m2-r1",
        participantIds: ["user-789"],
        scores: [0, 0],
        winnerId: "user-789",
        status: "bye"
      }
    ]
  },
  {
    round: 2,
    matches: [
      {
        matchId: "m1-r2",
        participantIds: ["user-123", "user-789"],
        scores: [0, 0],
        status: "pending"
      }
    ]
  }
];

const sampleTournament = {
  _id: "t-100",
  name: "Summer Championship 2026",
  slug: "summer-championship-2026",
  gameId: "valorant",
  region: "NA",
  status: "scheduled",
  organizerId: "user-organizer",
  participantIds: [
    { _id: "user-123", username: "CurrentGamer", displayName: "Current Gamer" },
    { _id: "user-456", username: "Opponent1", displayName: "Opponent 1" },
    { _id: "user-789", username: "Opponent2", displayName: "Opponent 2" }
  ],
  bracket: sampleBracket,
  maxParticipants: 16,
  startAt: "2026-08-01T00:00:00.000Z",
  endAt: "2026-08-05T00:00:00.000Z",
  prizePool: 5000,
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z"
};

const sampleClan = {
  _id: "clan-100",
  name: "Apex Predators",
  tag: "APEX",
  description: "Elite competitive gaming guild.",
  region: "NA",
  gameIds: ["valorant"],
  isPublic: true,
  recruiting: true,
  ownerId: "user-123",
  members: [
    { userId: "user-123", role: "owner", joinedAt: "2026-01-01T00:00:00Z" },
    { userId: "user-456", role: "member", joinedAt: "2026-01-02T00:00:00Z" }
  ],
  memberIds: ["user-123", "user-456"],
  invites: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z"
};

export const handlers = [
  // Auth mock endpoints
  http.post("*/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === "test@example.com" && body.password === "Password123!") {
      return HttpResponse.json({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: { id: "user-123", email: "test@example.com", username: "TestGamer" }
      });
    }
    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }),

  http.post("*/api/auth/register", async ({ request }) => {
    const body = (await request.json()) as { email?: string; username?: string; password?: string };
    if (body.email === "newuser@example.com") {
      return HttpResponse.json({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: { id: "user-456", email: "newuser@example.com", username: body.username || "NewGamer" }
      });
    }
    return HttpResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }),

  // Matchmaking mock endpoints
  http.get("*/api/matchmaking/requests/current", () => {
    return HttpResponse.json(null, { status: 404 });
  }),

  http.post("*/api/matchmaking/requests", async () => {
    return HttpResponse.json({
      requestId: "req-123",
      status: "queued",
      estimatedWaitSeconds: 120
    });
  }),

  http.delete("*/api/matchmaking/requests/:id", ({ params }) => {
    if (params.id === "fail-cancel") {
      return HttpResponse.json(
        { message: "Failed to cancel request on server" },
        { status: 500 }
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Chat mock endpoints
  http.get("*/api/chat/rooms/:roomId/messages", ({ params }) => {
    if (params.roomId === "fail-room") {
      return HttpResponse.json(
        { message: "Failed to load chat history" },
        { status: 500 }
      );
    }
    return HttpResponse.json([
      {
        id: "msg-1",
        roomId: params.roomId,
        senderId: "user-123",
        content: "Hello squad!",
        messageType: "text",
        createdAt: "2026-08-08T12:00:00Z"
      },
      {
        id: "msg-2",
        roomId: params.roomId,
        senderId: "user-999",
        content: "Ready for match!",
        messageType: "text",
        createdAt: "2026-08-08T12:01:00Z"
      }
    ]);
  }),

  // Profile mock endpoint
  http.get("*/api/profiles/:userId", ({ params }) => {
    return HttpResponse.json({
      userId: params.userId,
      gamerTag: params.userId === "user-123" ? "CurrentGamer" : "TeammateGamer"
    });
  }),

  // Tournament mock endpoints
  http.get("*/api/tournaments", () => {
    return HttpResponse.json([sampleTournament]);
  }),

  http.get("*/api/tournaments/:id", () => {
    return HttpResponse.json(sampleTournament);
  }),

  http.post("*/api/tournaments", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      ...sampleTournament,
      _id: "t-new",
      name: body.name || "New Tournament",
      slug: body.slug || "new-tournament"
    });
  }),

  http.post("*/api/tournaments/:id/join", () => {
    return HttpResponse.json({
      ...sampleTournament,
      participantIds: [
        ...sampleTournament.participantIds,
        { _id: "user-joined", username: "JoinedUser", displayName: "Joined User" }
      ]
    });
  }),

  http.post("*/api/tournaments/:id/results", async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.matchId === "fail-match") {
      return HttpResponse.json(
        { message: "Invalid scores or unauthorized submitter" },
        { status: 400 }
      );
    }
    return HttpResponse.json(sampleTournament);
  }),

  // Clan mock endpoints
  http.get("*/api/clans", () => {
    return HttpResponse.json([sampleClan]);
  }),

  http.get("*/api/clans/:id", () => {
    return HttpResponse.json(sampleClan);
  }),

  http.post("*/api/clans", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      ...sampleClan,
      _id: "clan-new",
      name: body.name,
      tag: body.tag,
      description: body.description
    });
  }),

  http.post("*/api/clans/:id/join", () => {
    return HttpResponse.json(sampleClan);
  }),

  http.post("*/api/clans/:id/kick", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      ...sampleClan,
      members: sampleClan.members.filter((m) => m.userId !== body.userId),
      memberIds: sampleClan.memberIds.filter((id) => id !== body.userId)
    });
  }),

  http.post("*/api/clans/:id/role", async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      ...sampleClan,
      members: sampleClan.members.map((m) =>
        m.userId === body.userId ? { ...m, role: body.role } : m
      )
    });
  }),

  http.get("*/api/clans/:id/events", () => {
    return HttpResponse.json([
      {
        _id: "evt-1",
        title: "Weekly Scrim Night",
        description: "Custom lobby scrims with community",
        startsAt: "2026-08-10T18:00:00Z",
        createdBy: "user-123",
        createdAt: "2026-08-01T00:00:00Z"
      }
    ]);
  })
];
