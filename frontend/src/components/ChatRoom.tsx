import { useEffect, useRef, useState } from "react";
import { getRoomMessages, ChatMessage } from "../api/chat";
import { getGamerProfile } from "../api/profiles";
import { useSocketStore } from "../store/socket";
import { MessageSquare, Send, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ChatRoomProps = {
  roomId: string; // e.g. "match:xxxx" or "clan:xxxx"
};

// Global-ish cache to share resolved tags across mounts and components
const globalProfileCache: Record<string, string> = {};

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const socket = useSocketStore((state) => state.socket);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [profiles, setProfiles] = useState<Record<string, string>>(() => ({ ...globalProfileCache }));
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    fetchHistory();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, [roomId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const history = await getRoomMessages(roomId);
      setMessages(history);
      // Pre-fetch sender profiles for this batch
      const uniqueSenderIds = Array.from(new Set(history.map((m) => m.senderId)));
      uniqueSenderIds.forEach(resolveSenderTag);
    } catch (err) {
      console.error("Failed to load chat history", err);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    // Join room
    socket.emit("chat.join", { roomId });

    socket.on("chat.message", (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        resolveSenderTag(message.senderId);
      }
    });

    socket.on("chat.typing", (payload: { roomId: string; userId: string; isTyping: boolean }) => {
      if (payload.roomId === roomId) {
        setTypingUsers((prev) => {
          if (payload.isTyping) {
            if (prev.includes(payload.userId)) return prev;
            return [...prev, payload.userId];
          } else {
            return prev.filter((id) => id !== payload.userId);
          }
        });
        resolveSenderTag(payload.userId);
      }
    });
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;
    socket.off("chat.message");
    socket.off("chat.typing");
  };

  const resolveSenderTag = async (senderId: string) => {
    if (profiles[senderId] || globalProfileCache[senderId]) {
      if (!profiles[senderId]) {
        setProfiles((prev) => ({ ...prev, [senderId]: globalProfileCache[senderId] }));
      }
      return;
    }

    // Set placeholder to prevent duplicate requests
    globalProfileCache[senderId] = `User_${senderId.slice(-4)}`;
    setProfiles((prev) => ({ ...prev, [senderId]: globalProfileCache[senderId] }));

    try {
      const data = await getGamerProfile(senderId);
      const tag = data.gamerTag || data.displayName || `User_${senderId.slice(-4)}`;
      globalProfileCache[senderId] = tag;
      setProfiles((prev) => ({ ...prev, [senderId]: tag }));
    } catch {
      // Keep fallback placeholder
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    // Send via socket
    socket.emit("chat.send", { roomId, content: inputText.trim() });
    setInputText("");

    // Stop typing indicator
    handleTypingStop();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("chat.typing", { roomId, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 2000);
  };

  const handleTypingStop = () => {
    if (isTypingRef.current && socket) {
      isTypingRef.current = false;
      socket.emit("chat.typing", { roomId, isTyping: false });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[520px] rounded-3xl border border-slate-900 bg-slate-950/75 overflow-hidden backdrop-blur-md shadow-2xl relative">
      {/* Header */}
      <div className="border-b border-slate-900 bg-slate-900/40 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-white uppercase tracking-widest block">Live Channel Session</span>
            <p className="text-[9px] text-slate-500 mt-0.5">Real-time socket data streams active</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>ONLINE</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="flex flex-col gap-2 justify-center items-center h-full text-slate-500 text-xs">
            <Sparkles className="w-5 h-5 animate-pulse text-brand-400" />
            <span className="font-mono text-[10px]">fetching telemetry logs...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-800" />
            <p className="text-xs">Establish communications in this channel.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = socket && msg.senderId === socket.id;
            const senderTag = profiles[msg.senderId] || `Player_${msg.senderId.slice(-4)}`;

            return (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                key={msg.id || idx}
                className={`flex gap-3 items-start ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold border ${
                  isMe
                    ? "bg-brand-500/20 border-brand-500/30 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300"
                }`}>
                  {senderTag.slice(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1 max-w-[70%]">
                  <div className={`flex items-baseline gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] font-extrabold text-slate-400">
                      {senderTag}
                    </span>
                    <span className="text-[8px] text-slate-600 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className={`text-xs px-3.5 py-2.5 rounded-2xl leading-relaxed break-words border ${
                    isMe
                      ? "bg-brand-600/10 border-brand-500/20 text-white rounded-tr-none"
                      : "bg-slate-900/50 border-slate-850 text-slate-200 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-5 py-2 text-[9px] text-slate-500 bg-slate-950/40 flex items-center gap-2 border-t border-slate-900/30 font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"></span>
          <span>
            {typingUsers.map((uid) => profiles[uid] || `User_${uid.slice(-4)}`).join(", ")} is typing...
          </span>
        </div>
      )}

      {/* Input panel */}
      <form onSubmit={handleSend} className="border-t border-slate-900 bg-slate-900/30 p-4 flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-xl border border-slate-850 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
          placeholder="Message this channel session..."
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleTypingStop}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="glow-button shrink-0 w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center text-white hover:bg-brand-500 transition disabled:opacity-50 disabled:shadow-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
