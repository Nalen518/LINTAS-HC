# LINTAS — Frontend (dashboard/)

The Next.js dashboard for LINTAS, the AI customs-declaration tool for Cikarang
Dryport (AI Open Hackathon 2026 semifinal). This folder is the **frontend
only**. The backend + ML pipeline live in `../src/` (see the root `README.md`).

- **Stack:** Next.js 14 (App Router) · TypeScript (strict) · Tailwind · Recharts · Framer Motion · Tabler icons
- **No auth** — the app opens straight into `/dashboard` (ADR-009).
- **CEISA is simulated** — never a real DJBC call (ADR-002). The response modal shows "Simulated CEISA Response (Demo Mode)".
- **Design source of truth:** Figma (every screen is built to a frame); tokens in `app/globals.css` + `tailwind.config.ts`.

---

## Quick start

```bash
cd dashboard
pnpm install
cp .env.example .env.local     # then edit if needed
pnpm dev                       # → http://localhost:3005
```

> Port is **3005**, not 3000 (3000 is reserved on some Windows setups).
> `pnpm build` runs a production build; `pnpm exec tsc --noEmit` type-checks
> without touching `.next` (use this while a dev server is running).

### Environment variables (`.env.local`)

| Var | Default | Purpose |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8000` | Where the FastAPI backend runs. The frontend proxies to it. |
| `NEXT_PUBLIC_USE_FIXTURES` | `true` | `true` = use local `fixtures/*.json` (dev without a backend). **Set `false` to call the real backend.** |

---

## How the frontend talks to the backend + ML  ← read this before merging

This is the single integration seam. **The frontend never calls the backend
directly** — it calls `/api/backend/*`, which `next.config.mjs` rewrites to
`${BACKEND_URL}/api/*`. So the backend just needs to serve `/api/*`.

Every call lives in **`lib/api.ts`**, typed and **zod-validated against
`../../docs/API_CONTRACT.md`** (the shared contract — do not change a shape on
one side only).

| Frontend call (`lib/api.ts`) | Backend endpoint | Owner |
|---|---|---|
| `extractDocuments(files)` | `POST /api/extract` (multipart: 3 files) | **ML pipeline** — Docling → PaddleOCR → LayoutLMv3 → TableTransformer → Ollama |
| `validateDocuments({ extraction_id, documents })` | `POST /api/validate` | **Backend** — Permendag rules + cross-doc + XGBoost/SHAP risk |
| `predictHsCode({ item_description, ... })` | `POST /api/predict-hs-code` | **ML** — HS code classifier |
| `submitCeisa({ validation_id })` | `POST /api/submit-ceisa` | **Backend** — builds CEISA JSON, returns a **simulated** ack (`simulated: true`) |
| `getHealth()` | `GET /api/health` | **Backend** |

**Declaration flow (what the user does → what backend/ML must return):**

```
Upload 3 docs → /api/extract  → extraction_id + documents + confidence_scores + ocr_meta
             → /api/validate  → risk_level + ml_risk_probability + warnings[] + shap_top_features[]
             → /api/predict-hs-code → suggested_hs_code + confidence + reasoning + alternatives
             → /api/submit-ceisa    → simulated: true + ceisa_ack + ceisa_payload
```

The UI renders **whatever the backend returns** — nothing is hardcoded. Risk,
warnings, SHAP factors, extracted-field confidence, HS-code, and the duties calc
all come from these responses. Right now `NEXT_PUBLIC_USE_FIXTURES=true` serves
`fixtures/*.json` (which match the contract shapes) so the UI works before the
backend is ready.

### To go live against the real backend

1. Backend serves the 5 endpoints at `/api/*` matching `docs/API_CONTRACT.md`
   (including CORS for `http://localhost:3000`/`3005`, and `simulated: true` on
   `/api/submit-ceisa`). The `src/main.py:50` hardcoded mock must be replaced so
   `/api/extract` processes the real uploaded files.
2. Frontend: set `NEXT_PUBLIC_USE_FIXTURES=false` and `BACKEND_URL` → restart `pnpm dev`.
3. Nothing else changes — the same components render the real data.

---

## Folder structure

```
dashboard/
├── app/
│   ├── page.tsx                     Landing page (public)
│   ├── layout.tsx                   Root layout, fonts, metadata
│   ├── dashboard/                   The app (no auth)
│   │   ├── layout.tsx               Sidebar + content shell (ADR-015)
│   │   ├── page.tsx                 Dashboard home (metrics/chart/attention — derived, lib/dashboard.ts)
│   │   ├── new/page.tsx             New declaration workflow (upload→processing→results→submit)
│   │   ├── history/page.tsx         History list + search/filters
│   │   ├── history/[id]/page.tsx    Read-only detail (reuses Results)
│   │   ├── settings/page.tsx        Impact-estimate assumptions (feed the Impact tab) + app info
│   │   └── help/page.tsx            Glossary + FAQ
│   └── api/backend/[...path]/route.ts   (proxy handled by next.config rewrite)
├── components/
│   ├── ui/                          Shared primitives (button, badge, modal, tab-bar, risk-meter, table row…)
│   ├── landing/                     Landing sections (one file per Figma section)
│   ├── shell/Sidebar.tsx            App nav
│   ├── dashboard/                   Home widgets (RecentDeclarations, WeeklyChart, AttentionPanel, HistoryEmpty)
│   └── declaration/                 The workflow: UploadZone, ExtractionProgress/Degraded, StageList,
│                                    ResultsView + 5 tabs, Confirm/CeisaSubmit/Share modals…
├── lib/
│   ├── api.ts                       Typed API wrappers (zod) — the contract seam
│   ├── results.ts                   Derive display data from extract/validate responses
│   ├── customs.ts                   Duties & taxes calc (CIF/PPN/PPh) + effort estimate (ADR-016)
│   ├── dashboard.ts                 Derive home metrics/chart/attention from the declarations list
│   ├── settings.ts                  Impact-estimate assumptions (localStorage)
│   ├── mock-data.ts                 Demo declarations (single source; swap for a backend fetch)
│   └── utils.ts                     cn(), formatRupiah (Rp), formatDate (day-first)
├── fixtures/                        Contract-shaped mock responses for dev (extract/validate/…)
├── tailwind.config.ts               Design tokens → Tailwind
└── app/globals.css                  CSS variable tokens (emerald #065F46 locked)
```

Each component/page file names the Figma frame it implements in a header comment.

---

## Conventions (so the merge stays clean)

- **Never invent an API field or endpoint** — update `docs/API_CONTRACT.md` first, then both sides.
- Sentence case copy; currency as **Rp** in the UI (IDR only inside the CEISA JSON); dates day-first (`5 Jul 2026`); Tabler outline icons; design tokens only (no ad-hoc hex/px).
- TypeScript `strict: true`. Run `pnpm exec tsc --noEmit` before committing.

## Status

Frontend is **feature-complete** for the semifinal: landing, dashboard home,
the full new-declaration workflow (upload → processing/degraded → results with 5
real-data tabs → confirm → simulated CEISA), history + detail + share, settings,
help. Currently running on fixtures; flip `NEXT_PUBLIC_USE_FIXTURES=false` once
the backend serves the contract.

**Known follow-up (needs backend):** the dashboard aggregate stats and the
per-declaration History detail use demo data because there's no
declarations/stats endpoint in the contract yet — add those endpoints and wire
`lib/dashboard.ts` / the detail page to fetch.
