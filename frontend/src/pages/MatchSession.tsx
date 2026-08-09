import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMatchSession, MatchSession, completeMatchSession } from "../api/matchmaking";
import { getGamerProfile, GamerProfile } from "../api/profiles";
import { GAMES_CATALOG } from "../api/games";
import ChatRoom from "../components/ChatRoom";
import { useDialogStore } from "../store/dialog";
import {
  Users,
  Compass,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  Link2,
  Lock,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function MatchSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { showAlert, showConfirm, showToast } = useDialogStore();

  const [session, setSession] = useState<MatchSession | null>(null);
  const [players, setPlayers] = useState<GamerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails(sessionId);
    }
  }, [sessionId]);

  const fetchSessionDetails = async (sid: string) => {
    setLoading(true);
    setError(null);
    try {
      const sess = await getMatchSession(sid);
      setSession(sess);

      // Resilient fetch for player profiles using Promise.allSettled
      const profilePromises = sess.playerIds.map((pid) => getGamerProfile(pid));
      const results = await Promise.allSettled(profilePromises);

      const resolvedProfiles: GamerProfile[] = results.map((res, index) => {
        const pid = sess.playerIds[index];
        if (res.status === "fulfilled") {
          return res.value;
        }
        // Fallback placeholder profile for failed fetches
        return {
          userId: pid,
          gamerTag: `Player_${pid.slice(-4)}`,
          displayName: "Unknown Gamer",
          region: sess.region || "global",
          skillLevel: "intermediate",
          favoriteGames: [],
          platforms: [],
          availability: [],
          gamingAccounts: [],
          playstyle: {
            competitiveStyle: "semi-pro",
            communicationStyle: "voice-chat",
            preferredRoles: []
          },
          privacy: { isPublic: true, showOnlineStatus: true, showMatchHistory: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      setPlayers(resolvedProfiles);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load match session details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionId) return;
    showConfirm(
      "Do you want to complete this match session? This will close the lobby for all players.",
      async () => {
        setCompleting(true);
        try {
          await completeMatchSession(sessionId);
          showToast("Match session completed successfully!", "success");
          navigate("/app/find-teammates");
        } catch (err: any) {
          showAlert(
            err.response?.data?.message || "Failed to complete match session on backend.",
            "Session Completion Failed",
            "error"
          );
        } finally {
          setCompleting(false);
        }
      },
      "Complete Session"
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse font-body">
        <div className="h-28 rounded-2xl glass-level-1 border border-white/10 p-6 flex flex-col justify-end">
          <div className="h-6 w-48 bg-white/10 rounded-xl"></div>
          <div className="h-4 w-96 bg-white/5 rounded-lg mt-3"></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 rounded-2xl glass-level-1 border border-white/10 lg:col-span-1"></div>
          <div className="h-96 rounded-2xl glass-level-1 border border-white/10 lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-md text-center py-20 space-y-6 font-body">
        <div className="w-16 h-16 rounded-3xl glass-level-2 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-2xl">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight font-display">Session Terminated</h2>
          <p className="text-slate-300 text-xs leading-relaxed font-body">
            {error || "The requested match session was not found or is expired."}
          </p>
        </div>
        <button
          onClick={() => navigate("/app/find-teammates")}
          className="glow-button px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500 text-xs uppercase tracking-wider"
        >
          Return to Find Teammates
        </button>
      </div>
    );
  }

  const game = GAMES_CATALOG.find((g) => g.gameId === session.gameId);

  return (
    <div className="space-y-6 font-body">
      {/* Session Header Banner */}
      <div className="rounded-2xl glass-level-2 border border-white/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur-2xl relative overflow-hidden shadow-xl font-body">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400"></div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-display">Lobby Session</h1>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-body">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Connection
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-300 font-body">
            Game: <span className="text-white font-bold">{game?.title || session.gameId}</span> · Server:{" "}
            <span className="text-white font-bold uppercase">{session.region || "Global"}</span>
          </p>
        </div>
        <div>
          <button
            onClick={handleCompleteSession}
            disabled={completing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-level-1 border border-white/10 hover:border-rose-500/40 hover:text-rose-300 text-slate-300 text-xs font-bold transition duration-200 disabled:opacity-50 font-body uppercase tracking-wider"
          >
            {completing && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-300" />}
            <span>{completing ? "Completing..." : "Complete Session"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Players Roster */}
        <section className="space-y-4 lg:col-span-1 font-body">
          <div className="flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-brand-300" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-display">Teammates Roster</h2>
          </div>

          <div className="space-y-4">
            {players.map((player) => (
              <div
                key={player.userId}
                className="glass-level-1 hover:glass-level-2 border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all shadow-md font-body"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-black text-white uppercase text-sm border border-white/20 shadow-md font-display">
                    {player.gamerTag.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-body">{player.gamerTag}</h3>
                    {player.displayName && <p className="text-[10px] text-slate-400 mt-0.5 font-body">{player.displayName}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] font-body">
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider font-bold">Skill Rating</span>
                    <span className="text-white font-semibold capitalize mt-0.5 block">{player.skillLevel || "Intermediate"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider font-bold">Playstyle</span>
                    <span className="text-brand-300 font-semibold capitalize mt-0.5 block">
                      {player.playstyle?.competitiveStyle || "Semi-Competitive"}
                    </span>
                  </div>
                </div>

                {player.gamingAccounts && player.gamingAccounts.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-white/10 text-[9px] space-y-1.5 font-body">
                    <span className="text-slate-400 block uppercase tracking-wider font-bold">Gaming Handles</span>
                    {player.gamingAccounts.map((acc) => (
                      <div key={acc.provider} className="flex justify-between items-center text-slate-300 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-white/5 font-body">
                        <span className="capitalize">{acc.provider}:</span>
                        <span className="font-mono font-bold text-white">{acc.handle}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Right column: Live Chat */}
        <section className="lg:col-span-2">
          {sessionId && <ChatRoom roomId={`match:${sessionId}`} />}
        </section>
      </div>
    </div>
  );
}
