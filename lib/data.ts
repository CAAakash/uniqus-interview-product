// All figures are in INR thousands ('000) at functional currency.
// Display layer converts to lakhs / crores / absolute.
// FS format/line ordering follows Schedule III (Division II) · Ind AS conventions.
// Names and numbers are entirely fictional — for demo only.

export type EntityStatus =
  | "tb_uploaded"
  | "mapping_done"
  | "elim_pending"
  | "consolidated"
  | "draft";

export interface Entity {
  id: string;
  name: string;
  shortName: string;
  type: "parent" | "subsidiary" | "associate" | "jv";
  holdingPct: number;
  ncIPct: number;
  currency: "INR" | "USD" | "SGD";
  fxRate: number;
  fxRateAvg: number;
  status: EntityStatus;
  lastSync: string;
  acquired?: string;
  goodwill?: number;
  notes?: string;
}

export const period = {
  label: "FY 2024-25",
  range: "01 Apr 2024 – 31 Mar 2025",
  reportingDate: "31 Mar 2025",
  framework: "Ind AS",
  currency: "INR",
};

export const entities: Entity[] = [
  {
    id: "parent",
    name: "Acme Industries Limited",
    shortName: "Acme Parent",
    type: "parent",
    holdingPct: 100,
    ncIPct: 0,
    currency: "INR",
    fxRate: 1,
    fxRateAvg: 1,
    status: "consolidated",
    lastSync: "2 hr ago",
  },
  {
    id: "tech",
    name: "Acme Tech Private Limited",
    shortName: "Acme Tech",
    type: "subsidiary",
    holdingPct: 100,
    ncIPct: 0,
    currency: "INR",
    fxRate: 1,
    fxRateAvg: 1,
    status: "consolidated",
    lastSync: "3 hr ago",
  },
  {
    id: "logi",
    name: "Acme Logistics Private Limited",
    shortName: "Acme Logistics",
    type: "subsidiary",
    holdingPct: 75,
    ncIPct: 25,
    currency: "INR",
    fxRate: 1,
    fxRateAvg: 1,
    status: "elim_pending",
    lastSync: "1 hr ago",
  },
  {
    id: "sg",
    name: "Acme Singapore Pte Ltd",
    shortName: "Acme SG",
    type: "subsidiary",
    holdingPct: 100,
    ncIPct: 0,
    currency: "SGD",
    fxRate: 65.4,
    fxRateAvg: 64.8,
    status: "mapping_done",
    lastSync: "5 hr ago",
  },
  {
    id: "renew",
    name: "Acme Renewables Private Limited",
    shortName: "Acme Renewables",
    type: "subsidiary",
    holdingPct: 60,
    ncIPct: 40,
    currency: "INR",
    fxRate: 1,
    fxRateAvg: 1,
    status: "tb_uploaded",
    lastSync: "yesterday",
  },
  {
    id: "north",
    name: "Northstar Solutions Limited",
    shortName: "Northstar",
    type: "subsidiary",
    holdingPct: 51,
    ncIPct: 49,
    currency: "USD",
    fxRate: 84.2,
    fxRateAvg: 83.6,
    status: "tb_uploaded",
    lastSync: "yesterday",
    acquired: "12 May 2024",
    goodwill: 184500,
    notes: "Business combination during the year — PPA fair value pending.",
  },
];

export const consolidationSteps = [
  { id: 1, key: "tb", label: "TB Upload", state: "done" },
  { id: 2, key: "map", label: "FS Mapping", state: "done" },
  { id: 3, key: "fx", label: "FX Translation", state: "done" },
  { id: 4, key: "ic", label: "Inter-co Eliminations", state: "active" },
  { id: 5, key: "adj", label: "Consol Adjustments", state: "pending" },
  { id: 6, key: "out", label: "Consolidated FS", state: "pending" },
  { id: 7, key: "notes", label: "Notes & Disclosures", state: "pending" },
];

export type LedgerLine = {
  code: string;
  ledger: string;
  debit: number;
  credit: number;
  fsGroup: string | null;
  flagged?: boolean;
  note?: string;
};

export const tbLogi: LedgerLine[] = [
  { code: "1101", ledger: "Cash on Hand", debit: 1240, credit: 0, fsGroup: "Cash & Cash Equivalents" },
  { code: "1102", ledger: "ICICI Bank — Current A/c 0021", debit: 84210, credit: 0, fsGroup: "Cash & Cash Equivalents" },
  { code: "1103", ledger: "HDFC Bank — Sweep FD", debit: 50000, credit: 0, fsGroup: "Bank Balances Other" },
  { code: "1201", ledger: "Sundry Debtors — Domestic", debit: 412300, credit: 0, fsGroup: "Trade Receivables" },
  { code: "1202", ledger: "Sundry Debtors — Acme Parent (IC)", debit: 64500, credit: 0, fsGroup: "Trade Receivables (IC)", note: "Inter-company" },
  { code: "1203", ledger: "ECL Provision — Trade Receivables", debit: 0, credit: 18400, fsGroup: "Trade Receivables", note: "Ind AS 109 ECL" },
  { code: "1301", ledger: "Inventory — Finished Goods", debit: 92100, credit: 0, fsGroup: "Inventories" },
  { code: "1401", ledger: "ROU Asset — Warehouse Lease", debit: 246800, credit: 0, fsGroup: "Right-of-Use Assets", note: "Ind AS 116" },
  { code: "1402", ledger: "Accumulated Depn — ROU", debit: 0, credit: 38200, fsGroup: "Right-of-Use Assets" },
  { code: "1501", ledger: "Plant & Machinery", debit: 612400, credit: 0, fsGroup: "Property, Plant & Equipment" },
  { code: "1502", ledger: "Acc Depn — Plant & Machinery", debit: 0, credit: 184600, fsGroup: "Property, Plant & Equipment" },
  { code: "1601", ledger: "Investment in Acme Tech (mutual)", debit: 12500, credit: 0, fsGroup: null, flagged: true, note: "Awaiting mapping" },
  { code: "2101", ledger: "Sundry Creditors", debit: 0, credit: 187200, fsGroup: "Trade Payables" },
  { code: "2102", ledger: "Creditors — Acme Parent (IC)", debit: 0, credit: 24800, fsGroup: "Trade Payables (IC)", note: "Inter-company" },
  { code: "2201", ledger: "Lease Liability — Current", debit: 0, credit: 42100, fsGroup: "Lease Liabilities — Current", note: "Ind AS 116" },
  { code: "2202", ledger: "Lease Liability — Non-current", debit: 0, credit: 178400, fsGroup: "Lease Liabilities — Non-current", note: "Ind AS 116" },
  { code: "2301", ledger: "Term Loan — SBI", debit: 0, credit: 320000, fsGroup: "Borrowings — Non-current" },
  { code: "2302", ledger: "Loan from Acme Parent (IC)", debit: 0, credit: 150000, fsGroup: "Borrowings (IC)", note: "Inter-company" },
  { code: "2401", ledger: "Deferred Tax Liability", debit: 0, credit: 41200, fsGroup: "Deferred Tax Liabilities" },
  { code: "3101", ledger: "Equity Share Capital", debit: 0, credit: 100000, fsGroup: "Equity Share Capital" },
  { code: "3102", ledger: "Retained Earnings", debit: 0, credit: 386500, fsGroup: "Other Equity" },
  { code: "4101", ledger: "Revenue from Logistics Services", debit: 0, credit: 824600, fsGroup: "Revenue from Operations" },
  { code: "4102", ledger: "Revenue — Acme Parent (IC)", debit: 0, credit: 96400, fsGroup: "Revenue (IC)", note: "Inter-company" },
  { code: "4201", ledger: "Other Income — Interest", debit: 0, credit: 6200, fsGroup: "Other Income" },
  { code: "5101", ledger: "Diesel & Fuel Costs", debit: 312800, credit: 0, fsGroup: "Cost of Operations" },
  { code: "5102", ledger: "Driver & Crew Wages", debit: 184600, credit: 0, fsGroup: "Employee Benefits Expense" },
  { code: "5103", ledger: "Sub-contractor — Acme Tech (IC)", debit: 38200, credit: 0, fsGroup: "Cost of Operations (IC)", note: "Inter-company" },
  { code: "5201", ledger: "Depreciation & Amortisation", debit: 92400, credit: 0, fsGroup: "Depreciation & Amortisation" },
  { code: "5301", ledger: "Finance Costs — Interest", debit: 41600, credit: 0, fsGroup: "Finance Costs" },
  { code: "5302", ledger: "Interest on Lease Liability", debit: 12800, credit: 0, fsGroup: "Finance Costs", note: "Ind AS 116" },
];

export type ICEntry = {
  id: string;
  type: "Loan" | "Sales/Purchases" | "Investment" | "Dividend" | "Services" | "Receivable/Payable";
  fromEntity: string;
  toEntity: string;
  fromAmount: number;
  toAmount: number;
  status: "matched" | "mismatch" | "unmatched";
  delta?: number;
  note?: string;
  ind_as?: string;
};

export const icEntries: ICEntry[] = [
  { id: "IC-001", type: "Loan", fromEntity: "parent", toEntity: "logi", fromAmount: 150000, toAmount: 150000, status: "matched" },
  { id: "IC-002", type: "Sales/Purchases", fromEntity: "logi", toEntity: "parent", fromAmount: 96400, toAmount: 94800, status: "mismatch", delta: 1600, note: "Cut-off: 3 invoices in transit at year end." },
  { id: "IC-003", type: "Receivable/Payable", fromEntity: "logi", toEntity: "parent", fromAmount: 64500, toAmount: 64500, status: "matched" },
  { id: "IC-004", type: "Investment", fromEntity: "parent", toEntity: "tech", fromAmount: 250000, toAmount: 250000, status: "matched", note: "Eliminate against share capital + pre-acq reserves." },
  { id: "IC-005", type: "Dividend", fromEntity: "tech", toEntity: "parent", fromAmount: 32000, toAmount: 32000, status: "matched" },
  { id: "IC-006", type: "Services", fromEntity: "tech", toEntity: "logi", fromAmount: 38200, toAmount: 38200, status: "matched" },
  { id: "IC-007", type: "Sales/Purchases", fromEntity: "sg", toEntity: "parent", fromAmount: 78400, toAmount: 0, status: "unmatched", delta: 78400, note: "Acme SG records sale; parent has not yet booked purchase. Likely GR/IR pending." },
  { id: "IC-008", type: "Receivable/Payable", fromEntity: "north", toEntity: "parent", fromAmount: 14200, toAmount: 14200, status: "matched", ind_as: "Ind AS 109", note: "ECL of ₹0.42 Cr to be recognised on intra-group receivable on consol-only basis." },
];

export type Adjustment = {
  id: string;
  category: "Goodwill / Capital Reserve" | "NCI" | "Fair Value" | "Unrealised Profit" | "Deferred Tax" | "Ind AS";
  title: string;
  ind_as?: string;
  amount: number;
  detail: string;
  status: "review" | "posted" | "draft";
  drBy: string;
  crBy: string;
};

export const adjustments: Adjustment[] = [
  { id: "ADJ-001", category: "Goodwill / Capital Reserve", title: "Goodwill on acquisition of Northstar Solutions", ind_as: "Ind AS 103", amount: 184500, detail: "Purchase consideration ₹38.50 Cr less FV of net identifiable assets ₹19.94 Cr (after PPA — customer relationships ₹2.40 Cr, brand ₹1.10 Cr) less NCI at proportionate share ₹0.95 Cr.", status: "posted", drBy: "Goodwill", crBy: "Investment in Northstar / NCI" },
  { id: "ADJ-002", category: "NCI", title: "NCI share of post-acquisition profit (Logistics)", amount: 24600, detail: "25% of Acme Logistics PAT for the year ₹9.84 Cr → NCI ₹2.46 Cr.", status: "posted", drBy: "P&L attributable to NCI", crBy: "Non-Controlling Interest (Equity)" },
  { id: "ADJ-003", category: "Unrealised Profit", title: "Unrealised profit on inventory (parent ↔ logistics)", amount: -7800, detail: "₹0.78 Cr unrealised margin on inter-co inventory still held at year end; eliminated against group COGS.", status: "review", drBy: "Cost of Materials (P&L)", crBy: "Inventory (BS)" },
  { id: "ADJ-004", category: "Fair Value", title: "PPA — Customer relationships (Northstar)", ind_as: "Ind AS 103", amount: 24000, detail: "Identified intangible — customer relationships, useful life 7 yrs, amortisation begins from acquisition date.", status: "review", drBy: "Customer Relationships (Intangibles)", crBy: "Investment / Capital Reserve" },
  { id: "ADJ-005", category: "Deferred Tax", title: "DTL on PPA fair value adjustments", ind_as: "Ind AS 12", amount: 8800, detail: "DTL @ 25.17% on FV uplift to identifiable intangibles created on consolidation.", status: "draft", drBy: "Goodwill", crBy: "Deferred Tax Liability" },
  { id: "ADJ-006", category: "Ind AS", title: "ECL on inter-company receivable (consol-only)", ind_as: "Ind AS 109", amount: -4200, detail: "Lifetime ECL on Northstar's receivable from parent; reverses in standalone but recognised at group level.", status: "review", drBy: "Impairment Loss (P&L)", crBy: "Loss Allowance — IC Receivable" },
];

export type FSRow = {
  id: string;
  label: string;
  level: 0 | 1 | 2;
  bold?: boolean;
  italic?: boolean;
  isTotal?: boolean;
  values: Record<string, number>;
  drillKey?: string;
  noteRef?: string;
};

const E = ["parent", "tech", "logi", "sg", "renew", "north", "elim", "consol"] as const;

const row = (
  id: string,
  label: string,
  level: 0 | 1 | 2,
  vals: Partial<Record<(typeof E)[number], number>>,
  opts: Partial<FSRow> = {}
): FSRow => {
  const filled: Record<string, number> = {};
  let sum = 0;
  for (const k of ["parent", "tech", "logi", "sg", "renew", "north"]) {
    filled[k] = vals[k as keyof typeof vals] ?? 0;
    sum += filled[k];
  }
  filled.elim = vals.elim ?? 0;
  filled.consol = vals.consol ?? sum + filled.elim;
  return { id, label, level, values: filled, ...opts };
};

// P&L — Schedule III Division II ordering: Revenue, Other income, Total income;
// Expenses (Cost of materials, Purchases of stock-in-trade, Changes in inventories,
// Employee benefits, Finance costs, Depreciation, Other expenses); Total expenses;
// PBT, Tax expense (Current + Deferred), PAT.
export const pnlRows: FSRow[] = [
  row("rev_ops", "Revenue from operations", 0, { parent: 8425000, tech: 1842000, logi: 921000, sg: 612400, renew: 184200, north: 246800, elim: -212600 }, { noteRef: "Note 22" }),
  row("oth_inc", "Other income", 0, { parent: 84200, tech: 12400, logi: 6200, sg: 8400, renew: 2100, north: 4800, elim: -32000 }, { noteRef: "Note 23" }),
  row("total_inc", "I. Total income", 0, { parent: 8509200, tech: 1854400, logi: 927200, sg: 620800, renew: 186300, north: 251600, elim: -244600 }, { bold: true, isTotal: true }),
  row("cogs", "Cost of materials consumed", 1, { parent: -3284000, tech: -612400, logi: -312800, sg: -284200, renew: -86400, north: -94200, elim: 134200 }, { noteRef: "Note 24" }),
  row("pst", "Purchases of stock-in-trade", 1, { parent: -218400, tech: -42600, logi: -18400, sg: -24600, renew: -8200, north: -12400 }),
  row("inv_chg", "Changes in inventories of finished goods, WIP & stock-in-trade", 1, { parent: -84200, tech: -18400, logi: -8400, sg: -12400, renew: -4200, north: -6200, elim: 7800 }),
  row("emp", "Employee benefits expense", 1, { parent: -1248000, tech: -486200, logi: -184600, sg: -94800, renew: -28400, north: -64200 }, { noteRef: "Note 25" }),
  row("fin", "Finance costs", 1, { parent: -218400, tech: -24600, logi: -54400, sg: -18200, renew: -8400, north: -12800, elim: 12400 }, { noteRef: "Note 26" }),
  row("dep", "Depreciation & amortisation expense", 1, { parent: -384200, tech: -68400, logi: -92400, sg: -24800, renew: -14200, north: -18400, elim: -8600 }, { noteRef: "Note 27" }),
  row("oth_exp", "Other expenses", 1, { parent: -1842000, tech: -284600, logi: -148200, sg: -84200, renew: -22400, north: -38400, elim: 88400 }, { noteRef: "Note 28" }),
  row("total_exp", "II. Total expenses", 0, { parent: -7279200, tech: -1537200, logi: -819200, sg: -543200, renew: -172200, north: -246600, elim: 234200 }, { bold: true, isTotal: true }),
  row("pbt", "III. Profit before tax (I − II)", 0, { parent: 1230000, tech: 317200, logi: 108000, sg: 77600, renew: 14100, north: 5000, elim: -10400 }, { bold: true, isTotal: true }),
  row("tax_cur", "Current tax", 1, { parent: -310000, tech: -82200, logi: -28400, sg: -22400, renew: -4200, north: -1400 }),
  row("tax_def", "Deferred tax", 1, { parent: -22000, tech: -8400, logi: -4200, sg: -3200, renew: -1200, north: -800, elim: -8800 }),
  row("tax_total", "IV. Tax expense", 0, { parent: -332000, tech: -90600, logi: -32600, sg: -25600, renew: -5400, north: -2200, elim: -8800 }, { bold: true, isTotal: true }),
  row("pat", "V. Profit for the year (III − IV)", 0, { parent: 898000, tech: 226600, logi: 75400, sg: 52000, renew: 8700, north: 2800, elim: -19200 }, { bold: true, isTotal: true }),
  row("oci", "VI. Other comprehensive income (net of tax)", 0, { parent: 8400, tech: 1200, logi: 600, sg: 21800, renew: 200, north: 1400 }, { italic: true }),
  row("total_ci", "VII. Total comprehensive income (V + VI)", 0, { parent: 906400, tech: 227800, logi: 76000, sg: 73800, renew: 8900, north: 4200, elim: -19200 }, { bold: true, isTotal: true }),
];

// Balance Sheet — Schedule III Division II grouping: Non-current assets, Current assets,
// Equity, Non-current liabilities, Current liabilities.
export const bsRows: FSRow[] = [
  // === ASSETS ===
  row("hdr_nca", "ASSETS", 0, {}, { bold: true }),
  row("hdr_ncasub", "Non-current assets", 0, {}, { italic: true }),
  row("ppe", "Property, plant & equipment", 1, { parent: 8246000, tech: 412800, logi: 427800, sg: 184200, renew: 286400, north: 124800 }, { noteRef: "Note 3" }),
  row("cwip", "Capital work-in-progress", 1, { parent: 248000, tech: 18400, logi: 42100, sg: 0, renew: 84200, north: 0 }),
  row("rou", "Right-of-use assets", 1, { parent: 612400, tech: 84200, logi: 208600, sg: 64200, renew: 12400, north: 18200 }, { noteRef: "Note 4" }),
  row("gw", "Goodwill", 1, { parent: 0, tech: 0, logi: 0, sg: 0, renew: 0, north: 0, elim: 184500, consol: 184500 }, { noteRef: "Note 5" }),
  row("intang", "Other intangible assets", 1, { parent: 84200, tech: 24800, logi: 0, sg: 8200, renew: 0, north: 0, elim: 24000 }, { noteRef: "Note 6" }),
  row("inv_sub", "Investment in subsidiaries", 1, { parent: 1248000, tech: 0, logi: 0, sg: 0, renew: 0, north: 0, elim: -1248000, consol: 0 }),
  row("oth_fin_nc", "Other financial assets (non-current)", 1, { parent: 64200, tech: 12400, logi: 18400, sg: 8400, renew: 6200, north: 4200 }),
  row("dta", "Deferred tax assets (net)", 1, { parent: 18400, tech: 4200, logi: 6200, sg: 0, renew: 2100, north: 1200 }),
  row("hdr_casub", "Current assets", 0, {}, { italic: true }),
  row("inv", "Inventories", 1, { parent: 824200, tech: 184200, logi: 92100, sg: 84200, renew: 24800, north: 18400, elim: -7800 }, { noteRef: "Note 7" }),
  row("tr", "Trade receivables", 1, { parent: 1842000, tech: 286400, logi: 412300, sg: 184200, renew: 64200, north: 84200, elim: -142800 }, { noteRef: "Note 8" }),
  row("cash", "Cash & cash equivalents", 1, { parent: 624200, tech: 184200, logi: 135450, sg: 184200, renew: 28400, north: 42100 }, { noteRef: "Note 9" }),
  row("bank_oth", "Bank balances other than above", 1, { parent: 184200, tech: 24600, logi: 50000, sg: 18400, renew: 8200, north: 4200 }),
  row("oth_fin_c", "Other financial assets (current)", 1, { parent: 248000, tech: 38400, logi: 24800, sg: 18400, renew: 8400, north: 6200 }),
  row("oth_ca", "Other current assets", 1, { parent: 162600, tech: 28400, logi: 18200, sg: 12400, renew: 6800, north: 4200 }),
  row("ta", "Total assets", 0, { parent: 14406400, tech: 1303000, logi: 1435950, sg: 766800, renew: 532100, north: 307900, elim: -1190100 }, { bold: true, isTotal: true }),
  // === EQUITY & LIABILITIES ===
  row("hdr_eq", "EQUITY & LIABILITIES", 0, {}, { bold: true }),
  row("hdr_eqsub", "Equity", 0, {}, { italic: true }),
  row("eq", "Equity share capital", 1, { parent: 250000, tech: 50000, logi: 100000, sg: 65400, renew: 100000, north: 84200, elim: -399600 }, { noteRef: "Note 14" }),
  row("oeq", "Other equity", 1, { parent: 6842000, tech: 612400, logi: 386500, sg: 218400, renew: 84200, north: 64200, elim: -848400 }, { noteRef: "Note 15" }),
  row("nci", "Non-controlling interests", 1, { parent: 0, tech: 0, logi: 0, sg: 0, renew: 0, north: 0, elim: 184600, consol: 184600 }),
  row("hdr_ncl", "Non-current liabilities", 0, {}, { italic: true }),
  row("borr_nc", "Borrowings (non-current)", 1, { parent: 2486000, tech: 184200, logi: 320000, sg: 184200, renew: 142800, north: 84200, elim: -150000 }, { noteRef: "Note 16" }),
  row("lease_nc", "Lease liabilities (non-current)", 1, { parent: 484200, tech: 64200, logi: 178400, sg: 48400, renew: 8400, north: 14200 }),
  row("prov_nc", "Provisions (non-current)", 1, { parent: 84200, tech: 18400, logi: 12400, sg: 8400, renew: 4200, north: 2100 }),
  row("dtl", "Deferred tax liabilities (net)", 1, { parent: 184200, tech: 24800, logi: 41200, sg: 18400, renew: 6200, north: 8400, elim: 8800 }, { noteRef: "Note 17" }),
  row("hdr_cl", "Current liabilities", 0, {}, { italic: true }),
  row("borr_c", "Borrowings (current)", 1, { parent: 612400, tech: 84200, logi: 150000, sg: 38400, renew: 28400, north: 18200 }),
  row("lease_c", "Lease liabilities (current)", 1, { parent: 128200, tech: 20000, logi: 42100, sg: 15800, renew: 4000, north: 4000 }),
  row("tp", "Trade payables", 1, { parent: 1284000, tech: 184200, logi: 187200, sg: 124200, renew: 38400, north: 24200, elim: -89400 }, { noteRef: "Note 18" }),
  row("oth_fl", "Other financial liabilities", 1, { parent: 386400, tech: 28400, logi: 18200, sg: 18400, renew: 18200, north: 4200 }),
  row("prov_c", "Provisions (current)", 1, { parent: 142800, tech: 24600, logi: 12200, sg: 8400, renew: 4200, north: 2100 }),
  row("oth_cl", "Other current liabilities", 1, { parent: 1521800, tech: 7600, logi: -11750, sg: 18400, renew: 93100, north: 100 }),
  row("tl", "Total equity & liabilities", 0, { parent: 14406200, tech: 1303000, logi: 1436450, sg: 766800, renew: 532100, north: 310100, elim: -1294000 }, { bold: true, isTotal: true }),
];

// Cash flow — indirect method per Ind AS 7
export const cashFlowRows: FSRow[] = [
  row("hdr_op", "A. Cash flows from operating activities", 0, {}, { bold: true }),
  row("op_pbt", "Profit before tax", 1, { consol: 1742000 }),
  row("dep_cf", "Adjustments — Depreciation & amortisation", 1, { consol: 610600 }),
  row("fc_cf", "Adjustments — Finance costs", 1, { consol: 304600 }),
  row("oi_cf", "Adjustments — Interest income & gain on FV", 1, { consol: -84200 }),
  row("op_pre_wc", "Operating profit before working capital changes", 0, { consol: 2573000 }, { bold: true }),
  row("wc_tr", "Changes in trade receivables", 1, { consol: -184200 }),
  row("wc_inv", "Changes in inventories", 1, { consol: -64200 }),
  row("wc_tp", "Changes in trade payables", 1, { consol: 142800 }),
  row("tax_cf", "Income tax paid (net)", 1, { consol: -512400 }),
  row("ocf", "Net cash from operating activities", 0, { consol: 1955000 }, { bold: true, isTotal: true }),
  row("hdr_inv", "B. Cash flows from investing activities", 0, {}, { bold: true }),
  row("capex", "Purchase of PPE & intangibles", 1, { consol: -842000 }),
  row("acq", "Acquisition of subsidiary (net of cash)", 1, { consol: -385000 }),
  row("int_inc", "Interest received", 1, { consol: 64200 }),
  row("icf", "Net cash used in investing activities", 0, { consol: -1162800 }, { bold: true, isTotal: true }),
  row("hdr_fin", "C. Cash flows from financing activities", 0, {}, { bold: true }),
  row("borr_cf", "Net change in borrowings", 1, { consol: -184200 }),
  row("lease_cf", "Repayment of lease liabilities (principal)", 1, { consol: -142800 }),
  row("int_paid", "Finance costs paid", 1, { consol: -284600 }),
  row("div_cf", "Dividends paid (incl. to NCI)", 1, { consol: -284600 }),
  row("fcf", "Net cash used in financing activities", 0, { consol: -896200 }, { bold: true, isTotal: true }),
  row("net", "Net increase / (decrease) in cash & equivalents", 0, { consol: -104000 }, { bold: true }),
  row("op_cash", "Cash & cash equivalents — opening", 1, { consol: 1302350 }),
  row("cl_cash", "Cash & cash equivalents — closing", 0, { consol: 1198350 }, { bold: true, isTotal: true }),
];

export type HealthCheck = {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  delta?: string;
};

export const healthChecks: HealthCheck[] = [
  { id: "tb", label: "TB tie-out (Dr = Cr) across all entities", status: "ok", detail: "All 6 entities tie within ₹1,000 tolerance.", delta: "Δ ₹0" },
  { id: "ic", label: "Inter-company mismatch", status: "warn", detail: "2 of 8 IC pairs mismatched. Largest: SG ↔ Parent ₹78.4 L (cut-off).", delta: "Δ ₹80.0 L" },
  { id: "eq", label: "Equity reconciliation (opening + PAT + OCI − div)", status: "ok", detail: "Reconciled to consolidated SOCIE.", delta: "Δ ₹0" },
  { id: "nci", label: "Minority / NCI movement", status: "ok", detail: "NCI opening + share of PAT − div paid to NCI ties.", delta: "Δ ₹0" },
  { id: "gw", label: "Goodwill computation (PPA pending)", status: "warn", detail: "Northstar PPA is preliminary. DTL on FV uplift in draft.", delta: "₹18.45 Cr" },
  { id: "fx", label: "FX translation reserve (CTR)", status: "ok", detail: "Closing rate vs avg rate translation passes; OCI: ₹2.18 Cr.", delta: "₹2.18 Cr" },
];

export const notes = [
  {
    id: "RPT",
    title: "Related Party Transactions",
    indAs: "Ind AS 24",
    status: "auto",
    summary: "8 inter-company transactions with 5 related parties. Closing balances disclosed by relationship.",
    items: [
      { party: "Acme Tech Pvt Ltd", relation: "Wholly-owned subsidiary", txn: "Investment, Dividend, Services", amount: "₹3.20 Cr" },
      { party: "Acme Logistics Pvt Ltd", relation: "Subsidiary (75%)", txn: "Loan, Sales, Services", amount: "₹15.00 Cr" },
      { party: "Acme SG Pte Ltd", relation: "Wholly-owned subsidiary", txn: "Sales/Purchases", amount: "₹0.78 Cr" },
      { party: "Northstar Solutions Ltd", relation: "Subsidiary (51%)", txn: "Acquisition", amount: "₹38.50 Cr" },
      { party: "KMP — A. Vijayakumar (Group Controller)", relation: "Key Mgmt Personnel", txn: "Remuneration", amount: "₹0.62 Cr" },
    ],
  },
  {
    id: "SEG",
    title: "Operating Segments",
    indAs: "Ind AS 108",
    status: "auto",
    summary: "Three reportable segments: Industrial Products, Logistics & Renewables, Technology Services.",
    items: [
      { segment: "Industrial Products", revenue: "₹84.25 Cr", segPL: "₹15.32 Cr", assets: "₹134.81 Cr" },
      { segment: "Logistics & Renewables", revenue: "₹11.05 Cr", segPL: "₹1.61 Cr", assets: "₹16.92 Cr" },
      { segment: "Technology Services", revenue: "₹18.42 Cr", segPL: "₹3.78 Cr", assets: "₹11.77 Cr" },
    ],
  },
  {
    id: "NCI",
    title: "Non-Controlling Interests Movement",
    indAs: "Ind AS 110",
    status: "auto",
    summary: "Reconciliation of NCI from opening to closing.",
    items: [
      { line: "Opening NCI", amount: "₹16.00 Cr" },
      { line: "Share of profit for the year", amount: "₹2.46 Cr" },
      { line: "Share of OCI", amount: "₹0.08 Cr" },
      { line: "Dividends to NCI", amount: "(₹0.08 Cr)" },
      { line: "On acquisition of Northstar", amount: "₹0.95 Cr" },
      { line: "Closing NCI", amount: "₹18.46 Cr" },
    ],
  },
  {
    id: "GW",
    title: "Goodwill Movement & Impairment",
    indAs: "Ind AS 36 / 103",
    status: "review",
    summary: "Goodwill of ₹18.45 Cr arose on Northstar acquisition. CGU-level impairment test pending.",
    items: [
      { line: "Opening goodwill", amount: "₹0.00 Cr" },
      { line: "Arising on acquisition (Northstar)", amount: "₹18.45 Cr" },
      { line: "Impairment", amount: "(₹0.00 Cr)" },
      { line: "FX translation differences", amount: "₹0.00 Cr" },
      { line: "Closing goodwill", amount: "₹18.45 Cr" },
    ],
  },
];

// User profile shown in sidebar
export const currentUser = {
  name: "Aakash Vijayakumar",
  initials: "AV",
  role: "Group Controller · Acme",
  email: "aakash.v@acme.in",
};

// Notifications panel mock
export type Notification = {
  id: string;
  type: "info" | "warn" | "ok";
  title: string;
  body: string;
  time: string;
};
export const notifications: Notification[] = [
  { id: "n1", type: "warn", title: "IC mismatch detected", body: "Acme SG ↔ Parent: ₹78.40 L unmatched. Likely GR/IR cut-off.", time: "12 min ago" },
  { id: "n2", type: "info", title: "TB uploaded — Acme Renewables", body: "FY 2024-25 trial balance imported. 412 ledger lines, mapping pending.", time: "1 hr ago" },
  { id: "n3", type: "ok", title: "Mapping completed — Acme SG", body: "All 287 ledger lines mapped to FS groups.", time: "3 hr ago" },
  { id: "n4", type: "info", title: "Audit query raised", body: "Big Four engagement team requested workings for ADJ-004.", time: "yesterday" },
  { id: "n5", type: "ok", title: "Health check passed", body: "Equity rollforward ties without difference.", time: "yesterday" },
];

// Period options
export const periodOptions = [
  { id: "fy25", label: "FY 2024-25 (Annual)", range: "01 Apr 2024 – 31 Mar 2025", current: true },
  { id: "q4-25", label: "Q4 FY25", range: "01 Jan 2025 – 31 Mar 2025" },
  { id: "q3-25", label: "Q3 FY25", range: "01 Oct 2024 – 31 Dec 2024" },
  { id: "q2-25", label: "Q2 FY25", range: "01 Jul 2024 – 30 Sep 2024" },
  { id: "q1-25", label: "Q1 FY25", range: "01 Apr 2024 – 30 Jun 2024" },
  { id: "fy24", label: "FY 2023-24 (Annual)", range: "01 Apr 2023 – 31 Mar 2024" },
];

export const pnlNoteRefMap: Record<string, string> = {};
