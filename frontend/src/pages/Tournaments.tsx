export default function TournamentsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">Tournaments</h1>
        <p className="mt-2 text-sm text-slate-400">
          Host and join brackets, submit results, and track winners.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Upcoming events</h2>
        <p className="mt-2 text-sm text-slate-400">
          Tournament listings will appear here once configured.
        </p>
      </section>
    </div>
  );
}
