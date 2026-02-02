export default function GamerProfilePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">Gamer Profile</h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your playstyle, availability, and linked gaming accounts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Profile details</h2>
          <p className="mt-2 text-sm text-slate-400">
            Update your gamer tag, regions, and favorite games.
          </p>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Availability</h2>
          <p className="mt-2 text-sm text-slate-400">
            Share your weekly schedule to get better matches.
          </p>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Linked accounts</h2>
          <p className="mt-2 text-sm text-slate-400">
            Connect Steam, Riot, or Epic accounts for richer insights.
          </p>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Privacy</h2>
          <p className="mt-2 text-sm text-slate-400">
            Control who can see your activity and match history.
          </p>
        </section>
      </div>
    </div>
  );
}
