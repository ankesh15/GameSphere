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
    pro: { label: "Radiant", color: "from-brand-400 to-pink-500", glow: "shadow-brand-500/30" }
  };

  const r = rankConfig[rank] ?? rankConfig.intermediate;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-800/60"
      aria-label="Player overview"
    >
      {/* ── Animated gradient background ───────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-brand-600/8 blur-[100px] animate-pulse-slow" />
        <div className="absolute -right-20 -bottom-20 h-[350px] w-[350px] rounded-full bg-indigo-600/8 blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      </div>

      <div className="relative px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* ── Left: Avatar + Identity ─────────────────────────── */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${r.color} text-xl font-black text-white shadow-xl ${r.glow} border border-white/10`}>
                {initials}
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[2.5px] border-slate-900 bg-emerald-500" />
              {/* Level badge */}
              <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-brand-500/40 text-[10px] font-black text-brand-400">
                {level}
              </div>
            </motion.div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {displayName}
                </h1>
                <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${r.color} px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md ${r.glow}`}>
                  <Crown className="h-3 w-3" />
                  {r.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {profile
                  ? `${profile.playstyle?.competitiveStyle ?? "Semi-Competitive"} · ${profile.region ?? "Global"}`
                  : "Set up your profile to unlock all features"}
              </p>

              {/* Quick badges row */}
              <div className="mt-2.5 flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <Flame className="h-3.5 w-3.5" />
                  {dailyStreak} day streak
                </span>
                <span className="h-3 w-px bg-slate-700" />
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Season {Math.ceil(seasonProgress / 10)}
                </span>
                <span className="h-3 w-px bg-slate-700" />
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <Star className="h-3.5 w-3.5" />
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: XP bar + actions ────────────────────────── */}
          <div className="flex flex-col gap-4 lg:items-end">
            {/* XP Progress */}
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Level {level} Progression</span>
                <span className="font-bold text-brand-400">{xpPercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80 border border-slate-700/40">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">3,200 / 5,000 XP to next level</p>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2.5">
              {profile ? (
                <>
                  <Link
                    to="/app/find-teammates"
                    className="glow-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white hover:from-brand-500 hover:to-indigo-500 transition-all"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Find Match
                  </Link>
                  <Link
                    to="/app/profile"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </Link>
                </>
              ) : (
                <Link
                  to="/app/profile"
                  className="glow-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/20"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Create Gamer Profile
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Season progress bar ──────────────────────────────── */}
        <div className="mt-6 flex items-center gap-4 rounded-xl border border-slate-800/50 bg-slate-900/30 px-5 py-3">
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Season 4 Progress</span>
              <span className="font-bold text-amber-400">{seasonProgress}/100</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500"
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
