import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMatchSession, MatchSession } from "../api/matchmaking";
import { getGamerProfile, GamerProfile } from "../api/profiles";
import { GAMES_CATALOG } from "../api/games";
import ChatRoom from "../components/ChatRoom";
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
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

export default function MatchSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<MatchSession | null>(null);
  const [players, setPlayers] = useState<GamerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Fetch player profiles
      const profilePromises = sess.playerIds.map((pid) => getGamerProfile(pid));
      const profiles = await Promise.all(profilePromises);
      setPlayers(profiles);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load match session details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-end">
          <div className="h-6 w-48 bg-slate-800 rounded"></div>
          <div className="h-4 w-96 bg-slate-800 rounded mt-3"></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800 lg:col-span-1"></div>
          <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800 lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-md text-center py-20 space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight">Session Terminated</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            {error || "The requested match session was not found or is expired."}
          </p>
        </div>
        <button
          onClick={() => navigate("/app/find-teammates")}
          className="glow-button px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-500 text-xs"
        >
          Return to Find Teammates
        </button>
      </div>
    );
  }

  const game = GAMES_CATALOG.find((g) => g.gameId === session.gameId);

  return (
    <div className="space-y-6">
      {/* Session Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">Lobby Session</h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
              Live Connection
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Game: <span className="text-white font-bold">{game?.title || session.gameId}</span> · Server:{" "}
            <span className="text-white font-bold uppercase">{session.region || "Global"}</span>
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              if (window.confirm("Do you want to complete this match session?")) {
                navigate("/app/find-teammates");
              }
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-350 hover:text-white transition duration-200"
          >
            Complete Session
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Players Roster */}
        <section className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-brand-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Teammates Roster</h2>
          </div>

          <div className="space-y-4">
            {players.map((player) => (
              <div
                key={player.userId}
                className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-650 to-purple-500 flex items-center justify-center font-black text-white uppercase text-sm border border-brand-400/25">
                    {player.gamerTag.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{player.gamerTag}</h3>
                    {player.displayName && <p className="text-[10px] text-slate-500 mt-0.5">{player.displayName}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900/60 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-550 block uppercase tracking-wider font-bold">Skill Rating</span>
                    <span className="text-white font-semibold capitalize mt-0.5 block">{player.skillLevel || "Intermediate"}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 block uppercase tracking-wider font-bold">Playstyle</span>
                    <span className="text-brand-400 font-semibold capitalize mt-0.5 block">
                      {player.playstyle?.competitiveStyle || "Semi-Competitive"}
                    </span>
                  </div>
                </div>

                {player.gamingAccounts && player.gamingAccounts.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-900/60 text-[9px] space-y-1.5">
                    <span className="text-slate-500 block uppercase tracking-wider font-bold">Gaming Handles</span>
                    {player.gamingAccounts.map((acc) => (
                      <div key={acc.provider} className="flex justify-between items-center text-slate-400 bg-slate-950/40 px-2 py-1 rounded border border-slate-900/50">
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
