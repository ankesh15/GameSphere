import apiClient from "./http";

export type ClanMember = {
  userId: string;
  role: "owner" | "admin" | "moderator" | "member";
  joinedAt: string;
};

export type ClanEvent = {
  _id: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  createdBy: string;
  createdAt: string;
};

export type Clan = {
  _id: string;
  name: string;
  tag: string;
  description?: string;
  region?: string;
  gameIds?: string[];
  isPublic?: boolean;
  recruiting?: boolean;
  ownerId: string;
  members: ClanMember[];
  memberIds: string[];
  invites: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateClanDto = {
  name: string;
  tag: string;
  description?: string;
  region?: string;
  gameIds?: string[];
  isPublic?: boolean;
  recruiting?: boolean;
};

export type InviteMemberDto = {
  userId: string;
};

export type UpdateClanRoleDto = {
  userId: string;
  role: "admin" | "moderator" | "member";
};

export type CreateClanEventDto = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
};

export async function getClans(): Promise<Clan[]> {
  const response = await apiClient.get<Clan[]>("/clans");
  return response.data;
}

export async function getClan(id: string): Promise<Clan> {
  const response = await apiClient.get<Clan>(`/clans/${id}`);
  return response.data;
}

export async function createClan(payload: CreateClanDto): Promise<Clan> {
  const response = await apiClient.post<Clan>("/clans", payload);
  return response.data;
}

export async function inviteMember(id: string, payload: InviteMemberDto): Promise<Clan> {
  const response = await apiClient.post<Clan>(`/clans/${id}/invite`, payload);
  return response.data;
}

export async function joinClan(id: string): Promise<Clan> {
  const response = await apiClient.post<Clan>(`/clans/${id}/join`);
  return response.data;
}

export async function leaveClan(id: string): Promise<Clan> {
  const response = await apiClient.post<Clan>(`/clans/${id}/leave`);
  return response.data;
}

export async function kickMember(id: string, userId: string): Promise<Clan> {
  const response = await apiClient.post<Clan>(`/clans/${id}/kick`, { userId });
  return response.data;
}

export async function updateMemberRole(id: string, payload: UpdateClanRoleDto): Promise<Clan> {
  const response = await apiClient.post<Clan>(`/clans/${id}/role`, payload);
  return response.data;
}

export async function createClanEvent(id: string, payload: CreateClanEventDto): Promise<ClanEvent> {
  const response = await apiClient.post<ClanEvent>(`/clans/${id}/events`, payload);
  return response.data;
}

export async function listClanEvents(id: string): Promise<ClanEvent[]> {
  const response = await apiClient.get<ClanEvent[]>(`/clans/${id}/events`);
  return response.data;
}
