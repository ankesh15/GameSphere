import { motion } from "framer-motion";
import { Swords, Clock, ChevronRight, Users, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

type MatchItem = {
  id: number;
  game: string;
  mode: string;
  result: "win" | "loss" | "draw";
  score: string;
  duration: string;
  teammates: number;
  timeAgo: string;
};

const matchData: MatchItem[] = [
  { id: 1, game: "Valorant", mode: "Competitive 5v5", result: "win", score: "13 - 8", duration: "42m", teammates: 4, timeAgo: "2h ago" },
  { id: 2, game: "CS2", mode: "Premier", result: "loss", score: "11 - 13", duration: "38m", teammates: 4, timeAgo: "5h ago" },
  { id: 3, game: "Apex Legends", mode: "Trios Ranked", result: "win", score: "#1 / 20", duration: "24m", teammates: 2, timeAgo: "8h ago" },
  { id: 4, game: "Valorant", mode: "Competitive 5v5", result: "win", score: "13 - 5", duration: "30m", teammates: 4, timeAgo: "1d ago" },
  { id: 5, game: "League of Legends", mode: "Ranked Solo", result: "loss", score: "22 - 35", duration: "34m", teammates: 4, timeAgo: "1d ago" }
];

const resultConfig = {
  win: { label: "Victory", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  loss: { label: "Defeat", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  draw: { label: "Draw", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" }
};

export default function MatchHistory() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm overflow-hidden"
      aria-label="Match history"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-sm font-bold text-white tracking-wider uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Match History
        </h2>
        <Link
          to="/app/find-teammates"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="px-4 pb-4 space-y-1.5">
        {matchData.map((match, index) => {
          const r = resultConfig[match.result];
          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + index * 0.06 }}
              className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-slate-800/30 cursor-default"
            >
              {/* Game icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/30">
                <Gamepad2 className="h-4.5 w-4.5 text-slate-400 group-hover:text-brand-400 transition-colors" />
              </div>

              {/* Match info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">{match.game}</span>
                  <span className="text-[10px] text-slate-500">{match.mode}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {match.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {match.teammates} teammates
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="hidden sm:flex items-center gap-2">
                <Swords className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-xs font-bold text-white">{match.score}</span>
              </div>

              {/* Result badge */}
              <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${r.color} ${r.bg} ${r.border}`}>
                {r.label}
              </span>

              {/* Time */}
              <span className="hidden sm:block shrink-0 text-[10px] font-medium text-slate-600 w-12 text-right">
                {match.timeAgo}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
