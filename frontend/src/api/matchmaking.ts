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

export async function createMatchRequest(
  payload: MatchRequestPayload
): Promise<MatchRequestResponse> {
  const response = await apiClient.post<MatchRequestResponse>(
    "/matchmaking/requests",
    payload
  );
  return response.data;
}
