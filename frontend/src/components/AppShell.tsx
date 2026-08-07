import { useEffect, useState, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useSocketStore } from "../store/socket";
import { logout as logoutApi } from "../api/auth";
import MatchOfferOverlay from "./MatchOfferOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationsStore } from "../store/notifications";
import NotificationPanel from "./NotificationPanel";
import {
  LayoutDashboard,
  User,
  Users,
  Cpu,
  Trophy,
  Shield,
  Code,
  LogOut,
  Bell,
  Menu,
  X
} from "lucide-react";

export default function AppShell() {
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const connectSocket = useSocketStore((state) => state.connectSocket);
  const disconnectSocket = useSocketStore((state) => state.disconnectSocket);
  const incrementElapsedTime = useSocketStore((state) => state.incrementElapsedTime);
  const isQueued = useSocketStore((state) => state.isQueued);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Server logout failed — still clear local tokens
    }
    disconnectSocket();
    clearTokens();
    navigate("/login", { replace: true });
  }, [clearTokens, disconnectSocket, navigate]);

  const {
    unreadCount,
    isOpen,
    setIsOpen,
    fetchNotifications,
    fetchUnreadCount,
    addNotification,
    setUnreadCount
  } = useNotificationsStore();

  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications(1);
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: any) => {
      addNotification(notification);
    };

    const handleUnreadCount = (payload: { count: number }) => {
      setUnreadCount(payload.count);
    };

    socket.on("notification.new", handleNewNotification);
    socket.on("notification.unread_count", handleUnreadCount);

    return () => {
      socket.off("notification.new", handleNewNotification);
      socket.off("notification.unread_count", handleUnreadCount);
    };
  }, [socket, addNotification, setUnreadCount]);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  useEffect(() => {
    if (!isQueued) return;
    const interval = setInterval(() => {
      incrementElapsedTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [isQueued, incrementElapsedTime]);

  const navItems = [
    { path: "/app", label: "Dashboard", icon: LayoutDashboard },
    { path: "/app/profile", label: "Gamer Profile", icon: User },
    { path: "/app/find-teammates", label: "Find Teammates", icon: Users },
    { path: "/app/ai-discovery", label: "AI Discovery", icon: Cpu },
    { path: "/app/tournaments", label: "Tournaments", icon: Trophy },
    { path: "/app/clans", label: "Clans", icon: Shield },
    { path: "/app/developer-hub", label: "Developer Hub", icon: Code }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-white">
      <MatchOfferOverlay />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/65 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo area */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/app")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-white font-extrabold text-sm tracking-tighter">GS</span>
              </div>
              <span className="text-lg font-black text-white tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                GameSphere
              </span>
              <span className="hidden sm:inline-block rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-400">
                PRO
              </span>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.path === "/app"
                    ? location.pathname === "/app"
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBg"
                        className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Header Options */}
            <div className="hidden lg:flex items-center gap-4 relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="notification-bell-btn text-slate-400 hover:text-white transition relative p-1.5 rounded-lg hover:bg-slate-900"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-slate-950"></span>
                )}
              </button>
              <NotificationPanel />

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition duration-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex lg:hidden items-center gap-2 relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="notification-bell-btn text-slate-400 hover:text-white transition relative p-2 rounded-lg bg-slate-900 border border-slate-800"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 border border-slate-900"></span>
                )}
              </button>
              <NotificationPanel />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-slate-950 border-t border-slate-900 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => {
                  const isActive =
                    item.path === "/app"
                      ? location.pathname === "/app"
                      : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? "bg-slate-900 border border-slate-800 text-white"
                          : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                      }`}
                    >
                      <item.icon className="w-4 h-4 text-brand-400" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
                <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm font-semibold text-slate-300 hover:text-white transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main page container */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
