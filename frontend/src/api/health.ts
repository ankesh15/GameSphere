import apiClient from "./http";

export type HealthStatus = {
  status: "ok";
  timestamp: string;
};

export async function getHealth(): Promise<HealthStatus> {
  const response = await apiClient.get<HealthStatus>("/health");
  return response.data;
}
