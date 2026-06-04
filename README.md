# Marta & Mateusz — Zakopane Seating Planner

A 100% client-side wedding seating planner. **No backend, no API calls, no database.**
All state lives in `localStorage`; the production build is static HTML/CSS/JS ready for
**AWS S3 + CloudFront**.

Stack: **React + TypeScript + Vite + Tailwind CSS**, with `@dnd-kit` and `jsPDF` for
Stage 2 (drag-and-drop) and PDF export.

---

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

> The project was scaffolded in an offline sandbox, so dependencies are declared in
> `package.json` but not installed. `npm install` pulls everything (React, Tailwind,
> @dnd-kit, jsPDF). No other setup is required.

## Build (static output)

```bash
npm run build    # -> dist/  (pure static files)
npm run preview  # serve dist/ locally to verify
```

`vite.config.ts` sets `base: './'` so the build works from any S3 prefix or CloudFront
path without rewriting asset URLs.

## Deploy to S3 + CloudFront

```bash
aws s3 sync dist/ s3://YOUR_BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**SPA refresh handling.** This is a single-page app with no client-side routing, so a
refresh on `/` always serves `index.html`. If you later add routing, either:
- use `HashRouter` (URLs become `/#/path`, no server config needed), or
- set the CloudFront/S3 custom error response: map **403/404 → `/index.html` (200)**.

---

## Architecture

```
src/
  types.ts                  Domain model + constants (STORAGE_KEY, defaults)
  hooks/useLocalStorage.ts  Persistence primitive (lazy read, cross-tab sync, safe)
  utils/csv.ts              In-browser CSV / paste parser (File API), id generator
  utils/export.ts           JSON backup + jsPDF seating manifest
  context/PlannerContext.tsx  Single source of truth; all actions persist automatically
  components/
    Header.tsx              Editable title, ridgeline motif, import/export
    SummaryDashboard.tsx    Totals + dietary tally
    Sidebar.tsx             Collapsible "Unseated guests"
    GuestList.tsx           Search + RSVP filter
    GuestCard.tsx           Guest row (drag handle reserved for Stage 2)
    TableCanvas.tsx         Add tables, responsive grid
    TableCard.tsx           Shape, seat limit, over-capacity red highlight
    ImportModal.tsx         CSV upload + paste + live preview
```

### Persistence
`useLocalStorage` is implemented first and wraps the entire planner state under the key
`zakopane-seating-planner/v1`. Every action in `PlannerContext` goes through it, so
persistence is automatic and survives refreshes and browser restarts. Edits sync across
open tabs via the `storage` event.

---

## Status

**Stage 1 (this delivery) — complete:** UI shell, theme, localStorage sync, CSV/paste
import, guest management, table management with over-capacity highlighting, summary
dashboard, JSON + PDF export.

Seating currently uses interim controls (a per-guest table dropdown, and click-a-chip to
unseat) so the data model and over-capacity logic are fully testable.

**Stage 2 (next) — drag & drop:** replace the interim controls with `@dnd-kit`:
- `DndContext` at the app root; `useDraggable` on `GuestCard`; `useDroppable` on tables and
  the sidebar drop zone.
- Drag from sidebar → table, table → table, table → sidebar (unseat).
- `onDragEnd` calls the existing `assignGuest(guestId, tableId)` action — the seam is
  already in place.
```
