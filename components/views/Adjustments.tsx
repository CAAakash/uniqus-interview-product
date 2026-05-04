"use client";

import { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Edit3,
  ArrowRight,
} from "lucide-react";
import type { Unit } from "@/lib/format";
import { fmt } from "@/lib/format";
import { useApp } from "@/lib/store";

const STATUS = {
  posted: { cls: "pill-green", icon: CheckCircle2, label: "Posted" },
  review: { cls: "pill-amber", icon: Clock, label: "Review" },
  draft: { cls: "pill-slate", icon: Edit3, label: "Draft" },
} as const;

const CATEGORY_TONE: Record<string, string> = {
  "Goodwill / Capital Reserve": "from-accent-500 to-accent-700",
  NCI: "from-emerald-500 to-emerald-700",
  "Fair Value": "from-violet-500 to-violet-700",
  "Unrealised Profit": "from-rose-500 to-rose-700",
  "Deferred Tax": "from-amber-500 to-amber-700",
  "Ind AS": "from-sky-500 to-sky-700",
};

export default function Adjustments({ unit }: { unit: Unit }) {
  const [openId, setOpenId] = useState<string | null>("ADJ-001");
  const { adj, postAdj, openDialog, toast } = useApp();

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="pill pill-blue">Ind AS 103</span>
          <h2 className="text-sm font-semibold text-ink-900">
            Goodwill on acquisition · Northstar Solutions Ltd (51%)
          </h2>
          <div className="flex-1" />
          <button
            onClick={() =>
              openDialog({
                type: "workings",
                adj: adj.find((a) => a.id === "ADJ-001")!,
              })
            }
            className="btn btn-outline text-xs"
          >
            Open workings
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
          <Tile
            label="Purchase consideration"
            value={fmt(385000, unit)}
            sub="Cash + share swap"
          />
          <Tile
            label="FV of net identifiable assets"
            value={fmt(199400, unit)}
            sub="Post-PPA"
            sign="-"
          />
          <Tile
            label="NCI (proportionate)"
            value={fmt(9500, unit)}
            sub="49% × ₹19.94 Cr"
            sign="-"
          />
          <Tile
            label="DTL on FV uplift"
            value={fmt(8800, unit)}
            sub="Ind AS 12 · 25.17%"
            sign="+"
          />
          <Tile
            label="Goodwill"
            value={fmt(184500, unit)}
            sub="Recognised"
            tone="accent"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-ink-900">All adjustments</h2>
        <span className="pill pill-slate">{adj.length}</span>
        <div className="flex-1" />
        <button
          onClick={() =>
            toast({
              tone: "info",
              title: "Adjustment template",
              body: "Pick a template to start a new adjustment (Goodwill, NCI, FV, Unrealised profit, DT, Ind AS).",
            })
          }
          className="btn btn-primary text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New adjustment</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="space-y-2">
        {adj.map((a) => {
          const open = openId === a.id;
          const s = STATUS[a.status];
          const Icon = s.icon;
          const grad = CATEGORY_TONE[a.category] || "from-ink-700 to-ink-900";
          const sign = a.amount < 0 ? "-" : "+";
          return (
            <div key={a.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : a.id)}
                className="w-full text-left flex items-start gap-3 p-3.5 sm:p-4 hover:bg-ink-50 transition-colors"
              >
                <div
                  className={`hidden sm:grid h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${grad} place-items-center text-white text-[10px] font-semibold`}
                >
                  {a.id.replace("ADJ-", "")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                      {a.category}
                    </span>
                    {a.ind_as && (
                      <span className="pill pill-blue">{a.ind_as}</span>
                    )}
                    <span className={`pill ${s.cls}`}>
                      <Icon className="h-3 w-3" />
                      {s.label}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink-900 leading-tight">
                    {a.title}
                  </div>
                  <div className="text-[12px] text-ink-500 mt-0.5 line-clamp-2 sm:line-clamp-1">
                    {a.detail}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={[
                      "num text-base font-semibold",
                      sign === "-" ? "text-rose-600" : "text-ink-900",
                    ].join(" ")}
                  >
                    {fmt(a.amount, unit)}
                  </div>
                  <div className="text-[11px] text-ink-500 mt-0.5">
                    {open ? (
                      <ChevronDown className="h-4 w-4 inline" />
                    ) : (
                      <ChevronRight className="h-4 w-4 inline" />
                    )}
                  </div>
                </div>
              </button>
              {open && (
                <div className="border-t border-ink-100 bg-ink-50/40 p-3.5 sm:p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1">
                        Rationale
                      </div>
                      <p className="text-sm text-ink-700 leading-relaxed">
                        {a.detail}
                      </p>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1">
                        Journal entry
                      </div>
                      <div className="rounded-lg bg-white ring-1 ring-ink-200 p-3 text-sm">
                        <div className="flex items-center gap-2 text-ink-700">
                          <span className="num text-emerald-600 font-medium">
                            Dr
                          </span>
                          <span className="flex-1">{a.drBy}</span>
                          <span className="num">
                            {fmt(Math.abs(a.amount), unit)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-ink-700 mt-1">
                          <span className="num text-rose-600 font-medium">
                            Cr
                          </span>
                          <span className="flex-1">{a.crBy}</span>
                          <span className="num">
                            {fmt(Math.abs(a.amount), unit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openDialog({ type: "workings", adj: a })}
                      className="btn btn-outline text-xs"
                    >
                      View workings
                    </button>
                    <button
                      onClick={() => openDialog({ type: "edit-adjustment", adj: a })}
                      className="btn btn-outline text-xs"
                    >
                      Edit
                    </button>
                    {a.status !== "posted" && (
                      <button
                        onClick={() => postAdj(a.id)}
                        className="btn btn-primary text-xs"
                      >
                        Post adjustment
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  sign,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  sign?: "+" | "-";
  tone?: "accent";
}) {
  const accent = tone === "accent";
  return (
    <div
      className={[
        "rounded-xl p-3.5 ring-1",
        accent
          ? "ring-accent-200/70 bg-gradient-to-br from-accent-50 to-white"
          : "ring-ink-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
        {sign && (
          <span
            className={[
              "h-4 w-4 rounded grid place-items-center text-[10px] font-bold",
              sign === "+"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700",
            ].join(" ")}
          >
            {sign}
          </span>
        )}
        {label}
      </div>
      <div
        className={[
          "mt-1 num text-lg font-semibold",
          accent ? "text-accent-700" : "text-ink-900",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div>
    </div>
  );
}
