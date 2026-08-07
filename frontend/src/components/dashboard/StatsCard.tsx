import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type StatsCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent: string; // tailwind gradient classes
  delay?: number;
  sparklineData?: number[];
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  trend = "neutral",
  trendValue = "",
  accent,
  delay = 0,
  sparklineData = []
}: StatsCardProps) {
  const trendConfig = {
    up: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    down: { icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-500/10" },
    neutral: { icon: Minus, color: "text-slate-400", bg: "bg-slate-500/10" }
  };

  const t = trendConfig[trend];
  const TrendIcon = t.icon;

  // Build mini sparkline SVG
  const sparklineWidth = 80;
  const sparklineHeight = 28;
  const maxVal = Math.max(...sparklineData, 1);
  const minVal = Math.min(...sparklineData, 0);
  const range = maxVal - minVal || 1;
  const points = sparklineData
    .map((val, i) => {
      const x = (i / Math.max(sparklineData.length - 1, 1)) * sparklineWidth;
      const y = sparklineHeight - ((val - minVal) / range) * sparklineHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-5 transition-all duration-300 hover:border-slate-700/60 hover:shadow-xl hover:shadow-brand-950/10 cursor-default"
      role="figure"
      aria-label={`${label}: ${value}`}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl ${accent} opacity-10`} />
      </div>

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {value}
          </p>

          {/* Trend badge */}
          {trendValue && (
            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${t.bg} ${t.color}`}>
              <TrendIcon className="h-3 w-3" />
              {trendValue}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Icon */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Mini sparkline */}
          {sparklineData.length > 2 && (
            <svg
              width={sparklineWidth}
              height={sparklineHeight}
              className="opacity-40 group-hover:opacity-70 transition-opacity"
            >
              <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-slate-500"}
              />
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  );
}
