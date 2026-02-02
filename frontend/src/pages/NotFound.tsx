import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <h1 className="text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
