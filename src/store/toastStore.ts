import { create } from "zustand";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastStore {
  toasts: ToastItem[];
  show: (message: string, type: "success" | "error") => void;
  hide: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  show: (message, type) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 2500);
  },

  hide: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
