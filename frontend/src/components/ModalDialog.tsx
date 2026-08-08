import { useDialogStore } from "../store/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export default function ModalDialog() {
  const { modal, closeModal, toasts, removeToast } = useDialogStore();

  const getIcon = () => {
    switch (modal.type) {
      case "error":
        return <AlertCircle className="w-7 h-7 text-rose-500" />;
      case "success":
        return <CheckCircle2 className="w-7 h-7 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="w-7 h-7 text-amber-400" />;
      default:
        return <Info className="w-7 h-7 text-brand-400" />;
    }
  };

  return (
    <>
      {/* Modal Dialog */}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  modal.type === "error"
                    ? "from-rose-500 to-red-600"
                    : modal.type === "success"
                    ? "from-emerald-400 to-teal-500"
                    : modal.type === "warning"
                    ? "from-amber-400 to-orange-500"
                    : "from-brand-500 to-indigo-500"
                }`}
              />

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
                  {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    {modal.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed font-medium">
                    {modal.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-900">
                {modal.isConfirm ? (
                  <>
                    <button
                      onClick={() => {
                        modal.onCancel?.();
                        closeModal();
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-400 hover:text-white transition"
                    >
                      {modal.cancelText || "Cancel"}
                    </button>
                    <button
                      onClick={() => {
                        modal.onConfirm?.();
                        closeModal();
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition glow-button ${
                        modal.type === "error" || modal.type === "warning"
                          ? "bg-rose-600 hover:bg-rose-500"
                          : "bg-brand-600 hover:bg-brand-500"
                      }`}
                    >
                      {modal.confirmText || "Confirm"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-500 transition glow-button"
                  >
                    OK
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`pointer-events-auto p-4 rounded-2xl border bg-slate-950/95 backdrop-blur-xl shadow-xl flex items-center justify-between gap-3 ${
                toast.type === "error"
                  ? "border-rose-500/30 text-rose-400"
                  : toast.type === "success"
                  ? "border-emerald-500/30 text-emerald-400"
                  : "border-brand-500/30 text-brand-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {toast.type === "error" ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                ) : toast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <Info className="w-4 h-4 shrink-0 text-brand-400" />
                )}
                <span className="text-xs font-semibold text-slate-200">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
