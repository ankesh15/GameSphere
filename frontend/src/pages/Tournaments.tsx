import { useState, useEffect } from "react";
import {
  Trophy,
  Calendar,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  TrendingUp,
  MapPin,
  Play,
  User,
  Plus,
  X,
  Award,
  CheckCircle,
  AlertCircle,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/auth";
import { useDialogStore } from "../store/dialog";
import { validateTournamentForm } from "../utils/validation";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import {
  getTournaments,
  getTournament,
  createTournament,
  joinTournament,
  leaveTournament,
  generateBracket,
  submitMatchResult,
  verifyWinner,
  Tournament,
  Participant,
  TournamentMatch
} from "../api/tournaments";
import { GAMES_CATALOG } from "../api/games";

export default function TournamentsPage() {
  const { user } = useAuthStore();
  const { showAlert, showConfirm, showToast } = useDialogStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState<TournamentMatch | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    gameId: "valorant",
    region: "NA",
    maxParticipants: 16,
    startAt: "",
    endAt: "",
    prizePool: 0
  });

  const [resultForm, setResultForm] = useState({
    scoreA: 0,
    scoreB: 0,
    winnerId: ""
  });

  useEffect(() => {
    fetchTournamentsList();
  }, []);

  const fetchTournamentsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getTournaments();
      setTournaments(list);
      if (list.length > 0) {
        loadTournamentDetails(list[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch tournaments directory.");
      setLoading(false);
    }
  };

  const loadTournamentDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const details = await getTournament(id);
      setSelectedTourney(details);
    } catch (err: any) {
      console.error("Failed to load tournament details", err);
    } finally {
      setDetailLoading(false);
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using shared validator
    const validation = validateTournamentForm({
      name: createForm.name,
      gameId: createForm.gameId,
      startAt: createForm.startAt,
      endAt: createForm.endAt,
      prizePool: createForm.prizePool
    });

    if (validation.firstError) {
      showAlert(validation.firstError, "Validation Error", "error");
      return;
    }

    try {
      const payload = {
        ...createForm,
        startAt: createForm.startAt ? new Date(createForm.startAt).toISOString() : undefined,
        endAt: createForm.endAt ? new Date(createForm.endAt).toISOString() : undefined
      };
      const newT = await createTournament(payload);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        slug: "",
        gameId: "valorant",
        region: "NA",
        maxParticipants: 16,
        startAt: "",
        endAt: "",
        prizePool: 0
      });
      // Refresh list and select the new one
      const list = await getTournaments();
      setTournaments(list);
      loadTournamentDetails(newT._id);
      showToast("Tournament created successfully!", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to create tournament.", "Tournament Error", "error");
    }
  };

  const handleJoinTournament = async () => {
    if (!selectedTourney) return;
    try {
      const updated = await joinTournament(selectedTourney._id);
      setSelectedTourney(updated);
      // Update in list
      setTournaments(prev => prev.map(t => t._id === updated._id ? updated : t));
      showToast("Successfully joined tournament!", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to join tournament.", "Tournament Error", "error");
    }
  };

  const handleLeaveTournament = async () => {
    if (!selectedTourney) return;
    try {
      const updated = await leaveTournament(selectedTourney._id);
      setSelectedTourney(updated);
      // Update in list
      setTournaments(prev => prev.map(t => t._id === updated._id ? updated : t));
      showToast("Left tournament.", "info");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to leave tournament.", "Tournament Error", "error");
    }
  };

  const handleGenerateBracket = async () => {
    if (!selectedTourney) return;
    try {
      const updated = await generateBracket(selectedTourney._id);
      setSelectedTourney(updated);
      setTournaments(prev => prev.map(t => t._id === updated._id ? updated : t));
      showToast("Bracket generated successfully!", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to generate bracket. Note that participant count must be at least 2.", "Bracket Error", "error");
    }
  };

  const openResultModal = (match: TournamentMatch) => {
    setShowResultModal(match);
    setResultForm({
      scoreA: 0,
      scoreB: 0,
      winnerId: match.participantIds[0] || ""
    });
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney || !showResultModal) return;
    try {
      const updated = await submitMatchResult(selectedTourney._id, {
        matchId: showResultModal.matchId,
        scores: [resultForm.scoreA, resultForm.scoreB],
        winnerId: resultForm.winnerId
      });
      setSelectedTourney(updated);
      setTournaments(prev => prev.map(t => t._id === updated._id ? updated : t));
      setShowResultModal(null);
      showToast("Match scores submitted!", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to submit match result.", "Submission Error", "error");
    }
  };

  const handleVerifyWinner = async (matchId: string, winnerId: string) => {
    if (!selectedTourney) return;
    showConfirm(
      "Verify this result and advance the winner to the next round?",
      async () => {
        try {
          const updated = await verifyWinner(selectedTourney._id, {
            matchId,
            winnerId
          });
          setSelectedTourney(updated);
          setTournaments(prev => prev.map(t => t._id === updated._id ? updated : t));
          showToast("Winner verified and advanced!", "success");
        } catch (err: any) {
          showAlert(err.response?.data?.message || "Failed to verify winner.", "Verification Error", "error");
        }
      },
      "Verify Match Result"
    );
  };


  // Helper to check participation
  const isParticipant = selectedTourney?.participantIds.some((p: any) => {
    const pid = typeof p === "object" ? p._id : p;
    return pid === user?.id;
  });

  const getParticipantName = (id: string): string => {
    if (!selectedTourney) return "Unknown";
    const found = selectedTourney.participantIds.find((p: any) => {
      const pid = typeof p === "object" ? p._id : p;
      return pid === id;
    });
    if (found && typeof found === "object") {
      return (found as Participant).displayName || (found as Participant).username;
    }
    return "Player";
  };

  const isOrganizer = selectedTourney?.organizerId === user?.id;

  return (
    <div className="space-y-6 font-body">
      {/* Page Header */}
      <div className="rounded-3xl glass-level-2 border border-white/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur-2xl relative overflow-hidden shadow-xl font-body">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-amber-500"></div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight font-display">Esports Tournaments</h1>
          <p className="mt-1 text-xs text-slate-300 font-body">
            Join competitive gaming brackets, track live brackets, and claim prize rewards.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="glow-button inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition duration-200 uppercase tracking-wider font-body"
          >
            <Trophy className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center font-body">
          <div className="w-8 h-8 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-3xl glass-level-2 border border-rose-500/30 bg-rose-950/20 p-8 text-center max-w-md mx-auto my-12 shadow-xl font-body">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-rose-300 font-body">{error}</p>
          <button
            onClick={fetchTournamentsList}
            className="mt-6 px-5 py-2.5 rounded-xl glass-level-1 border border-white/10 text-xs font-bold text-white hover:border-white/20 transition uppercase tracking-wider font-body"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 font-body">
          {/* Left Column: Tournaments list */}
          <div className="space-y-4 lg:col-span-1 font-body">
            <div className="flex items-center gap-2 text-slate-300 px-1 font-body">
              <Trophy className="w-4.5 h-4.5 text-brand-300" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-display">Tournament Directory</span>
            </div>

            <div className="space-y-3 font-body">
              {tournaments.length === 0 ? (
                <EmptyState
                  icon={<Trophy className="w-6 h-6 text-brand-400" />}
                  title="No Tournaments Scheduled"
                  description="There are currently no active competitive brackets. Be the first host to create one!"
                  actionLabel="Host Tournament"
                  onAction={() => setShowCreateModal(true)}
                  actionIcon={<Plus className="w-3.5 h-3.5" />}
                />
              ) : (
                tournaments.map((t) => {
                  const active = selectedTourney?._id === t._id;
                  const game = GAMES_CATALOG.find((g) => g.gameId === t.gameId);
                  return (
                    <div
                      key={t._id}
                      onClick={() => loadTournamentDetails(t._id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between shadow-md font-body ${
                        active
                          ? "glass-level-2 border-brand-500/50 bg-brand-500/10 text-white shadow-lg shadow-brand-500/5"
                          : "glass-level-1 border-white/10 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-950/70 border border-white/10 font-bold uppercase text-slate-300 tracking-wider font-body">
                            {game?.title || t.gameId}
                          </span>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider mt-2 font-body">
                            {t.name}
                          </h3>
                        </div>
                        <span
                          className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 font-body ${
                            t.status === "live"
                              ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                              : t.status === "completed"
                              ? "bg-slate-900/80 border border-white/5 text-slate-400"
                              : "bg-brand-500/15 border border-brand-500/30 text-brand-300"
                          }`}
                        >
                          {t.status === "live" && <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping"></span>}
                          {t.status}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] font-body">
                        <div className="flex items-center gap-1 font-mono">
                          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-300 font-bold">${t.prizePool?.toLocaleString() || "0"}</span>
                          <span className="text-slate-400 text-[9px] font-body">Pool</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-slate-300">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {t.participantIds.length} / {t.maxParticipants || 16}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Columns: Tournament details & interactive Bracket Visualizer */}
          <div className="lg:col-span-2 space-y-4 font-body">
            {detailLoading ? (
              <div className="flex h-[40vh] items-center justify-center font-body">
                <div className="w-8 h-8 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
              </div>
            ) : selectedTourney ? (
              <div className="space-y-6 font-body">
                {/* Selected Tourney Header Panel */}
                <div className="p-6 rounded-3xl glass-level-2 border border-white/10 space-y-4 relative overflow-hidden font-body shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-body">
                    <div>
                      <h2 className="text-lg font-black text-white uppercase tracking-wider font-display">
                        {selectedTourney.name}
                      </h2>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 font-body">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-300" />
                          {selectedTourney.region || "Global"}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Users className="w-3.5 h-3.5 text-brand-300" />
                          {selectedTourney.participantIds.length} Joined
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono text-amber-300 font-bold">
                          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                          ${selectedTourney.prizePool?.toLocaleString() || "0"} Prize
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-body">
                      {selectedTourney.status === "scheduled" && (
                        <>
                          {isParticipant ? (
                            <button
                              onClick={handleLeaveTournament}
                              className="px-4 py-2 rounded-xl glass-level-1 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition font-body uppercase tracking-wider"
                            >
                              Leave Tournament
                            </button>
                          ) : (
                            <button
                              onClick={handleJoinTournament}
                              disabled={selectedTourney.participantIds.length >= (selectedTourney.maxParticipants || 16)}
                              className="glow-button px-5 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-500 transition disabled:opacity-50 font-body uppercase tracking-wider"
                            >
                              Join Tournament
                            </button>
                          )}

                          {isOrganizer && (
                            <button
                              onClick={handleGenerateBracket}
                              className="px-4 py-2.5 rounded-xl border border-brand-500/40 bg-brand-500/15 text-xs font-bold text-brand-300 hover:bg-brand-500 hover:text-white transition font-body uppercase tracking-wider"
                            >
                              Generate Bracket
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bracket Section */}
                <div className="space-y-4 font-body">
                  <div className="flex items-center justify-between px-1 font-body">
                    <div className="flex items-center gap-2 text-slate-300 font-body">
                      <TrendingUp className="w-4.5 h-4.5 text-brand-300" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider font-display">
                        {selectedTourney.status === "live" ? "Live Bracket Visualization" : "Bracket Preview"}
                      </span>
                    </div>
                  </div>

                  {selectedTourney.bracket && selectedTourney.bracket.length > 0 ? (
                    <div className="glass-level-2 rounded-3xl p-4 sm:p-6 border border-white/10 overflow-x-auto relative group shadow-2xl font-body">
                      <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

                      {/* Mobile Scroll Indicator Banner */}
                      <div className="sm:hidden flex items-center justify-between gap-2 px-3 py-1.5 mb-2 rounded-xl glass-level-1 border border-brand-500/30 bg-brand-500/10 text-[10px] font-bold text-brand-300 font-body">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 animate-spin text-brand-300" style={{ animationDuration: "6s" }} />
                          Scroll horizontally to view full bracket
                        </span>
                        <span className="text-[12px] font-mono">→</span>
                      </div>

                      {/* Edge gradient hint indicating horizontal scroll */}
                      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950/90 to-transparent rounded-r-3xl z-10 sm:hidden" />

                      <div className="flex gap-8 min-w-[700px] py-2 sm:py-4 relative font-body">
                        {selectedTourney.bracket.map((round) => (
                          <div
                            key={round.round}
                            className="flex-1 flex flex-col justify-around space-y-4"
                          >
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center mb-2 font-display">
                              Round {round.round}
                            </div>

                            {round.matches.map((match) => {
                              const isAWinner = match.winnerId === match.participantIds[0];
                              const isBWinner = match.winnerId === match.participantIds[1];
                              const teamA = match.participantIds[0]
                                ? getParticipantName(match.participantIds[0])
                                : "TBD";
                              const teamB = match.participantIds[1]
                                ? getParticipantName(match.participantIds[1])
                                : match.status === "bye"
                                ? "BYE"
                                : "TBD";
                              const scoreA = match.scores?.[0] ?? "-";
                              const scoreB = match.scores?.[1] ?? "-";

                              const isLiveMatch = match.status === "pending" || match.status === "submitted";
                              const isUserParticipantOfMatch = match.participantIds.includes(
                                user?.id || ""
                              );

                              return (
                                <div
                                  key={match.matchId}
                                  className={`p-3.5 rounded-2xl space-y-2 relative group transition duration-200 font-body shadow-md ${
                                    isLiveMatch
                                      ? "glass-level-2 border-l-4 border-l-amber-500 border border-amber-500/30 bg-slate-950/90 shadow-amber-500/10"
                                      : match.status === "bye"
                                      ? "glass-level-1 border border-white/5 bg-slate-950/40 text-slate-500"
                                      : "glass-level-1 border border-white/10 bg-slate-950/70 hover:border-white/20"
                                  }`}
                                >
                                  {isLiveMatch && (
                                    <div className="flex items-center justify-between text-[8px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                                      <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                        Live Match
                                      </span>
                                    </div>
                                  )}

                                  {/* Team A */}
                                  <div className="flex justify-between items-center">
                                    <span
                                      className={`text-[11px] font-bold ${
                                        isAWinner ? "text-brand-300 font-extrabold" : "text-slate-300"
                                      }`}
                                    >
                                      {teamA}
                                    </span>
                                    <span className="font-mono text-[10px] text-white font-bold bg-slate-950/80 border border-white/10 px-2 py-0.5 rounded-md">
                                      {scoreA}
                                    </span>
                                  </div>

                                  <div className="h-px bg-white/10" />

                                  {/* Team B */}
                                  <div className="flex justify-between items-center">
                                    <span
                                      className={`text-[11px] font-bold ${
                                        isBWinner ? "text-brand-300 font-extrabold" : "text-slate-300"
                                      }`}
                                    >
                                      {teamB}
                                    </span>
                                    <span className="font-mono text-[10px] text-white font-bold bg-slate-950/80 border border-white/10 px-2 py-0.5 rounded-md">
                                      {scoreB}
                                    </span>
                                  </div>

                                  {/* Organizer/Participant controls */}
                                  {(match.status === "pending" || match.status === "submitted") && (
                                    <div className="pt-2 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                      {match.status === "pending" && (isUserParticipantOfMatch || isOrganizer) && (
                                        <button
                                          onClick={() => openResultModal(match)}
                                          className="text-[9px] font-bold px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white border border-amber-500/30 transition uppercase font-body"
                                        >
                                          Report Result
                                        </button>
                                      )}
                                      {match.status === "submitted" && isOrganizer && (
                                        <button
                                          onClick={() =>
                                            handleVerifyWinner(match.matchId, match.winnerId || "")
                                          }
                                          className="text-[9px] font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition uppercase font-body"
                                        >
                                          Verify Winner
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Award className="w-7 h-7 text-slate-500" />}
                      title="Bracket Not Generated"
                      description={
                        isOrganizer
                          ? "As tournament organizer, click 'Generate Bracket' above once participants have checked in."
                          : "Bracket details will be published once the tournament organizer initiates match pairings."
                      }
                      actionLabel={isOrganizer ? "Generate Bracket" : undefined}
                      onAction={isOrganizer ? handleGenerateBracket : undefined}
                    />
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Trophy className="w-8 h-8 text-slate-600" />}
                title="Select a Tournament"
                description="Choose an active tournament from the directory panel to view brackets, participant rosters, and live telemetry."
              />
            )}
          </div>
        </div>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl font-body">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl glass-level-3 border border-white/10 bg-slate-950/90 p-6 shadow-2xl relative overflow-hidden font-body"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-amber-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-black text-white uppercase tracking-wider font-display">
                  Create Tournament
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTournament} className="space-y-4 font-body">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-body">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                      })
                    }
                    placeholder="e.g. Valorant Summer Masters"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-body">
                      Game
                    </label>
                    <select
                      value={createForm.gameId}
                      onChange={(e) => setCreateForm({ ...createForm, gameId: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                    >
                      {GAMES_CATALOG.map((g) => (
                        <option key={g.gameId} value={g.gameId} className="bg-slate-950">
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-body">
                      Region
                    </label>
                    <select
                      value={createForm.region}
                      onChange={(e) => setCreateForm({ ...createForm, region: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                    >
                      <option value="NA" className="bg-slate-950">
                        North America (NA)
                      </option>
                      <option value="EU" className="bg-slate-950">
                        Europe (EU)
                      </option>
                      <option value="AS" className="bg-slate-950">
                        Asia (AS)
                      </option>
                      <option value="BR" className="bg-slate-950">
                        Brazil (BR)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-body">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      required
                      min={2}
                      max={1024}
                      value={createForm.maxParticipants}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, maxParticipants: parseInt(e.target.value) })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-body">
                      Prize Pool ($)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={createForm.prizePool}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, prizePool: parseInt(e.target.value) })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-body">
                      Starts At
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={createForm.startAt}
                      onChange={(e) => setCreateForm({ ...createForm, startAt: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-body">
                      Ends At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={createForm.endAt}
                      onChange={(e) => setCreateForm({ ...createForm, endAt: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 glow-button rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-500 transition duration-200 uppercase tracking-wider font-body"
                >
                  Create Tournament
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT RESULT MODAL */}
      <AnimatePresence>
        {showResultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl font-body">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl glass-level-3 border border-white/10 bg-slate-950/90 p-6 shadow-2xl relative overflow-hidden font-body"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-amber-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-black text-white uppercase tracking-wider font-display">
                  Report Match Scores
                </h3>
                <button
                  onClick={() => setShowResultModal(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-4 font-body">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 truncate font-body">
                      {getParticipantName(showResultModal.participantIds[0] || "")} Score
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={resultForm.scoreA}
                      onChange={(e) =>
                        setResultForm({
                          ...resultForm,
                          scoreA: parseInt(e.target.value),
                          winnerId:
                            parseInt(e.target.value) > resultForm.scoreB
                              ? showResultModal.participantIds[0]
                              : showResultModal.participantIds[1] || ""
                        })
                      }
                      className="w-full text-center rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 truncate font-body">
                      {getParticipantName(showResultModal.participantIds[1] || "")} Score
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={resultForm.scoreB}
                      onChange={(e) =>
                        setResultForm({
                          ...resultForm,
                          scoreB: parseInt(e.target.value),
                          winnerId:
                            resultForm.scoreA > parseInt(e.target.value)
                              ? showResultModal.participantIds[0]
                              : showResultModal.participantIds[1] || ""
                        })
                      }
                      className="w-full text-center rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-body">
                    Declared Winner
                  </label>
                  <select
                    value={resultForm.winnerId}
                    onChange={(e) => setResultForm({ ...resultForm, winnerId: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
                  >
                    <option value={showResultModal.participantIds[0]} className="bg-slate-950">
                      {getParticipantName(showResultModal.participantIds[0] || "")}
                    </option>
                    {showResultModal.participantIds[1] && (
                      <option value={showResultModal.participantIds[1]} className="bg-slate-950">
                        {getParticipantName(showResultModal.participantIds[1])}
                      </option>
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 glow-button rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-500 transition duration-200 uppercase tracking-wider font-body"
                >
                  Submit Scores
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
