export default function ClansPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">Clans</h1>
        <p className="mt-2 text-sm text-slate-400">
          Build your squad, manage roles, and coordinate events.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Your clan spaces</h2>
        <p className="mt-2 text-sm text-slate-400">
          Create a clan or join an existing community to unlock clan chat.
        </p>
      </section>
    </div>
  );
}
