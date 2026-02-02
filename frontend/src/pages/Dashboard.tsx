import { useEffect, useState } from "react";
import { getHealth, HealthStatus } from "../api/health";

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((payload) => {
        if (isMounted) {
          setHealth(payload);
          setHealthError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setHealthError(error instanceof Error ? error.message : "Unknown error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Track your sessions, matchmaking status, and communities.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">API Health</h2>
          {health ? (
            <p className="mt-2 text-sm text-emerald-400">
              {health.status} · {new Date(health.timestamp).toLocaleString()}
            </p>
          ) : healthError ? (
            <p className="mt-2 text-sm text-rose-400">{healthError}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Checking...</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Next Steps</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>Complete your gamer profile.</li>
            <li>Queue for a match with preferred latency.</li>
            <li>Join a clan to coordinate sessions.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
