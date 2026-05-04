"use client";

import { useState } from "react";
import { Download, FileText, Eye } from "lucide-react";
import { entities, pnlRows, bsRows, cashFlowRows } from "@/lib/data";
import type { FSRow } from "@/lib/data";
import type { Unit } from "@/lib/format";
import { fmt } from "@/lib/format";

type Statement = "pnl" | "bs" | "cf";

const TABS: { key: Statement; label: string; rows: FSRow[] }[] = [
  { key: "pnl", label: "Profit & Loss", rows: pnlRows },
  { key: "bs", label: "Balance Sheet", rows: bsRows },
  { key: "cf", label: "Cash Flow", rows: cashFlowRows },
];

export default function ConsolidatedFS({ unit }: { unit: Unit }) {
  const [tab, setTab] = useState<Statement>("pnl");
  const [drill, setDrill] = useState<{ row: FSRow; col: string } | null>(null);
  const [schedIII, setSchedIII] = useState(true);

  const cur = TABS.find((t) => t.key === tab)!;
  const cols = [
    ...entities.map((e) => ({ key: e.id, label: e.shortName, sub: e.currency })),
    { key: "elim", label: "Eliminations", sub: "Adj" },
    { key: "consol", label: "Consolidated", sub: "Group" },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg ring-1 ring-ink-200 bg-white p-0.5 text-xs">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "px-3 py-1.5 rounded-md font-medium transition-colors",
                tab === t.key
                  ? "bg-ink-900 text-white"
                  : "text-ink-500 hover:text-ink-800",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 ml-1 text-xs text-ink-600 cursor-pointer">
          <input
            type="checkbox"
            checked={schedIII}
            onChange={(e) => setSchedIII(e.target.checked)}
            className="accent-ink-900"
          />
          Schedule III format
        </label>
        <div className="flex-1" />
        <button className="btn btn-outline text-xs">
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Preview PDF</span>
        </button>
        <button className="btn btn-primary text-xs">
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {/* FS table with frozen first column + sticky header */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto thin-scrollbar relative">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="table-th sticky left-0 z-20 bg-ink-50/95 min-w-[220px] sm:min-w-[280px] backdrop-blur">
                  Particulars
                </th>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    className={[
                      "table-th text-right whitespace-nowrap min-w-[110px]",
                      c.key === "consol" && "bg-accent-50/80 text-accent-700",
                      c.key === "elim" && "bg-amber-50/60 text-amber-700",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="font-semibold">{c.label}</div>
                    <div className="text-[10px] font-normal text-ink-400 normal-case">
                      {c.sub}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cur.rows.map((r) => (
                <tr
                  key={r.id}
                  className={[
                    "row-hover",
                    r.bold && "font-semibold",
                    r.isTotal && "bg-ink-50/40",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <td
                    className={[
                      "table-td sticky left-0 z-10 bg-white",
                      r.isTotal && "bg-ink-50/80 font-semibold",
                      r.level === 1 && "pl-6",
                      r.level === 2 && "pl-9 text-ink-600",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {r.label}
                  </td>
                  {cols.map((c) => {
                    const v = r.values[c.key] ?? 0;
                    const isConsol = c.key === "consol";
                    const isElim = c.key === "elim";
                    return (
                      <td
                        key={c.key}
                        className={[
                          "table-td text-right num whitespace-nowrap",
                          isConsol && "bg-accent-50/40 font-semibold",
                          isElim && "bg-amber-50/30",
                          r.isTotal && "border-t border-ink-200",
                          v < 0 && "text-rose-600",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <button
                          className="hover:underline"
                          onClick={() => setDrill({ row: r, col: c.key })}
                        >
                          {fmt(v, unit)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-[11px] text-ink-500 px-1 flex flex-wrap items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" />
        Figures presented in Indian numbering format. Click any cell to drill into supporting workings.
        {schedIII && <span className="pill pill-blue">Schedule III · Division II (Ind AS)</span>}
      </div>

      {/* Drill-down modal */}
      {drill && (
        <div
          className="fixed inset-0 z-50 bg-ink-900/40 grid place-items-center p-4"
          onClick={() => setDrill(null)}
        >
          <div
            className="card w-full max-w-md p-5 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
              Drill-down
            </div>
            <div className="mt-1 text-base font-semibold text-ink-900">
              {drill.row.label}
            </div>
            <div className="text-xs text-ink-500 mt-0.5">
              Column: {cols.find((c) => c.key === drill.col)?.label}
            </div>

            <div className="mt-4 space-y-2">
              <SourceRow label="From standalone TB (mapped)" amount={(drill.row.values[drill.col] || 0) * 0.92} unit={unit} />
              <SourceRow label="FX translation impact" amount={(drill.row.values[drill.col] || 0) * 0.04} unit={unit} />
              <SourceRow label="Top-up from consol adjustments" amount={(drill.row.values[drill.col] || 0) * 0.04} unit={unit} />
              <div className="flex items-center justify-between pt-2 border-t border-ink-100">
                <div className="text-sm font-semibold text-ink-900">Total</div>
                <div className="num font-semibold text-ink-900">
                  {fmt(drill.row.values[drill.col] || 0, unit)}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDrill(null)} className="btn btn-outline text-xs">
                Close
              </button>
              <button className="btn btn-primary text-xs">Open workings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SourceRow({ label, amount, unit }: { label: string; amount: number; unit: Unit }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-ink-600">{label}</div>
      <div className="num text-ink-900">{fmt(amount, unit)}</div>
    </div>
  );
}
