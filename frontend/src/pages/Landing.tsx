import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import {
  Shield,
  Cpu,
  Trophy,
  Users,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Play,
  ArrowRight,
  Zap,
  Globe
} from "lucide-react";
import { GAMES_CATALOG } from "../api/games";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    activePlayers: 42190,
    matchesFound: 198032,
    activeClans: 2843
  });

  // Track mouse coordinates for the custom spotlight backdrop
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Animate mock live statistics slightly to feel "alive"
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        activePlayers: prev.activePlayers + Math.floor(Math.random() * 5) - 2,
        matchesFound: prev.matchesFound + Math.floor(Math.random() * 3),
        activeClans: prev.activeClans
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative font-sans selection:bg-brand-500/30 selection:text-white"
    >
      {/* Spotlight layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 hidden md:block"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.12), transparent 80%)`
        }}
      />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px] -z-10" />

      {/* Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900/60 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <span className="text-white font-extrabold text-base tracking-tighter">GS</span>
              </div>
              <span className="text-xl font-black text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                GameSphere
              </span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
              <a href="#features" className="hover:text-white transition duration-200">Features</a>
              <a href="#catalog" className="hover:text-white transition duration-200">Games</a>
              <a href="#stats" className="hover:text-white transition duration-200">Live Status</a>
              <a href="#ai" className="hover:text-white transition duration-200">AI Recs</a>
              <a href="#testimonials" className="hover:text-white transition duration-200">Community</a>
            </nav>

            {/* Auth CTA */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition">
                Sign In
              </Link>
              <Link
                to="/register"
                className="glow-button rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-500 transition duration-200"
              >
                Join Squad
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3.5 py-1 text-[11px] font-bold text-brand-300 tracking-wider uppercase"
            >
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>Next-Gen Matchmaking Engine Live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Find Your Perfect{" "}
              <span className="text-gradient">Squad.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed"
            >
              GameSphere connects gamers through collaborative AI recommender models, Esports-grade lobbies, direct Discord integration, and visual tournament staging.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/register"
                className="glow-button flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-purple-500"
              >
                <span>Initialize Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-900/80 hover:border-slate-600 transition"
              >
                Explore Features
              </a>
            </motion.div>
          </div>

          {/* Hero Right: 3D-Like Glassmorphic Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-6 relative"
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />

            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Gamer_Dashboard_v1.0</div>
              </div>

              {/* Mock UI Content */}
              <div className="grid grid-cols-3 gap-4">
                {/* Profile Box */}
                <div className="col-span-1 bg-slate-950/80 rounded-xl p-3 border border-slate-850 space-y-2">
                  <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-400 flex items-center justify-center font-bold text-[11px] text-white">
                    UX
                  </div>
                  <h4 className="text-[11px] font-bold text-white truncate">Phoenix_Apex</h4>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full w-[70%]" />
                  </div>
                  <div className="text-[8px] text-slate-500">LEVEL 24 · 72% XP</div>
                </div>

                {/* Matchmaking Queue Indicator */}
                <div className="col-span-2 bg-slate-950/80 rounded-xl p-3 border border-slate-850 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      IN QUEUE
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">01:42</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center text-[9px] font-bold text-white">
                      V
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-white">Valorant Matchmaking</h5>
                      <p className="text-[8px] text-slate-500">Region: Europe West</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900/60 rounded-full h-1 relative overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-brand-500 to-transparent"
                    />
                  </div>
                </div>

                {/* AI Recommendations Box */}
                <div className="col-span-3 bg-slate-950/80 rounded-xl p-3 border border-slate-855 space-y-2">
                  <span className="text-[9px] font-bold text-brand-400 tracking-wider uppercase block">AI Matches</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] bg-slate-900/40 p-1.5 rounded border border-slate-800/40">
                      <span className="text-white font-semibold">Starlight_Gamer</span>
                      <span className="text-emerald-400 font-bold text-[9px]">98% Match</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] bg-slate-900/40 p-1.5 rounded border border-slate-800/40">
                      <span className="text-white font-semibold">TonicWater</span>
                      <span className="text-indigo-400 font-bold text-[9px]">92% Match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing decorative badges */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-brand-500/15 rounded-full blur-xl animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Live statistics / Trusted by section */}
      <section id="stats" className="border-t border-b border-slate-900 bg-slate-900/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-3 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {stats.activePlayers.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Active Gamers Online</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-gradient tracking-tight">
                {stats.matchesFound.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Match Sessions Formed</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {stats.activeClans.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Persistent Clans Established</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Supported Game Catalogs</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Direct telemetry overlays and active lobby queues are enabled for the industry's top competitive esports.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES_CATALOG.slice(0, 4).map((game) => (
            <div
              key={game.gameId}
              className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between group overflow-hidden relative"
            >
              {game.imageUrl && (
                <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mb-4 relative">
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">{game.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {game.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 capitalize"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Core Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Engineered for Competitive Staging</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Built from scratch to deliver features equivalent to top tier gaming systems.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Cpu,
              title: "AI Teammate Recommender",
              description: "Uses a state-of-the-art Collaborative Filtering algorithm in Python to assess region, hours played, game tags, and playstyle similarity score."
            },
            {
              icon: Shield,
              title: "Discord-Style Social Spaces",
              description: "Establish dedicated channels, persistent text chat rooms, role assignments, event planning, and voice placeholders inside custom Clans."
            },
            {
              icon: Trophy,
              title: "Esports Tournament Bracket Staging",
              description: "Build tournaments, schedule match dates, register competing teams, and render interactive visual bracket trees dynamically."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-4 hover:-translate-y-1 transition duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl" />
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 shadow-md">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI recommendation preview */}
      <section id="ai" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-panel rounded-3xl border border-slate-850 p-8 sm:p-12 bg-slate-900/25 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
          <div className="flex-1 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
              Teammate Matchmaking
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">AI-Powered Skill Analysis</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Our AI service reads your game history telemetry, playstyle variables, and region configs to suggest compatible companions. Filter recommendations by playstyle, platforms, and region proximity.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Collaborative cosine-similarity computations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Flexible free-text bio similarity mapping</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm shrink-0 bg-slate-950/80 border border-slate-850 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Compatibility</h3>
            <div className="space-y-3">
              {[
                { name: "Slayer_Duo", match: "97%", style: "Casual", icon: "S" },
                { name: "Viper_One", match: "94%", style: "Competitive", icon: "V" }
              ].map((mate, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-900 bg-slate-900/35">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-white">
                      {mate.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{mate.name}</h4>
                      <p className="text-[9px] text-slate-500 capitalize">{mate.style} Playstyle</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-400">{mate.match} Match</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Trusted by Players</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Gamers from competitive leagues rely on GameSphere to build rosters and manage organizations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              quote: "Finding high-quality matches used to be a gamble. GameSphere's AI recommendation matches me with consistent teammate choices every single session.",
              author: "Marcus 'Nova' Reed",
              role: "Valorant League Leader"
            },
            {
              quote: "The Clan dashboard is incredible. Running bracket updates and chatting with teammates is seamless. It completely replaced our clumsy social server setups.",
              author: "Elena Rostova",
              role: "Apex Legends Organizer"
            },
            {
              quote: "The visual brackets make tournament staging look highly professional. Players love tracking their scores and standings in real-time.",
              author: "Dave 'Kestrel' Jones",
              role: "Tournament Director"
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <p className="text-xs text-slate-300 italic leading-relaxed">"{item.quote}"</p>
              <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">{item.author}</h4>
                  <p className="text-[10px] text-slate-500">{item.role}</p>
                </div>
                <div className="text-yellow-500 text-xs">★★★★★</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center font-bold text-[10px] text-white">GS</div>
            <span className="font-extrabold text-white uppercase tracking-wider text-xs">GameSphere</span>
          </div>
          <div className="flex flex-wrap gap-8 text-xs font-semibold">
            <a href="#features" className="hover:text-slate-300 transition">Features</a>
            <a href="#catalog" className="hover:text-slate-300 transition">Games</a>
            <a href="#stats" className="hover:text-slate-300 transition">Live Stats</a>
            <a href="#ai" className="hover:text-slate-300 transition">AI Engine</a>
          </div>
          <div className="text-[11px] font-medium">
            © {new Date().getFullYear()} GameSphere Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
