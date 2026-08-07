import apiClient from "./http";

export type Participant = {
  _id: string;
  username: string;
  displayName?: string;
  avatar?: string;
};

export type TournamentMatch = {
  matchId: string;
  participantIds: string[];
  scores: number[];
  winnerId?: string;
  status: "pending" | "submitted" | "verified" | "bye";
  reportedBy?: string;
  reportedAt?: string;
};

export type BracketRound = {
  round: number;
  matches: TournamentMatch[];
};

export type Tournament = {
  _id: string;
  name: string;
  slug: string;
  gameId: string;
  region?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  organizerId: string;
  participantIds: string[] | Participant[];
  bracket: BracketRound[];
  maxParticipants?: number;
  startAt?: string;
  endAt?: string;
  prizePool?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateTournamentDto = {
  name: string;
  slug: string;
  gameId: string;
  region?: string;
  maxParticipants?: number;
  startAt?: string;
  endAt?: string;
  prizePool?: number;
};

export type SubmitResultDto = {
  matchId: string;
  scores: number[];
  winnerId: string;
};

export type VerifyWinnerDto = {
  matchId: string;
  winnerId: string;
};

export async function getTournaments(): Promise<Tournament[]> {
  const response = await apiClient.get<Tournament[]>("/tournaments");
  return response.data;
}

export async function getTournament(id: string): Promise<Tournament> {
  const response = await apiClient.get<Tournament>(`/tournaments/${id}`);
  return response.data;
}

export async function createTournament(payload: CreateTournamentDto): Promise<Tournament> {
  const response = await apiClient.post<Tournament>("/tournaments", payload);
  return response.data;
}

export async function joinTournament(id: string): Promise<Tournament> {
  const response = await apiClient.post<Tournament>(`/tournaments/${id}/join`);
  return response.data;
}

export async function leaveTournament(id: string): Promise<Tournament> {
  const response = await apiClient.post<Tournament>(`/tournaments/${id}/leave`);
  return response.data;
}

export async function generateBracket(id: string): Promise<Tournament> {
  const response = await apiClient.post<Tournament>(`/tournaments/${id}/bracket`);
  return response.data;
}

export async function submitMatchResult(id: string, payload: SubmitResultDto): Promise<Tournament> {
  const response = await apiClient.post<Tournament>(`/tournaments/${id}/results`, payload);
  return response.data;
}

export async function verifyWinner(id: string, payload: VerifyWinnerDto): Promise<Tournament> {
  const response = await apiClient.post<Tournament>(`/tournaments/${id}/verify`, payload);
  return response.data;
}
