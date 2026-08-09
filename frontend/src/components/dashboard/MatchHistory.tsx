import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swords, Clock, ChevronRight, Users, Gamepad2, Sparkles, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyMatchSessions, MatchSession } from "../../api/matchmaking";

const gameNameMap: Record<string, string> = {
  valorant: "Valorant",
  cs2: "CS2",
  "apex-legends": "Apex Legends",
  apex: "Apex Legends",
  "league-of-legends": "League of Legends",
  lol: "League of Legends",
  dota2: "Dota 2",
  overwatch: "Overwatch 2"
};

function formatGameName(gameId: string): string {
  const lower = gameId.toLowerCase();
  if (gameNameMap[lower]) return gameNameMap[lower];
  return gameId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTimeAgo(dateStr?: string): string {
  if (!dateStr) return "Recently";
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  completed: { label: "Victory", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  active: { label: "Live", color: "text-live-400", bg: "bg-live-orange/10", border: "border-live-orange/30" },
  pending: { label: "Pending", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  declined: { label: "Declined", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  cancelled: { label: "Cancelled", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  expired: { label: "Expired", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" }
};

export default function MatchHistory() {
  const [sessions, setSessions] = useState<MatchSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getMyMatchSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load match history", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-2xl glass-level-2 overflow-hidden"
      aria-label="Match history"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/5">
        <h2 className="text-sm font-bold text-white tracking-wider uppercase font-display">
          Match History
        </h2>
        <Link
          to="/app/find-teammates"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-300 hover:text-brand-200 transition-colors font-body"
        >
          Matchmaking <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-4 space-y-1.5 min-h-[160px]">
        {loading ? (
          <div className="flex flex-col gap-2 justify-center items-center py-10 text-slate-500 text-xs">
            <Sparkles className="w-5 h-5 animate-pulse text-brand-400" />
            <span className="font-mono text-[10px]">Loading match sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 space-y-2">
            <Inbox className="w-8 h-8 text-slate-700" />
            <p className="text-xs font-body">No match sessions found. Join queue to start a match!</p>
          </div>
        ) : (
          sessions.map((match, index) => {
            const conf = statusConfig[match.status] || statusConfig.completed;
            const gameName = formatGameName(match.gameId);
            const modeName = match.region ? `${match.region.toUpperCase()} Ranked` : "Ranked Session";
            const timeAgo = getTimeAgo(match.endedAt || match.startedAt);
            const teammateCount = Math.max(1, match.playerIds.length - 1);

            return (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-slate-800/40 cursor-default"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 border border-white/5">
                  <Gamepad2 className="h-4.5 w-4.5 text-slate-400 group-hover:text-brand-300 transition-colors" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate font-display">{gameName}</span>
                    <span className="text-[10px] text-slate-400 font-body">{modeName}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[10px] text-slate-500 font-body">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Session
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {teammateCount} teammate{teammateCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <Swords className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-[11px] font-mono text-slate-400">#{match._id.slice(-6)}</span>
                </div>

                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-body ${conf.color} ${conf.bg} ${conf.border}`}>
                  {conf.label}
                </span>

                <span className="hidden sm:block shrink-0 text-[10px] font-medium text-slate-500 font-mono w-14 text-right">
                  {timeAgo}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.section>
  );
}
