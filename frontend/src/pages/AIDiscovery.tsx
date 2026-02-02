export default function AIDiscoveryPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">AI Discovery</h1>
        <p className="mt-2 text-sm text-slate-400">
          Explore game and teammate recommendations tailored to your playstyle.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Recommended for you</h2>
        <p className="mt-2 text-sm text-slate-400">
          Connect your profile data to see AI-powered suggestions.
        </p>
      </section>
    </div>
  );
}
