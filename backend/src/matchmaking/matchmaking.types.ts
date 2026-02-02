export type CreateMatchRequestPayload = {
  userId: string;
  gameId: string;
  region?: string;
  skill?: number;
  pingMs?: number;
  maxPingMs?: number;
};

export type MatchRequestStatus = "queued" | "matched" | "cancelled" | "expired";

export type MatchRequestResponse = {
  requestId: string;
  status: MatchRequestStatus;
  estimatedWaitSeconds: number;
  matchSessionId?: string;
};
