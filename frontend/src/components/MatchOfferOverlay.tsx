import { useEffect, useState } from "react";
import { useSocketStore } from "../store/socket";
import { GAMES_CATALOG } from "../api/games";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function MatchOfferOverlay() {
  const activeMatchOffer = useSocketStore((state) => state.activeMatchOffer);
  const acceptMatch = useSocketStore((state) => state.acceptMatch);
  const declineMatch = useSocketStore((state) => state.declineMatch);

  const [timeLeft, setTimeLeft] = useState(90);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    if (!activeMatchOffer) {
      setHasAccepted(false);
      return;
    }

    setHasAccepted(false);

    const calculateTimeLeft = () => {
      if (!activeMatchOffer.expiresAt) return 90;
      const diff = new Date(activeMatchOffer.expiresAt).getTime() - Date.now();
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeMatchOffer]);

  if (!activeMatchOffer) return null;

  const game = GAMES_CATALOG.find((g) => g.gameId === activeMatchOffer.gameId);
  const totalPlayers = activeMatchOffer.playerIds.length;
  const acceptedPlayersCount = activeMatchOffer.acceptedBy.length;

  const handleAccept = () => {
    setHasAccepted(true);
    acceptMatch();
  };

  const handleDecline = () => {
    declineMatch();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 font-body">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-md rounded-3xl glass-level-3 border border-amber-500/40 bg-slate-950/90 p-8 shadow-2xl shadow-amber-500/15 text-center relative overflow-hidden font-body"
        >
          {/* Top urgency indicator strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

          {/* Radial amber glow background */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* SVG Gradient Circular Ring Countdown */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="liveAmberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#FF6B00" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#0f172a"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#liveAmberGradient)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * timeLeft) / 90}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute text-3xl font-black text-amber-300 font-mono tracking-tighter drop-shadow-md">{timeLeft}s</span>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight font-display">Live Match Found!</h2>
          </div>
          <p className="mt-1 text-xs text-slate-300 font-body">Ready up immediately to lock in your squad slot</p>

          {/* Game Details Card */}
          <div className="mt-5 rounded-2xl glass-level-1 border border-white/10 p-4 flex items-center gap-4 text-left font-body">
            {game?.imageUrl ? (
              <img src={game.imageUrl} alt={game.title} className="w-14 h-14 object-cover rounded-xl border border-white/10 shadow-md" />
            ) : (
              <div className="w-14 h-14 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-xl">
                🎮
              </div>
            )}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-body">{game?.title || activeMatchOffer.gameId}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 capitalize font-body">Server: {activeMatchOffer.region || "Global"}</p>
              <p className="text-[10px] font-extrabold text-amber-400 mt-1 font-body">
                Lobby Status: {acceptedPlayersCount} of {totalPlayers} ready
              </p>
            </div>
          </div>

          {/* Progress checks indicators */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-center gap-2">
              {activeMatchOffer.playerIds.map((pid) => {
                const accepted = activeMatchOffer.acceptedBy.includes(pid);
                return (
                  <div
                    key={pid}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      accepted
                        ? "w-8 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/30"
                        : "w-4 bg-slate-800/80 border border-white/5"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Accept / Decline CTA */}
          <div className="mt-8 flex gap-4 font-body">
            <button
              onClick={handleDecline}
              disabled={hasAccepted}
              className="flex-1 py-3.5 rounded-xl glass-level-1 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition disabled:opacity-50 font-body uppercase tracking-wider"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={hasAccepted}
              className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition font-body uppercase tracking-wider ${
                hasAccepted
                  ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                  : "glow-button bg-brand-600 hover:bg-brand-500 text-white"
              }`}
            >
              {hasAccepted ? (
                <span className="flex items-center justify-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ready
                </span>
              ) : (
                "Accept Match"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
