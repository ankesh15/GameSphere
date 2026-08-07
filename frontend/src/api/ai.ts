import apiClient from "./http";

export type RecommendRequestPayload = {
  userHistory: Array<{
    gameId: string;
    hoursPlayed?: number;
    liked?: boolean;
    tags?: string[];
  }>;
  preferences?: {
    genres?: string[];
    modes?: string[];
    platforms?: string[];
    playstyle?: string[];
    freeText?: string;
    region?: string;
  };
  gamesCatalog?: Array<{
    gameId: string;
    title: string;
    tags?: string[];
    genres?: string[];
    modes?: string[];
  }>;
  communityProfiles?: Array<{
    userId: string;
    history: Array<{
      gameId: string;
      hoursPlayed?: number;
      liked?: boolean;
      tags?: string[];
    }>;
    preferences?: {
      genres?: string[];
      modes?: string[];
      platforms?: string[];
      playstyle?: string[];
      freeText?: string;
      region?: string;
    };
  }>;
};

export type RecommendationItem = {
  id: string;
  score: number;
  reason: string;
};

export type RecommendResponse = {
  games: RecommendationItem[];
  teammates: RecommendationItem[];
  extracted_interests: string[];
};

export async function getRecommendations(payload: RecommendRequestPayload): Promise<RecommendResponse> {
  const response = await apiClient.post<RecommendResponse>("/ai/recommend", payload);
  return response.data;
}
