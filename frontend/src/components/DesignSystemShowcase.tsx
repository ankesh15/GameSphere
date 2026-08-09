import React, { useState, useEffect } from "react";
import { Shield, Zap, Radio, Clock, Trophy, Flame, Play, CheckCircle2 } from "lucide-react";
import { tokens } from "../styles/tokens";

export default function DesignSystemShowcase() {
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto bg-obsidian-950 min-h-screen text-slate-100 font-body">
      {/* HEADER SECTION */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-brand-400" />
          <h1 className="text-3xl font-black font-display tracking-tight text-white">
            GameSphere <span className="text-gradient">Design Tokens & System</span>
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Unified design foundation establishing cohesive color roles, glass surface hierarchy, high-legibility typography, and signature live system visual language.
        </p>
      </div>

      {/* SECTION 1: COLOR ROLE PALETTE */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-400" /> 1. Color System & Accents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Base Surface */}
          <div className="glass-level-2 p-5 rounded-2xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              Surface Canvas (Near-Black)
            </span>
            <div className="h-16 rounded-xl bg-obsidian-950 border border-white/10 flex items-center justify-center font-mono text-xs text-slate-400">
              #060913 (Obsidian Void)
            </div>
            <p className="text-xs text-slate-400">Deep, non-pure-black background maintaining depth without harsh absolute zero contrast.</p>
          </div>

          {/* Primary Accent */}
          <div className="glass-level-2 p-5 rounded-2xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-300 block">
              Primary Accent (Electric Violet)
            </span>
            <div className="h-16 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center font-mono text-xs text-white font-bold">
              #8B5CF6 / #7C3AED
            </div>
            <p className="text-xs text-slate-400">Committed brand primary for standard navigation, primary actions, and brand identity.</p>
          </div>

          {/* Secondary Live Accent */}
          <div className="glass-level-2 p-5 rounded-2xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-live-400 block">
              Live/Urgent Accent (Cyber Amber)
            </span>
            <div className="h-16 rounded-xl bg-gradient-to-r from-amber-500 to-live-orange shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center font-mono text-xs text-white font-bold">
              #FF6B00 / #F59E0B
            </div>
            <p className="text-xs text-slate-400">Strictly reserved for in-progress matches, active queue radars, urgent notifications, and timers.</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: GLASS HIERARCHY */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-400" /> 2. Glassmorphic Surface Hierarchy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-level-1 p-5 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level 1: Sub-Panel</span>
            <p className="text-xs text-slate-300">Subtle backdrop blur (12px), 45% dark background. Used for nested containers and list items.</p>
          </div>

          <div className="glass-level-2 p-5 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Level 2: Main Card</span>
            <p className="text-xs text-slate-300">Deep backdrop blur (20px), 60% opacity with ambient drop shadow. Standard card elevation.</p>
          </div>

          <div className="glass-level-3 p-5 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Level 3: Modal Overlay</span>
            <p className="text-xs text-slate-300">Maximum blur (24px), 85% opacity with intense glow border. Used for dialogs and popovers.</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: SIGNATURE LIVE SYSTEM MOTIFS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Flame className="w-4 h-4 text-live-400" /> 3. Signature "Live System" Motifs (Unified Visual Language)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Matchmaking Radar Motif */}
          <div className="live-glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            <div className="relative w-16 h-16 rounded-full border border-live-orange/40 flex items-center justify-center bg-live-orange/5 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
              <div className="absolute inset-0 rounded-full border border-live-orange/60 animate-ping opacity-25"></div>
              <Radio className="w-7 h-7 text-live-orange animate-pulse-slow" />
            </div>
            <div>
              <span className="live-badge">
                <span className="live-indicator-dot"></span> Queue Active
              </span>
              <h4 className="text-sm font-bold font-display text-white mt-2">Ranked 5v5 Radar</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Searching for balanced lobby...</p>
            </div>
          </div>

          {/* Live Countdown Timer Motif */}
          <div className="live-glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex items-center gap-2 text-live-400">
              <Clock className="w-5 h-5 animate-pulse-live" />
              <span className="text-2xl font-black font-display font-mono text-white tracking-widest">
                00:{countdown < 10 ? `0${countdown}` : countdown}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-live-orange">
                Match Offer Accept Expiry
              </span>
              <h4 className="text-sm font-bold font-display text-white mt-1">Lobby Found #842</h4>
            </div>
            <button className="glow-button-live w-full py-2.5 rounded-xl text-xs uppercase tracking-wider">
              Accept Match
            </button>
          </div>

          {/* Live Bracket Match Motif */}
          <div className="glass-level-2 p-5 rounded-2xl space-y-3 border-l-4 border-l-live-orange">
            <div className="flex items-center justify-between">
              <span className="live-badge">
                <span className="live-indicator-dot"></span> Live Bracket Match
              </span>
              <span className="text-[10px] text-slate-400 font-mono">BO3 • Game 2</span>
            </div>

            <div className="space-y-2 py-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-white/5">
                <span className="text-xs font-bold text-white">Sentinels</span>
                <span className="text-xs font-mono font-black text-live-orange">1</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-white/5">
                <span className="text-xs font-bold text-slate-400">Fnatic</span>
                <span className="text-xs font-mono font-black text-slate-500">0</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-white/5">
              <span>Prize Match</span>
              <span className="text-brand-300 font-semibold">$5,000 Bracket</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: STANDARD VS LIVE BUTTON REFERENCE */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-brand-400" /> 4. Action Buttons & Component Tokens
        </h2>

        <div className="glass-level-2 p-6 rounded-2xl flex flex-wrap items-center gap-4">
          <button className="glow-button px-5 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-500 transition">
            Primary Violet Action
          </button>

          <button className="glow-button-live px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">
            Live Emergency / Offer Action
          </button>

          <button className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition">
            Secondary Surface Button
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[10px] font-bold uppercase tracking-widest">
            Primary Tag
          </div>

          <div className="live-badge">
            Live Action Tag
          </div>
        </div>
      </div>
    </div>
  );
}
