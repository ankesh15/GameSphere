import apiClient from "./http";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  refreshExpiresIn: string;
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
