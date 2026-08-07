import { FormEvent, useMemo, useState } from "react";
import { createMatchRequest } from "../api/matchmaking";
import { GAMES_CATALOG } from "../api/games";
import { useSocketStore } from "../store/socket";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Wifi,
  Sliders,
  Play,
  RotateCw,
  XCircle,
  Clock,
  Globe,
  Settings
} from "lucide-react";

const DEFAULT_SKILL = 5;
const DEFAULT_PING = 50;

export default function MatchRequestForm() {
  const isQueued = useSocketStore((state) => state.isQueued);
  const queuedGameId = useSocketStore((state) => state.queuedGameId);
  const elapsedTime = useSocketStore((state) => state.elapsedTime);
  const setQueueState = useSocketStore((state) => state.setQueueState);

  const [gameId, setGameId] = useState(GAMES_CATALOG[0]?.gameId || "");
  const [region, setRegion] = useState("global");
  const [skill, setSkill] = useState(DEFAULT_SKILL);
  const [pingMs, setPingMs] = useState(DEFAULT_PING);
  const [maxPingMs, setMaxPingMs] = useState(150);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validationMessage = useMemo(() => {
    if (!gameId) return "Please select a game.";
    if (skill < 1 || skill > 10) return "Skill must be between 1 and 10.";
    if (pingMs < 0 || pingMs > 1000) return "Ping must be between 0 and 1000 ms.";
    if (maxPingMs < 0 || maxPingMs > 1000) return "Max ping must be between 0 and 1000 ms.";
    if (pingMs > maxPingMs) return "Ping cannot exceed max ping.";
    return null;
  }, [gameId, skill, pingMs, maxPingMs]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);
    try {
      const response = await createMatchRequest({
        gameId,
        region: region || undefined,
        skill,
        pingMs,
        maxPingMs
      });

      if (response.matchSessionId) {
        setStatus(`Matched! Redirecting to session ${response.matchSessionId}...`);
      } else {
        setQueueState(true, gameId, response.requestId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedQueuedGame = GAMES_CATALOG.find((g) => g.gameId === queuedGameId);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isQueued ? (
          <motion.div
            key="queue-active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-3xl border border-brand-500/20 bg-slate-900/40 p-8 text-center relative overflow-hidden flex flex-col items-center backdrop-blur-xl"
          >
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl" />

            {/* Radar Animation */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-brand-500/10 animate-pulse-slow"></div>
              <div className="absolute inset-4 rounded-full border border-brand-500/20 animate-ping opacity-30"></div>
              <div className="absolute inset-8 rounded-full border border-brand-500/30 animate-spin opacity-20" style={{ animationDuration: "12s" }}>
                <div className="w-2 h-2 rounded-full bg-brand-500 absolute top-0 left-1/2 -translate-x-1/2" />
              </div>
              <div className="relative w-20 h-20 rounded-full bg-slate-950 border border-brand-500/40 flex items-center justify-center text-white shadow-2xl shadow-brand-500/20 overflow-hidden">
                {selectedQueuedGame?.imageUrl ? (
                  <img src={selectedQueuedGame.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <Compass className="w-8 h-8 text-brand-400 animate-spin" style={{ animationDuration: "8s" }} />
                )}
              </div>
            </div>

            <h3 className="mt-6 text-xl font-black text-white tracking-tight">Searching for Teammates...</h3>
            <p className="mt-1.5 text-xs text-slate-400">
              Game: <span className="text-white font-bold">{selectedQueuedGame?.title || queuedGameId}</span>
            </p>

            {/* Search timer HUD */}
            <div className="mt-5 space-y-1">
              <div className="text-3xl font-mono font-black text-white tracking-widest bg-slate-950 border border-slate-850 px-6 py-2.5 rounded-2xl shadow-inner">
                {formatTime(elapsedTime)}
              </div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Elapsed Wait Time</span>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800/40 w-full grid grid-cols-2 gap-4 text-[10px] text-slate-400">
              <div className="text-center bg-slate-950/30 py-2 rounded-xl border border-slate-900">
                <span className="text-slate-500 block uppercase font-bold tracking-wider">Estimated Wait</span>
                <span className="text-slate-350 font-semibold block mt-0.5">02:15</span>
              </div>
              <div className="text-center bg-slate-950/30 py-2 rounded-xl border border-slate-900">
                <span className="text-slate-500 block uppercase font-bold tracking-wider">Network Ping</span>
                <span className="text-brand-400 font-semibold block mt-0.5">~32ms</span>
              </div>
            </div>

            <button
              onClick={() => setQueueState(false)}
              className="glow-button mt-8 w-full py-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-bold text-rose-400 transition"
            >
              Cancel Matchmaking Request
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="queue-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 bg-slate-900/20 border border-slate-900 p-6 rounded-3xl"
            onSubmit={handleSubmit}
          >
            <div className="border-b border-slate-800/60 pb-3 flex items-center gap-2.5">
              <Settings className="w-4.5 h-4.5 text-brand-400" />
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Match Settings</h3>
                <p className="text-[10px] text-slate-500">Configure parameters for optimal skill matching.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Play className="w-3 h-3 text-brand-400" />
                  <span>Choose Game</span>
                </label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                  value={gameId}
                  onChange={(event) => setGameId(event.target.value)}
                >
                  {GAMES_CATALOG.map((game) => (
                    <option key={game.gameId} value={game.gameId}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  <span>Lobby Region</span>
                </label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                >
                  <option value="global">Global (Recommended)</option>
                  <option value="us-east">North America (East)</option>
                  <option value="us-west">North America (West)</option>
                  <option value="eu-west">Europe (West)</option>
                  <option value="eu-east">Europe (East)</option>
                  <option value="asia-east">Asia (East)</option>
                </select>
              </div>
            </div>

            {/* Custom Sliders */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-400" />
                    Target Skill Level
                  </span>
                  <span className="text-brand-400 font-mono text-xs">{skill} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full accent-brand-500 h-1 bg-slate-950 rounded-lg cursor-pointer appearance-none"
                  value={skill}
                  onChange={(e) => setSkill(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-brand-400" />
                      Expected Ping
                    </span>
                    <span className="text-brand-400 font-mono text-xs">{pingMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    className="w-full accent-brand-500 h-1 bg-slate-950 rounded-lg cursor-pointer appearance-none"
                    value={pingMs}
                    onChange={(e) => setPingMs(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-rose-500" />
                      Max Tolerable Ping
                    </span>
                    <span className="text-rose-450 font-mono text-xs">{maxPingMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    className="w-full accent-brand-500 h-1 bg-slate-950 rounded-lg cursor-pointer appearance-none"
                    value={maxPingMs}
                    onChange={(e) => setMaxPingMs(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {validationMessage && <p className="text-xs text-rose-400">{validationMessage}</p>}
            {error && <p className="text-xs text-rose-400">{error}</p>}
            {status && <p className="text-xs text-emerald-400">{status}</p>}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="glow-button flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50"
                disabled={Boolean(validationMessage) || submitting}
              >
                {submitting && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{submitting ? "Deploying Search..." : "Find Squad"}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
