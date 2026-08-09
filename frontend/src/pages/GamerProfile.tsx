import { useEffect, useState } from "react";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  updateAvailability,
  linkGamingAccount,
  unlinkGamingAccount,
  GamerProfile,
  AvailabilityItem
} from "../api/profiles";
import { GAMES_CATALOG } from "../api/games";
import { useDialogStore } from "../store/dialog";
import {
  User,
  Gamepad,
  Clock,
  Link2,
  Lock,
  Award,
  Globe,
  Monitor,
  Flame,
  Shield,
  Layers,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Save,
  RotateCw,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REGIONS = [
  { value: "us-east", label: "North America (East)" },
  { value: "us-west", label: "North America (West)" },
  { value: "eu-west", label: "Europe (West)" },
  { value: "eu-east", label: "Europe (East)" },
  { value: "asia-east", label: "Asia (East)" },
  { value: "asia-south", label: "Asia (South)" },
  { value: "global", label: "Global / Other" }
];

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "pro", label: "Professional" }
];

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"];

const COMPETITIVE_STYLES = [
  { value: "casual", label: "Casual - Just for fun" },
  { value: "semi-pro", label: "Semi-Competitive - Fun but trying to win" },
  { value: "hardcore", label: "Hardcore - Competitive ranked grinding" }
];

const COMMUNICATION_STYLES = [
  { value: "ping-only", label: "Pings Only - No voice chat" },
  { value: "voice-chat", label: "Voice Chat - Active microphone user" },
  { value: "quiet", label: "Quiet - Listen but rarely speak" }
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default function GamerProfilePage() {
  const { showAlert, showConfirm, showToast } = useDialogStore();
  const [profile, setProfile] = useState<GamerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Onboarding Form States
  const [newGamerTag, setNewGamerTag] = useState("");
  const [newRegion, setNewRegion] = useState("global");
  const [newSkillLevel, setNewSkillLevel] = useState<"beginner" | "intermediate" | "advanced" | "pro">("intermediate");

  // Profile Form States
  const [gamerTag, setGamerTag] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [region, setRegion] = useState("");
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced" | "pro">("intermediate");
  const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  // Playstyle Form States
  const [competitiveStyle, setCompetitiveStyle] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);

  // Availability State
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);

  // Account Linking State
  const [linkingProvider, setLinkingProvider] = useState<"steam" | "riot" | "epic" | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<"steam" | "riot" | "epic" | null>(null);
  const [accountHandle, setAccountHandle] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  // Privacy State
  const [isPublic, setIsPublic] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showMatchHistory, setShowMatchHistory] = useState(true);

  // Per-handler saving states
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [playstyleSaving, setPlaystyleSaving] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const isSaving = detailsSaving || playstyleSaving || availabilitySaving || privacySaving || onboardingSaving;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProfile();
      setProfileData(data);
    } catch (err: any) {
      if (err.statusCode === 404 || err.response?.status === 404) {
        setOnboarding(true);
      } else {
        setError(err.message || err.response?.data?.message || "Failed to load gamer profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const setProfileData = (data: GamerProfile) => {
    setProfile(data);
    setGamerTag(data.gamerTag || "");
    setDisplayName(data.displayName || "");
    setBio(data.bio || "");
    setRegion(data.region || "global");
    setSkillLevel(data.skillLevel || "intermediate");
    setFavoriteGames(data.favoriteGames || []);
    setPlatforms(data.platforms || []);
    setCompetitiveStyle(data.playstyle?.competitiveStyle || "semi-pro");
    setCommunicationStyle(data.playstyle?.communicationStyle || "voice-chat");
    setPreferredRoles(data.playstyle?.preferredRoles || []);
    setAvailability(data.availability || []);
    setIsPublic(data.privacy?.isPublic !== false);
    setShowOnlineStatus(data.privacy?.showOnlineStatus !== false);
    setShowMatchHistory(data.privacy?.showMatchHistory !== false);
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGamerTag.trim()) {
      showAlert("Gamer Tag is required.", "Validation Error", "warning");
      return;
    }
    setOnboardingSaving(true);
    setError(null);
    try {
      const data = await createProfile({
        gamerTag: newGamerTag.trim(),
        region: newRegion,
        skillLevel: newSkillLevel
      });
      setProfileData(data);
      setOnboarding(false);
      showToast("Welcome to GameSphere! Profile created.", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to create profile.", "Profile Creation Error", "error");
    } finally {
      setOnboardingSaving(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamerTag.trim()) {
      showAlert("Gamer Tag cannot be empty.", "Validation Error", "warning");
      return;
    }
    setDetailsSaving(true);
    try {
      const data = await updateProfile({
        gamerTag: gamerTag.trim(),
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        region,
        skillLevel,
        favoriteGames,
        platforms
      });
      setProfileData(data);
      showToast("Profile details updated successfully.", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to update profile.", "Update Failed", "error");
    } finally {
      setDetailsSaving(false);
    }
  };

  const handlePlaystyleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaystyleSaving(true);
    try {
      const data = await updateProfile({
        playstyle: {
          competitiveStyle,
          communicationStyle,
          preferredRoles
        }
      });
      setProfileData(data);
      showToast("Playstyle settings saved.", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to update playstyle.", "Update Failed", "error");
    } finally {
      setPlaystyleSaving(false);
    }
  };

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvailabilitySaving(true);
    try {
      const data = await updateAvailability(availability);
      setProfileData(data);
      showToast("Weekly availability schedule saved.", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to update availability.", "Update Failed", "error");
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrivacySaving(true);
    try {
      const data = await updateProfile({
        privacy: {
          isPublic,
          showOnlineStatus,
          showMatchHistory
        }
      });
      setProfileData(data);
      showToast("Privacy settings updated.", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to update privacy.", "Update Failed", "error");
    } finally {
      setPrivacySaving(false);
    }
  };

  const handleAccountLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingProvider || !accountHandle.trim()) {
      setLinkError("Please input an account handle.");
      return;
    }
    setLinkError(null);
    try {
      const data = await linkGamingAccount({
        provider: linkingProvider,
        handle: accountHandle.trim(),
        externalId: "mock_" + Math.random().toString(36).substr(2, 9)
      });
      setProfileData(data);
      setLinkingProvider(null);
      setAccountHandle("");
      showToast(`Successfully linked ${linkingProvider} account!`, "success");
    } catch (err: any) {
      setLinkError(err.response?.data?.message || `Failed to link ${linkingProvider} account.`);
    }
  };

  const handleAccountUnlink = async (provider: "steam" | "riot" | "epic") => {
    showConfirm(
      `Are you sure you want to unlink your ${provider} account? This cannot be undone.`,
      async () => {
        setUnlinkingProvider(provider);
        try {
          const data = await unlinkGamingAccount(provider);
          setProfileData(data);
          showToast(`Successfully unlinked ${provider} account.`, "success");
        } catch (err: any) {
          showAlert(
            err.response?.data?.message || `Failed to unlink ${provider} account.`,
            "Unlink Failed",
            "error"
          );
        } finally {
          setUnlinkingProvider(null);
        }
      },
      `Unlink ${provider.charAt(0).toUpperCase() + provider.slice(1)} Account`
    );
  };

  const toggleFavoriteGame = (id: string) => {
    if (favoriteGames.includes(id)) {
      setFavoriteGames(favoriteGames.filter((g) => g !== id));
    } else {
      setFavoriteGames([...favoriteGames, id]);
    }
  };

  const togglePlatform = (name: string) => {
    if (platforms.includes(name)) {
      setPlatforms(platforms.filter((p) => p !== name));
    } else {
      setPlatforms([...platforms, name]);
    }
  };

  const handleDayAvailabilityToggle = (dayIndex: number) => {
    const existing = availability.find((a) => a.dayOfWeek === dayIndex);
    if (existing) {
      setAvailability(availability.filter((a) => a.dayOfWeek !== dayIndex));
    } else {
      setAvailability([
        ...availability,
        { dayOfWeek: dayIndex, startTime: "18:00", endTime: "22:00", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      ]);
    }
  };

  const updateDayTimes = (dayIndex: number, start: string, end: string) => {
    setAvailability(
      availability.map((a) => (a.dayOfWeek === dayIndex ? { ...a, startTime: start, endTime: end } : a))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 rounded-2xl bg-slate-900/65 border border-slate-800 p-6 flex flex-col justify-end">
          <div className="h-6 w-48 bg-slate-800 rounded"></div>
          <div className="h-4 w-96 bg-slate-800 rounded mt-3"></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 lg:col-span-1"></div>
          <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800 lg:col-span-3"></div>
        </div>
      </div>
    );
  }

  if (!loading && error && !profile && !onboarding) {
    return (
      <div className="py-16 px-4">
        <div className="glass-level-2 max-w-md mx-auto p-8 rounded-3xl border border-rose-500/30 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight font-display">Profile Load Failed</h2>
            <p className="mt-2 text-xs text-slate-300 font-body leading-relaxed">{error}</p>
          </div>
          <button
            onClick={fetchProfile}
            className="glow-button inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition uppercase tracking-wider font-body"
          >
            <RotateCw className="w-4 h-4" />
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  if (onboarding) {
    return (
      <div className="mx-auto max-w-xl space-y-6 pt-10">
        <div className="glass-level-2 rounded-3xl p-8 text-center relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600"></div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">Create Gamer Profile</h1>
          <p className="mt-3 text-sm text-slate-400 font-body">
            Welcome to GameSphere! Initialize your player tag and server region to start matching.
          </p>

          <form onSubmit={handleOnboardingSubmit} className="mt-8 text-left space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-body">Gamer Tag (Unique)</label>
              <input
                type="text"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                placeholder="e.g. Shroud#1337"
                value={newGamerTag}
                onChange={(e) => setNewGamerTag(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-body">Default Server Region</label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-body">Self-Assessed Skill Level</label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as any)}
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={onboardingSaving}
              className="glow-button w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-xs font-bold text-white transition hover:bg-brand-500 disabled:opacity-50 font-body uppercase tracking-wider"
            >
              {onboardingSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{onboardingSaving ? "Creating..." : "Initialize Profile"}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabItems = [
    { id: "details", label: "Identity", icon: User },
    { id: "playstyle", label: "Playstyle", icon: Gamepad },
    { id: "schedule", label: "Availability", icon: Clock },
    { id: "accounts", label: "Connected Accounts", icon: Link2 },
    { id: "privacy", label: "Privacy & Visibility", icon: Lock }
  ];

  return (
    <div className="space-y-6">
      {/* High-Fidelity Cover Banner */}
      <div className="rounded-3xl border border-white/10 glass-level-2 overflow-hidden relative">
        <div className="h-28 bg-gradient-to-r from-brand-900/60 via-purple-900/30 to-slate-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-brand-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-4 right-4 flex gap-2">
            {profile?.badges?.map((badge) => (
              <span
                key={badge.code}
                title={badge.source || "System Awarded"}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-live-400 text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider font-body"
              >
                <Award className="w-3.5 h-3.5" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Profile Card Main Info */}
        <div className="px-6 pb-6 pt-3 flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-14">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center font-black text-white text-3xl border-2 border-obsidian-950 shadow-2xl relative font-display">
              {profile?.gamerTag.slice(0, 2).toUpperCase()}
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-obsidian-950"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">{profile?.gamerTag}</h1>
                <span className="rounded-full bg-brand-500/10 border border-brand-500/30 px-2.5 py-0.5 text-[9px] font-extrabold text-brand-300 uppercase tracking-widest font-body">
                  {profile?.skillLevel || "Intermediate"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-body">
                {displayName ? `${displayName} · ` : ""}Region: {REGIONS.find((r) => r.value === region)?.label || region}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-body">Profile Level</span>
              <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">Level 12</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-body">Playstyle</span>
              <span className="text-sm font-extrabold text-brand-300 mt-0.5 block capitalize font-body">
                {profile?.playstyle?.competitiveStyle || "Semi-Pro"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-1 glass-level-1 border border-white/5 rounded-2xl p-2.5 h-fit">
          {tabItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition relative font-body ${
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="profileTabBg"
                    className="absolute inset-0 glass-level-2 border border-brand-500/35 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`w-4 h-4 ${isActive ? "text-brand-300" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Tab content panel */}
        <section className="lg:col-span-3">
          <div className="glass-level-2 rounded-3xl p-6 relative overflow-hidden min-h-[400px] border border-white/10">
            {activeTab === "details" && (
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Identity Details</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Update your display information and catalog favorites.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 font-body">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Gamer Tag</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                      value={gamerTag}
                      onChange={(e) => setGamerTag(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Real Name / Display Name</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                      value={displayName}
                      placeholder="e.g. John Doe"
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="font-body">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Biography / Status</label>
                  <textarea
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-none leading-relaxed transition-all font-body"
                    value={bio}
                    placeholder="Tell other squads about your playstyle, preferences, or schedules..."
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 font-body">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Server Region</label>
                    <select
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      {REGIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Skill Level Assessment</label>
                    <select
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value as any)}
                    >
                      {SKILL_LEVELS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Platforms selection */}
                <div className="space-y-2 font-body">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Available Platforms</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {PLATFORMS.map((plat) => {
                      const selected = platforms.includes(plat);
                      return (
                        <button
                          type="button"
                          key={plat}
                          onClick={() => togglePlatform(plat)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition font-body ${
                            selected
                              ? "bg-brand-600/20 border-brand-500/40 text-white shadow-md shadow-brand-500/10"
                              : "glass-level-1 border-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Favorite Games selection */}
                <div className="space-y-3 font-body">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Game Catalogs Preferred</label>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 pt-1">
                    {GAMES_CATALOG.map((game) => {
                      const selected = favoriteGames.includes(game.gameId);
                      return (
                        <div
                          key={game.gameId}
                          onClick={() => toggleFavoriteGame(game.gameId)}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition flex items-center justify-between font-body ${
                            selected
                              ? "bg-brand-500/15 border-brand-500/40 text-white shadow-md"
                              : "glass-level-1 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
                          }`}
                        >
                          <span className="text-xs font-bold font-body">{game.title}</span>
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                            selected ? "bg-brand-600 border-brand-500 text-white" : "border-slate-700"
                          }`}>
                            {selected ? "✓" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={detailsSaving}
                    className="glow-button inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50 font-body uppercase tracking-wider"
                  >
                    {detailsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{detailsSaving ? "Saving..." : "Save Identity"}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "playstyle" && (
              <form onSubmit={handlePlaystyleSubmit} className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white font-display">Playstyle Settings</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-body">Specify how you prefer to communicate and play with teams.</p>
                </div>

                <div className="space-y-4 font-body">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Competitive Intent</label>
                    <div className="grid gap-3 md:grid-cols-3 mt-2">
                      {COMPETITIVE_STYLES.map((style) => {
                        const active = competitiveStyle === style.value;
                        return (
                          <div
                            key={style.value}
                            onClick={() => setCompetitiveStyle(style.value)}
                            className={`p-4 rounded-2xl border cursor-pointer select-none transition ${
                              active
                                ? "glass-level-2 border-brand-500/40 bg-brand-500/10 text-white shadow-lg shadow-brand-500/5"
                                : "glass-level-1 border-white/5 text-slate-400 hover:border-white/15"
                            }`}
                          >
                            <h4 className="text-xs font-bold font-body text-white">{style.label.split(" - ")[0]}</h4>
                            <p className="text-[9px] text-slate-400 mt-1 font-body">{style.label.split(" - ")[1]}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-body">Communication Preference</label>
                    <div className="grid gap-3 md:grid-cols-3 mt-2">
                      {COMMUNICATION_STYLES.map((comm) => {
                        const active = communicationStyle === comm.value;
                        return (
                          <div
                            key={comm.value}
                            onClick={() => setCommunicationStyle(comm.value)}
                            className={`p-4 rounded-2xl border cursor-pointer select-none transition ${
                              active
                                ? "glass-level-2 border-brand-500/40 bg-brand-500/10 text-white shadow-lg shadow-brand-500/5"
                                : "glass-level-1 border-white/5 text-slate-400 hover:border-white/15"
                            }`}
                          >
                            <h4 className="text-xs font-bold font-body text-white">{comm.label.split(" - ")[0]}</h4>
                            <p className="text-[9px] text-slate-400 mt-1 font-body">{comm.label.split(" - ")[1]}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={playstyleSaving}
                    className="glow-button inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50 font-body uppercase tracking-wider"
                  >
                    {playstyleSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{playstyleSaving ? "Saving..." : "Save Playstyle"}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "schedule" && (
              <form onSubmit={handleAvailabilitySubmit} className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white font-display">Weekly Availability</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-body">Specify which days and hours you are available for matchmaking.</p>
                </div>

                <div className="space-y-4 font-body">
                  {DAYS_OF_WEEK.map((day, idx) => {
                    const dayItem = availability.find((a) => a.dayOfWeek === idx);
                    const active = !!dayItem;

                    return (
                      <div
                        key={day}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition ${
                          active ? "glass-level-2 border-white/10 text-white" : "glass-level-1 border-white/5 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleDayAvailabilityToggle(idx)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                              active ? "bg-brand-600 border-brand-500 text-white" : "border-slate-700"
                            }`}
                          >
                            {active ? "✓" : ""}
                          </button>
                          <span className="text-xs font-bold text-white font-body">{day}</span>
                        </div>

                        {active && (
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <input
                              type="time"
                              className="rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1.5 text-xs text-white focus:border-brand-500/50 focus:outline-none"
                              value={dayItem.startTime}
                              onChange={(e) => updateDayTimes(idx, e.target.value, dayItem.endTime)}
                            />
                            <span className="text-slate-400 font-body">to</span>
                            <input
                              type="time"
                              className="rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1.5 text-xs text-white focus:border-brand-500/50 focus:outline-none"
                              value={dayItem.endTime}
                              onChange={(e) => updateDayTimes(idx, dayItem.startTime, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={availabilitySaving}
                    className="glow-button inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50 font-body uppercase tracking-wider"
                  >
                    {availabilitySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{availabilitySaving ? "Saving..." : "Save Schedule"}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "accounts" && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white font-display">Link Game Clients</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-body">Connect your verified handles so teammates can find you.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 font-body">
                  {(["riot", "steam", "epic"] as const).map((prov) => {
                    const linkedAcc = profile?.gamingAccounts.find((a) => a.provider === prov);
                    return (
                      <div
                        key={prov}
                        className={`p-5 rounded-2xl border flex flex-col justify-between h-40 transition relative overflow-hidden ${
                          linkedAcc ? "glass-level-2 border-brand-500/30 bg-brand-500/10" : "glass-level-1 border-white/5"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 font-body">{prov}</span>
                            {linkedAcc ? (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20 font-body">
                                <CheckCircle className="w-3 h-3" /> Linked
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/5 font-body">
                                <XCircle className="w-3 h-3" /> Disconnected
                              </span>
                            )}
                          </div>

                          <div className="mt-4">
                            {linkedAcc ? (
                              <div className="space-y-1">
                                <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-body">Handle Name</span>
                                <span className="text-sm font-extrabold text-white truncate block font-body">{linkedAcc.handle}</span>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-body">Provide gaming credential handles to establish connection.</p>
                            )}
                          </div>
                        </div>

                        {linkedAcc ? (
                          <button
                            onClick={() => handleAccountUnlink(prov)}
                            disabled={unlinkingProvider === prov}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition disabled:opacity-50 font-body"
                          >
                            {unlinkingProvider === prov ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span>{unlinkingProvider === prov ? "Unlinking..." : "Unlink Handle"}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setLinkingProvider(prov)}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl glass-level-1 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition font-body"
                          >
                            <Plus className="w-3.5 h-3.5 text-brand-300" />
                            <span>Link Handle</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Account linker form modal */}
                <AnimatePresence>
                  {linkingProvider && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-5 rounded-2xl glass-level-3 border border-white/15 space-y-4 shadow-2xl"
                    >
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                        Verify {linkingProvider} Client Handle
                      </h4>
                      <form onSubmit={handleAccountLink} className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          required
                          className="flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-body"
                          placeholder={`Enter ${linkingProvider} nickname or tag`}
                          value={accountHandle}
                          onChange={(e) => setAccountHandle(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="glow-button px-4 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-500 transition font-body uppercase tracking-wider"
                          >
                            Verify Link
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLinkingProvider(null);
                              setAccountHandle("");
                              setLinkError(null);
                            }}
                            className="px-4 py-2.5 rounded-xl glass-level-1 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition font-body"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                      {linkError && <p className="text-[10px] font-semibold text-rose-400 font-body">{linkError}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === "privacy" && (
              <form onSubmit={handlePrivacySubmit} className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white font-display">Privacy Parameters</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-body">Control your profile's global metadata visibility.</p>
                </div>

                <div className="space-y-4 font-body">
                  {[
                    { label: "Public Profile Indexing", desc: "Allow other users and squads to see your stats, bio, and availability.", state: isPublic, setter: setIsPublic },
                    { label: "Online Activity Tracking", desc: "Broadcast active online indicators inside clans and lobbies.", state: showOnlineStatus, setter: setShowOnlineStatus },
                    { label: "Expose Historical Matches", desc: "Render historical match details inside teammate lists.", state: showMatchHistory, setter: setShowMatchHistory }
                  ].map((priv, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 glass-level-1">
                      <div>
                        <h4 className="text-xs font-bold text-white font-body">{priv.label}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-body">{priv.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => priv.setter(!priv.state)}
                        className={`w-11 h-6 rounded-full p-0.5 transition duration-300 ${
                          priv.state ? "bg-brand-600" : "bg-slate-800"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transform duration-300 ${
                            priv.state ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={privacySaving}
                    className="glow-button inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50 font-body uppercase tracking-wider"
                  >
                    {privacySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{privacySaving ? "Saving..." : "Save Privacy"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
