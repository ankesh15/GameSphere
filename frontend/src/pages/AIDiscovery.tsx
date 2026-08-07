import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile, getAllProfiles, GamerProfile } from "../api/profiles";
import { getRecommendations, RecommendationItem } from "../api/ai";
import { GAMES_CATALOG } from "../api/games";
import {
  Cpu,
  UserPlus,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Gamepad,
  Bookmark,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIDiscoveryPage() {
  const [profile, setProfile] = useState<GamerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recommendations state
  const [recGames, setRecGames] = useState<RecommendationItem[]>([]);
  const [recTeammates, setRecTeammates] = useState<RecommendationItem[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [teammateProfiles, setTeammateProfiles] = useState<Record<string, GamerProfile>>({});

  // Interaction State
  const [sentInvites, setSentInvites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    setError(null);
    try {
      let myProfile: GamerProfile;
      try {
        myProfile = await getMyProfile();
        setProfile(myProfile);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setProfile(null);
          setLoading(false);
          setRefreshing(false);
          return;
        }
        throw err;
      }

      const otherProfiles = await getAllProfiles();
      const filteredProfiles = otherProfiles.filter((p) => p.userId !== myProfile.userId);

      const userHistory = (myProfile.favoriteGames || []).map((gameId) => ({
        gameId,
        hoursPlayed: 25,
        liked: true,
        tags: GAMES_CATALOG.find((g) => g.gameId === gameId)?.tags || []
      }));

      const preferences = {
        genres: myProfile.preferences?.genres || [],
        modes: myProfile.preferences?.modes || [],
        platforms: myProfile.platforms || [],
        playstyle: myProfile.playstyle
          ? [myProfile.playstyle.competitiveStyle, myProfile.playstyle.communicationStyle].filter(Boolean) as string[]
          : [],
        freeText: myProfile.bio || "",
        region: myProfile.region || "global"
      };

      const catalogPayload = GAMES_CATALOG.map((g) => ({
        gameId: g.gameId,
        title: g.title,
        tags: g.tags,
        genres: g.genres,
        modes: g.modes
      }));

      const communityPayload = filteredProfiles.map((p) => ({
        userId: p.userId,
        history: (p.favoriteGames || []).map((gameId) => ({
          gameId,
          hoursPlayed: 15,
          liked: true,
          tags: GAMES_CATALOG.find((g) => g.gameId === gameId)?.tags || []
        })),
        preferences: {
          genres: p.preferences?.genres || [],
          modes: p.preferences?.modes || [],
          platforms: p.platforms || [],
          playstyle: p.playstyle
            ? [p.playstyle.competitiveStyle, p.playstyle.communicationStyle].filter(Boolean) as string[]
            : [],
          freeText: p.bio || "",
          region: p.region || "global"
        }
      }));

      const recommendations = await getRecommendations({
        userHistory,
        preferences,
        gamesCatalog: catalogPayload,
        communityProfiles: communityPayload
      });

      setRecGames(recommendations.games || []);
      setRecTeammates(recommendations.teammates || []);
      setInterests(recommendations.extracted_interests || []);

      const profileMap: Record<string, GamerProfile> = {};
      filteredProfiles.forEach((p) => {
        profileMap[p.userId] = p;
      });
      setTeammateProfiles(profileMap);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate AI recommendations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendInvite = (teammateId: string, gamerTag: string) => {
    if (sentInvites.includes(teammateId)) return;
    setSentInvites([...sentInvites, teammateId]);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pt-4">
        <div className="h-28 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-end">
          <div className="h-6 w-48 bg-slate-800 rounded"></div>
          <div className="h-4 w-96 bg-slate-800 rounded mt-3"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[450px] rounded-3xl bg-slate-900/60 border border-slate-800"></div>
          <div className="h-[450px] rounded-3xl bg-slate-900/60 border border-slate-800"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md text-center py-24 space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto animate-pulse">
          <Cpu className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight">AI Discover Standby</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Create a Gamer Profile first to unlock collaborative similarity matches. We compare playstyles, regions, and preferred catalogs.
          </p>
        </div>
        <Link
          to="/app/profile"
          className="glow-button inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/20"
        >
          Initialize Gamer Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">AI Discovery Discovery</h1>
            <span className="rounded bg-brand-500/15 border border-brand-500/20 px-2 py-0.5 text-[9px] font-extrabold text-brand-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Engine Online
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Cosine-similarity matrix diagnostics analyzing playstyles, latencies, and tag overlaps.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="glow-button flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-850 bg-slate-950 text-xs font-bold text-slate-350 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Re-Analyzing..." : "Refresh Insights"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-400">
          {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* RECOMMENDED GAMES */}
        <section className="glass-panel rounded-3xl p-6 space-y-5 relative">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Gamepad className="w-4.5 h-4.5 text-brand-400" />
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Catalog Suggestions</h2>
              <p className="text-[10px] text-slate-500">Recommended games based on playstyle filters.</p>
            </div>
          </div>

          <div className="space-y-4">
            {recGames.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6">No suggestions generated. Expand your profile preference list.</p>
            ) : (
              recGames.map((item) => {
                const game = GAMES_CATALOG.find((g) => g.gameId === item.id);
                if (!game) return null;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition"
                  >
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt="" className="w-14 h-14 object-cover rounded-xl border border-slate-850" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">🎮</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">{game.title}</h3>
                        <span className="shrink-0 text-xs font-black text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
                          {Math.round(item.score * 100)}% Match
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed">"{item.reason}"</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {game.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* RECOMMENDED TEAMMATES */}
        <section className="glass-panel rounded-3xl p-6 space-y-5 relative">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Activity className="w-4.5 h-4.5 text-brand-400" />
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Compatible Teammates</h2>
              <p className="text-[10px] text-slate-500">Collaborative matches sorted by playstyle affinity.</p>
            </div>
          </div>

          <div className="space-y-4">
            {recTeammates.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6">No players matching similarity metrics found.</p>
            ) : (
              recTeammates.map((item) => {
                const mate = teammateProfiles[item.id];
                if (!mate) return null;

                const alreadySent = sentInvites.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-650 to-purple-500 flex items-center justify-center font-black text-white text-xs border border-brand-400/25">
                          {mate.gamerTag.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{mate.gamerTag}</h3>
                          <p className="text-[9px] text-slate-500 capitalize mt-0.5">Region: {mate.region}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
                        {Math.round(item.score * 100)}% Match
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-450 italic leading-relaxed">"{item.reason}"</p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-900/60">
                      <div className="flex gap-1.5">
                        {mate.platforms.map((plat) => (
                          <span key={plat} className="text-[8px] px-1.5 py-0.5 bg-slate-900 border border-slate-850 rounded text-slate-500 font-bold">
                            {plat}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSendInvite(item.id, mate.gamerTag)}
                        disabled={alreadySent}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          alreadySent
                            ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                            : "glow-button bg-brand-600 hover:bg-brand-500 text-white"
                        }`}
                      >
                        {alreadySent ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Request Sent</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add Teammate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* EXTRACTED INTERESTS INSIGHTS (SVG Visual Representation) */}
      {interests.length > 0 && (
        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Bookmark className="w-4.5 h-4.5 text-brand-400" />
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">AI Preference Interest Insights</h2>
              <p className="text-[10px] text-slate-550">Tags parsed from profile data telemetry logs.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-3.5 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-350 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
