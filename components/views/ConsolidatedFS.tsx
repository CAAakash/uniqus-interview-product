"use client";

import { useState } from "react";
import { Download, FileText, Eye } from "lucide-react";
import { entities, pnlRows, bsRows, cashFlowRows } from "@/lib/data";
import type { FSRow } from "@/lib/data";
import type { Unit } from "@/lib/format";
import { fmt } from "@/lib/format";
import { useApp } from "@/lib/store";
import { exportConsolidatedFS } from "@/lib/excel";

type Statement = "pnl" | "bs" | "cf";

const TABS: { key: Statement; label: string; rows: FSRow[] }[] = [
  { key: "pnl", label: "Profit & Loss", rows: pnlRows },
  { key: "bs", label: "Balance Sheet", rows: bsRows },
  { key: "cf", label: "Cash Flow", rows: cashFlowRows },
];

export default function ConsolidatedFS({ unit }: { unit: Unit }) {
  const [tab, setTab] = useState<Statement>("pnl");
  const [schedIII, setSchedIII] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { openDialog, toast } = useApp();

  const cur = TABS.find((t) => t.key === tab)!;
  const cols = [
    ...entities.map((e) => ({ key: e.id, label: e.shortName, sub: e.currency })),
    { key: "elim", label: "Eliminations", sub: "Adj" },
    { key: "consol", label: "Consolidated", sub: "Group" },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportConsolidatedFS();
      toast({
        tone: "ok",
        title: "Excel downloaded",
        body: "Acme-Consolidated-FS-FY25.xlsx · gridlines off · BS/Notes linked to P&L.",
      });
    } catch (e: any) {
      console.error("[Excel export] failed:", e);
      toast({
        tone: "err",
        title: "Export failed",
        body: e?.message ?? String(e),
      });
    } finally {
      setExporting(false);
    }
  };

  // Show only consol column when CF (single-column statement)
  const showCols = tab === "cf" ? cols.filter((c) => c.key === "consol") : cols;

  return (
    <div className="space-y-4">
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
        <button
          onClick={() => openDialog({ type: "preview-pdf", statement: tab })}
          className="btn btn-outline text-xs"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Preview PDF</span>
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn btn-primary text-xs disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {exporting ? "Exporting…" : "Export Excel"}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto thin-scrollbar relative">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="table-th sticky left-0 z-20 bg-ink-50/95 min-w-[220px] sm:min-w-[280px] backdrop-blur">
                  Particulars
                </th>
                {showCols.map((c) => (
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
                <th className="table-th text-right whitespace-nowrap hidden lg:table-cell">
                  Note
                </th>
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
                      r.italic && "italic text-ink-500",
                      r.level === 1 && "pl-6",
                      r.level === 2 && "pl-9 text-ink-600",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {r.label}
                  </td>
                  {showCols.map((c) => {
                    const v = r.values[c.key] ?? 0;
                    const isConsol = c.key === "consol";
                    const isElim = c.key === "elim";
                    if (
                      r.label === "ASSETS" ||
                      r.label === "EQUITY & LIABILITIES" ||
                      r.label === "Non-current assets" ||
                      r.label === "Current assets" ||
                      r.label === "Equity" ||
                      r.label === "Non-current liabilities" ||
                      r.label === "Current liabilities" ||
                      r.label === "A. Cash flows from operating activities" ||
                      r.label === "B. Cash flows from investing activities" ||
                      r.label === "C. Cash flows from financing activities"
                    ) {
                      return <td key={c.key} className="table-td"></td>;
                    }
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
                          onClick={() => {
                            if (v === 0) return;
                            openDialog({
                              type: "drill",
                              rowId: r.id,
                              rowLabel: r.label,
                              col: c.key,
                              colLabel: c.label,
                              value: v,
                            });
                          }}
                        >
                          {fmt(v, unit)}
                        </button>
                      </td>
                    );
                  })}
                  <td className="table-td text-right hidden lg:table-cell text-[11px] text-ink-500">
                    {r.noteRef ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[11px] text-ink-500 px-1 flex flex-wrap items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" />
        Figures presented in Indian numbering format. Click any cell to drill into
        supporting workings.
        {schedIII && (
          <span className="pill pill-blue">
            Schedule III · Division II (Ind AS)
          </span>
        )}
      </div>
    </div>
  );
}
