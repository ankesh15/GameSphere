import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUserData = {
  id: string;
  email: string;
  username: string;
  roles: string[];
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUserData | null;
  setTokens: (tokens: {
    accessToken: string;
    refreshToken: string;
    user?: AuthUserData;
  }) => void;
  setUser: (user: AuthUserData) => void;
  clearTokens: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: tokens.user ?? null
        }),
      setUser: (user) => set({ user }),
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, user: null })
    }),
    {
      name: "gamesphere-auth"
    }
  )
);
