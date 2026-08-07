import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./auth";

type MatchOffer = {
  sessionId: string;
  gameId: string;
  region: string | null;
  playerIds: string[];
  status: "pending" | "active" | "declined" | "completed";
  acceptedBy: string[];
  expiresAt: string | null;
};

type SocketState = {
  socket: Socket | null;
  isConnected: boolean;
  activeMatchOffer: MatchOffer | null;
  isQueued: boolean;
  queuedGameId: string | null;
  queuedRequestId: string | null;
  elapsedTime: number;
  matchSessionId: string | null; // active live match session ID
  connectSocket: () => void;
  disconnectSocket: () => void;
  setQueueState: (queued: boolean, gameId?: string | null, requestId?: string | null) => void;
  incrementElapsedTime: () => void;
  acceptMatch: () => void;
  declineMatch: () => void;
};

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  activeMatchOffer: null,
  isQueued: false,
  queuedGameId: null,
  queuedRequestId: null,
  elapsedTime: 0,
  matchSessionId: null,

  connectSocket: () => {
    const existing = get().socket;
    if (existing) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const backendUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
      : "http://localhost:3000";

    const socketInstance = io(backendUrl, {
      auth: { token },
      transports: ["websocket"]
    });

    socketInstance.on("connect", () => {
      set({ isConnected: true });
    });

    socketInstance.on("disconnect", () => {
      set({ isConnected: false });
    });

    // Matchmaking events
    socketInstance.on("match.offer", (offer: MatchOffer) => {
      set({ activeMatchOffer: offer, isQueued: false, queuedGameId: null, queuedRequestId: null });
    });

    socketInstance.on("match.accepted", (payload: { sessionId: string; acceptedBy: string }) => {
      set((state) => {
        if (state.activeMatchOffer?.sessionId === payload.sessionId) {
          const acceptedBy = [...state.activeMatchOffer.acceptedBy];
          if (!acceptedBy.includes(payload.acceptedBy)) {
            acceptedBy.push(payload.acceptedBy);
          }
          return {
            activeMatchOffer: {
              ...state.activeMatchOffer,
              acceptedBy
            }
          };
        }
        return {};
      });
    });

    socketInstance.on("match.declined", (payload: { sessionId: string; declinedBy: string }) => {
      set((state) => {
        if (state.activeMatchOffer?.sessionId === payload.sessionId) {
          // Reset offer and show alert, but keep user in queue
          return {
            activeMatchOffer: null,
            // Automatically re-queue? For simplicity, we can let user know match was declined
          };
        }
        return {};
      });
      alert("A player declined the match offer. Returning to queue or lobby.");
    });

    socketInstance.on("match.started", (session: MatchOffer) => {
      set({
        activeMatchOffer: null,
        matchSessionId: session.sessionId
      });
      // Redirect to /app/match/:sessionId
      window.location.hash = `#/app/match/${session.sessionId}`;
      // Fallback for non-hash routing
      if (window.location.pathname.startsWith("/app")) {
        window.location.href = `/app/match/${session.sessionId}`;
      }
    });

    set({ socket: socketInstance });
  },

  disconnectSocket: () => {
    const s = get().socket;
    if (s) {
      s.disconnect();
      set({ socket: null, isConnected: false, activeMatchOffer: null });
    }
  },

  setQueueState: (queued, gameId = null, requestId = null) => {
    set({
      isQueued: queued,
      queuedGameId: gameId,
      queuedRequestId: requestId,
      elapsedTime: 0
    });
  },

  incrementElapsedTime: () => {
    if (get().isQueued) {
      set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
    }
  },

  acceptMatch: () => {
    const offer = get().activeMatchOffer;
    const socket = get().socket;
    if (!offer || !socket) return;

    // Call REST endpoint
    fetch(`/api/matchmaking/sessions/${offer.sessionId}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        "Content-Type": "application/json"
      }
    }).catch(console.error);

    // Locally show accepted state
    set((state) => {
      if (state.activeMatchOffer) {
        const userId = socket.id; // Or actual user id
        // We will receive match.accepted event anyway, so we just let Socket.IO update it.
      }
      return {};
    });
  },

  declineMatch: () => {
    const offer = get().activeMatchOffer;
    if (!offer) return;

    fetch(`/api/matchmaking/sessions/${offer.sessionId}/decline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        "Content-Type": "application/json"
      }
    }).catch(console.error);

    set({ activeMatchOffer: null });
  }
}));
