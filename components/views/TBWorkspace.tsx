"use client";

import { useMemo, useState } from "react";
import {
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { entities, tbLogi } from "@/lib/data";
import type { Unit } from "@/lib/format";
import { fmt } from "@/lib/format";

export default function TBWorkspace({ unit }: { unit: Unit }) {
  const [entityId, setEntityId] = useState("logi");
  const [filter, setFilter] = useState<"all" | "unmapped" | "ic">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return tbLogi.filter((r) => {
      if (filter === "unmapped" && r.fsGroup) return false;
      if (filter === "ic" && !r.note?.toLowerCase().includes("inter")) return false;
      if (q && !`${r.code} ${r.ledger} ${r.fsGroup ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [filter, q]);

  const totals = useMemo(() => {
    const tDr = tbLogi.reduce((a, r) => a + r.debit, 0);
    const tCr = tbLogi.reduce((a, r) => a + r.credit, 0);
    const mapped = tbLogi.filter((r) => !!r.fsGroup).length;
    const unmapped = tbLogi.length - mapped;
    return { tDr, tCr, mapped, unmapped, total: tbLogi.length };
  }, []);

  const entity = entities.find((e) => e.id === entityId)!;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* entity selector */}
          <div className="relative">
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="appearance-none rounded-lg ring-1 ring-ink-200 bg-white pl-9 pr-8 py-2 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.shortName} · {e.currency}
                </option>
              ))}
            </select>
            <FileSpreadsheet className="h-4 w-4 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="h-3.5 w-3.5 text-ink-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-500">
            <span className="pill pill-slate">
              {entity.holdingPct}% holding
            </span>
            {entity.ncIPct > 0 && (
              <span className="pill pill-amber">NCI {entity.ncIPct}%</span>
            )}
          </div>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-2 text-xs text-ink-500">
            <span className="pill pill-green">
              <CheckCircle2 className="h-3 w-3" />
              {totals.mapped} mapped
            </span>
            <span className="pill pill-red">
              <AlertCircle className="h-3 w-3" />
              {totals.unmapped} unmapped
            </span>
          </div>

          <button className="btn btn-primary text-xs">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Upload TB</span>
            <span className="sm:hidden">TB</span>
          </button>
        </div>

        {/* Search + filters */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="h-4 w-4 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ledger code or name…"
              className="w-full rounded-lg ring-1 ring-ink-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div className="inline-flex rounded-lg ring-1 ring-ink-200 bg-white p-0.5 text-xs">
            {(["all", "unmapped", "ic"] as const).map((k) => (
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
                {k === "ic" ? "Inter-co" : k}
              </button>
            ))}
          </div>
          <button className="btn btn-outline text-xs">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">More filters</span>
          </button>
        </div>

        {/* Mobile mapping summary */}
        <div className="md:hidden mt-3 flex items-center gap-2">
          <span className="pill pill-green">
            <CheckCircle2 className="h-3 w-3" />
            {totals.mapped} mapped
          </span>
          <span className="pill pill-red">
            <AlertCircle className="h-3 w-3" />
            {totals.unmapped} unmapped
          </span>
        </div>
      </div>

      {/* Ledger table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr>
                <th className="table-th w-[80px]">Code</th>
                <th className="table-th">Ledger</th>
                <th className="table-th text-right">Debit</th>
                <th className="table-th text-right">Credit</th>
                <th className="table-th">FS group</th>
                <th className="table-th hidden lg:table-cell">Flag</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code} className="row-hover">
                  <td className="table-td num text-ink-500">{r.code}</td>
                  <td className="table-td">
                    <div className="font-medium text-ink-900">{r.ledger}</div>
                    {r.note && (
                      <div className="text-[11px] text-ink-500 mt-0.5">
                        {r.note}
                      </div>
                    )}
                  </td>
                  <td className="table-td num text-right">{fmt(r.debit, unit)}</td>
                  <td className="table-td num text-right">{fmt(r.credit, unit)}</td>
                  <td className="table-td">
                    {r.fsGroup ? (
                      <span className="inline-flex items-center gap-1.5 text-ink-700">
                        <span className="dot bg-emerald-500" />
                        <span className="truncate max-w-[200px]">{r.fsGroup}</span>
                      </span>
                    ) : (
                      <button className="inline-flex items-center gap-1.5 text-rose-600 font-medium hover:underline">
                        <span className="dot bg-rose-500" />
                        Map ledger →
                      </button>
                    )}
                  </td>
                  <td className="table-td hidden lg:table-cell">
                    {r.note?.toLowerCase().includes("inter") && (
                      <span className="pill pill-amber">IC</span>
                    )}
                    {r.note?.toLowerCase().includes("ind as") && (
                      <span className="pill pill-blue">{r.note?.match(/Ind AS \d+/)?.[0]}</span>
                    )}
                    {r.flagged && <span className="pill pill-red">Review</span>}
                  </td>
                </tr>
              ))}
              <tr className="bg-ink-50/70 sticky bottom-0">
                <td className="table-td font-semibold text-ink-700"></td>
                <td className="table-td font-semibold text-ink-700">
                  Total ({rows.length} of {tbLogi.length})
                </td>
                <td className="table-td num font-semibold text-right">
                  {fmt(totals.tDr, unit)}
                </td>
                <td className="table-td num font-semibold text-right">
                  {fmt(totals.tCr, unit)}
                </td>
                <td className="table-td" colSpan={2}>
                  <span className="pill pill-green">
                    <CheckCircle2 className="h-3 w-3" />
                    Dr = Cr (tie out)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
