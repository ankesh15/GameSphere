import apiClient from "./http";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  roles: string[];
};

export type AuthTokens = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  refreshExpiresIn: string;
  user: AuthUser;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function register(payload: RegisterPayload): Promise<AuthTokens> {
  const response = await apiClient.post<AuthTokens>("/auth/register", payload);
  return response.data;
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const response = await apiClient.post<AuthTokens>("/auth/login", payload);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getMe(): Promise<{ success: boolean; user: AuthUser }> {
  const response = await apiClient.get<{ success: boolean; user: AuthUser }>(
    "/auth/me"
  );
  return response.data;
}
