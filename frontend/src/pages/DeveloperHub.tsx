export default function DeveloperHubPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">Developer Hub</h1>
        <p className="mt-2 text-sm text-slate-400">
          Build integrations, bots, and analytics on top of GameSphere APIs.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">API status</h2>
        <p className="mt-2 text-sm text-slate-400">
          API keys, rate limits, and SDK resources will appear here.
        </p>
      </section>
    </div>
  );
}
