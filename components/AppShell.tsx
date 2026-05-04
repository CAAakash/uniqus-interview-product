"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  GitMerge,
  SlidersHorizontal,
  FileBarChart2,
  ScrollText,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  CalendarRange,
  Building2,
  Sparkles,
} from "lucide-react";
import { period, entities, periodOptions, currentUser } from "@/lib/data";
import type { Unit } from "@/lib/format";
import { unitLabel } from "@/lib/format";
import { useApp } from "@/lib/store";

export type ViewKey =
  | "dashboard"
  | "tb"
  | "ic"
  | "adjustments"
  | "fs"
  | "notes";

const NAV: { key: ViewKey; label: string; icon: any; badge?: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tb", label: "Trial Balance", icon: FileSpreadsheet, badge: "6" },
  { key: "ic", label: "Inter-co Eliminations", icon: GitMerge, badge: "2" },
  { key: "adjustments", label: "Consol Adjustments", icon: SlidersHorizontal },
  { key: "fs", label: "Consolidated FS", icon: FileBarChart2 },
  { key: "notes", label: "Notes & Disclosures", icon: ScrollText },
];

const VIEW_TITLES: Record<ViewKey, { title: string; sub: string }> = {
  dashboard: {
    title: "Group Consolidation Workspace",
    sub: "Acme Industries Limited (Consolidated)",
  },
  tb: { title: "Trial Balance Workspace", sub: "Map ledgers to FS grouping" },
  ic: { title: "Inter-company Eliminations", sub: "Auto-match • Variance review" },
  adjustments: { title: "Consolidation Adjustments", sub: "Goodwill • NCI • Fair value • Ind AS" },
  fs: { title: "Consolidated Financial Statements", sub: "Schedule III · Ind AS" },
  notes: { title: "Notes & Disclosures", sub: "Auto-generated draft" },
};

export default function AppShell({
  view,
  setView,
  unit,
  setUnit,
  children,
}: {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  unit: Unit;
  setUnit: (u: Unit) => void;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const headerInfo = VIEW_TITLES[view];
  const { openDialog, runConsolidation, notifs, periodId } = useApp();
  const activePeriod = periodOptions.find((p) => p.id === periodId) ?? periodOptions[0];

  return (
    <div className="min-h-screen bg-ink-50 text-ink-800">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink-200 bg-white/90 backdrop-blur px-3">
        <button
          onClick={() => setNavOpen(true)}
          className="btn btn-ghost -ml-1.5"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <button
          onClick={() => openDialog({ type: "command-palette" })}
          className="btn btn-ghost -mr-1.5"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-ink-200 bg-white transition-transform duration-200 ease-out",
            "lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:w-64 lg:translate-x-0",
            navOpen ? "translate-x-0 shadow-pop" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex h-14 items-center justify-between px-4 border-b border-ink-100">
            <Logo />
            <button
              className="btn btn-ghost lg:hidden -mr-1.5"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-3 py-3 border-b border-ink-100">
            <button
              onClick={() => openDialog({ type: "period-picker" })}
              className="w-full text-left rounded-lg bg-ink-50 ring-1 ring-ink-200/70 px-3 py-2.5 hover:bg-ink-100/70 transition-colors"
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-ink-500 font-semibold">
                <Building2 className="h-3.5 w-3.5" />
                Group
              </div>
              <div className="mt-0.5 text-sm font-semibold text-ink-900 leading-tight">
                Acme Industries Limited
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-500">
                <CalendarRange className="h-3.5 w-3.5" />
                {activePeriod.label} · {period.framework}
              </div>
            </button>
          </div>

          <nav className="px-2 py-2 space-y-0.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.key === view;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setView(item.key);
                    setNavOpen(false);
                  }}
                  className={[
                    "nav-item w-full",
                    active ? "nav-item-active" : "",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={active ? "pill pill-blue" : "pill pill-slate"}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-3 mt-4">
            <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold px-1.5 mb-1.5">
              Entities ({entities.length})
            </div>
            <div className="space-y-0.5">
              {entities.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setView("tb");
                    setNavOpen(false);
                  }}
                  className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-ink-600 hover:bg-ink-50 text-left"
                >
                  <span
                    className={[
                      "dot",
                      e.status === "consolidated" && "bg-emerald-500",
                      e.status === "elim_pending" && "bg-amber-500",
                      e.status === "mapping_done" && "bg-accent-500",
                      e.status === "tb_uploaded" && "bg-rose-500",
                      e.status === "draft" && "bg-ink-300",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                  <span className="flex-1 truncate">{e.shortName}</span>
                  <span className="text-[10px] text-ink-400 font-mono">
                    {e.holdingPct}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-ink-100 px-3 py-3 bg-white">
            <button
              onClick={() => openDialog({ type: "user-menu" })}
              className="flex items-center gap-2.5 w-full rounded-lg p-1.5 hover:bg-ink-50 transition-colors"
            >
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 grid place-items-center text-white text-xs font-semibold">
                {currentUser.initials}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-sm font-medium text-ink-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-ink-500 truncate">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-ink-400 shrink-0" />
            </button>
          </div>
        </aside>

        {/* Backdrop */}
        {navOpen && (
          <div
            className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
            onClick={() => setNavOpen(false)}
            aria-hidden
          />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Desktop top bar */}
          <div className="hidden lg:flex sticky top-0 z-30 h-14 items-center gap-3 border-b border-ink-200 bg-white/90 backdrop-blur px-5">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-ink-500">Acme Industries</span>
              <span className="text-ink-300">/</span>
              <span className="text-ink-500">Consolidation</span>
              <span className="text-ink-300">/</span>
              <span className="font-medium text-ink-900">{headerInfo.title}</span>
            </div>
            <div className="flex-1" />
            <UnitToggle unit={unit} setUnit={setUnit} />
            <PeriodPill onClick={() => openDialog({ type: "period-picker" })} label={activePeriod.label} />
            <button
              onClick={() => openDialog({ type: "command-palette" })}
              className="btn btn-ghost"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => openDialog({ type: "notifications" })}
              className="btn btn-ghost relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
            <button onClick={runConsolidation} className="btn btn-primary">
              <Sparkles className="h-4 w-4" />
              Run consolidation
            </button>
          </div>

          {/* Page header */}
          <div className="px-4 sm:px-5 lg:px-8 pt-5 pb-3">
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-[22px] font-semibold tracking-tight text-ink-900 leading-tight">
                  {headerInfo.title}
                </h1>
                <p className="text-sm text-ink-500 mt-0.5">{headerInfo.sub}</p>
              </div>
              <div className="flex-1" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="pill pill-blue">
                  <ShieldCheck className="h-3 w-3" />
                  Ind AS · Schedule III
                </span>
                <span className="pill pill-slate">
                  Reporting: {period.reportingDate}
                </span>
              </div>
            </div>
            {/* Mobile-only unit + period row */}
            <div className="lg:hidden flex flex-wrap items-center gap-2 mt-3">
              <UnitToggle unit={unit} setUnit={setUnit} />
              <PeriodPill onClick={() => openDialog({ type: "period-picker" })} label={activePeriod.label} />
              <div className="flex-1" />
              <button
                onClick={() => openDialog({ type: "notifications" })}
                className="btn btn-ghost relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>
              <button onClick={runConsolidation} className="btn btn-primary">
                <Sparkles className="h-4 w-4" />
                Run
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-5 lg:px-8 pb-12">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-ink-900 to-ink-700 grid place-items-center shadow-soft">
        <div className="h-3 w-3 rounded-sm bg-gradient-to-tr from-accent-500 to-emerald-400" />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight text-ink-900">
          ConsolidatePro
        </div>
        <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
          Group · Ind AS
        </div>
      </div>
    </div>
  );
}

function UnitToggle({
  unit,
  setUnit,
}: {
  unit: Unit;
  setUnit: (u: Unit) => void;
}) {
  const opts: Unit[] = ["lakh", "crore", "abs"];
  return (
    <div className="inline-flex rounded-lg ring-1 ring-ink-200 bg-white p-0.5 text-xs">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => setUnit(o)}
          className={[
            "px-2.5 py-1 rounded-md font-medium transition-colors",
            unit === o
              ? "bg-ink-900 text-white"
              : "text-ink-500 hover:text-ink-800",
          ].join(" ")}
        >
          {unitLabel[o]}
        </button>
      ))}
    </div>
  );
}

function PeriodPill({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
    >
      <CalendarRange className="h-3.5 w-3.5 text-ink-500" />
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
    </button>
  );
}
