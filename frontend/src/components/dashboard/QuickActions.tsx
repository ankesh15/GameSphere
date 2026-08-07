import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Swords,
  Cpu,
  Trophy,
  Zap,
  ArrowRight
} from "lucide-react";

type QuickAction = {
  label: string;
  description: string;
  icon: typeof Users;
  href: string;
  gradient: string;
  glowColor: string;
};

const actions: QuickAction[] = [
  {
    label: "Find Match",
    description: "AI-powered teammate pairing",
    icon: Swords,
    href: "/app/find-teammates",
    gradient: "from-brand-600 to-indigo-600",
    glowColor: "group-hover:shadow-brand-500/20"
  },
  {
    label: "AI Discovery",
    description: "Explore game recommendations",
    icon: Cpu,
    href: "/app/ai-discovery",
    gradient: "from-cyan-600 to-blue-600",
    glowColor: "group-hover:shadow-cyan-500/20"
  },
  {
    label: "Tournaments",
    description: "Join competitive events",
    icon: Trophy,
    href: "/app/tournaments",
    gradient: "from-amber-600 to-orange-600",
    glowColor: "group-hover:shadow-amber-500/20"
  },
  {
    label: "Create Team",
    description: "Build your dream squad",
    icon: Users,
    href: "/app/clans",
    gradient: "from-emerald-600 to-teal-600",
    glowColor: "group-hover:shadow-emerald-500/20"
  }
];

export default function QuickActions() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      aria-label="Quick actions"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <Zap className="h-4 w-4 text-amber-400" />
        <h2 className="text-sm font-bold text-white tracking-wider uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.06 }}
            >
              <Link
                to={action.href}
                className={`group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-4 text-center transition-all duration-300 hover:border-slate-700/50 hover:bg-slate-800/40 hover:shadow-xl ${action.glowColor} hover:-translate-y-1`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{action.label}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500 leading-tight">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
