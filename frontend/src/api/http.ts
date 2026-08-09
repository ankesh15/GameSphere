import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "../store/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

// ── Request interceptor: attach Bearer token ────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 + extract error messages ──
let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Auto-refresh on 401 (not for auth endpoints)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as { _retry?: boolean })._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      (originalRequest as { _retry?: boolean })._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`
        } as any;
        return apiClient(originalRequest);
      }
    }

    // ── Extract backend error message ─────────────────────────────────
    // The backend returns { success: false, message: "..." }
    // Without this, the catch block only sees Axios's generic
    // "Request failed with status code 400" string.
    const backendMessage = extractErrorMessage(error);
    const enhancedError = new Error(backendMessage);
    (enhancedError as any).statusCode = error.response?.status;
    (enhancedError as any).response = error.response;
    (enhancedError as any).originalError = error;
    return Promise.reject(enhancedError);
  }
);

/**
 * Extract a human-readable error message from the backend response.
 * Falls back to the generic Axios message if nothing is found.
 */
function extractErrorMessage(error: AxiosError): string {
  const data = error.response?.data as Record<string, unknown> | undefined;

  if (data) {
    // Backend returns { message: "..." } or { message: ["...", "..."] }
    if (typeof data.message === "string") {
      return data.message;
    }
    if (Array.isArray(data.message) && data.message.length > 0) {
      return data.message.join(", ");
    }
    if (typeof data.error === "string") {
      return data.error;
    }
  }

  // Network errors
  if (!error.response) {
    return "Unable to connect to server. Please check your internet connection.";
  }

  // Fallback
  return error.message ?? "An unexpected error occurred.";
}

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
