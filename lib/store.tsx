"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  adjustments as seedAdj,
  icEntries as seedIC,
  tbLogi as seedTB,
  notifications as seedNotifs,
  periodOptions,
  type Adjustment,
  type ICEntry,
  type LedgerLine,
  type Notification,
} from "./data";

type ToastTone = "ok" | "warn" | "info" | "err";
export type Toast = { id: number; tone: ToastTone; title: string; body?: string };

export type DialogKind =
  | { type: "none" }
  | { type: "run" }
  | { type: "upload-tb"; entityId: string }
  | { type: "map-ledger"; ledger: LedgerLine }
  | { type: "manual-je" }
  | { type: "add-entity" }
  | { type: "command-palette" }
  | { type: "notifications" }
  | { type: "user-menu" }
  | { type: "period-picker" }
  | { type: "more-filters" }
  | { type: "edit-adjustment"; adj: Adjustment }
  | { type: "workings"; adj: Adjustment }
  | { type: "preview-pdf"; statement: "pnl" | "bs" | "cf" }
  | { type: "drill"; rowId: string; rowLabel: string; col: string; colLabel: string; value: number };

interface AppState {
  toasts: Toast[];
  dialog: DialogKind;
  ic: ICEntry[];
  adj: Adjustment[];
  tb: LedgerLine[];
  notifs: Notification[];
  periodId: string;
  busyRun: number; // 0–100; >0 means run-consolidation in progress
}

type Action =
  | { type: "toast/push"; toast: Omit<Toast, "id"> }
  | { type: "toast/dismiss"; id: number }
  | { type: "dialog/open"; dialog: DialogKind }
  | { type: "dialog/close" }
  | { type: "ic/auto-match" }
  | { type: "ic/post-je"; entry: Omit<ICEntry, "id" | "status"> & { status?: ICEntry["status"] } }
  | { type: "adj/post"; id: string }
  | { type: "adj/edit"; adj: Adjustment }
  | { type: "tb/map"; code: string; fsGroup: string }
  | { type: "tb/upload-mock"; lines: number; entityId: string }
  | { type: "notifs/clear" }
  | { type: "period/set"; periodId: string }
  | { type: "run/tick"; pct: number }
  | { type: "run/done" };

let _toastId = 1;

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "toast/push":
      return { ...state, toasts: [...state.toasts, { id: _toastId++, ...action.toast }] };
    case "toast/dismiss":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "dialog/open":
      return { ...state, dialog: action.dialog };
    case "dialog/close":
      return { ...state, dialog: { type: "none" } };
    case "ic/auto-match": {
      const ic = state.ic.map((e) =>
        e.status === "matched" ? e : { ...e, status: "matched" as const, delta: 0, toAmount: e.fromAmount, note: e.note ? `${e.note} · auto-matched` : "Auto-matched" }
      );
      return { ...state, ic };
    }
    case "ic/post-je": {
      const id = `IC-${String(state.ic.length + 1).padStart(3, "0")}`;
      const status = action.entry.status ?? "matched";
      return {
        ...state,
        ic: [...state.ic, { ...action.entry, id, status } as ICEntry],
      };
    }
    case "adj/post":
      return {
        ...state,
        adj: state.adj.map((a) => (a.id === action.id ? { ...a, status: "posted" } : a)),
      };
    case "adj/edit":
      return {
        ...state,
        adj: state.adj.map((a) => (a.id === action.adj.id ? action.adj : a)),
      };
    case "tb/map":
      return {
        ...state,
        tb: state.tb.map((l) =>
          l.code === action.code ? { ...l, fsGroup: action.fsGroup, flagged: false } : l
        ),
      };
    case "tb/upload-mock":
      return state; // mock: no actual change beyond toast
    case "notifs/clear":
      return { ...state, notifs: [] };
    case "period/set":
      return { ...state, periodId: action.periodId };
    case "run/tick":
      return { ...state, busyRun: action.pct };
    case "run/done":
      return { ...state, busyRun: 0 };
    default:
      return state;
  }
}

const initialState: AppState = {
  toasts: [],
  dialog: { type: "none" },
  ic: seedIC,
  adj: seedAdj,
  tb: seedTB,
  notifs: seedNotifs,
  periodId: periodOptions.find((p) => p.current)?.id ?? "fy25",
  busyRun: 0,
};

interface AppContextShape extends AppState {
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  openDialog: (d: DialogKind) => void;
  closeDialog: () => void;
  autoMatchIC: () => void;
  postJE: (e: Omit<ICEntry, "id" | "status"> & { status?: ICEntry["status"] }) => void;
  postAdj: (id: string) => void;
  editAdj: (a: Adjustment) => void;
  mapLedger: (code: string, fsGroup: string) => void;
  uploadTBMock: (entityId: string, lines: number) => void;
  clearNotifs: () => void;
  setPeriod: (id: string) => void;
  runConsolidation: () => Promise<void>;
}

const AppContext = createContext<AppContextShape | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const runRef = useRef<NodeJS.Timeout | null>(null);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    dispatch({ type: "toast/push", toast: t });
    setTimeout(() => {
      // best-effort auto-dismiss after 4s
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    dispatch({ type: "toast/dismiss", id });
  }, []);

  const openDialog = useCallback((d: DialogKind) => dispatch({ type: "dialog/open", dialog: d }), []);
  const closeDialog = useCallback(() => dispatch({ type: "dialog/close" }), []);

  const autoMatchIC = useCallback(() => {
    dispatch({ type: "ic/auto-match" });
    toast({
      tone: "ok",
      title: "Auto-match complete",
      body: "All inter-company pairs reconciled. Cut-off variances posted to suspense.",
    });
  }, [toast]);

  const postJE = useCallback(
    (e: Omit<ICEntry, "id" | "status"> & { status?: ICEntry["status"] }) => {
      dispatch({ type: "ic/post-je", entry: e });
      toast({ tone: "ok", title: "Elimination JE posted", body: "Group ledger updated." });
    },
    [toast]
  );

  const postAdj = useCallback(
    (id: string) => {
      dispatch({ type: "adj/post", id });
      toast({ tone: "ok", title: "Adjustment posted", body: `${id} moved to posted status.` });
    },
    [toast]
  );

  const editAdj = useCallback(
    (a: Adjustment) => {
      dispatch({ type: "adj/edit", adj: a });
      toast({ tone: "info", title: "Adjustment updated", body: `${a.id} changes saved.` });
    },
    [toast]
  );

  const mapLedger = useCallback(
    (code: string, fsGroup: string) => {
      dispatch({ type: "tb/map", code, fsGroup });
      toast({ tone: "ok", title: "Ledger mapped", body: `${code} → ${fsGroup}` });
    },
    [toast]
  );

  const uploadTBMock = useCallback(
    (entityId: string, lines: number) => {
      dispatch({ type: "tb/upload-mock", entityId, lines });
      toast({
        tone: "ok",
        title: "Trial balance uploaded",
        body: `${lines} ledger lines imported. Mapping rules auto-applied to ${Math.round(lines * 0.86)}.`,
      });
    },
    [toast]
  );

  const clearNotifs = useCallback(() => {
    dispatch({ type: "notifs/clear" });
    toast({ tone: "info", title: "Notifications cleared" });
  }, [toast]);

  const setPeriod = useCallback(
    (id: string) => {
      dispatch({ type: "period/set", periodId: id });
      const opt = periodOptions.find((p) => p.id === id);
      toast({ tone: "info", title: "Period changed", body: opt?.label });
    },
    [toast]
  );

  const runConsolidation = useCallback(async () => {
    if (runRef.current) return;
    openDialog({ type: "run" });
    for (let p = 0; p <= 100; p += 8) {
      await new Promise((r) => {
        runRef.current = setTimeout(r, 220);
      });
      dispatch({ type: "run/tick", pct: p });
    }
    runRef.current = null;
    dispatch({ type: "run/done" });
    toast({
      tone: "ok",
      title: "Consolidation completed",
      body: "All 6 entities consolidated. FS pack ready for review.",
    });
    setTimeout(() => dispatch({ type: "dialog/close" }), 600);
  }, [openDialog, toast]);

  const value = useMemo<AppContextShape>(
    () => ({
      ...state,
      toast,
      dismissToast,
      openDialog,
      closeDialog,
      autoMatchIC,
      postJE,
      postAdj,
      editAdj,
      mapLedger,
      uploadTBMock,
      clearNotifs,
      setPeriod,
      runConsolidation,
    }),
    [state, toast, dismissToast, openDialog, closeDialog, autoMatchIC, postJE, postAdj, editAdj, mapLedger, uploadTBMock, clearNotifs, setPeriod, runConsolidation]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// auto-dismiss helper hook used by ToastHost
export function useAutoDismiss(ms = 4000) {
  const { toasts, dismissToast } = useApp();
  const seen = useRef<Set<number>>(new Set());
  useState(() => {
    const id = setInterval(() => {
      // no-op
    }, ms);
    return () => clearInterval(id);
  });
  toasts.forEach((t) => {
    if (!seen.current.has(t.id)) {
      seen.current.add(t.id);
      setTimeout(() => dismissToast(t.id), ms);
    }
  });
}
