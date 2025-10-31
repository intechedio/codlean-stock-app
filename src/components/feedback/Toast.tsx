import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  kind?: ToastKind;
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, ...t };
    setToasts((s) => [...s, item]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3500);
  }, []);
  const remove = useCallback(
    (id: string) => setToasts((s) => s.filter((x) => x.id !== id)),
    []
  );
  const value = useMemo(
    () => ({ toasts, push, remove }),
    [toasts, push, remove]
  );
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-16 z-50 flex w-[360px] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl border bg-card p-3 shadow ${
              t.kind === "success"
                ? "border-green-400/40"
                : t.kind === "error"
                ? "border-red-400/40"
                : "border-border"
            }`}
          >
            <div className="text-sm font-medium">{t.title}</div>
            {t.description ? (
              <div className="text-xs text-muted-foreground mt-1">
                {t.description}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
