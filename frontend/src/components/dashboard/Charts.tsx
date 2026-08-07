import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

const winRateData = [
  { week: "W1", wins: 8, losses: 4 },
  { week: "W2", wins: 6, losses: 5 },
  { week: "W3", wins: 10, losses: 3 },
  { week: "W4", wins: 7, losses: 6 },
  { week: "W5", wins: 12, losses: 2 },
  { week: "W6", wins: 9, losses: 4 },
  { week: "W7", wins: 11, losses: 3 }
];

const matchesPerWeek = [
  { day: "Mon", matches: 3 },
  { day: "Tue", matches: 5 },
  { day: "Wed", matches: 2 },
  { day: "Thu", matches: 7 },
  { day: "Fri", matches: 8 },
  { day: "Sat", matches: 12 },
  { day: "Sun", matches: 6 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-900/95 backdrop-blur-md px-3 py-2 shadow-xl">
      <p className="text-[10px] font-bold text-slate-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Charts() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="grid gap-5 sm:grid-cols-2"
      aria-label="Performance charts"
    >
      {/* Win Rate Area Chart */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Win Rate
          </h3>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
            +12% this week
          </span>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={winRateData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="winsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="wins"
                name="Wins"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#winsGrad)"
              />
              <Area
                type="monotone"
                dataKey="losses"
                name="Losses"
                stroke="#f43f5e"
                strokeWidth={1.5}
                fill="transparent"
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Matches Per Day Bar Chart */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Matches This Week
          </h3>
          <span className="text-[10px] font-semibold text-brand-400 bg-brand-500/10 rounded-full px-2 py-0.5">
            43 total
          </span>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={matchesPerWeek} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="matches" name="Matches" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  );
}
