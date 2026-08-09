import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, LogIn, AlertCircle, CheckCircle2, Gamepad2 } from "lucide-react";
import { login } from "../api/auth";
import { useAuthStore } from "../store/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 5000);
    },
    []
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      const response = await login({ email, password });
      setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user
      });
      showToast("success", `Welcome back, ${response.user?.username ?? "Gamer"}!`);

      // Short delay so the user sees the success toast
      setTimeout(() => navigate("/app", { replace: true }), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* ── Animated Background ──────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-600/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/8 blur-[100px] animate-pulse-slow" style={{ animationDelay: "4s" }} />
      </div>

      {/* ── Toast Notification ────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3 shadow-2xl backdrop-blur-md ${
              toast.type === "success"
                ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
                : "border-rose-500/30 bg-rose-950/80 text-rose-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Login Card ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <div className="glass-level-2 rounded-2xl p-8 shadow-2xl border border-white/10">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/25">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome back
              </h1>
              <p className="text-xs text-slate-400">
                Sign in to your GameSphere account
              </p>
            </div>
          </motion.div>

          {/* ── Form ───────────────────────────────────────────────── */}
          <form className="space-y-5" onSubmit={handleSubmit} id="login-form">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2.5 pr-11 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Remember Me + Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center justify-between"
            >
              <label
                htmlFor="remember-me"
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-300"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-brand-500 accent-brand-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="glow-button flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:from-brand-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-brand-600 disabled:hover:to-indigo-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* ── Divider ──────────────────────────────────────────── */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500">or</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* ── Sign Up Link ─────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-slate-400"
          >
            New to GameSphere?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand-400 transition-colors hover:text-brand-300"
            >
              Create an account
            </Link>
          </motion.p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
