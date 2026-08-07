import apiClient from "./http";

export type MatchRequestPayload = {
  gameId: string;
  region?: string;
  skill?: number;
  pingMs?: number;
  maxPingMs?: number;
};

export type MatchRequestResponse = {
  requestId: string;
  status: "queued" | "matched" | "cancelled" | "expired";
  estimatedWaitSeconds: number;
  matchSessionId?: string;
};

export type MatchSession = {
  _id: string;
  gameId: string;
  region: string;
  playerIds: string[];
  status: "pending" | "active" | "completed" | "cancelled" | "declined";
  acceptedBy: string[];
  startedAt?: string;
  endedAt?: string;
};

export async function createMatchRequest(
  payload: MatchRequestPayload
): Promise<MatchRequestResponse> {
  const response = await apiClient.post<MatchRequestResponse>(
    "/matchmaking/requests",
    payload
  );
  return response.data;
}

export type MatchRequest = {
  _id: string;
  userId: string;
  gameId: string;
  region?: string;
  skill?: number;
  pingMs?: number;
  maxPingMs?: number;
  status: "queued" | "matched" | "cancelled" | "expired";
  matchSessionId?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getMatchSession(sessionId: string): Promise<MatchSession> {
  const response = await apiClient.get<MatchSession>(`/matchmaking/sessions/${sessionId}`);
  return response.data;
}

export async function cancelMatchRequest(requestId: string): Promise<void> {
  await apiClient.delete(`/matchmaking/requests/${requestId}`);
}

export async function getCurrentMatchRequest(): Promise<MatchRequest> {
  const response = await apiClient.get<MatchRequest>("/matchmaking/requests/current");
  return response.data;
}

export async function completeMatchSession(sessionId: string): Promise<void> {
  await apiClient.post(`/matchmaking/sessions/${sessionId}/complete`);
}

export async function getMyMatchSessions(): Promise<MatchSession[]> {
  const response = await apiClient.get<MatchSession[]>("/matchmaking/sessions/me");
  return response.data;
}

