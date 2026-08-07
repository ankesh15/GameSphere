import { useState } from "react";
import {
  Trophy,
  Calendar,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  TrendingUp,
  MapPin,
  Play
} from "lucide-react";
import { motion } from "framer-motion";

export default function TournamentsPage() {
  const [selectedTourney, setSelectedTourney] = useState("valorant-showdown");

  // Mock Tournament Data
  const tournaments = [
    {
      id: "valorant-showdown",
      title: "Valorant Masters Showdown",
      game: "Valorant",
      prize: "$5,000",
      teams: "16/16",
      status: "Ongoing",
      date: "Starts in 2h"
    },
    {
      id: "apex-champs",
      title: "Apex Legends Arena Cup",
      game: "Apex Legends",
      prize: "$3,000",
      teams: "12/20",
      status: "Registration Open",
      date: "June 25, 2026"
    },
    {
      id: "league-clash",
      title: "League of Legends Summoner Clash",
      game: "League of Legends",
      prize: "$2,500",
      teams: "8/8",
      status: "Completed",
      date: "Completed"
    }
  ];

  // Bracket structure for Valorant Masters Showdown
  const bracketRounds = [
    {
      name: "Quarterfinals",
      matches: [
        { id: 1, teamA: "Sentinels", scoreA: "2", teamB: "Fnatic", scoreB: "1", winner: "Sentinels" },
        { id: 2, teamA: "Team Liquid", scoreA: "0", teamB: "Paper Rex", scoreB: "2", winner: "Paper Rex" },
        { id: 3, teamA: "LOUD", scoreA: "2", teamB: "NRG", scoreB: "0", winner: "LOUD" },
        { id: 4, teamA: "DRX", scoreA: "1", teamB: "Evil Geniuses", scoreB: "2", winner: "Evil Geniuses" }
      ]
    },
    {
      name: "Semifinals",
      matches: [
        { id: 5, teamA: "Sentinels", scoreA: "2", teamB: "Paper Rex", scoreB: "0", winner: "Sentinels" },
        { id: 6, teamA: "LOUD", scoreA: "1", teamB: "Evil Geniuses", scoreB: "2", winner: "Evil Geniuses" }
      ]
    },
    {
      name: "Grand Finals",
      matches: [
        { id: 7, teamA: "Sentinels", scoreA: "3", teamB: "Evil Geniuses", scoreB: "2", winner: "Sentinels" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-rose-500"></div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Esports Tournaments</h1>
          <p className="mt-1 text-sm text-slate-400">
            Join competitive gaming brackets, track live brackets, and claim prize rewards.
          </p>
        </div>
        <div>
          <button className="glow-button inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition duration-200">
            <Trophy className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Tournaments list */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-500 px-1">
            <Trophy className="w-4.5 h-4.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Tournament Directory</span>
          </div>

          <div className="space-y-3">
            {tournaments.map((t) => {
              const active = selectedTourney === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTourney(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    active
                      ? "bg-brand-650/10 border-brand-500 text-white shadow-lg shadow-brand-500/5"
                      : "bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-bold uppercase text-slate-400 tracking-wider">
                        {t.game}
                      </span>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mt-2">{t.title}</h3>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === "Ongoing"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : t.status === "Completed"
                        ? "bg-slate-800 text-slate-500"
                        : "bg-brand-500/10 text-brand-400"
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900/50 flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.prize} Pool</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-450">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Interactive Bracket Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Live Bracket Visualization</span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 overflow-x-auto relative">
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex gap-8 min-w-[650px] py-4 relative">
              {bracketRounds.map((round, rIdx) => (
                <div key={round.name} className="flex-1 flex flex-col justify-around space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 text-center mb-2">
                    {round.name}
                  </div>

                  {round.matches.map((match) => {
                    const isAWinner = match.winner === match.teamA;
                    const isBWinner = match.winner === match.teamB;

                    return (
                      <div
                        key={match.id}
                        className="p-3.5 rounded-2xl border border-slate-850 bg-slate-950/80 space-y-2 relative group hover:border-slate-700 transition duration-200"
                      >
                        {/* Team A */}
                        <div className="flex justify-between items-center">
                          <span className={`text-[11px] font-bold ${
                            isAWinner ? "text-brand-400" : "text-slate-500"
                          }`}>
                            {match.teamA}
                          </span>
                          <span className="font-mono text-xs text-white font-bold bg-slate-900/60 border border-slate-850 px-1.5 py-0.5 rounded">
                            {match.scoreA}
                          </span>
                        </div>

                        <div className="h-px bg-slate-900/60" />

                        {/* Team B */}
                        <div className="flex justify-between items-center">
                          <span className={`text-[11px] font-bold ${
                            isBWinner ? "text-brand-400" : "text-slate-500"
                          }`}>
                            {match.teamB}
                          </span>
                          <span className="font-mono text-xs text-white font-bold bg-slate-900/60 border border-slate-850 px-1.5 py-0.5 rounded">
                            {match.scoreB}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
