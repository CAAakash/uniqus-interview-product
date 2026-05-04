"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  } as const;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-ink-900/40 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`card w-full ${widths[size]} max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-pop`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-ink-100">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-base font-semibold text-ink-900 leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-ink-500 mt-1">{description}</p>
              )}
            </div>
            <button
              className="btn btn-ghost -mr-1.5 -mt-1.5"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto thin-scrollbar p-4 sm:p-5">{children}</div>
        {footer && (
          <div className="border-t border-ink-100 p-3 sm:p-4 flex flex-wrap items-center justify-end gap-2 bg-ink-50/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
