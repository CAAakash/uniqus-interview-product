"use client";

import { CheckCircle2, AlertTriangle, Info, X, XCircle } from "lucide-react";
import { useApp } from "@/lib/store";
import { useEffect } from "react";

export default function ToastHost() {
  const { toasts, dismissToast } = useApp();

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => dismissToast(t.id), 4500)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[80] flex flex-col gap-2 max-w-[calc(100vw-1.5rem)] sm:max-w-sm w-[360px]">
      {toasts.map((t) => {
        const Icon =
          t.tone === "ok"
            ? CheckCircle2
            : t.tone === "warn"
            ? AlertTriangle
            : t.tone === "err"
            ? XCircle
            : Info;
        const tone =
          t.tone === "ok"
            ? "ring-emerald-200 bg-emerald-50/80 text-emerald-700"
            : t.tone === "warn"
            ? "ring-amber-200 bg-amber-50/80 text-amber-700"
            : t.tone === "err"
            ? "ring-rose-200 bg-rose-50/80 text-rose-700"
            : "ring-accent-200/70 bg-accent-50/80 text-accent-700";
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 rounded-xl ring-1 px-3.5 py-3 shadow-pop backdrop-blur ${tone}`}
          >
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0 text-ink-900">
              <div className="text-sm font-semibold leading-tight">{t.title}</div>
              {t.body && (
                <div className="text-[12px] text-ink-600 mt-0.5">{t.body}</div>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-ink-400 hover:text-ink-700 -mr-1 -mt-0.5"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
