/**
 * GameSphere Design System Tokens
 * Centralized design tokens establishing a cohesive, dark glassmorphic gaming aesthetic.
 */

export const tokens = {
  colors: {
    // Backgrounds & Surface Hierarchy (Obsidian Space Void)
    surface: {
      base: "#060913",       // Main app canvas
      panel: "#0b101d",      // Inner container/panel
      card: "#0f172a",       // Card background
      cardHover: "#141f36",  // Interactive hover state
      border: "rgba(255, 255, 255, 0.07)",
      borderHover: "rgba(139, 92, 246, 0.35)",
    },
    // Primary Accent: Electric Violet (Committed Brand Accent)
    primary: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",        // Bright text/icon highlight
      500: "#8b5cf6",        // Base Accent
      600: "#7c3aed",        // Solid fill button / active tab
      700: "#6d28d9",        // Dark pressed state
      glow: "rgba(139, 92, 246, 0.35)",
      glowSubtle: "rgba(139, 92, 246, 0.12)",
    },
    // Secondary "Live/Action" Accent: Cyber Amber & Orange (WCAG AA Compliant for Dark Glass Surfaces)
    live: {
      amber: "#f59e0b",      // High-contrast amber text (9.1:1 ratio vs #060913)
      orange: "#ff6b00",     // Live border/fill/icon accent (5.4:1 ratio vs #060913)
      text: "#ffaa5e",       // Boosted luminance for small body text & tags (8.6:1 ratio vs #060913)
      glow: "rgba(255, 107, 0, 0.4)",
      glowSubtle: "rgba(255, 107, 0, 0.15)",
      badgeBg: "rgba(255, 107, 0, 0.12)",
      border: "rgba(255, 107, 0, 0.4)",
    },
    // Text Hierarchy
    text: {
      primary: "#f8fafc",    // Slate-50 high contrast
      secondary: "#94a3b8",  // Slate-400 readable body
      muted: "#64748b",      // Slate-500 captions/metadata
      accent: "#a78bfa",     // Violet highlight text
      live: "#ffaa5e",       // Live warning/timer text (WCAG AA compliant)
    }
  },
  typography: {
    fontDisplay: "'Outfit', sans-serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    scale: {
      h1: "text-2xl font-black tracking-tight font-display text-white",
      h2: "text-xl font-extrabold tracking-tight font-display text-white",
      h3: "text-base font-bold tracking-wide font-display text-white",
      bodyMd: "text-sm font-medium leading-relaxed font-body text-slate-200",
      bodySm: "text-xs font-normal leading-normal font-body text-slate-400",
      caption: "text-[10px] font-semibold uppercase tracking-wider font-body text-slate-500",
      badge: "text-[9px] font-bold uppercase tracking-widest font-body",
    }
  },
  glass: {
    level1: "bg-slate-900/40 border border-white/5 backdrop-blur-md",
    level2: "bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl",
    level3: "bg-slate-950/85 border border-white/15 backdrop-blur-2xl shadow-2xl",
    livePanel: "bg-amber-950/20 border border-amber-500/35 backdrop-blur-xl shadow-[0_0_20px_rgba(255,107,0,0.15)]"
  },
  radii: {
    sm: "rounded-lg",    // 8px
    md: "rounded-xl",    // 12px
    lg: "rounded-2xl",   // 16px
    xl: "rounded-3xl",   // 24px
    full: "rounded-full"
  },
  motion: {
    fast: { duration: 0.15, ease: "easeOut" },
    normal: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    springy: { type: "spring", stiffness: 350, damping: 25 },
    livePulse: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};
