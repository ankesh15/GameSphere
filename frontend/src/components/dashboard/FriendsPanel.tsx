import { motion } from "framer-motion";
import { Wifi, Clock, Gamepad2 } from "lucide-react";

type Friend = {
  id: number;
  name: string;
  status: "online" | "in-game" | "idle" | "offline";
  game?: string;
  lastSeen?: string;
};

const friends: Friend[] = [
  { id: 1, name: "Viper_One", status: "in-game", game: "Valorant" },
  { id: 2, name: "ArcticFox", status: "online" },
  { id: 3, name: "Slayer_Duo", status: "in-game", game: "CS2" },
  { id: 4, name: "NovaBlitz", status: "online" },
  { id: 5, name: "ZeroGravity", status: "idle", lastSeen: "15m" },
  { id: 6, name: "Phantom_X", status: "offline", lastSeen: "2h" },
  { id: 7, name: "CyberNinja", status: "offline", lastSeen: "1d" }
];

const statusConfig = {
  online: { dot: "bg-emerald-500", label: "Online", textColor: "text-emerald-400" },
  "in-game": { dot: "bg-brand-500", label: "In Game", textColor: "text-brand-300" },
  idle: { dot: "bg-amber-500", label: "Idle", textColor: "text-live-400" },
  offline: { dot: "bg-slate-600", label: "Offline", textColor: "text-slate-500" }
};

export default function FriendsPanel() {
  const onlineCount = friends.filter(f => f.status !== "offline").length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="rounded-2xl glass-level-2 overflow-hidden"
      aria-label="Online friends"
    >
      <div className="px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2 font-display">
            <Wifi className="h-4 w-4 text-emerald-400" />
            Friends
          </h2>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5 font-mono">
            {onlineCount} online
          </span>
        </div>
      </div>

      <div className="p-3 space-y-0.5">
        {friends.map((friend, index) => {
          const s = statusConfig[friend.status];
          const initials = friend.name.slice(0, 2).toUpperCase();

          return (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.04 }}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-slate-800/40 cursor-pointer"
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-400 font-display">
                  {initials}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-obsidian-950 ${s.dot}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors font-body">
                  {friend.name}
                </p>
                <p className={`text-[10px] font-medium ${s.textColor} flex items-center gap-1 font-body`}>
                  {friend.status === "in-game" ? (
                    <>
                      <Gamepad2 className="h-2.5 w-2.5" />
                      Playing {friend.game}
                    </>
                  ) : friend.status === "idle" || friend.status === "offline" ? (
                    <>
                      <Clock className="h-2.5 w-2.5" />
                      {friend.lastSeen ?? ""}
                    </>
                  ) : (
                    s.label
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
