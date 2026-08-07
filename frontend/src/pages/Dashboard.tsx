import { useEffect, useState } from "react";
import { Clock, Trophy, Users, Gamepad2 } from "lucide-react";
import { getMyProfile, GamerProfile } from "../api/profiles";
import { useAuthStore } from "../store/auth";
import HeroSection from "../components/dashboard/HeroSection";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import MatchHistory from "../components/dashboard/MatchHistory";
import Charts from "../components/dashboard/Charts";
import MissionCard from "../components/dashboard/MissionCard";
import FriendsPanel from "../components/dashboard/FriendsPanel";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<GamerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getMyProfile()
      .then((p) => {
        if (isMounted) {
          setProfile(p);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800" />
          ))}
        </div>
        <div className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Hero Section ───────────────────────────── */}
      <HeroSection profile={profile} user={user} />

      {/* ── 2. Top Stats Grid ─────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Matches Played"
          value={profile ? "142" : "0"}
          icon={Gamepad2}
          trend="up"
          trendValue="+12"
          accent="from-brand-500 to-purple-600"
          delay={0.1}
          sparklineData={[1, 3, 2, 5, 4, 8, 7]}
        />
        <StatsCard
          label="Win Rate"
          value={profile ? "58.2%" : "0%"}
          icon={Trophy}
          trend="up"
          trendValue="+2.4%"
          accent="from-emerald-500 to-teal-500"
          delay={0.15}
          sparklineData={[50, 52, 51, 55, 54, 58, 58.2]}
        />
        <StatsCard
          label="Hours Played"
          value={profile ? "342h" : "0h"}
          icon={Clock}
          trend="neutral"
          trendValue="Avg 3h/day"
          accent="from-amber-500 to-orange-500"
          delay={0.2}
          sparklineData={[3, 2, 4, 3, 5, 6, 3]}
        />
        <StatsCard
          label="Teammates Met"
          value={profile ? "89" : "0"}
          icon={Users}
          trend="up"
          trendValue="+5"
          accent="from-sky-500 to-blue-600"
          delay={0.25}
          sparklineData={[2, 1, 4, 2, 6, 3, 5]}
        />
      </div>

      {/* ── 3. Quick Actions ──────────────────────────── */}
      <QuickActions />

      {/* ── 4. Main Content Split ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Feed, Charts, History (70%) */}
        <div className="lg:col-span-8 space-y-6">
          <Charts />
          <ActivityFeed />
          <MatchHistory />
        </div>

        {/* Right Column: Missions, Friends (30%) */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <MissionCard />
          <FriendsPanel />
        </div>
      </div>
    </div>
  );
}
