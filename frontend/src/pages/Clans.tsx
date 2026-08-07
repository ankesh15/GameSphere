import { useState } from "react";
import ChatRoom from "../components/ChatRoom";
import {
  Shield,
  MessageSquare,
  Volume2,
  Users,
  Megaphone,
  Calendar,
  Settings,
  Plus,
  Compass,
  ArrowRight,
  Tv
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClansPage() {
  const [selectedClan, setSelectedClan] = useState("liquid");
  const [selectedChannel, setSelectedChannel] = useState("general");

  // Mock Clan Data
  const clans = [
    { id: "liquid", name: "Team Liquid", tag: "TL", avatar: "TL" },
    { id: "phoenix", name: "Phoenix Clan", tag: "PHX", avatar: "PX" },
    { id: "sentinels", name: "Sentinels Elite", tag: "SEN", avatar: "SE" }
  ];

  const channels = [
    { id: "announcements", label: "announcements", icon: Megaphone },
    { id: "general", label: "general-chat", icon: MessageSquare },
    { id: "scrims", label: "scrim-coordination", icon: Calendar }
  ];

  const voiceChannels = [
    { id: "lounge", label: "Lounge" },
    { id: "scrim-v1", label: "Scrim Room 1" },
    { id: "scrim-v2", label: "Scrim Room 2" }
  ];

  const members = [
    { name: "Liquid_Core", role: "Leader", online: true, tag: "LC" },
    { name: "Shroud_Duo", role: "Competitor", online: true, tag: "SD" },
    { name: "Viper_One", role: "Competitor", online: true, tag: "VO" },
    { name: "Nova_Apex", role: "Member", online: false, tag: "NA" },
    { name: "Helix_Player", role: "Member", online: false, tag: "HP" }
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-950/40 border border-slate-900 rounded-3xl overflow-hidden backdrop-blur-md">
      {/* Clan Server Navigation Icon Panel (Discord Style Left Strip) */}
      <div className="w-16 bg-slate-950 border-r border-slate-900 py-4 flex flex-col items-center gap-3 shrink-0">
        {clans.map((clan) => {
          const active = selectedClan === clan.id;
          return (
            <button
              key={clan.id}
              onClick={() => setSelectedClan(clan.id)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all relative ${
                active
                  ? "bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-405 hover:bg-brand-500 hover:text-white hover:rounded-xl"
              }`}
              title={clan.name}
            >
              {active && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
              )}
              {clan.avatar}
            </button>
          );
        })}

        <div className="w-8 h-px bg-slate-900 my-1" />

        <button className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 text-brand-400 hover:bg-brand-500 hover:text-white hover:rounded-xl flex items-center justify-center transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Channel List Panel */}
      <div className="w-56 bg-slate-950/60 border-r border-slate-900 flex flex-col justify-between shrink-0">
        <div>
          {/* Server Title Header */}
          <div className="px-4 py-4 border-b border-slate-900/60 flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider truncate">
              {clans.find((c) => c.id === selectedClan)?.name || "Clans Space"}
            </span>
            <Shield className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          </div>

          {/* Text Channels List */}
          <div className="px-2 py-3 space-y-4">
            <div className="space-y-1">
              <span className="px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest block">Text Channels</span>
              {channels.map((chan) => {
                const active = selectedChannel === chan.id;
                return (
                  <button
                    key={chan.id}
                    onClick={() => setSelectedChannel(chan.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                      active
                        ? "bg-slate-900 border border-slate-800 text-white"
                        : "text-slate-450 hover:bg-slate-900/30 hover:text-slate-200"
                    }`}
                  >
                    <chan.icon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{chan.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Voice Channels List */}
            <div className="space-y-1">
              <span className="px-2 text-[9px] font-black text-slate-500 uppercase tracking-widest block">Voice Channels</span>
              {voiceChannels.map((vchan) => (
                <button
                  key={vchan.id}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-450 hover:bg-slate-900/30 hover:text-slate-200 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{vchan.label}</span>
                  </div>
                  <span className="text-[8px] bg-slate-900 border border-slate-850 px-1 rounded text-slate-550">0/5</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User quick status footer */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-[10px] shrink-0">
              ME
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-white block truncate">Gamer#1337</span>
              <span className="text-[8px] text-emerald-400 block font-semibold">online</span>
            </div>
          </div>
          <button className="text-slate-500 hover:text-white transition">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Interface Panel */}
      <div className="flex-1 flex flex-col bg-slate-950/20">
        <div className="flex-1 relative">
          <ChatRoom roomId={`clan:${selectedClan}-${selectedChannel}`} />
        </div>
      </div>

      {/* Member Roster List Panel */}
      <div className="w-48 bg-slate-955/40 border-l border-slate-900 p-4 space-y-4 shrink-0 hidden md:block">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">MEMBERS — {members.length}</span>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-300 text-[10px] shrink-0">
                    {member.tag}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-white block truncate">{member.name}</span>
                    <span className="text-[8px] text-slate-500 block truncate capitalize">{member.role}</span>
                  </div>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${member.online ? "bg-emerald-500" : "bg-slate-800"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
