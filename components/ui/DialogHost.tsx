"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cog,
  FileSpreadsheet,
  HelpCircle,
  LogOut,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserCircle2,
} from "lucide-react";
import { Modal } from "./Modal";
import { useApp } from "@/lib/store";
import {
  currentUser,
  entities,
  periodOptions,
  type ICEntry,
} from "@/lib/data";
import { fmt } from "@/lib/format";

const FS_GROUPS = [
  "Property, Plant & Equipment",
  "Right-of-Use Assets",
  "Goodwill",
  "Other Intangible Assets",
  "Investment in Subsidiaries",
  "Other Financial Assets",
  "Inventories",
  "Trade Receivables",
  "Cash & Cash Equivalents",
  "Bank Balances Other",
  "Other Current Assets",
  "Equity Share Capital",
  "Other Equity",
  "Borrowings — Non-current",
  "Borrowings — Current",
  "Lease Liabilities — Non-current",
  "Lease Liabilities — Current",
  "Trade Payables",
  "Provisions",
  "Deferred Tax Liabilities",
  "Revenue from Operations",
  "Other Income",
  "Cost of Materials Consumed",
  "Cost of Operations",
  "Employee Benefits Expense",
  "Finance Costs",
  "Depreciation & Amortisation",
  "Other Expenses",
];

export default function DialogHost() {
  const { dialog, closeDialog } = useApp();

  return (
    <>
      <RunDialog />
      <UploadTBDialog />
      <MapLedgerDialog />
      <ManualJEDialog />
      <AddEntityDialog />
      <CommandPalette />
      <NotificationsPanel />
      <UserMenu />
      <PeriodPicker />
      <MoreFiltersDialog />
      <EditAdjustmentDialog />
      <WorkingsDialog />
      <PreviewPDFDialog />
      <DrillDialog />
    </>
  );
}

/* --- Run consolidation --- */
function RunDialog() {
  const { dialog, closeDialog, busyRun } = useApp();
  const open = dialog.type === "run";
  const steps = [
    { pct: 12, label: "Reading entity trial balances" },
    { pct: 28, label: "Applying FS group mapping" },
    { pct: 44, label: "FX translation (closing/avg rates)" },
    { pct: 60, label: "Inter-company elimination" },
    { pct: 76, label: "Posting consolidation adjustments" },
    { pct: 90, label: "Building consolidated FS" },
    { pct: 100, label: "Generating notes & disclosures" },
  ];
  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Running consolidation"
      description="Building Consolidated FS from 6 entities · FY 2024-25"
      size="md"
    >
      <div className="space-y-3">
        <div className="h-2 w-full bg-ink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-500 to-accent-700 transition-all duration-200"
            style={{ width: `${busyRun}%` }}
          />
        </div>
        <div className="text-xs text-ink-500 text-right num">{busyRun}%</div>
        <ul className="space-y-1.5 mt-3">
          {steps.map((s) => {
            const done = busyRun >= s.pct;
            const active = !done && busyRun >= s.pct - 14;
            return (
              <li
                key={s.label}
                className={`flex items-center gap-2.5 text-sm ${
                  done ? "text-ink-700" : active ? "text-ink-900" : "text-ink-400"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : active ? (
                  <CircleDot className="h-4 w-4 text-accent-600 animate-pulse" />
                ) : (
                  <CircleDot className="h-4 w-4 text-ink-300" />
                )}
                {s.label}
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}

/* --- Upload TB --- */
function UploadTBDialog() {
  const { dialog, closeDialog, uploadTBMock } = useApp();
  const open = dialog.type === "upload-tb";
  const entityId = dialog.type === "upload-tb" ? dialog.entityId : "";
  const entity = entities.find((e) => e.id === entityId);
  const [filename, setFilename] = useState("");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"pick" | "uploading" | "done">("pick");

  useEffect(() => {
    if (open) {
      setFilename("");
      setProgress(0);
      setStep("pick");
    }
  }, [open]);

  const startUpload = (name: string) => {
    setFilename(name);
    setStep("uploading");
    let p = 0;
    const id = setInterval(() => {
      p += 12;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        setStep("done");
      }
    }, 200);
  };

  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title={`Upload trial balance · ${entity?.shortName ?? ""}`}
      description="Drop your TB export from Tally / SAP / Oracle / NetSuite. Mapping rules from prior periods will auto-apply."
      size="md"
      footer={
        step === "done" ? (
          <>
            <button onClick={closeDialog} className="btn btn-outline text-xs">
              Close
            </button>
            <button
              onClick={() => {
                uploadTBMock(entityId, 412);
                closeDialog();
              }}
              className="btn btn-primary text-xs"
            >
              Apply to workspace
            </button>
          </>
        ) : (
          <button onClick={closeDialog} className="btn btn-outline text-xs">
            Cancel
          </button>
        )
      }
    >
      {step === "pick" && (
        <div>
          <div className="rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/50 p-6 text-center">
            <Upload className="h-8 w-8 text-ink-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-ink-800">
              Drop a .xlsx or .csv here
            </div>
            <div className="text-xs text-ink-500 mt-1">
              or click to browse from your computer
            </div>
            <button
              onClick={() => startUpload(`${entity?.shortName ?? "TB"}_FY25_TB.xlsx`)}
              className="btn btn-primary text-xs mt-3"
            >
              Choose file
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <span className="pill pill-blue">
              <Sparkles className="h-3 w-3" />
              412 mapping rules from prior period
            </span>
            <span className="pill pill-slate">FY25 TB · 6 ledgers</span>
          </div>
        </div>
      )}
      {step === "uploading" && (
        <div className="space-y-3">
          <div className="text-sm text-ink-700 font-medium truncate">
            <FileSpreadsheet className="h-4 w-4 inline mr-1.5 -mt-0.5 text-emerald-600" />
            {filename}
          </div>
          <div className="h-2 w-full bg-ink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-500 to-accent-700 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-ink-500 num text-right">{progress}%</div>
        </div>
      )}
      {step === "done" && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Upload complete
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <Stat label="Ledger lines" value="412" />
            <Stat label="Auto-mapped" value="354" />
            <Stat label="Needs review" value="58" tone="warn" />
          </div>
          <div className="text-xs text-ink-500 mt-1">
            <span className="num">{filename}</span> · TB ties out (Dr = Cr).
          </div>
        </div>
      )}
    </Modal>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div
      className={`rounded-lg ring-1 p-2.5 ${
        tone === "warn"
          ? "ring-amber-200 bg-amber-50/50"
          : "ring-ink-200 bg-white"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
        {label}
      </div>
      <div className="num text-base font-semibold text-ink-900 mt-0.5">{value}</div>
    </div>
  );
}

/* --- Map ledger --- */
function MapLedgerDialog() {
  const { dialog, closeDialog, mapLedger } = useApp();
  const open = dialog.type === "map-ledger";
  const ledger = dialog.type === "map-ledger" ? dialog.ledger : null;
  const [picked, setPicked] = useState<string>("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) {
      setPicked(ledger?.fsGroup ?? "");
      setQ("");
    }
  }, [open, ledger]);

  if (!ledger) return <Modal open={false} onClose={closeDialog}><></></Modal>;

  const filtered = FS_GROUPS.filter((g) =>
    g.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Map ledger to FS group"
      description={`${ledger.code} · ${ledger.ledger}`}
      size="md"
      footer={
        <>
          <button onClick={closeDialog} className="btn btn-outline text-xs">
            Cancel
          </button>
          <button
            disabled={!picked}
            onClick={() => {
              mapLedger(ledger.code, picked);
              closeDialog();
            }}
            className="btn btn-primary text-xs disabled:opacity-50"
          >
            Save mapping
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg ring-1 ring-ink-200 bg-ink-50/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
              Debit
            </div>
            <div className="num font-semibold mt-0.5">
              {fmt(ledger.debit, "lakh")}
            </div>
          </div>
          <div className="rounded-lg ring-1 ring-ink-200 bg-ink-50/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
              Credit
            </div>
            <div className="num font-semibold mt-0.5">
              {fmt(ledger.credit, "lakh")}
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search FS groups…"
            className="w-full rounded-lg ring-1 ring-ink-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
        <div className="max-h-64 overflow-y-auto thin-scrollbar -mx-1 px-1">
          {filtered.map((g) => (
            <button
              key={g}
              onClick={() => setPicked(g)}
              className={`flex items-center gap-2 w-full rounded-md px-2.5 py-2 text-sm text-left transition-colors ${
                picked === g
                  ? "bg-accent-50 text-accent-700 ring-1 ring-accent-200/70"
                  : "hover:bg-ink-50 text-ink-700"
              }`}
            >
              <CircleDot
                className={`h-3.5 w-3.5 ${
                  picked === g ? "text-accent-600" : "text-ink-300"
                }`}
              />
              {g}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* --- Manual JE --- */
function ManualJEDialog() {
  const { dialog, closeDialog, postJE } = useApp();
  const open = dialog.type === "manual-je";
  const [form, setForm] = useState({
    type: "Sales/Purchases" as ICEntry["type"],
    fromEntity: "parent",
    toEntity: "tech",
    amount: "",
    note: "",
  });
  useEffect(() => {
    if (open) {
      setForm({
        type: "Sales/Purchases",
        fromEntity: "parent",
        toEntity: "tech",
        amount: "",
        note: "",
      });
    }
  }, [open]);

  const submit = () => {
    const amt = Math.round(parseFloat(form.amount || "0") * 100); // crores → '000? user enters in lakhs
    postJE({
      type: form.type,
      fromEntity: form.fromEntity,
      toEntity: form.toEntity,
      fromAmount: amt,
      toAmount: amt,
      note: form.note || "Manual elimination JE",
    });
    closeDialog();
  };

  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Manual elimination JE"
      description="Posts a matched IC pair to the elimination ledger."
      size="md"
      footer={
        <>
          <button onClick={closeDialog} className="btn btn-outline text-xs">
            Cancel
          </button>
          <button
            disabled={!form.amount || form.fromEntity === form.toEntity}
            onClick={submit}
            className="btn btn-primary text-xs disabled:opacity-50"
          >
            Post JE
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Type">
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as ICEntry["type"] })
            }
            className="ip"
          >
            {(["Loan", "Sales/Purchases", "Investment", "Dividend", "Services", "Receivable/Payable"] as const).map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              )
            )}
          </select>
        </Field>
        <Field label="Amount (₹ lakhs)">
          <input
            type="number"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="e.g. 24.50"
            className="ip num"
          />
        </Field>
        <Field label="From entity">
          <select
            value={form.fromEntity}
            onChange={(e) => setForm({ ...form, fromEntity: e.target.value })}
            className="ip"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.shortName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="To entity">
          <select
            value={form.toEntity}
            onChange={(e) => setForm({ ...form, toEntity: e.target.value })}
            className="ip"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.shortName}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Narration / note">
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Eliminate sub-contracting fees between Acme Tech and Acme Logistics"
              className="ip"
            />
          </Field>
        </div>
      </div>
      <style jsx>{`
        :global(.ip) {
          width: 100%;
          border-radius: 0.5rem;
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          box-shadow: 0 0 0 1px rgb(221 225 231);
          outline: none;
          transition: box-shadow 150ms;
        }
        :global(.ip:focus) {
          box-shadow: 0 0 0 2px rgb(59 108 243);
        }
      `}</style>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

/* --- Add entity --- */
function AddEntityDialog() {
  const { dialog, closeDialog, toast } = useApp();
  const open = dialog.type === "add-entity";
  const [form, setForm] = useState({
    name: "",
    holding: "100",
    currency: "INR",
    type: "subsidiary",
  });
  useEffect(() => {
    if (open) setForm({ name: "", holding: "100", currency: "INR", type: "subsidiary" });
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Add entity to consolidation scope"
      description="Pulls TB on next sync. Holding % drives NCI computation."
      size="md"
      footer={
        <>
          <button onClick={closeDialog} className="btn btn-outline text-xs">
            Cancel
          </button>
          <button
            disabled={!form.name}
            onClick={() => {
              toast({
                tone: "ok",
                title: "Entity added",
                body: `${form.name} added to scope. Holding ${form.holding}% · ${form.currency}.`,
              });
              closeDialog();
            }}
            className="btn btn-primary text-xs disabled:opacity-50"
          >
            Add to scope
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Field label="Entity legal name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Acme Solar Power Ltd"
              className="ip"
            />
          </Field>
        </div>
        <Field label="Type">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="ip"
          >
            <option value="subsidiary">Subsidiary</option>
            <option value="associate">Associate</option>
            <option value="jv">Joint venture</option>
          </select>
        </Field>
        <Field label="Holding %">
          <input
            type="number"
            value={form.holding}
            onChange={(e) => setForm({ ...form, holding: e.target.value })}
            className="ip num"
          />
        </Field>
        <Field label="Functional currency">
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="ip"
          >
            <option>INR</option>
            <option>USD</option>
            <option>SGD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>AED</option>
          </select>
        </Field>
        <Field label="NCI %">
          <input
            type="number"
            value={String(100 - parseFloat(form.holding || "0"))}
            disabled
            className="ip num bg-ink-50/60"
          />
        </Field>
      </div>
    </Modal>
  );
}

/* --- Command palette --- */
function CommandPalette() {
  const { dialog, closeDialog, toast } = useApp();
  const open = dialog.type === "command-palette";
  const [q, setQ] = useState("");
  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const COMMANDS = [
    { label: "Go to Dashboard", hint: "Navigation" },
    { label: "Go to Trial Balance Workspace", hint: "Navigation" },
    { label: "Go to Inter-co Eliminations", hint: "Navigation" },
    { label: "Run consolidation", hint: "Action" },
    { label: "Export consolidated FS to Excel", hint: "Action" },
    { label: "Acme Logistics — TB", hint: "Entity" },
    { label: "Acme SG — Mapping", hint: "Entity" },
    { label: "Goodwill movement", hint: "Note" },
    { label: "Related party transactions", hint: "Note" },
    { label: "Open settings", hint: "Settings" },
  ];
  const filtered = COMMANDS.filter((c) =>
    `${c.label} ${c.hint}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Modal open={open} onClose={closeDialog} size="md">
      <div className="-m-4 sm:-m-5">
        <div className="relative border-b border-ink-100">
          <Search className="h-4 w-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anything…"
            className="w-full bg-transparent pl-10 pr-3 py-3.5 text-sm focus:outline-none"
          />
        </div>
        <div className="max-h-72 overflow-y-auto thin-scrollbar p-1.5">
          {filtered.length === 0 && (
            <div className="text-center py-6 text-sm text-ink-500">No results</div>
          )}
          {filtered.map((c) => (
            <button
              key={c.label}
              onClick={() => {
                toast({ tone: "info", title: c.label });
                closeDialog();
              }}
              className="flex items-center gap-2.5 w-full rounded-md px-2.5 py-2 text-sm hover:bg-ink-50"
            >
              <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
              <span className="flex-1 text-left text-ink-800">{c.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                {c.hint}
              </span>
            </button>
          ))}
        </div>
        <div className="border-t border-ink-100 px-3 py-2 text-[11px] text-ink-500 flex items-center gap-3">
          <span>↵ to run</span>
          <span>esc to close</span>
        </div>
      </div>
    </Modal>
  );
}

/* --- Notifications panel --- */
function NotificationsPanel() {
  const { dialog, closeDialog, notifs, clearNotifs } = useApp();
  const open = dialog.type === "notifications";
  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Notifications"
      description={`${notifs.length} active`}
      size="md"
      footer={
        <>
          <button onClick={clearNotifs} className="btn btn-outline text-xs">
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
          <button onClick={closeDialog} className="btn btn-primary text-xs">
            Close
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {notifs.length === 0 ? (
          <div className="text-center py-6 text-sm text-ink-500">
            <Bell className="h-6 w-6 mx-auto mb-2 text-ink-300" />
            All caught up.
          </div>
        ) : (
          notifs.map((n) => {
            const Icon =
              n.type === "ok"
                ? CheckCircle2
                : n.type === "warn"
                ? AlertCircle
                : Bell;
            const tone =
              n.type === "ok"
                ? "text-emerald-600"
                : n.type === "warn"
                ? "text-amber-600"
                : "text-accent-600";
            return (
              <div
                key={n.id}
                className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-ink-50"
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tone}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-sm font-medium text-ink-900">
                      {n.title}
                    </div>
                    <div className="text-[10px] text-ink-400 shrink-0">
                      {n.time}
                    </div>
                  </div>
                  <div className="text-[12px] text-ink-500 mt-0.5">{n.body}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

/* --- User menu --- */
function UserMenu() {
  const { dialog, closeDialog, toast } = useApp();
  const open = dialog.type === "user-menu";
  return (
    <Modal open={open} onClose={closeDialog} size="sm">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 grid place-items-center text-white text-base font-semibold">
            {currentUser.initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-900">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-ink-500">{currentUser.email}</div>
            <div className="text-[11px] text-ink-500">{currentUser.role}</div>
          </div>
        </div>
        <div className="space-y-0.5">
          {[
            { icon: UserCircle2, label: "Profile" },
            { icon: Cog, label: "Settings" },
            { icon: HelpCircle, label: "Help & support" },
            { icon: LogOut, label: "Sign out" },
          ].map((m) => (
            <button
              key={m.label}
              onClick={() => {
                toast({ tone: "info", title: m.label });
                closeDialog();
              }}
              className="flex items-center gap-2.5 w-full rounded-md px-2.5 py-2 text-sm hover:bg-ink-50"
            >
              <m.icon className="h-4 w-4 text-ink-500" />
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* --- Period picker --- */
function PeriodPicker() {
  const { dialog, closeDialog, periodId, setPeriod } = useApp();
  const open = dialog.type === "period-picker";
  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Reporting period"
      description="Switching period reloads TB and FS for that range."
      size="md"
    >
      <div className="space-y-1">
        {periodOptions.map((p) => {
          const active = p.id === periodId;
          return (
            <button
              key={p.id}
              onClick={() => {
                setPeriod(p.id);
                closeDialog();
              }}
              className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-accent-50 ring-1 ring-accent-200/70 text-accent-700"
                  : "hover:bg-ink-50 text-ink-800"
              }`}
            >
              <CircleDot
                className={`h-4 w-4 ${
                  active ? "text-accent-600" : "text-ink-300"
                }`}
              />
              <div className="flex-1 text-left">
                <div className="font-medium">{p.label}</div>
                <div className="text-[11px] text-ink-500">{p.range}</div>
              </div>
              {p.current && <span className="pill pill-green">Current</span>}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

/* --- More filters (TB) --- */
function MoreFiltersDialog() {
  const { dialog, closeDialog, toast } = useApp();
  const open = dialog.type === "more-filters";
  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Advanced filters"
      description="Narrow the trial balance view."
      size="md"
      footer={
        <>
          <button onClick={closeDialog} className="btn btn-outline text-xs">
            Cancel
          </button>
          <button
            onClick={() => {
              toast({ tone: "info", title: "Filters applied" });
              closeDialog();
            }}
            className="btn btn-primary text-xs"
          >
            Apply
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Amount range (₹ lakhs)">
          <div className="grid grid-cols-2 gap-2">
            <input className="ip num" placeholder="Min" />
            <input className="ip num" placeholder="Max" />
          </div>
        </Field>
        <Field label="Ledger nature">
          <select className="ip">
            <option>All</option>
            <option>Asset</option>
            <option>Liability</option>
            <option>Equity</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </Field>
        <Field label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {["Inter-company", "Ind AS 116", "Ind AS 109", "Ind AS 19", "Foreign currency", "Auto-mapped", "Manually overridden"].map(
              (t) => (
                <button key={t} className="pill pill-slate hover:pill-blue">
                  {t}
                </button>
              )
            )}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

/* --- Edit adjustment --- */
function EditAdjustmentDialog() {
  const { dialog, closeDialog, editAdj } = useApp();
  const open = dialog.type === "edit-adjustment";
  const adj = dialog.type === "edit-adjustment" ? dialog.adj : null;
  const [form, setForm] = useState({ title: "", detail: "", amount: "0" });
  useEffect(() => {
    if (open && adj) {
      setForm({
        title: adj.title,
        detail: adj.detail,
        amount: String(adj.amount / 100),
      });
    }
  }, [open, adj]);

  if (!adj) return <Modal open={false} onClose={closeDialog}><></></Modal>;

  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title={`Edit ${adj.id}`}
      description={`${adj.category} · ${adj.ind_as ?? "Ind AS"}`}
      size="md"
      footer={
        <>
          <button onClick={closeDialog} className="btn btn-outline text-xs">
            Cancel
          </button>
          <button
            onClick={() => {
              editAdj({
                ...adj,
                title: form.title,
                detail: form.detail,
                amount: Math.round(parseFloat(form.amount || "0") * 100),
              });
              closeDialog();
            }}
            className="btn btn-primary text-xs"
          >
            Save changes
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="ip"
          />
        </Field>
        <Field label="Amount (₹ lakhs, signed)">
          <input
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="ip num"
          />
        </Field>
        <Field label="Rationale / detail">
          <textarea
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            rows={4}
            className="ip"
          />
        </Field>
      </div>
    </Modal>
  );
}

/* --- Workings --- */
function WorkingsDialog() {
  const { dialog, closeDialog } = useApp();
  const open = dialog.type === "workings";
  const adj = dialog.type === "workings" ? dialog.adj : null;
  if (!adj) return <Modal open={false} onClose={closeDialog}><></></Modal>;

  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title={`Workings — ${adj.title}`}
      description={`${adj.id} · ${adj.category}${adj.ind_as ? ` · ${adj.ind_as}` : ""}`}
      size="lg"
      footer={
        <button onClick={closeDialog} className="btn btn-primary text-xs">
          Close
        </button>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-ink-700 leading-relaxed">{adj.detail}</p>
        <div className="rounded-lg ring-1 ring-ink-200 overflow-hidden">
          <div className="bg-ink-50/60 px-3 py-2 text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
            Step-by-step computation
          </div>
          <div className="divide-y divide-ink-100">
            {[
              { line: "Pre-acquisition net assets (book value)", amount: 175400 },
              { line: "Fair value uplift — PPE", amount: 12400 },
              { line: "Fair value uplift — Identified intangibles", amount: 24000 },
              { line: "Less: DTL on FV uplift", amount: -12400 },
              { line: "FV of net identifiable assets (A)", amount: 199400 },
              { line: "Purchase consideration (B)", amount: 385000 },
              { line: "NCI at proportionate share — 49% (C)", amount: 9500 },
              { line: "Goodwill = B − A + C", amount: 184500, total: true },
            ].map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2 ${
                  r.total ? "bg-accent-50/40 font-semibold" : ""
                }`}
              >
                <div className="text-ink-700">{r.line}</div>
                <div className="num text-ink-900">{fmt(r.amount, "lakh")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* --- Preview PDF --- */
function PreviewPDFDialog() {
  const { dialog, closeDialog } = useApp();
  const open = dialog.type === "preview-pdf";
  const stmt = dialog.type === "preview-pdf" ? dialog.statement : null;
  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Preview — PDF render"
      description="A preview of how the FS pack will print. Final layout uses your firm's letterhead."
      size="lg"
      footer={
        <>
          <button onClick={closeDialog} className="btn btn-outline text-xs">
            Close
          </button>
          <button onClick={closeDialog} className="btn btn-primary text-xs">
            Send to printer
          </button>
        </>
      }
    >
      <div className="rounded-lg ring-1 ring-ink-200 bg-white aspect-[1/1.414] p-6 text-[10px] text-ink-700 overflow-hidden relative">
        <div className="text-center mb-3">
          <div className="text-base font-semibold text-ink-900">
            Acme Industries Limited
          </div>
          <div className="text-xs text-ink-500">
            Consolidated Financial Statements · FY 2024-25
          </div>
        </div>
        <div className="text-[11px] font-semibold text-ink-900 mb-1">
          {stmt === "pnl"
            ? "Statement of Profit & Loss"
            : stmt === "bs"
            ? "Balance Sheet"
            : "Statement of Cash Flows"}
        </div>
        <div className="text-[10px] text-ink-500 mb-2">
          (All amounts in ₹ Crores unless stated)
        </div>
        <div className="space-y-0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-dashed border-ink-100 py-1"
            >
              <div className="h-1.5 bg-ink-100 rounded w-1/2" />
              <div className="h-1.5 bg-ink-100 rounded w-12" />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-6 bottom-3 text-[9px] text-ink-400 flex items-center justify-between">
          <div>Generated by ConsolidatePro</div>
          <div>Page 1 of 24</div>
        </div>
      </div>
    </Modal>
  );
}

/* --- Drill-down --- */
function DrillDialog() {
  const { dialog, closeDialog } = useApp();
  const open = dialog.type === "drill";
  if (dialog.type !== "drill") return <Modal open={false} onClose={closeDialog}><></></Modal>;
  const { rowLabel, colLabel, value } = dialog;
  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title={rowLabel}
      description={`Column: ${colLabel}`}
      size="md"
      footer={
        <>
          <button onClick={closeDialog} className="btn btn-outline text-xs">
            Close
          </button>
          <button onClick={closeDialog} className="btn btn-primary text-xs">
            Open workings
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {[
          { label: "From standalone TB (mapped)", w: 0.92 },
          { label: "FX translation impact", w: 0.04 },
          { label: "Top-up from consol adjustments", w: 0.04 },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <div className="text-ink-600">{s.label}</div>
            <div className="num text-ink-900">{fmt(value * s.w, "lakh")}</div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-ink-100">
          <div className="text-sm font-semibold text-ink-900">Total</div>
          <div className="num font-semibold text-ink-900">
            {fmt(value, "lakh")}
          </div>
        </div>
      </div>
    </Modal>
  );
}
