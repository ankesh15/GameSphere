import { motion } from "framer-motion";
import {
  CheckCircle2,
  Swords,
  UserPlus,
  Trophy,
  Shield,
  MessageCircle,
  Star
} from "lucide-react";

type ActivityItem = {
  id: number;
  text: string;
  time: string;
  type: "match" | "social" | "achievement" | "clan" | "message" | "system";
};

const activityData: ActivityItem[] = [
  { id: 1, text: "Won a Valorant Competitive match 13-8", time: "12m ago", type: "match" },
  { id: 2, text: "Viper_One sent you a friend request", time: "34m ago", type: "social" },
  { id: 3, text: "Unlocked 'Clutch King' achievement", time: "1h ago", type: "achievement" },
  { id: 4, text: "Clan Phoenix won their weekly scrimmage", time: "2h ago", type: "clan" },
  { id: 5, text: "New message from Slayer_Duo", time: "3h ago", type: "message" },
  { id: 6, text: "Matched with 3 teammates for CS2 queue", time: "4h ago", type: "match" },
  { id: 7, text: "Season 4 rewards are now available", time: "6h ago", type: "system" }
];

const iconMap: Record<ActivityItem["type"], { icon: typeof CheckCircle2; color: string; bg: string }> = {
  match: { icon: Swords, color: "text-brand-300", bg: "bg-brand-500/10" },
  social: { icon: UserPlus, color: "text-sky-400", bg: "bg-sky-500/10" },
  achievement: { icon: Trophy, color: "text-live-400", bg: "bg-amber-500/10" },
  clan: { icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  message: { icon: MessageCircle, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  system: { icon: Star, color: "text-slate-400", bg: "bg-slate-500/10" }
};

export default function ActivityFeed() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl glass-level-2 overflow-hidden"
      aria-label="Recent activity"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/5">
        <h2 className="text-sm font-bold text-white tracking-wider uppercase font-display">
          Recent Activity
        </h2>
        <button className="text-[11px] font-semibold text-brand-300 hover:text-brand-200 transition-colors font-body">
          View all
        </button>
      </div>

      <div className="p-4 space-y-0.5">
        {activityData.map((item, index) => {
          const config = iconMap[item.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              className="group flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-800/40 cursor-default"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-300 truncate group-hover:text-white transition-colors font-body">
                  {item.text}
                </p>
              </div>

              <span className="shrink-0 text-[10px] font-medium text-slate-500 font-mono">
                {item.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
