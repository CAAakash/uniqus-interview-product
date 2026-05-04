"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  XCircle,
  Globe2,
  Building2,
  TrendingUp,
  Wallet,
  Layers,
  Activity,
} from "lucide-react";
import { entities, consolidationSteps, healthChecks, period } from "@/lib/data";
import type { Unit } from "@/lib/format";
import { fmt, unitShort } from "@/lib/format";

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  consolidated: { label: "Consolidated", cls: "pill-green" },
  elim_pending: { label: "Eliminations pending", cls: "pill-amber" },
  mapping_done: { label: "Mapping done", cls: "pill-blue" },
  tb_uploaded: { label: "TB uploaded", cls: "pill-red" },
  draft: { label: "Draft", cls: "pill-slate" },
};

export default function Dashboard({ unit }: { unit: Unit }) {
  const totalRevenue = 12231400; // INR '000
  const totalPAT = 1626100;
  const grossAssets = 17347050;

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={TrendingUp}
          label="Group revenue"
          value={fmt(totalRevenue, unit)}
          unit={unitShort[unit]}
          delta="+8.4% YoY"
          tone="up"
        />
        <Kpi
          icon={Wallet}
          label="Profit after tax"
          value={fmt(totalPAT, unit)}
          unit={unitShort[unit]}
          delta="+12.1% YoY"
          tone="up"
        />
        <Kpi
          icon={Layers}
          label="Total assets"
          value={fmt(grossAssets, unit)}
          unit={unitShort[unit]}
          delta="+₹6.4 Cr QoQ"
          tone="up"
        />
        <Kpi
          icon={Activity}
          label="Consol progress"
          value="62%"
          unit=""
          delta="3 of 7 steps"
          tone="neutral"
        />
      </div>

      {/* Progress tracker */}
      <section className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-ink-900">
              Consolidation pipeline · {period.label}
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Auto-advances when each step completes for all in-scope entities.
            </p>
          </div>
          <span className="hidden sm:inline-flex pill pill-blue">
            Last run: 2 hr ago
          </span>
        </div>
        <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {consolidationSteps.map((s, i) => {
            const isDone = s.state === "done";
            const isActive = s.state === "active";
            return (
              <li
                key={s.id}
                className={[
                  "rounded-lg ring-1 px-3 py-2.5 transition-colors",
                  isDone && "bg-emerald-50/60 ring-emerald-200",
                  isActive && "bg-amber-50/60 ring-amber-200",
                  !isDone && !isActive && "bg-ink-50 ring-ink-200/70",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "h-5 w-5 rounded-full grid place-items-center text-[10px] font-semibold",
                      isDone && "bg-emerald-600 text-white",
                      isActive && "bg-amber-500 text-white",
                      !isDone && !isActive && "bg-white text-ink-400 ring-1 ring-ink-300",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                    Step {i + 1}
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium text-ink-900 leading-tight">
                  {s.label}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Entities table */}
        <section className="xl:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-ink-100">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">
                Group entities
              </h2>
              <p className="text-xs text-ink-500 mt-0.5">
                {entities.length} entities · 1 acquired this period
              </p>
            </div>
            <button className="btn btn-outline text-xs">
              Add entity
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th">Entity</th>
                  <th className="table-th">Type</th>
                  <th className="table-th text-right">Holding</th>
                  <th className="table-th">CCY</th>
                  <th className="table-th">Status</th>
                  <th className="table-th hidden md:table-cell">Last sync</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((e) => {
                  const pill = STATUS_PILL[e.status];
                  return (
                    <tr key={e.id} className="row-hover">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 shrink-0 rounded-lg bg-ink-100 grid place-items-center">
                            {e.currency === "INR" ? (
                              <Building2 className="h-4 w-4 text-ink-500" />
                            ) : (
                              <Globe2 className="h-4 w-4 text-ink-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-ink-900 truncate">
                              {e.name}
                            </div>
                            <div className="text-[11px] text-ink-500 truncate">
                              {e.id === "north"
                                ? `Acquired ${e.acquired}`
                                : e.shortName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="capitalize text-ink-600">
                          {e.type}
                        </span>
                      </td>
                      <td className="table-td text-right num">
                        {e.holdingPct}%
                        {e.ncIPct > 0 && (
                          <span className="text-[11px] text-ink-400 ml-1">
                            · NCI {e.ncIPct}%
                          </span>
                        )}
                      </td>
                      <td className="table-td">
                        <span className="num text-ink-700">{e.currency}</span>
                        {e.currency !== "INR" && (
                          <span className="text-[11px] text-ink-400 ml-1.5">
                            @ {e.fxRate}
                          </span>
                        )}
                      </td>
                      <td className="table-td">
                        <span className={`pill ${pill.cls}`}>
                          <span
                            className={[
                              "dot",
                              e.status === "consolidated" && "bg-emerald-500",
                              e.status === "elim_pending" && "bg-amber-500",
                              e.status === "mapping_done" && "bg-accent-500",
                              e.status === "tb_uploaded" && "bg-rose-500",
                              e.status === "draft" && "bg-ink-400",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          />
                          {pill.label}
                        </span>
                      </td>
                      <td className="table-td hidden md:table-cell text-ink-500 text-xs">
                        {e.lastSync}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Health check */}
        <section className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">
                Consolidation health check
              </h2>
              <p className="text-xs text-ink-500 mt-0.5">
                Auto-runs after every TB upload
              </p>
            </div>
            <span className="pill pill-amber">2 to review</span>
          </div>
          <ul className="space-y-2">
            {healthChecks.map((h) => {
              const Icon =
                h.status === "ok"
                  ? CheckCircle2
                  : h.status === "warn"
                  ? AlertTriangle
                  : XCircle;
              const tone =
                h.status === "ok"
                  ? "text-emerald-600"
                  : h.status === "warn"
                  ? "text-amber-600"
                  : "text-rose-600";
              return (
                <li
                  key={h.id}
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-ink-50 transition-colors"
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tone}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-sm font-medium text-ink-900 leading-tight">
                        {h.label}
                      </div>
                      {h.delta && (
                        <span className="num text-[11px] text-ink-500 shrink-0">
                          {h.delta}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-ink-500 mt-0.5">
                      {h.detail}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  unit: string;
  delta: string;
  tone: "up" | "down" | "neutral";
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
          {label}
        </div>
        <Icon className="h-4 w-4 text-ink-400" />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <div className="num text-2xl font-semibold text-ink-900 leading-none">
          {value}
        </div>
        {unit && <div className="text-xs text-ink-500">{unit}</div>}
      </div>
      <div
        className={[
          "mt-2 text-[11px] font-medium",
          tone === "up" && "text-emerald-600",
          tone === "down" && "text-rose-600",
          tone === "neutral" && "text-ink-500",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {delta}
      </div>
    </div>
  );
}
