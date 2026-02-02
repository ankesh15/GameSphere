import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "../store/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as { _retry?: boolean })._retry
    ) {
      (originalRequest as { _retry?: boolean })._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`
        };
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();
  if (!refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    });
    const payload = response.data as {
      accessToken: string;
      refreshToken: string;
    };
    setTokens(payload);
    return payload.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export default apiClient;
