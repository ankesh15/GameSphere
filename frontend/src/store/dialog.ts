import { create } from "zustand";

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "info" | "error" | "success" | "warning";
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ToastConfig {
  id: string;
  message: string;
  type: "info" | "error" | "success" | "warning";
}

interface DialogState {
  modal: ModalConfig;
  toasts: ToastConfig[];
  showAlert: (message: string, title?: string, type?: "info" | "error" | "success" | "warning") => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    title?: string,
    confirmText?: string,
    cancelText?: string
  ) => void;
  closeModal: () => void;
  showToast: (message: string, type?: "info" | "error" | "success" | "warning") => void;
  removeToast: (id: string) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  modal: {
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  },
  toasts: [],
  showAlert: (message, title = "Notification", type = "info") =>
    set({
      modal: {
        isOpen: true,
        title,
        message,
        type,
        isConfirm: false
      }
    }),
  showConfirm: (message, onConfirm, title = "Confirm Action", confirmText = "Confirm", cancelText = "Cancel") =>
    set({
      modal: {
        isOpen: true,
        title,
        message,
        type: "warning",
        isConfirm: true,
        confirmText,
        cancelText,
        onConfirm
      }
    }),
  closeModal: () =>
    set((state) => ({
      modal: { ...state.modal, isOpen: false }
    })),
  showToast: (message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}));
