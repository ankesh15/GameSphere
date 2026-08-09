import { FormEvent, useEffect, useMemo, useState } from "react";
import { createMatchRequest, cancelMatchRequest, getCurrentMatchRequest } from "../api/matchmaking";
import { GAMES_CATALOG } from "../api/games";
import { useSocketStore } from "../store/socket";
import { useDialogStore } from "../store/dialog";
import { validateMatchRequestForm } from "../utils/validation";
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
  const queuedRequestId = useSocketStore((state) => state.queuedRequestId);
  const elapsedTime = useSocketStore((state) => state.elapsedTime);
  const setQueueState = useSocketStore((state) => state.setQueueState);
  const { showAlert, showToast } = useDialogStore();

  const [gameId, setGameId] = useState(GAMES_CATALOG[0]?.gameId || "");
  const [region, setRegion] = useState("global");
  const [skill, setSkill] = useState(DEFAULT_SKILL);
  const [pingMs, setPingMs] = useState(DEFAULT_PING);
  const [maxPingMs, setMaxPingMs] = useState(150);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    // Only check if we are not currently queued locally
    if (!isQueued) {
      getCurrentMatchRequest()
        .then((request) => {
          if (request && (request.status === "queued" || request.status === "matched")) {
            if (request.status === "matched" && request.matchSessionId) {
              // Redirect to match session
              window.location.hash = `#/app/match/${request.matchSessionId}`;
            } else if (request.status === "queued") {
              setQueueState(true, request.gameId, request._id || (request as any).id);
            }
          }
        })
        .catch((err) => {
          // Ignore 404 since it just means there is no active request
          if (err.statusCode !== 404) {
            console.error("Failed to check current matchmaking request status", err);
          }
        });
    }
  }, [isQueued, setQueueState]);

  const validationMessage = useMemo(() => {
    const res = validateMatchRequestForm({ gameId, skill, pingMs, maxPingMs });
    return res.firstError || null;
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

  const handleCancel = async () => {
    if (!queuedRequestId) {
      setQueueState(false);
      return;
    }
    setCanceling(true);
    try {
      await cancelMatchRequest(queuedRequestId);
      showToast("Matchmaking request canceled", "info");
      setQueueState(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Failed to cancel matchmaking request on server.";
      showAlert(errMsg, "Cancellation Error", "error");
    } finally {
      setCanceling(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedQueuedGame = GAMES_CATALOG.find((g) => g.gameId === queuedGameId);

  return (
    <div className="w-full font-body">
      <AnimatePresence mode="wait">
        {isQueued ? (
          <motion.div
            key="queue-active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-3xl border border-amber-500/35 bg-amber-500/5 p-8 text-center relative overflow-hidden flex flex-col items-center backdrop-blur-2xl shadow-2xl shadow-amber-500/10"
          >
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

            {/* Radar Animation */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-pulse-slow"></div>
              <div className="absolute inset-4 rounded-full border border-amber-500/30 animate-ping opacity-40"></div>
              <div className="absolute inset-8 rounded-full border border-amber-500/40 animate-spin opacity-30" style={{ animationDuration: "10s" }}>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-0 left-1/2 -translate-x-1/2 shadow-lg shadow-amber-400" />
              </div>
              <div className="relative w-20 h-20 rounded-full bg-slate-950 border-2 border-amber-500/50 flex items-center justify-center text-white shadow-2xl shadow-amber-500/30 overflow-hidden">
                {selectedQueuedGame?.imageUrl ? (
                  <img src={selectedQueuedGame.imageUrl} alt="" className="w-full h-full object-cover opacity-85" />
                ) : (
                  <Compass className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <h3 className="text-xl font-black text-white tracking-tight font-display">Searching for Teammates...</h3>
            </div>
            <p className="mt-1.5 text-xs text-slate-300 font-body">
              Game: <span className="text-white font-bold">{selectedQueuedGame?.title || queuedGameId}</span>
            </p>

            {/* Search timer HUD */}
            <div className="mt-5 space-y-1">
              <div className="text-3xl font-mono font-black text-amber-300 tracking-widest bg-slate-950/90 border border-amber-500/30 px-7 py-2.5 rounded-2xl shadow-inner shadow-amber-500/10">
                {formatTime(elapsedTime)}
              </div>
              <span className="text-[9px] text-amber-400/80 uppercase tracking-widest font-extrabold font-body block pt-1">Elapsed Wait Time</span>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 w-full grid grid-cols-2 gap-4 text-[10px] text-slate-300 font-body">
              <div className="text-center bg-slate-950/60 py-2.5 rounded-xl border border-white/5">
                <span className="text-slate-400 block uppercase font-bold tracking-wider">Estimated Wait</span>
                <span className="text-white font-semibold font-mono block mt-0.5">02:15</span>
              </div>
              <div className="text-center bg-slate-950/60 py-2.5 rounded-xl border border-white/5">
                <span className="text-slate-400 block uppercase font-bold tracking-wider">Network Ping</span>
                <span className="text-amber-400 font-semibold font-mono block mt-0.5">~32ms</span>
              </div>
            </div>

            <button
              onClick={handleCancel}
              disabled={canceling}
              className="glow-button mt-8 w-full py-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 transition disabled:opacity-50 flex items-center justify-center gap-2 font-body uppercase tracking-wider"
            >
              {canceling && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{canceling ? "Canceling Request..." : "Cancel Matchmaking Request"}</span>
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="queue-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 glass-level-2 border border-white/10 p-6 rounded-3xl shadow-2xl font-body"
            onSubmit={handleSubmit}
          >
            <div className="border-b border-white/10 pb-3 flex items-center gap-2.5">
              <Settings className="w-4.5 h-4.5 text-brand-300" />
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display">Match Settings</h3>
                <p className="text-[10px] text-slate-400 font-body">Configure parameters for optimal skill matching.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 font-body">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-body">
                  <Play className="w-3 h-3 text-brand-400" />
                  <span>Choose Game</span>
                </label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-body">
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  <span>Lobby Region</span>
                </label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
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
            <div className="space-y-6 font-body">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-400" />
                    Target Skill Level
                  </span>
                  <span className="text-brand-300 font-mono text-xs">{skill} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full accent-brand-500 h-1.5 bg-slate-950/80 border border-white/10 rounded-lg cursor-pointer appearance-none"
                  value={skill}
                  onChange={(e) => setSkill(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-brand-400" />
                      Expected Ping
                    </span>
                    <span className="text-brand-300 font-mono text-xs">{pingMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    className="w-full accent-brand-500 h-1.5 bg-slate-950/80 border border-white/10 rounded-lg cursor-pointer appearance-none"
                    value={pingMs}
                    onChange={(e) => setPingMs(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-rose-400" />
                      Max Tolerable Ping
                    </span>
                    <span className="text-rose-400 font-mono text-xs">{maxPingMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    className="w-full accent-brand-500 h-1.5 bg-slate-950/80 border border-white/10 rounded-lg cursor-pointer appearance-none"
                    value={maxPingMs}
                    onChange={(e) => setMaxPingMs(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {validationMessage && <p className="text-xs text-rose-400 font-semibold font-body">{validationMessage}</p>}
            {error && <p className="text-xs text-rose-400 font-semibold font-body">{error}</p>}
            {status && <p className="text-xs text-emerald-400 font-semibold font-body">{status}</p>}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="glow-button flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50 font-body uppercase tracking-wider"
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
