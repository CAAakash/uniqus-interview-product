"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles, Download, FileSpreadsheet } from "lucide-react";
import { notes } from "@/lib/data";
import { useApp } from "@/lib/store";
import { exportConsolidatedFS } from "@/lib/excel";

export default function Notes() {
  const [openId, setOpenId] = useState<string | null>("RPT");
  const { toast } = useApp();
  const [exporting, setExporting] = useState(false);

  const exportDocx = () => {
    toast({
      tone: "info",
      title: "DOCX export queued",
      body: "Your firm's letterhead and footnote styling will be applied. Download starts in a few seconds.",
    });
  };

  const exportXlsx = async () => {
    setExporting(true);
    try {
      await exportConsolidatedFS();
      toast({
        tone: "ok",
        title: "Excel downloaded",
        body: "Includes the NCI movement note linked to P&L.",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5 bg-gradient-to-br from-accent-50/60 to-white">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="hidden sm:grid h-10 w-10 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 place-items-center text-white">
            <Sparkles className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h2 className="text-sm font-semibold text-ink-900">
              Auto-generated disclosure notes
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Drafted from the consolidated TB, IC pairs, and adjustments. Review and
              tag each note before publishing to the FS pack.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportXlsx}
              disabled={exporting}
              className="btn btn-outline text-xs disabled:opacity-60"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">XLSX</span>
            </button>
            <button onClick={exportDocx} className="btn btn-primary text-xs">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export DOCX</span>
              <span className="sm:hidden">DOCX</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {notes.map((n) => {
          const open = openId === n.id;
          return (
            <div key={n.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : n.id)}
                className="w-full text-left flex items-start gap-3 p-3.5 sm:p-4 hover:bg-ink-50 transition-colors"
              >
                <div className="hidden sm:grid h-9 w-9 shrink-0 rounded-lg bg-ink-100 place-items-center text-ink-600 text-[11px] font-mono font-semibold">
                  {n.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-ink-900">{n.title}</h3>
                    <span className="pill pill-blue">{n.indAs}</span>
                    <span
                      className={`pill ${
                        n.status === "auto" ? "pill-green" : "pill-amber"
                      }`}
                    >
                      {n.status === "auto" ? "Auto-drafted" : "Needs review"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                    {n.summary}
                  </p>
                </div>
                <div className="text-ink-400">
                  {open ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </button>
              {open && (
                <div className="border-t border-ink-100 bg-ink-50/40 p-3.5 sm:p-4">
                  <NoteBody id={n.id} items={n.items as any[]} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NoteBody({ id, items }: { id: string; items: any[] }) {
  if (id === "RPT") {
    return (
      <div className="overflow-x-auto thin-scrollbar">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr>
              <th className="table-th">Related party</th>
              <th className="table-th">Relationship</th>
              <th className="table-th hidden sm:table-cell">Nature of transaction</th>
              <th className="table-th text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any, i: number) => (
              <tr key={i} className="row-hover">
                <td className="table-td font-medium text-ink-900">{it.party}</td>
                <td className="table-td text-ink-600">{it.relation}</td>
                <td className="table-td hidden sm:table-cell text-ink-600">
                  {it.txn}
                </td>
                <td className="table-td num text-right">{it.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (id === "SEG") {
    return (
      <div className="overflow-x-auto thin-scrollbar">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr>
              <th className="table-th">Segment</th>
              <th className="table-th text-right">Revenue</th>
              <th className="table-th text-right">Segment P/L</th>
              <th className="table-th text-right">Assets</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any, i: number) => (
              <tr key={i} className="row-hover">
                <td className="table-td font-medium text-ink-900">{it.segment}</td>
                <td className="table-td num text-right">{it.revenue}</td>
                <td className="table-td num text-right">{it.segPL}</td>
                <td className="table-td num text-right">{it.assets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <table className="w-full text-sm">
      <tbody>
        {items.map((it: any, i: number) => {
          const total = i === items.length - 1;
          return (
            <tr
              key={i}
              className={total ? "border-t-2 border-ink-200 font-semibold" : ""}
            >
              <td className="py-2 text-ink-700">{it.line}</td>
              <td className="py-2 text-right num text-ink-900">{it.amount}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
