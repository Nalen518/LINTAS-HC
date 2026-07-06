# LINTAS dashboard — code-along map

Frontend for LINTAS (Next.js 14 App Router + Tailwind + Tabler icons).
Every file below maps 1:1 to a frame in the Figma file
([Lintas](https://www.figma.com/design/LXlUR5tBGnKe058EnXsByO/Lintas)) — open the
file, find the node id in its header comment, build to spec (ADR-008).

Copy sources: `../../docs/LANDING_COPY.md` (landing) · `../../PRD.md` (app).
Tokens: `app/globals.css` + `tailwind.config.ts` (from `docs/FIGMA_TOKENS.md`).
API shapes: `../../docs/API_CONTRACT.md` — never invent a field or endpoint.

## Run

```bash
pnpm install
pnpm dev        # localhost:3000
pnpm build      # run before every commit — catches type errors
```

## Routes (app/)

| Route | File | Figma frame | Status |
|---|---|---|---|
| `/` | `app/page.tsx` | Landing sections, in order | scaffold |
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard — Home (100:1027) | scaffold |
| `/dashboard/new` | `app/dashboard/new/page.tsx` | Upload → Processing → Results → Submit (see file header) | scaffold |
| `/dashboard/history` | `app/dashboard/history/page.tsx` | History (100:1261) · empty (100:1768) | scaffold |
| `/dashboard/history/[id]` | `app/dashboard/history/[id]/page.tsx` | no frame — reuses Results read-only | scaffold |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | Settings (100:1453) | scaffold |
| `/dashboard/help` | `app/dashboard/help/page.tsx` | Help (100:1551) | scaffold |
| shell | `app/dashboard/layout.tsx` | Sidebar + content split (ADR-015) | **done** |
| proxy | `app/api/backend/[...path]/route.ts` | → FastAPI `/api/*` | **done** |

## Landing sections (components/landing/) — build order top→bottom

| File | Figma frame | Copy |
|---|---|---|
| `LandingNav.tsx` | Landing Page (20:11) nav / Nav symbol (8:17) | LANDING_COPY §2 |
| `Hero.tsx` | Landing Page (20:11) | §3 |
| `WhatThisDoes.tsx` | What this does (23:4) | §4 |
| `HowItWorks.tsx` | How it works (34:9) | §5 |
| `HowLintasThinks.tsx` | How LINTAS thinks (37:11) | §6 |
| `BeforeAfter.tsx` | Before / After (38:13) | §7 |
| `Footer.tsx` | Footer (48:27) | §8 |

## Declaration workflow (components/declaration/) — /dashboard/new

| File | Figma frame | Phase |
|---|---|---|
| `Stepper.tsx` | 85:300 (on every workflow screen) | all |
| `UploadZone.tsx` | Upload (69:383) | 1 |
| `ExtractionProgress.tsx` | Processing (75:620) | 2 |
| `ExtractionDegraded.tsx` | Extraction degraded (100:1785) | 2 (error) |
| `ResultsSummary.tsx` | Summary cards (85:322) | 3 |
| `ExtractedFieldsTab.tsx` | Extracted Fields (84:534) | 3 · tab 1 |
| `ConfidenceField.tsx` | field row inside 84:534 | 3 · tab 1 |
| `ValidationTab.tsx` | Results · Validation (86:337) | 3 · tab 2 |
| `RiskShapTab.tsx` | Results · Risk & SHAP (85:296) | 3 · tab 3 |
| `ShapWaterfall.tsx` | factor rows inside 85:296 | 3 · tab 3 |
| `HsCodeTab.tsx` | Results · HS code (87:378) | 3 · tab 4 |
| `ImpactTab.tsx` | Results · Impact (88:419) | 3 · tab 5 |
| `ConfirmCeisaModal.tsx` | Submit confirm (94:460) | 4 |
| `CeisaSubmitModal.tsx` | CEISA response (96:503) — exact string "Simulated CEISA Response (Demo Mode)" | 4 |
| `ShareModal.tsx` | Share (100:1845) | after submit |

## Shared components — done, built from the Figma Components page (3:2)

| File | Figma component |
|---|---|
| `components/ui/button.tsx` | Button (5:19) |
| `components/ui/badge.tsx` | Badge (62:24) |
| `components/ui/metric-card.tsx` | Metric card (68:19) |
| `components/ui/page-header.tsx` | Page header (68:18) |
| `components/ui/tab-bar.tsx` | Tabs (85:348) |
| `components/ui/risk-meter.tsx` | Risk meter (85:328) |
| `components/ui/declaration-row.tsx` | Table row (68:20) |
| `components/shell/Sidebar.tsx` | Sidebar (68:17) |

## lib/

| File | Purpose |
|---|---|
| `lib/api.ts` | Typed fetch wrappers per API_CONTRACT — zod-validated |
| `lib/utils.ts` | `cn()`, `formatRupiah` (Rp), `formatDate` (day-first) |

## Fixtures (fixtures/)

Contract-shaped mock responses — develop against these until the backend
serves `/api/*` for real. `canonical_run.json` is the pre-computed demo run.

## Hard rules

- CEISA is **simulated** — never call a real DJBC endpoint (ADR-002, FR-5.5)
- No auth anywhere (ADR-009) — app opens straight into /dashboard
- No invented metrics (ADR-012/016)
- Sentence case; Rp for currency; day-first dates; Tabler outline icons only
- Every value uses a design token — no ad-hoc hex/px
