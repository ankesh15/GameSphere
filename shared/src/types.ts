export type HealthStatus = {
  status: "ok";
  timestamp: string;
};

export type MatchRequest = {
  userId: string;
  gameId: string;
  region?: string;
  skill?: number;
};

export type MatchRequestResponse = {
  requestId: string;
  status: "queued";
  estimatedWaitSeconds: number;
};

export type MatchScoreResponse = {
  score: number;
  rationale: string;
};
