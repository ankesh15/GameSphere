import apiClient from "./http";

export type Playstyle = {
  competitiveStyle?: string;
  communicationStyle?: string;
  preferredRoles?: string[];
};

export type AvailabilityItem = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone?: string;
};

export type GamingAccount = {
  provider: "steam" | "riot" | "epic";
  handle: string;
  externalId?: string;
  linkedAt?: string;
};

export type Badge = {
  code: string;
  label: string;
  awardedAt?: string;
  source?: string;
};

export type GamerProfile = {
  userId: string;
  gamerTag: string;
  displayName?: string;
  bio?: string;
  region?: string;
  skillRating?: number;
  skillLevel?: "beginner" | "intermediate" | "advanced" | "pro";
  favoriteGames: string[];
  platforms: string[];
  playstyle?: Playstyle;
  availability: AvailabilityItem[];
  gamingAccounts: GamingAccount[];
  privacy?: {
    isPublic?: boolean;
    showOnlineStatus?: boolean;
    showMatchHistory?: boolean;
  };
  badges?: Badge[];
  preferences?: {
    genres?: string[];
    modes?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProfilePayload = {
  gamerTag: string;
  displayName?: string;
  bio?: string;
  region?: string;
  skillLevel?: "beginner" | "intermediate" | "advanced" | "pro";
  favoriteGames?: string[];
  platforms?: string[];
};

export async function getMyProfile(): Promise<GamerProfile> {
  const response = await apiClient.get<GamerProfile>("/profiles/me");
  return response.data;
}

export async function getGamerProfile(userId: string): Promise<GamerProfile> {
  const response = await apiClient.get<GamerProfile>(`/profiles/${userId}`);
  return response.data;
}

export async function getAllProfiles(query?: string): Promise<GamerProfile[]> {
  const response = await apiClient.get<GamerProfile[]>("/profiles", {
    params: { q: query }
  });
  return response.data;
}

export async function createProfile(payload: CreateProfilePayload): Promise<GamerProfile> {
  const response = await apiClient.post<GamerProfile>("/profiles", payload);
  return response.data;
}

export async function updateProfile(payload: Partial<GamerProfile>): Promise<GamerProfile> {
  const response = await apiClient.patch<GamerProfile>("/profiles/me", payload);
  return response.data;
}

export async function updateAvailability(availability: AvailabilityItem[]): Promise<GamerProfile> {
  const response = await apiClient.patch<GamerProfile>("/profiles/me/availability", { availability });
  return response.data;
}

export async function linkGamingAccount(payload: {
  provider: "steam" | "riot" | "epic";
  handle: string;
  externalId?: string;
}): Promise<GamerProfile> {
  const response = await apiClient.post<GamerProfile>("/profiles/me/accounts", payload);
  return response.data;
}

export async function unlinkGamingAccount(provider: "steam" | "riot" | "epic"): Promise<GamerProfile> {
  const response = await apiClient.delete<GamerProfile>(`/profiles/me/accounts/${provider}`);
  return response.data;
}
