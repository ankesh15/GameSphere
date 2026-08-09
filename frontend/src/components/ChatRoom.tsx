import { useEffect, useRef, useState } from "react";
import { getRoomMessages, ChatMessage } from "../api/chat";
import { getGamerProfile } from "../api/profiles";
import { useSocketStore } from "../store/socket";
import { useAuthStore } from "../store/auth";
import EmptyState from "./EmptyState";
import ErrorAlert from "./ErrorAlert";
import { MessageSquare, Send, Sparkles, User, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ChatRoomProps = {
  roomId: string; // e.g. "match:xxxx" or "clan:xxxx"
};

// Global-ish cache to share resolved tags across mounts and components
const globalProfileCache: Record<string, string> = {};

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const socket = useSocketStore((state) => state.socket);
  const currentUser = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [profiles, setProfiles] = useState<Record<string, string>>(() => ({ ...globalProfileCache }));
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await getRoomMessages(roomId);
      setMessages(history);
      // Pre-fetch sender profiles for this batch
      const uniqueSenderIds = Array.from(new Set(history.map((m) => m.senderId)));
      uniqueSenderIds.forEach(resolveSenderTag);
    } catch (err: any) {
      console.error("Failed to load chat history", err);
      setError(err.response?.data?.message || "Failed to establish history connection for this room.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    if (!socket) return;

    // Join room
    socket.emit("chat.join", { roomId });

    const handleChatMessage = (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        resolveSenderTag(message.senderId);
      }
    };

    const handleChatTyping = (payload: { roomId: string; userId: string; isTyping: boolean }) => {
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
    };

    const handleConnect = () => {
      socket.emit("chat.join", { roomId });
    };

    socket.on("chat.message", handleChatMessage);
    socket.on("chat.typing", handleChatTyping);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("chat.message", handleChatMessage);
      socket.off("chat.typing", handleChatTyping);
      socket.off("connect", handleConnect);
    };
  }, [roomId, socket]);

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
    <div className="flex flex-col h-[520px] rounded-3xl glass-level-2 border border-white/10 overflow-hidden backdrop-blur-2xl shadow-2xl relative font-body">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/80 px-5 py-4 flex items-center justify-between font-body">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-300 shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-white uppercase tracking-widest block font-display">Live Channel Session</span>
            <p className="text-[9px] text-slate-400 mt-0.5 font-body">Real-time socket data telemetry streams active</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-extrabold text-emerald-400 font-body">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>ONLINE</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-body">
        {loading ? (
          <div className="flex flex-col gap-2 justify-center items-center h-full text-slate-400 text-xs font-body">
            <Sparkles className="w-5 h-5 animate-pulse text-brand-400" />
            <span className="font-mono text-[10px]">fetching telemetry logs...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center p-4">
            <ErrorAlert
              title="Chat History Unavailable"
              message={error}
              onRetry={fetchHistory}
              retryLabel="Retry Loading History"
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <EmptyState
              icon={<MessageSquare className="w-8 h-8 text-slate-600" />}
              title="No Messages Yet"
              description="Establish communications in this channel by sending your first squad message below."
            />
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = currentUser && msg.senderId === currentUser.id;
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
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold border font-display transition-all ${
                  isMe
                    ? "bg-brand-600/30 border-brand-500/50 text-white shadow-sm"
                    : "glass-level-1 border-white/10 text-slate-300"
                }`}>
                  {senderTag.slice(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1 max-w-[70%]">
                  <div className={`flex items-baseline gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[10px] font-extrabold ${isMe ? "text-brand-300" : "text-slate-400"} font-body`}>
                      {senderTag}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className={`text-xs px-4 py-2.5 rounded-2xl leading-relaxed break-words border font-body ${
                    isMe
                      ? "glass-level-1 bg-brand-500/15 border-brand-500/30 text-white rounded-tr-none shadow-md shadow-brand-500/5"
                      : "glass-level-1 bg-slate-950/60 border-white/10 text-slate-200 rounded-tl-none"
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
        <div className="px-5 py-2 text-[9px] text-slate-300 bg-slate-950/60 flex items-center gap-2 border-t border-white/5 font-semibold tracking-wide font-body">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
          <span>
            {typingUsers.map((uid) => profiles[uid] || `User_${uid.slice(-4)}`).join(", ")} is typing...
          </span>
        </div>
      )}

      {/* Input panel */}
      <form onSubmit={handleSend} className="border-t border-white/10 bg-slate-950/70 p-4 flex gap-2 font-body">
        <input
          type="text"
          className="flex-1 rounded-xl border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all font-body"
          placeholder="Message this channel session..."
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleTypingStop}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="glow-button shrink-0 w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center text-white hover:bg-brand-500 transition disabled:opacity-40 disabled:shadow-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
