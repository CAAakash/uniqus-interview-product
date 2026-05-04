# ConsolidatePro

Frontend mockup for a financial statement preparation and consolidation app for CA firms and listed companies. Ind AS · Schedule III ready.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- lucide-react

## Screens

1. **Dashboard** — group entities, status pills, consolidation pipeline, health checks
2. **Trial Balance Workspace** — ledger-level TB with FS group mapping
3. **Inter-company Eliminations** — auto-match with mismatch / unmatched review
4. **Consolidation Adjustments** — Goodwill / NCI / FV / unrealised profit / Ind AS
5. **Consolidated FS** — column-wise build (Parent + Subs + Eliminations = Consolidated), drill-down
6. **Notes & Disclosures** — auto-drafted RPT, segment, NCI movement, goodwill movement

Mobile-first. All views work down to 360px width.
