import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, XCircle } from "lucide-react";

export interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  variant?: "card" | "banner";
}

export default function ErrorAlert({
  title = "Connection Error",
  message,
  onRetry,
  retryLabel = "Retry Action",
  className = "",
  variant = "card"
}: ErrorAlertProps) {
  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-medium text-rose-300 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-bold transition shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`glass-panel rounded-3xl p-6 md:p-8 text-center flex flex-col items-center justify-center space-y-4 border border-rose-500/20 bg-rose-950/10 backdrop-blur-xl relative overflow-hidden ${className}`}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Alert Icon */}
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg">
        <AlertTriangle className="w-7 h-7" />
      </div>

      {/* Message content */}
      <div className="space-y-1 max-w-md">
        {title && <h3 className="text-sm font-extrabold text-white tracking-tight">{title}</h3>}
        <p className="text-xs text-rose-300/90 leading-relaxed">{message}</p>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="glow-button inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold text-rose-200 transition duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </motion.div>
  );
}
