"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  ArrowRight,
  Wand2,
  ChevronRight,
} from "lucide-react";
import { entities, icEntries } from "@/lib/data";
import type { Unit } from "@/lib/format";
import { fmt } from "@/lib/format";

const STATUS_META = {
  matched: { cls: "pill-green", icon: CheckCircle2, label: "Matched" },
  mismatch: { cls: "pill-amber", icon: AlertCircle, label: "Mismatch" },
  unmatched: { cls: "pill-red", icon: XCircle, label: "Unmatched" },
} as const;

export default function ICEliminations({ unit }: { unit: Unit }) {
  const [filter, setFilter] = useState<"all" | "matched" | "mismatch" | "unmatched">(
    "all"
  );

  const counts = useMemo(() => {
    const c = { matched: 0, mismatch: 0, unmatched: 0 };
    icEntries.forEach((e) => c[e.status]++);
    return c;
  }, []);

  const filtered = filter === "all" ? icEntries : icEntries.filter((e) => e.status === filter);

  const totalElim = useMemo(
    () => icEntries.filter((e) => e.status === "matched").reduce((a, e) => a + e.fromAmount, 0),
    []
  );

  const lookup = (id: string) =>
    entities.find((e) => e.id === id)?.shortName ?? id;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Total IC pairs" value={`${icEntries.length}`} tone="slate" />
        <SummaryCard label="Matched" value={`${counts.matched}`} tone="green" />
        <SummaryCard label="Mismatch / Unmatched" value={`${counts.mismatch + counts.unmatched}`} tone="amber" />
        <SummaryCard
          label="Elimination total"
          value={fmt(totalElim, unit)}
          tone="blue"
          mono
        />
      </div>

      {/* Filters & action */}
      <div className="card p-3 sm:p-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg ring-1 ring-ink-200 bg-white p-0.5 text-xs">
          {(["all", "matched", "mismatch", "unmatched"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={[
                "px-2.5 py-1 rounded-md font-medium transition-colors capitalize",
                filter === k
                  ? "bg-ink-900 text-white"
                  : "text-ink-500 hover:text-ink-800",
              ].join(" ")}
            >
              {k === "all" ? "All" : STATUS_META[k].label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="btn btn-outline text-xs">
          <Wand2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Auto-match</span>
          <span className="sm:hidden">Auto</span>
        </button>
        <button className="btn btn-primary text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Manual elimination JE</span>
          <span className="sm:hidden">JE</span>
        </button>
      </div>

      {/* Table (desktop) */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr>
                <th className="table-th w-[88px]">ID</th>
                <th className="table-th">Type</th>
                <th className="table-th">Counterparty pair</th>
                <th className="table-th text-right">From booked</th>
                <th className="table-th text-right">To booked</th>
                <th className="table-th text-right">Δ</th>
                <th className="table-th">Status</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const meta = STATUS_META[e.status];
                const Icon = meta.icon;
                return (
                  <tr key={e.id} className="row-hover">
                    <td className="table-td num text-ink-500">{e.id}</td>
                    <td className="table-td">
                      <div className="font-medium text-ink-900">{e.type}</div>
                      {e.note && (
                        <div className="text-[11px] text-ink-500 mt-0.5 max-w-[260px]">
                          {e.note}
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5 text-ink-700">
                        <span className="font-medium">{lookup(e.fromEntity)}</span>
                        <ArrowRight className="h-3 w-3 text-ink-400" />
                        <span className="font-medium">{lookup(e.toEntity)}</span>
                      </div>
                      {e.ind_as && (
                        <span className="pill pill-blue mt-1">{e.ind_as}</span>
                      )}
                    </td>
                    <td className="table-td num text-right">
                      {fmt(e.fromAmount, unit)}
                    </td>
                    <td className="table-td num text-right">
                      {fmt(e.toAmount, unit)}
                    </td>
                    <td className="table-td num text-right">
                      {e.delta ? (
                        <span className="text-rose-600 font-medium">
                          {fmt(e.delta, unit)}
                        </span>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                    <td className="table-td">
                      <span className={`pill ${meta.cls}`}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <button className="text-ink-400 hover:text-ink-700">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden space-y-2.5">
        {filtered.map((e) => {
          const meta = STATUS_META[e.status];
          const Icon = meta.icon;
          return (
            <div key={e.id} className="card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] text-ink-500 num">{e.id}</div>
                  <div className="font-medium text-ink-900 mt-0.5">{e.type}</div>
                </div>
                <span className={`pill ${meta.cls} shrink-0`}>
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-700">
                <span className="font-medium">{lookup(e.fromEntity)}</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-400" />
                <span className="font-medium">{lookup(e.toEntity)}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-ink-500">From</div>
                  <div className="num font-medium">{fmt(e.fromAmount, unit)}</div>
                </div>
                <div>
                  <div className="text-ink-500">To</div>
                  <div className="num font-medium">{fmt(e.toAmount, unit)}</div>
                </div>
                <div>
                  <div className="text-ink-500">Δ</div>
                  <div className="num font-medium text-rose-600">
                    {e.delta ? fmt(e.delta, unit) : "—"}
                  </div>
                </div>
              </div>
              {e.note && (
                <div className="mt-2 text-[11px] text-ink-500">{e.note}</div>
              )}
              {e.ind_as && (
                <span className="pill pill-blue mt-2">{e.ind_as}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone: "slate" | "green" | "amber" | "blue";
  mono?: boolean;
}) {
  const ring =
    tone === "green"
      ? "ring-emerald-200 bg-emerald-50/50"
      : tone === "amber"
      ? "ring-amber-200 bg-amber-50/50"
      : tone === "blue"
      ? "ring-accent-200/60 bg-accent-50/40"
      : "ring-ink-200 bg-white";
  return (
    <div className={`rounded-xl ring-1 ${ring} p-3.5 shadow-soft`}>
      <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
        {label}
      </div>
      <div className={`mt-1.5 text-xl font-semibold text-ink-900 ${mono ? "num" : ""}`}>
        {value}
      </div>
    </div>
  );
}
