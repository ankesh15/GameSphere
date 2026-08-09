import { motion } from "framer-motion";
import { Target, CheckCircle2, Lock, Flame } from "lucide-react";

type Mission = {
  id: number;
  title: string;
  description: string;
  progress: number;
  total: number;
  xp: number;
  completed: boolean;
  locked: boolean;
};

const missions: Mission[] = [
  { id: 1, title: "First Blood", description: "Win your first match today", progress: 1, total: 1, xp: 50, completed: true, locked: false },
  { id: 2, title: "Social Butterfly", description: "Add 2 new teammates", progress: 1, total: 2, xp: 75, completed: false, locked: false },
  { id: 3, title: "Streak Master", description: "Win 3 matches in a row", progress: 2, total: 3, xp: 150, completed: false, locked: false },
  { id: 4, title: "Night Owl", description: "Play after midnight", progress: 0, total: 1, xp: 100, completed: false, locked: true }
];

export default function MissionCard() {
  const completedCount = missions.filter(m => m.completed).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-2xl glass-level-2 overflow-hidden"
      aria-label="Daily missions"
    >
      <div className="px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2 font-display">
            <Flame className="h-4 w-4 text-live-400" />
            Daily Missions
          </h2>
          <span className="text-[10px] font-bold text-live-400 bg-live-orange/12 rounded-full px-2 py-0.5 font-mono">
            {completedCount}/{missions.length}
          </span>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.06 }}
            className={`rounded-xl px-3 py-3 transition-colors ${
              mission.locked
                ? "opacity-40 cursor-not-allowed"
                : mission.completed
                  ? "bg-emerald-500/5 border border-emerald-500/10"
                  : "hover:bg-slate-800/40 cursor-default"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {mission.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : mission.locked ? (
                  <Lock className="h-4 w-4 text-slate-600" />
                ) : (
                  <Target className="h-4 w-4 text-brand-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between font-body">
                  <p className={`text-xs font-bold ${mission.completed ? "text-emerald-300 line-through" : "text-white"}`}>
                    {mission.title}
                  </p>
                  <span className="text-[10px] font-bold text-live-400 font-mono">+{mission.xp} XP</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-body">{mission.description}</p>

                {!mission.completed && !mission.locked && (
                  <div className="mt-2">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-900">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-0.5 text-right font-mono">
                      {mission.progress}/{mission.total}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
