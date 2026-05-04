"use client";

// Excel export — workbook with three sheets.
// Gridlines are turned off on every sheet.
// Balance Sheet and Notes reference P&L cells via formulas (e.g. =`P&L`!E14)
// so changing the P&L value in Excel propagates to the linked cells.

import { entities, pnlRows, bsRows, cashFlowRows, period } from "./data";
import type { FSRow } from "./data";

const COL_KEYS = ["parent", "tech", "logi", "sg", "renew", "north", "elim", "consol"] as const;

function colLetter(idx: number) {
  // 1-based: 1 -> A
  let n = idx;
  let out = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

export async function exportConsolidatedFS() {
  const ExcelJS = (await import("exceljs")).default;
  const { saveAs } = await import("file-saver");

  const wb = new ExcelJS.Workbook();
  wb.creator = "ConsolidatePro";
  wb.created = new Date();
  wb.company = "Acme Industries Limited";

  const NUM_FMT = "#,##0.00;(#,##0.00);\"—\"";
  const HEADERS = [
    "Particulars",
    ...entities.map((e) => `${e.shortName} (${e.currency})`),
    "Eliminations",
    "Consolidated",
  ];

  // Column letter for each FS column (Particulars=A, parent=B, ..., consol=I)
  const COL_LETTER: Record<string, string> = {
    label: "A",
    parent: "B",
    tech: "C",
    logi: "D",
    sg: "E",
    renew: "F",
    north: "G",
    elim: "H",
    consol: "I",
  };

  // ─── P&L sheet ───
  const pnl = wb.addWorksheet("P&L", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 5, xSplit: 1 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });
  pnl.properties.defaultRowHeight = 16;
  // column widths
  pnl.getColumn(1).width = 56;
  for (let i = 2; i <= HEADERS.length; i++) pnl.getColumn(i).width = 14;

  // brand header
  pnl.mergeCells("A1:I1");
  pnl.getCell("A1").value = "Acme Industries Limited (Consolidated)";
  pnl.getCell("A1").font = { name: "Inter", bold: true, size: 14, color: { argb: "FF0F1318" } };
  pnl.mergeCells("A2:I2");
  pnl.getCell("A2").value = `Statement of Profit and Loss for the year ended ${period.reportingDate}`;
  pnl.getCell("A2").font = { name: "Inter", italic: true, size: 10, color: { argb: "FF5B6473" } };
  pnl.mergeCells("A3:I3");
  pnl.getCell("A3").value = "(All amounts in ₹ Lakhs, unless otherwise stated)";
  pnl.getCell("A3").font = { name: "Inter", italic: true, size: 9, color: { argb: "FF8A93A2" } };

  // table header on row 5
  HEADERS.forEach((h, i) => {
    const cell = pnl.getCell(5, i + 1);
    cell.value = h;
    cell.font = { name: "Inter", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1C2129" } };
    cell.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : "right", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF1C2129" } },
      bottom: { style: "thin", color: { argb: "FF1C2129" } },
    };
  });
  pnl.getRow(5).height = 28;

  // body rows: convert from '000 to lakhs ('000 / 100)
  const writeFSRows = (sheet: any, rows: FSRow[], includeAllCols: boolean) => {
    let r = 6;
    const rowMap: Record<string, number> = {};
    rows.forEach((row) => {
      const cells: any[] = [row.label];
      for (const k of COL_KEYS) {
        if (!includeAllCols && k !== "consol") {
          cells.push(null);
        } else {
          const v = row.values[k] ?? 0;
          cells.push(v === 0 ? null : v / 100);
        }
      }
      const xlrow = sheet.addRow(cells);
      sheet.getRow(r).height = 16;
      // formatting
      const labelCell = xlrow.getCell(1);
      labelCell.font = {
        name: "Inter",
        bold: !!row.bold,
        italic: !!row.italic,
        size: 10,
        color: { argb: row.italic ? "FF5B6473" : "FF1C2129" },
      };
      const indent = row.level === 1 ? 1 : row.level === 2 ? 2 : 0;
      labelCell.alignment = { vertical: "middle", indent };

      for (let c = 2; c <= HEADERS.length; c++) {
        const cell = sheet.getCell(r, c);
        cell.numFmt = NUM_FMT;
        cell.font = {
          name: "JetBrains Mono",
          bold: !!row.bold,
          size: 10,
          color: { argb: row.bold ? "FF0F1318" : "FF1C2129" },
        };
        cell.alignment = { vertical: "middle", horizontal: "right" };
        // tint elim and consol cols
        if (c === 8) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF7E0" } };
        }
        if (c === 9) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF4FF" } };
          if (row.bold)
            cell.font = { ...cell.font, bold: true, color: { argb: "FF1E44B3" } };
        }
      }
      // total row underline
      if (row.isTotal) {
        for (let c = 1; c <= HEADERS.length; c++) {
          const cell = sheet.getCell(r, c);
          cell.border = {
            top: { style: "thin", color: { argb: "FFC1C7D0" } },
            bottom: { style: "double", color: { argb: "FF1C2129" } },
          };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F8FA" } };
        }
      }
      rowMap[row.id] = r;
      r += 1;
    });
    return rowMap;
  };

  const pnlRowMap = writeFSRows(pnl, pnlRows, true);

  // Footer note
  const noteRow = pnl.lastRow!.number + 2;
  pnl.mergeCells(noteRow, 1, noteRow, 9);
  pnl.getCell(noteRow, 1).value =
    "The accompanying notes form an integral part of these consolidated financial statements.";
  pnl.getCell(noteRow, 1).font = { name: "Inter", italic: true, size: 9, color: { argb: "FF5B6473" } };

  // ─── Balance Sheet sheet (with formulas linking to P&L) ───
  const bs = wb.addWorksheet("Balance Sheet", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 5, xSplit: 1 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });
  bs.properties.defaultRowHeight = 16;
  bs.getColumn(1).width = 56;
  for (let i = 2; i <= HEADERS.length; i++) bs.getColumn(i).width = 14;

  bs.mergeCells("A1:I1");
  bs.getCell("A1").value = "Acme Industries Limited (Consolidated)";
  bs.getCell("A1").font = { name: "Inter", bold: true, size: 14, color: { argb: "FF0F1318" } };
  bs.mergeCells("A2:I2");
  bs.getCell("A2").value = `Balance Sheet as at ${period.reportingDate}`;
  bs.getCell("A2").font = { name: "Inter", italic: true, size: 10, color: { argb: "FF5B6473" } };
  bs.mergeCells("A3:I3");
  bs.getCell("A3").value = "(All amounts in ₹ Lakhs, unless otherwise stated)";
  bs.getCell("A3").font = { name: "Inter", italic: true, size: 9, color: { argb: "FF8A93A2" } };

  HEADERS.forEach((h, i) => {
    const cell = bs.getCell(5, i + 1);
    cell.value = h;
    cell.font = { name: "Inter", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1C2129" } };
    cell.alignment = {
      vertical: "middle",
      horizontal: i === 0 ? "left" : "right",
      wrapText: true,
    };
  });
  bs.getRow(5).height = 28;

  const bsRowMap = writeFSRows(bs, bsRows, true);

  // Now patch the "Other equity" row's consol cell with a live formula
  // referencing P&L's PAT row. This demonstrates linking BS → P&L.
  const oeqRow = bsRowMap["oeq"];
  const patRow = pnlRowMap["pat"];
  const ociRow = pnlRowMap["oci"];
  if (oeqRow && patRow) {
    const cell = bs.getCell(oeqRow, 9); // consol col
    const existing = cell.value as number | null;
    const opening = existing ? Number(existing) - 8980 : 0; // mock opening reserves
    // Live formula: opening + PAT (consol) + OCI (consol)
    cell.value = {
      formula: `${opening}+'P&L'!I${patRow}+'P&L'!I${ociRow}`,
      result: existing ?? 0,
    } as any;
    cell.numFmt = NUM_FMT;
    cell.font = {
      name: "JetBrains Mono",
      size: 10,
      bold: false,
      color: { argb: "FF1E44B3" },
      italic: true,
    };
    cell.alignment = { vertical: "middle", horizontal: "right" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF4FF" } };
    // add a comment indicating the link
    cell.note = {
      texts: [{ text: "Linked: opening reserves + PAT (P&L) + OCI (P&L)" }],
    } as any;
  }

  // Patch NCI row to reference P&L NCI share — show formula style demo
  const nciBSRow = bsRowMap["nci"];
  if (nciBSRow && patRow) {
    const cell = bs.getCell(nciBSRow, 9);
    const existing = cell.value as number | null;
    cell.value = {
      formula: `1600+'P&L'!I${patRow}*0.025`, // mock: opening NCI 1,600 + share of PAT
      result: existing ?? 0,
    } as any;
    cell.numFmt = NUM_FMT;
    cell.font = {
      name: "JetBrains Mono",
      size: 10,
      italic: true,
      color: { argb: "FF1E44B3" },
    };
    cell.alignment = { vertical: "middle", horizontal: "right" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF4FF" } };
    cell.note = {
      texts: [{ text: "Linked: opening NCI + 2.5% × consolidated PAT (mock)" }],
    } as any;
  }

  // Footer
  const bsNoteRow = bs.lastRow!.number + 2;
  bs.mergeCells(bsNoteRow, 1, bsNoteRow, 9);
  bs.getCell(bsNoteRow, 1).value =
    "Highlighted cells in Other Equity and NCI are linked formulas referencing the P&L sheet.";
  bs.getCell(bsNoteRow, 1).font = {
    name: "Inter",
    italic: true,
    size: 9,
    color: { argb: "FF5B6473" },
  };

  // ─── Cash Flow sheet ───
  const cf = wb.addWorksheet("Cash Flow", {
    views: [{ showGridLines: false, state: "frozen", ySplit: 5 }],
    pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1 },
  });
  cf.getColumn(1).width = 64;
  cf.getColumn(2).width = 18;
  cf.mergeCells("A1:B1");
  cf.getCell("A1").value = "Acme Industries Limited (Consolidated)";
  cf.getCell("A1").font = { name: "Inter", bold: true, size: 14, color: { argb: "FF0F1318" } };
  cf.mergeCells("A2:B2");
  cf.getCell("A2").value = `Statement of Cash Flows for the year ended ${period.reportingDate} (Indirect method)`;
  cf.getCell("A2").font = { name: "Inter", italic: true, size: 10, color: { argb: "FF5B6473" } };
  cf.mergeCells("A3:B3");
  cf.getCell("A3").value = "(All amounts in ₹ Lakhs, unless otherwise stated)";
  cf.getCell("A3").font = { name: "Inter", italic: true, size: 9, color: { argb: "FF8A93A2" } };

  cf.getCell(5, 1).value = "Particulars";
  cf.getCell(5, 2).value = "Consolidated";
  for (let c = 1; c <= 2; c++) {
    const cell = cf.getCell(5, c);
    cell.font = { name: "Inter", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1C2129" } };
    cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "right" };
  }
  cf.getRow(5).height = 28;

  let cfR = 6;
  const cfRowMap: Record<string, number> = {};
  cashFlowRows.forEach((row) => {
    const indent = row.level === 1 ? 1 : row.level === 2 ? 2 : 0;
    cf.getCell(cfR, 1).value = row.label;
    cf.getCell(cfR, 1).font = {
      name: "Inter",
      bold: !!row.bold,
      italic: !!row.italic,
      size: 10,
      color: { argb: row.italic ? "FF5B6473" : "FF1C2129" },
    };
    cf.getCell(cfR, 1).alignment = { vertical: "middle", indent };

    const v = row.values.consol ?? 0;
    cf.getCell(cfR, 2).value = v === 0 ? null : v / 100;
    cf.getCell(cfR, 2).numFmt = NUM_FMT;
    cf.getCell(cfR, 2).font = {
      name: "JetBrains Mono",
      bold: !!row.bold,
      size: 10,
      color: { argb: row.bold ? "FF0F1318" : "FF1C2129" },
    };
    cf.getCell(cfR, 2).alignment = { vertical: "middle", horizontal: "right" };
    if (row.isTotal) {
      for (let c = 1; c <= 2; c++) {
        const cell = cf.getCell(cfR, c);
        cell.border = {
          top: { style: "thin", color: { argb: "FFC1C7D0" } },
          bottom: { style: "double", color: { argb: "FF1C2129" } },
        };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F8FA" } };
      }
    }
    cfRowMap[row.id] = cfR;
    cfR += 1;
  });

  // Link CF "Profit before tax" to P&L PBT row to demonstrate cross-sheet formula
  if (cfRowMap["op_pbt"] && pnlRowMap["pbt"]) {
    const cell = cf.getCell(cfRowMap["op_pbt"], 2);
    cell.value = {
      formula: `'P&L'!I${pnlRowMap["pbt"]}`,
      result: cell.value as number,
    } as any;
    cell.font = {
      name: "JetBrains Mono",
      size: 10,
      italic: true,
      color: { argb: "FF1E44B3" },
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF4FF" } };
    cell.note = { texts: [{ text: "Linked: P&L PBT" }] } as any;
  }
  // Link Depreciation in CF
  if (cfRowMap["dep_cf"] && pnlRowMap["dep"]) {
    const cell = cf.getCell(cfRowMap["dep_cf"], 2);
    cell.value = {
      formula: `-'P&L'!I${pnlRowMap["dep"]}`,
      result: cell.value as number,
    } as any;
    cell.font = {
      name: "JetBrains Mono",
      size: 10,
      italic: true,
      color: { argb: "FF1E44B3" },
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF4FF" } };
    cell.note = { texts: [{ text: "Linked: −P&L D&A (sign-flip)" }] } as any;
  }
  // Link Finance costs in CF
  if (cfRowMap["fc_cf"] && pnlRowMap["fin"]) {
    const cell = cf.getCell(cfRowMap["fc_cf"], 2);
    cell.value = {
      formula: `-'P&L'!I${pnlRowMap["fin"]}`,
      result: cell.value as number,
    } as any;
    cell.font = {
      name: "JetBrains Mono",
      size: 10,
      italic: true,
      color: { argb: "FF1E44B3" },
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF4FF" } };
    cell.note = { texts: [{ text: "Linked: −P&L finance costs (sign-flip)" }] } as any;
  }

  // ─── Notes sheet (linked) ───
  const notes = wb.addWorksheet("Notes", {
    views: [{ showGridLines: false }],
  });
  notes.getColumn(1).width = 48;
  notes.getColumn(2).width = 20;
  notes.mergeCells("A1:B1");
  notes.getCell("A1").value = "Selected Notes & Reconciliations";
  notes.getCell("A1").font = { name: "Inter", bold: true, size: 14 };
  notes.mergeCells("A2:B2");
  notes.getCell("A2").value = "Note 30 — NCI movement (Ind AS 110) · ₹ Lakhs";
  notes.getCell("A2").font = { name: "Inter", italic: true, size: 10, color: { argb: "FF5B6473" } };

  let nR = 4;
  const nciHeader = ["Particulars", "Amount"];
  nciHeader.forEach((h, i) => {
    const cell = notes.getCell(nR, i + 1);
    cell.value = h;
    cell.font = { name: "Inter", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1C2129" } };
    cell.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : "right" };
  });
  notes.getRow(nR).height = 24;
  nR += 1;

  const nciLines: { label: string; formula?: string; v?: number }[] = [
    { label: "Opening NCI", v: 1600 },
    {
      label: "Share of profit for the year",
      formula: pnlRowMap["pat"] ? `'P&L'!I${pnlRowMap["pat"]}*0.025` : undefined,
      v: 246,
    },
    {
      label: "Share of OCI",
      formula: pnlRowMap["oci"] ? `'P&L'!I${pnlRowMap["oci"]}*0.025` : undefined,
      v: 8,
    },
    { label: "Dividends paid to NCI", v: -8 },
    { label: "On acquisition of Northstar", v: 95 },
    {
      label: "Closing NCI",
      formula: undefined,
      v: 1846,
    },
  ];
  const startRow = nR;
  nciLines.forEach((nl, i) => {
    notes.getCell(nR, 1).value = nl.label;
    notes.getCell(nR, 1).font = {
      name: "Inter",
      bold: i === nciLines.length - 1,
      size: 10,
    };
    const cell = notes.getCell(nR, 2);
    if (nl.formula) {
      cell.value = { formula: nl.formula, result: nl.v ?? 0 } as any;
      cell.font = {
        name: "JetBrains Mono",
        size: 10,
        italic: true,
        color: { argb: "FF1E44B3" },
      };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF4FF" } };
      cell.note = { texts: [{ text: "Linked to P&L" }] } as any;
    } else if (i === nciLines.length - 1) {
      cell.value = { formula: `SUM(B${startRow}:B${nR - 1})`, result: nl.v ?? 0 } as any;
      cell.font = { name: "JetBrains Mono", bold: true, size: 10 };
      cell.note = { texts: [{ text: "Sum of opening + movements" }] } as any;
    } else {
      cell.value = nl.v ?? null;
      cell.font = { name: "JetBrains Mono", size: 10 };
    }
    cell.numFmt = NUM_FMT;
    cell.alignment = { vertical: "middle", horizontal: "right" };
    if (i === nciLines.length - 1) {
      for (let c = 1; c <= 2; c++) {
        notes.getCell(nR, c).border = {
          top: { style: "thin", color: { argb: "FFC1C7D0" } },
          bottom: { style: "double", color: { argb: "FF1C2129" } },
        };
      }
    }
    nR += 1;
  });

  // small explainer
  notes.mergeCells(nR + 1, 1, nR + 1, 2);
  notes.getCell(nR + 1, 1).value =
    "Cells highlighted in blue are live formulas — they reference the P&L sheet so any change there flows through.";
  notes.getCell(nR + 1, 1).font = {
    name: "Inter",
    italic: true,
    size: 9,
    color: { argb: "FF5B6473" },
  };

  // ─── Cover sheet ───
  const cover = wb.addWorksheet("Cover", {
    views: [{ showGridLines: false }],
  });
  cover.getColumn(1).width = 80;
  cover.mergeCells("A1:A1");
  cover.getCell("A1").value = "Acme Industries Limited";
  cover.getCell("A1").font = { name: "Inter", bold: true, size: 24, color: { argb: "FF0F1318" } };
  cover.getCell("A2").value = "Consolidated Financial Statements";
  cover.getCell("A2").font = { name: "Inter", size: 14, color: { argb: "FF3F4754" } };
  cover.getCell("A3").value = `Year ended ${period.reportingDate} · ${period.framework} · Schedule III (Division II)`;
  cover.getCell("A3").font = { name: "Inter", size: 11, color: { argb: "FF5B6473" } };

  cover.getCell("A6").value = "Sheets in this workbook";
  cover.getCell("A6").font = { name: "Inter", bold: true, size: 11 };
  ["1. P&L — Statement of Profit and Loss", "2. Balance Sheet (linked formulas to P&L)", "3. Cash Flow — Indirect method (linked formulas to P&L)", "4. Notes — NCI movement (linked formulas to P&L)"].forEach((t, i) => {
    cover.getCell(7 + i, 1).value = t;
    cover.getCell(7 + i, 1).font = { name: "Inter", size: 10, color: { argb: "FF1C2129" } };
  });
  cover.getCell("A12").value = "Conventions";
  cover.getCell("A12").font = { name: "Inter", bold: true, size: 11 };
  ["• Figures presented in ₹ Lakhs.", "• Gridlines turned off on every sheet for a printed-FS look.", "• Cells filled in light blue contain formulas that link to other sheets.", "• Negative numbers shown in parentheses, e.g. (123.45)."].forEach((t, i) => {
    cover.getCell(13 + i, 1).value = t;
    cover.getCell(13 + i, 1).font = { name: "Inter", size: 10, color: { argb: "FF3F4754" } };
  });
  cover.getCell("A19").value = `Prepared by: Aakash Vijayakumar (Group Controller)`;
  cover.getCell("A19").font = {
    name: "Inter",
    italic: true,
    size: 10,
    color: { argb: "FF5B6473" },
  };

  // Move Cover to first
  wb.worksheets.unshift(wb.worksheets.pop()!);

  // Generate file
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Acme-Consolidated-FS-FY25.xlsx`);
}
