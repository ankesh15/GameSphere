import MatchRequestForm from "../components/MatchRequestForm";

export default function FindTeammatesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">Find Teammates</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create a request and let the AI match you with compatible players.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Match request</h2>
        <div className="mt-4">
          <MatchRequestForm />
        </div>
      </section>
    </div>
  );
}
