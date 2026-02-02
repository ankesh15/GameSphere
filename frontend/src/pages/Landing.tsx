import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <span className="text-lg font-semibold text-white">GameSphere</span>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-slate-300 hover:text-white">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-500"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12">
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
              AI-powered matchmaking
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white lg:text-5xl">
              Find your next squad, tournament, and community.
            </h1>
            <p className="mt-4 text-base text-slate-400">
              GameSphere connects gamers with smarter matchmaking, discovery, and
              community tools built for competitive play and social coordination.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
              >
                Join GameSphere
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-500"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <h2 className="text-lg font-semibold text-white">Live highlights</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>Match quality signals from AI and real-time telemetry.</li>
              <li>Clan coordination, events, and persistent chat.</li>
              <li>Brackets and tournament tooling for organizers.</li>
              <li>Developer hub for community integrations.</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Find teammates",
              description:
                "Queue with latency targets and skill filters to get better matches."
            },
            {
              title: "AI discovery",
              description:
                "Get recommendations for games and teammates powered by collaborative filtering."
            },
            {
              title: "Community power",
              description:
                "Manage clans, events, and tournaments with built-in moderation."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
