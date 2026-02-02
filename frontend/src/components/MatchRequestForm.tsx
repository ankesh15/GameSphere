import { FormEvent, useMemo, useState } from "react";
import { createMatchRequest } from "../api/matchmaking";

const DEFAULT_SKILL = 5;
const DEFAULT_PING = 50;

export default function MatchRequestForm() {
  const [gameId, setGameId] = useState("");
  const [region, setRegion] = useState("");
  const [skill, setSkill] = useState(DEFAULT_SKILL);
  const [pingMs, setPingMs] = useState(DEFAULT_PING);
  const [maxPingMs, setMaxPingMs] = useState(150);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validationMessage = useMemo(() => {
    if (gameId.trim().length < 2) {
      return "Game ID must be at least 2 characters.";
    }
    if (skill < 1 || skill > 10) {
      return "Skill must be between 1 and 10.";
    }
    if (pingMs < 0 || pingMs > 1000) {
      return "Ping must be between 0 and 1000 ms.";
    }
    if (maxPingMs < 0 || maxPingMs > 1000) {
      return "Max ping must be between 0 and 1000 ms.";
    }
    if (pingMs > maxPingMs) {
      return "Ping cannot exceed max ping.";
    }
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

    try {
      const response = await createMatchRequest({
        gameId: gameId.trim(),
        region: region.trim() || undefined,
        skill,
        pingMs,
        maxPingMs
      });
      setStatus(
        response.matchSessionId
          ? `Matched! Session: ${response.matchSessionId}.`
          : `Queued (ID: ${response.requestId}). Estimated wait: ${response.estimatedWaitSeconds}s.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit request.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-200">Game ID</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={gameId}
          onChange={(event) => setGameId(event.target.value)}
          placeholder="valorant"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Region (optional)</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          placeholder="us-east"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-200">Skill (1-10)</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            type="number"
            min={1}
            max={10}
            value={skill}
            onChange={(event) => setSkill(Number(event.target.value))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Ping (ms)</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            type="number"
            min={0}
            max={1000}
            value={pingMs}
            onChange={(event) => setPingMs(Number(event.target.value))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Max ping (ms)</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            type="number"
            min={0}
            max={1000}
            value={maxPingMs}
            onChange={(event) => setMaxPingMs(Number(event.target.value))}
          />
        </div>
      </div>

      {validationMessage ? (
        <p className="text-sm text-rose-400">{validationMessage}</p>
      ) : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {status ? <p className="text-sm text-emerald-400">{status}</p> : null}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-700"
        disabled={Boolean(validationMessage)}
      >
        Request Match
      </button>
    </form>
  );
}
