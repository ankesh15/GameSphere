import { useEffect, useRef, useState } from "react";
import { useNotificationsStore, Notification } from "../store/notifications";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../api/http";
import {
  Bell,
  Check,
  Clock,
  Cpu,
  Loader2,
  Megaphone,
  MessageSquare,
  Shield,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
  AlertCircle,
  Award
} from "lucide-react";

const typeIcons: Record<string, any> = {
  friend_request: UserPlus,
  team_invitation: Users,
  tournament_invitation: Trophy,
  tournament_update: Trophy,
  chat_message: MessageSquare,
  clan_invitation: Shield,
  match_reminder: Clock,
  achievement_unlock: Award,
  ai_recommendation: Cpu,
  system_announcement: Megaphone
};

const typeColors: Record<string, string> = {
  friend_request: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  team_invitation: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  tournament_invitation: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  tournament_update: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  chat_message: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  clan_invitation: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  match_reminder: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  achievement_unlock: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  ai_recommendation: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  system_announcement: "text-red-400 bg-red-500/10 border-red-500/20"
};

function formatRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export default function NotificationPanel() {
  const {
    notifications,
    isOpen,
    loading,
    loadingMore,
    error,
    page,
    totalPages,
    setIsOpen,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    triggerMockNotification
  } = useNotificationsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [ctaLoading, setCtaLoading] = useState<string | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".notification-bell-btn")
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  // Group notifications
  const groupNotifications = (items: Notification[]) => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    items.forEach((n) => {
      const time = new Date(n.createdAt).getTime();
      if (time >= startOfToday) {
        today.push(n);
      } else if (time >= startOfYesterday) {
        yesterday.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, older };
  };

  const grouped = groupNotifications(notifications);

  // CTA Accept / Decline Handlers
  const handleAcceptClanInvite = async (clanId: string, notificationId: string) => {
    setCtaLoading(notificationId);
    try {
      await apiClient.post(`/clans/${clanId}/join`);
      alert("Successfully joined the clan!");
      await markAsRead(notificationId);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join clan");
    } finally {
      setCtaLoading(null);
    }
  };

  const handleJoinTournament = async (tournamentId: string, notificationId: string) => {
    setCtaLoading(notificationId);
    try {
      await apiClient.post(`/tournaments/${tournamentId}/join`);
      alert("Successfully joined the tournament!");
      await markAsRead(notificationId);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join tournament");
    } finally {
      setCtaLoading(null);
    }
  };

  const handleAcceptFriendRequest = async (senderUsername: string, notificationId: string) => {
    setCtaLoading(notificationId);
    try {
      // Mock action since friend relationships do not have a DB table yet
      await new Promise((resolve) => setTimeout(resolve, 600));
      alert(`Friend request from ${senderUsername} accepted!`);
      await markAsRead(notificationId);
    } finally {
      setCtaLoading(null);
    }
  };

  const renderCTA = (n: Notification) => {
    if (n.isRead) return null;

    const isLoading = ctaLoading === n._id;

    if (n.type === "clan_invitation" && n.data?.clanId) {
      return (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleAcceptClanInvite(n.data!.clanId, n._id)}
            disabled={isLoading}
            className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>Accept</span>
          </button>
          <button
            onClick={() => markAsRead(n._id)}
            disabled={isLoading}
            className="px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-wider transition-colors duration-150 disabled:opacity-50"
          >
            <span>Ignore</span>
          </button>
        </div>
      );
    }

    if (n.type === "tournament_invitation" && n.data?.tournamentId) {
      return (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleJoinTournament(n.data!.tournamentId, n._id)}
            disabled={isLoading}
            className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>Register</span>
          </button>
          <button
            onClick={() => markAsRead(n._id)}
            disabled={isLoading}
            className="px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-wider transition-colors duration-150 disabled:opacity-50"
          >
            <span>Ignore</span>
          </button>
        </div>
      );
    }

    if (n.type === "friend_request" && n.senderId?.username) {
      return (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleAcceptFriendRequest(n.senderId!.username, n._id)}
            disabled={isLoading}
            className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors duration-150 flex items-center gap-1 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>Accept</span>
          </button>
          <button
            onClick={() => markAsRead(n._id)}
            disabled={isLoading}
            className="px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-wider transition-colors duration-150 disabled:opacity-50"
          >
            <span>Ignore</span>
          </button>
        </div>
      );
    }

    return null;
  };

  const renderGroupSection = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
          {title}
        </h4>
        <div className="space-y-1.5">
          {items.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            const colorClass = typeColors[n.type] || "text-slate-400 bg-slate-500/10";

            return (
              <motion.div
                key={n._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative p-3 rounded-xl border transition-all duration-200 ${
                  n.isRead
                    ? "bg-slate-950/40 border-slate-900/60 hover:bg-slate-900/20 hover:border-slate-900"
                    : "bg-slate-900/40 border-slate-850/60 hover:bg-slate-900/60 hover:border-slate-800 shadow-md shadow-brand-500/[0.02]"
                }`}
              >
                {/* Dot indicating unread */}
                {!n.isRead && (
                  <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                )}

                <div className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {n.senderId ? `@${n.senderId.username}` : "System"}
                    </span>
                    <h5 className="text-xs font-bold text-white leading-snug tracking-wide">
                      {n.title}
                    </h5>
                    <p className="text-[11px] text-slate-450 leading-relaxed mt-0.5">
                      {n.content}
                    </p>
                    {renderCTA(n)}
                    <span className="text-[9px] text-slate-650 font-mono mt-1 block">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Micro Actions Menu (Hover Only) */}
                <div className="absolute right-2 bottom-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/90 py-1 px-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors duration-150"
                      title="Mark as Read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors duration-150"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute right-0 mt-2.5 w-96 max-h-[580px] flex flex-col rounded-2xl border border-slate-850 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/80 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-900 bg-slate-900/20">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-wide text-white uppercase">
                Notifications
              </h3>
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-[9px] font-extrabold text-brand-400 font-mono">
                  {notifications.filter((n) => !n.isRead).length} NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors duration-150"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trigger Mock Menu (Development Only) */}
          <div className="px-4 py-2 border-b border-slate-900 bg-slate-950/20 flex flex-wrap gap-1.5 items-center justify-start max-h-24 overflow-y-auto">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mr-1 block w-full">
              Test Mock Triggers:
            </span>
            {[
              { type: "friend_request", label: "Friend" },
              { type: "clan_invitation", label: "Clan" },
              { type: "tournament_invitation", label: "Tourney" },
              { type: "achievement_unlock", label: "Achieve" },
              { type: "ai_recommendation", label: "AI" }
            ].map((mock) => (
              <button
                key={mock.type}
                onClick={() => triggerMockNotification(mock.type)}
                className="px-2 py-0.5 rounded border border-slate-800 hover:border-brand-500/40 bg-slate-900/60 hover:bg-slate-900 text-[9px] font-medium text-slate-400 hover:text-white transition-all duration-150"
              >
                +{mock.label}
              </button>
            ))}
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px]">
            {loading ? (
              /* Loading Skeletons */
              <div className="space-y-3">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 flex gap-3 animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 shrink-0"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-2 bg-slate-900 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-900 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-900 rounded w-1/2 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p className="text-xs text-slate-400">{error}</p>
                <button
                  onClick={() => fetchNotifications(1, true)}
                  className="px-4 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-200 transition-colors duration-150"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-850 flex items-center justify-center text-slate-500">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    All Clean
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mt-1">
                    No new alerts or pending invitations at the moment.
                  </p>
                </div>
              </div>
            ) : (
              /* Notification Sections */
              <div className="space-y-4">
                {renderGroupSection("Today", grouped.today)}
                {renderGroupSection("Yesterday", grouped.yesterday)}
                {renderGroupSection("Older", grouped.older)}

                {/* Pagination / Load More button */}
                {page < totalPages && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full py-2.5 rounded-xl border border-slate-900 bg-slate-950 hover:bg-slate-900/60 text-xs font-extrabold text-slate-400 hover:text-white transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <span>Load More Alerts</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
