import { Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import AIDiscoveryPage from "./pages/AIDiscovery";
import ClansPage from "./pages/Clans";
import DashboardPage from "./pages/Dashboard";
import DeveloperHubPage from "./pages/DeveloperHub";
import FindTeammatesPage from "./pages/FindTeammates";
import GamerProfilePage from "./pages/GamerProfile";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import NotFoundPage from "./pages/NotFound";
import RegisterPage from "./pages/Register";
import TournamentsPage from "./pages/Tournaments";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/profile" element={<GamerProfilePage />} />
        <Route path="/app/find-teammates" element={<FindTeammatesPage />} />
        <Route path="/app/ai-discovery" element={<AIDiscoveryPage />} />
        <Route path="/app/tournaments" element={<TournamentsPage />} />
        <Route path="/app/clans" element={<ClansPage />} />
        <Route path="/app/developer-hub" element={<DeveloperHubPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
