import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Users,
  Pencil,
  Zap,
  Flame,
  Star,
  ChevronRight,
  Crown,
  Sparkles
} from "lucide-react";
import type { GamerProfile } from "../../api/profiles";
import type { AuthUserData } from "../../store/auth";

type HeroSectionProps = {
  profile: GamerProfile | null;
  user: AuthUserData | null;
};

export default function HeroSection({ profile, user }: HeroSectionProps) {
  const displayName = profile?.gamerTag ?? user?.username ?? "Gamer";
  const initials = displayName.slice(0, 2).toUpperCase();
  const level = 12;
  const xpPercent = 64;
  const dailyStreak = 7;
  const seasonProgress = 42;
  const rank = profile?.skillLevel ?? "intermediate";

  const rankConfig: Record<string, { label: string; color: string; glow: string }> = {
    beginner: { label: "Bronze", color: "from-amber-700 to-amber-500", glow: "shadow-amber-500/20" },
    intermediate: { label: "Gold", color: "from-yellow-500 to-amber-400", glow: "shadow-yellow-500/20" },
    advanced: { label: "Diamond", color: "from-cyan-400 to-blue-500", glow: "shadow-cyan-500/20" },
    pro: { label: "Radiant", color: "from-brand-400 to-purple-500", glow: "shadow-brand-500/30" }
  };

  const r = rankConfig[rank] ?? rankConfig.intermediate;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl glass-level-2 border border-white/10"
      aria-label="Player overview"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-brand-600/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute -right-20 -bottom-20 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />
      </div>

      <div className="relative px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Avatar + Identity */}
          <div className="flex items-center gap-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="relative shrink-0"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${r.color} text-xl font-black text-white shadow-xl ${r.glow} border border-white/15 font-display`}>
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[2.5px] border-obsidian-950 bg-emerald-500" />
              <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-obsidian-950 border border-brand-500/50 text-[10px] font-black text-brand-300 font-mono">
                {level}
              </div>
            </motion.div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight font-display">
                  {displayName}
                </h1>
                <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${r.color} px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md ${r.glow} font-body uppercase tracking-wider`}>
                  <Crown className="h-3 w-3" />
                  {r.label}
                </span>
              </div>
              <p className="mt-1 text-xs font-body text-slate-400">
                {profile
                  ? `${profile.playstyle?.competitiveStyle ?? "Semi-Competitive"} · ${profile.region ?? "Global"}`
                  : "Set up your profile to unlock all features"}
              </p>

              {/* Quick badges row */}
              <div className="mt-2.5 flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-live-400 font-body">
                  <Flame className="h-3.5 w-3.5" />
                  {dailyStreak} day streak
                </span>
                <span className="h-3 w-px bg-white/10" />
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-300 font-body">
                  <Sparkles className="h-3.5 w-3.5" />
                  Season {Math.ceil(seasonProgress / 10)}
                </span>
                <span className="h-3 w-px bg-white/10" />
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 font-body">
                  <Star className="h-3.5 w-3.5" />
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* XP bar + Actions */}
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-body">
                <span className="font-semibold text-slate-300">Level {level} Progression</span>
                <span className="font-bold text-brand-300 font-mono">{xpPercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950/80 border border-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">3,200 / 5,000 XP to next level</p>
            </div>

            <div className="flex items-center gap-2.5">
              {profile ? (
                <>
                  <Link
                    to="/app/find-teammates"
                    className="glow-button inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition-all font-body uppercase tracking-wider"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Find Match
                  </Link>
                  <Link
                    to="/app/profile"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-body"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </Link>
                </>
              ) : (
                <Link
                  to="/app/profile"
                  className="glow-button inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/20 font-body uppercase tracking-wider"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Create Gamer Profile
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Season progress bar */}
        <div className="mt-6 flex items-center gap-4 rounded-xl border border-white/5 bg-slate-950/40 px-5 py-3">
          <Zap className="h-4 w-4 text-live-400 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1 font-body">
              <span className="font-semibold text-slate-300">Season 4 Progress</span>
              <span className="font-bold text-live-400 font-mono">{seasonProgress}/100</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-950">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-live-orange to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${seasonProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
