import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = ""
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-panel rounded-3xl p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-4 border border-slate-850/80 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden ${className}`}
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Icon slot */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shadow-xl relative group">
        <div className="absolute inset-0 rounded-2xl bg-brand-500/10 opacity-0 group-hover:opacity-100 transition duration-300" />
        {icon ? icon : <Sparkles className="w-8 h-8 text-brand-400 animate-pulse-slow" />}
      </div>

      {/* Text Content */}
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-extrabold text-white tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="glow-button mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500 transition duration-200 shadow-lg shadow-brand-600/20"
        >
          {actionIcon}
          <span>{actionLabel}</span>
        </button>
      )}
    </motion.div>
  );
}
