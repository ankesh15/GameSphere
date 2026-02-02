import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function AppShell() {
  const clearTokens = useAuthStore((state) => state.clearTokens);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">GameSphere</span>
            <span className="rounded-full bg-brand-600/20 px-2 py-0.5 text-xs text-brand-300">
              Beta
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white"
              }
            >
              Gamer Profile
            </NavLink>
            <NavLink
              to="/app/find-teammates"
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white"
              }
            >
              Find Teammates
            </NavLink>
            <NavLink
              to="/app/ai-discovery"
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white"
              }
            >
              AI Discovery
            </NavLink>
            <NavLink
              to="/app/tournaments"
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white"
              }
            >
              Tournaments
            </NavLink>
            <NavLink
              to="/app/clans"
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white"
              }
            >
              Clans
            </NavLink>
            <NavLink
              to="/app/developer-hub"
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white"
              }
            >
              Developer Hub
            </NavLink>
            <button
              onClick={clearTokens}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
