import { useState, useEffect } from "react";
import ChatRoom from "../components/ChatRoom";
import {
  Shield,
  MessageSquare,
  Volume2,
  Users,
  Megaphone,
  Calendar,
  Settings,
  Plus,
  Compass,
  ArrowRight,
  Tv,
  X,
  Trash2,
  UserPlus,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/auth";
import {
  getClans,
  getClan,
  createClan,
  joinClan,
  leaveClan,
  kickMember,
  updateMemberRole,
  createClanEvent,
  listClanEvents,
  Clan,
  ClanMember,
  ClanEvent
} from "../api/clans";
import { getGamerProfile, GamerProfile } from "../api/profiles";
import { GAMES_CATALOG } from "../api/games";

export default function ClansPage() {
  const { user } = useAuthStore();
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [clanMembers, setClanMembers] = useState<GamerProfile[]>([]);
  const [clanEvents, setClanEvents] = useState<ClanEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    tag: "",
    description: "",
    region: "NA",
    gameIds: [] as string[],
    isPublic: true,
    recruiting: true
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: ""
  });

  const [inviteUserId, setInviteUserId] = useState("");

  const channels = [
    { id: "announcements", label: "announcements", icon: Megaphone },
    { id: "general", label: "general-chat", icon: MessageSquare },
    { id: "scrims", label: "scrim-coordination", icon: Calendar }
  ];

  const voiceChannels = [
    { id: "lounge", label: "Lounge" },
    { id: "scrim-v1", label: "Scrim Room 1" },
    { id: "scrim-v2", label: "Scrim Room 2" }
  ];

  useEffect(() => {
    fetchClansList();
  }, []);

  useEffect(() => {
    if (selectedClan) {
      fetchClanRoster(selectedClan);
      fetchClanEventsList(selectedClan._id);
    }
  }, [selectedClan]);

  const fetchClansList = async () => {
    setLoading(true);
    try {
      const list = await getClans();
      setClans(list);
      if (list.length > 0) {
        setSelectedClan(list[0]);
      }
    } catch (err) {
      console.error("Failed to load clans directory", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClanRoster = async (clan: Clan) => {
    setRosterLoading(true);
    try {
      const promises = clan.members.map((m) => getGamerProfile(m.userId).catch(() => null));
      const profiles = await Promise.all(promises);
      setClanMembers(profiles.filter((p): p is GamerProfile => p !== null));
    } catch (err) {
      console.error("Failed to load clan members profiles", err);
    } finally {
      setRosterLoading(false);
    }
  };

  const fetchClanEventsList = async (clanId: string) => {
    setEventsLoading(true);
    try {
      const events = await listClanEvents(clanId);
      setClanEvents(events);
    } catch (err) {
      console.error("Failed to fetch clan events", err);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleCreateClan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newClan = await createClan(createForm);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        tag: "",
        description: "",
        region: "NA",
        gameIds: [],
        isPublic: true,
        recruiting: true
      });
      // Refresh
      const list = await getClans();
      setClans(list);
      setSelectedClan(newClan);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create clan.");
    }
  };

  const handleJoinClan = async () => {
    if (!selectedClan) return;
    try {
      const updated = await joinClan(selectedClan._id);
      setSelectedClan(updated);
      setClans((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join clan.");
    }
  };

  const handleLeaveClan = async () => {
    if (!selectedClan) return;
    if (!window.confirm("Are you sure you want to leave this clan?")) return;
    try {
      const updated = await leaveClan(selectedClan._id);
      setSelectedClan(updated);
      setClans((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to leave clan.");
    }
  };

  const handleKickMember = async (targetUserId: string) => {
    if (!selectedClan) return;
    if (!window.confirm("Kick this member from the clan?")) return;
    try {
      const updated = await kickMember(selectedClan._id, targetUserId);
      setSelectedClan(updated);
      setClans((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to kick member.");
    }
  };

  const handleRoleUpdate = async (targetUserId: string, newRole: "admin" | "moderator" | "member") => {
    if (!selectedClan) return;
    try {
      const updated = await updateMemberRole(selectedClan._id, {
        userId: targetUserId,
        role: newRole
      });
      setSelectedClan(updated);
      setClans((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClan) return;
    try {
      const payload = {
        ...eventForm,
        startsAt: new Date(eventForm.startsAt).toISOString(),
        endsAt: eventForm.endsAt ? new Date(eventForm.endsAt).toISOString() : undefined
      };
      await createClanEvent(selectedClan._id, payload);
      setShowEventModal(false);
      setEventForm({ title: "", description: "", startsAt: "", endsAt: "" });
      fetchClanEventsList(selectedClan._id);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create clan event.");
    }
  };

  // Helper checks
  const isMember = selectedClan?.memberIds.includes(user?.id || "");
  const myMemberEntry = selectedClan?.members.find((m) => m.userId === user?.id);
  const myRole = myMemberEntry?.role;
  const isManager = myRole && ["owner", "admin", "moderator"].includes(myRole);

  const getMemberRoleLabel = (memberId: string): string => {
    const entry = selectedClan?.members.find((m) => m.userId === memberId);
    return entry?.role || "member";
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-950/40 border border-slate-900 rounded-3xl overflow-hidden backdrop-blur-md relative">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Clan Server Navigation Icon Panel (Discord Style Left Strip) */}
          <div className="w-16 bg-slate-950 border-r border-slate-900 py-4 flex flex-col items-center gap-3 shrink-0">
            {clans.map((clan) => {
              const active = selectedClan?._id === clan._id;
              return (
                <button
                  key={clan._id}
                  onClick={() => setSelectedClan(clan)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs uppercase transition-all relative ${
                    active
                      ? "bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/20"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-brand-500 hover:text-white hover:rounded-xl"
                  }`}
                  title={clan.name}
                >
                  {active && (
                    <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                  )}
                  {clan.tag.slice(0, 3)}
                </button>
              );
            })}

            <div className="w-8 h-px bg-slate-900 my-1" />

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 text-brand-400 hover:bg-brand-500 hover:text-white hover:rounded-xl flex items-center justify-center transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {selectedClan ? (
            <>
              {/* Channel List Panel */}
              <div className="w-56 bg-slate-955/60 border-r border-slate-900 flex flex-col justify-between shrink-0">
                <div>
                  {/* Server Title Header */}
                  <div className="px-4 py-4 border-b border-slate-900/60 flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider truncate">
                      {selectedClan.name}
                    </span>
                    <Shield className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  </div>

                  {/* Text Channels List */}
                  <div className="px-2 py-3 space-y-4">
                    <div className="space-y-1">
                      <span className="px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                        Text Channels
                      </span>
                      {channels.map((chan) => {
                        const active = selectedChannel === chan.id;
                        return (
                          <button
                            key={chan.id}
                            disabled={!isMember}
                            onClick={() => setSelectedChannel(chan.id)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                              active
                                ? "bg-slate-900 border border-slate-800 text-white"
                                : "text-slate-450 hover:bg-slate-900/30 hover:text-slate-200 disabled:opacity-40"
                            }`}
                          >
                            <chan.icon className="w-3.5 h-3.5 text-slate-500" />
                            <span>{chan.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Voice Channels List */}
                    <div className="space-y-1">
                      <span className="px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                        Voice Channels
                      </span>
                      {voiceChannels.map((vchan) => (
                        <button
                          key={vchan.id}
                          disabled={!isMember}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-450 hover:bg-slate-900/30 hover:text-slate-200 transition text-left disabled:opacity-40"
                        >
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{vchan.label}</span>
                          </div>
                          <span className="text-[8px] bg-slate-900 border border-slate-850 px-1 rounded text-slate-550">
                            0/5
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* User quick status footer */}
                <div className="p-3 border-t border-slate-900 bg-slate-950/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-[10px] shrink-0">
                        {user?.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-white block truncate">
                          {user?.username}
                        </span>
                        <span className="text-[8px] text-emerald-400 block font-semibold">
                          {isMember ? myRole : "visitor"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isMember ? (
                    <button
                      onClick={handleJoinClan}
                      className="w-full py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-[10px] font-bold text-white transition"
                    >
                      Join Clan
                    </button>
                  ) : (
                    <button
                      onClick={handleLeaveClan}
                      className="w-full py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-red-400 transition"
                    >
                      Leave Clan
                    </button>
                  )}
                </div>
              </div>

              {/* Main Area: Chat Room or Visitor State */}
              <div className="flex-1 flex flex-col bg-slate-955/20 min-w-0">
                {isMember ? (
                  <div className="flex-1 relative">
                    <ChatRoom roomId={`clan:${selectedClan._id}-${selectedChannel}`} />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
                    <Shield className="w-12 h-12 text-brand-500 mb-4 opacity-50" />
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Visitor View
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      You are not a member of {selectedClan.name}. Join the clan to view and post in channels.
                    </p>
                    <button
                      onClick={handleJoinClan}
                      className="mt-6 glow-button px-6 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-500 transition"
                    >
                      Join Clan Now
                    </button>
                  </div>
                )}
              </div>

              {/* Right Panel: Member Roster & Events Calendar */}
              <div className="w-56 bg-slate-955/40 border-l border-slate-900 p-4 flex flex-col gap-6 shrink-0 hidden lg:flex overflow-y-auto">
                {/* Roster */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      MEMBERS — {clanMembers.length}
                    </span>
                  </div>

                  {rosterLoading ? (
                    <div className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 animate-spin rounded-full mx-auto" />
                  ) : (
                    <div className="space-y-3">
                      {clanMembers.map((member) => {
                        const role = getMemberRoleLabel(member.userId);
                        const canManageThisUser =
                          isManager &&
                          role !== "owner" &&
                          member.userId !== user?.id;

                         return (
                          <div key={member.userId} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-300 text-[10px] shrink-0">
                                {member.gamerTag.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-white block truncate">
                                  {member.displayName || member.gamerTag}
                                </span>
                                <span className="text-[8px] text-slate-500 block truncate capitalize">
                                  {role}
                                </span>
                              </div>
                            </div>

                            {canManageThisUser ? (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <select
                                  value={role}
                                  onChange={(e) =>
                                    handleRoleUpdate(
                                      member.userId,
                                      e.target.value as "admin" | "moderator" | "member"
                                    )
                                  }
                                  className="bg-slate-900 border border-slate-800 text-[8px] rounded px-1 py-0.5 text-slate-400 focus:outline-none"
                                >
                                  <option value="member">Member</option>
                                  <option value="moderator">Mod</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  onClick={() => handleKickMember(member.userId)}
                                  className="text-slate-500 hover:text-red-500 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                className={`w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-900" />

                {/* Events Calendar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        CLAN EVENTS
                      </span>
                    </div>

                    {isManager && (
                      <button
                        onClick={() => setShowEventModal(true)}
                        className="text-brand-400 hover:text-white transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {eventsLoading ? (
                    <div className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 animate-spin rounded-full mx-auto" />
                  ) : (
                    <div className="space-y-3.5">
                      {clanEvents.length === 0 ? (
                        <span className="text-[9px] text-slate-550 block italic">
                          No upcoming events.
                        </span>
                      ) : (
                        clanEvents.map((evt) => (
                          <div key={evt._id} className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/40">
                            <span className="text-[10px] font-bold text-white block truncate">
                              {evt.title}
                            </span>
                            {evt.description && (
                              <span className="text-[8px] text-slate-450 block line-clamp-2 mt-0.5">
                                {evt.description}
                              </span>
                            )}
                            <span className="text-[7px] text-brand-400 block font-semibold mt-1">
                              {new Date(evt.startsAt).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Shield className="w-12 h-12 text-slate-800 mb-4" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Welcome to Clans Space
              </h3>
              <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Clans are communities where you can match up, organize scrims, and schedule tournaments. Create one to begin!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 glow-button px-6 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-500 transition"
              >
                Create a Clan
              </button>
            </div>
          )}
        </>
      )}

      {/* CREATE CLAN MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-purple-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Create Clan Guild
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-500 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClan} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                      Clan Name
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g. Sentinels Guild"
                      className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                      Tag
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={createForm.tag}
                      onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value.toUpperCase() })}
                      placeholder="e.g. SEN"
                      className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Describe your clan community rules/goals..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                      Region
                    </label>
                    <select
                      value={createForm.region}
                      onChange={(e) => setCreateForm({ ...createForm, region: e.target.value })}
                      className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                    >
                      <option value="NA" className="bg-slate-950">
                        North America (NA)
                      </option>
                      <option value="EU" className="bg-slate-950">
                        Europe (EU)
                      </option>
                      <option value="AS" className="bg-slate-950">
                        Asia (AS)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                      Games Focus
                    </label>
                    <select
                      multiple
                      value={createForm.gameIds}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
                        setCreateForm({ ...createForm, gameIds: values });
                      }}
                      className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                      style={{ height: "42px" }}
                    >
                      {GAMES_CATALOG.map((g) => (
                        <option key={g.gameId} value={g.gameId} className="bg-slate-950">
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.isPublic}
                      onChange={(e) => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                      className="rounded border-slate-800 bg-slate-900/40 text-brand-650 focus:ring-brand-500 focus:ring-offset-0 focus:ring-2 focus:ring-offset-slate-950"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      Public Clan
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.recruiting}
                      onChange={(e) => setCreateForm({ ...createForm, recruiting: e.target.checked })}
                      className="rounded border-slate-800 bg-slate-900/40 text-brand-650 focus:ring-brand-500 focus:ring-offset-0 focus:ring-2 focus:ring-offset-slate-950"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      Recruiting
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 glow-button rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-500 transition duration-200"
                >
                  Create Clan Guild
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE EVENT MODAL */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-purple-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Schedule Event
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-slate-500 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. Scrim vs Team Liquid"
                    className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Provide details..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.startsAt}
                    onChange={(e) => setEventForm({ ...eventForm, startsAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block mb-1">
                    Ends At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.endsAt}
                    onChange={(e) => setEventForm({ ...eventForm, endsAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-850 bg-slate-900/40 px-3 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 glow-button rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-500 transition duration-200"
                >
                  Schedule Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
