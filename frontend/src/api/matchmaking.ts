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

export async function getMatchSession(sessionId: string): Promise<MatchSession> {
  const response = await apiClient.get<MatchSession>(`/matchmaking/sessions/${sessionId}`);
  return response.data;
}
