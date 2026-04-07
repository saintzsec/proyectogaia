"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type SaveToastContextValue = {
  /** Muestra la notificación de éxito (por defecto: «Cambios guardados»). */
  showSaved: (message?: string) => void;
};

const SaveToastContext = createContext<SaveToastContextValue | null>(null);

export function useSaveToast(): SaveToastContextValue {
  const ctx = useContext(SaveToastContext);
  return ctx ?? { showSaved: () => {} };
}

type ToastState = { message: string; leaving: boolean } | null;

export function SaveToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const showSaved = useCallback((message = "Cambios guardados") => {
    setToast({ message, leaving: false });
  }, []);

  useEffect(() => {
    if (!toast || toast.leaving) return;
    const t = setTimeout(() => {
      setToast((s) => (s && !s.leaving ? { ...s, leaving: true } : s));
    }, 3800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!toast?.leaving) return;
    const t = setTimeout(() => setToast(null), 300);
    return () => clearTimeout(t);
  }, [toast?.leaving]);

  return (
    <SaveToastContext.Provider value={{ showSaved }}>
      {children}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            "gaia-save-toast pointer-events-none fixed left-1/2 z-[9999] flex max-w-[min(100vw-2rem,22rem)] -translate-x-1/2 items-center gap-3 rounded-[var(--radius-gaia)] border border-[#0baba9]/30 bg-white px-4 py-3 text-left shadow-lg",
            toast.leaving ? "gaia-save-toast-leave" : "gaia-save-toast-enter",
          )}
          style={{ top: "max(1rem, env(safe-area-inset-top, 0px))" }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0baba9]/15 text-sm font-bold text-[#0baba9]"
            aria-hidden
          >
            ✓
          </span>
          <p className="text-sm font-medium leading-snug text-[#111827]">{toast.message}</p>
        </div>
      ) : null}
    </SaveToastContext.Provider>
  );
}
