"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen grid place-items-center bg-ink-50 p-6">
      <div className="card max-w-md w-full p-6 text-center">
        <div className="h-10 w-10 mx-auto rounded-lg bg-rose-50 ring-1 ring-rose-200 grid place-items-center mb-3">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
        </div>
        <h2 className="text-base font-semibold text-ink-900">Something went wrong</h2>
        <p className="text-sm text-ink-500 mt-1">
          {error.message || "An unexpected error occurred while rendering this view."}
        </p>
        {error.digest && (
          <div className="num text-[11px] text-ink-400 mt-2">ref: {error.digest}</div>
        )}
        <button onClick={reset} className="btn btn-primary text-xs mt-4">
          <RefreshCcw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    </div>
  );
}
