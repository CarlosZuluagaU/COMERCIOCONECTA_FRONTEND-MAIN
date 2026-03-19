# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build (uses 4GB Node memory limit)
npm run build

# Lint
npm run lint

# Production
npm run start
```

No test suite is configured.

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

The `AuthContext` throws at startup if `NEXT_PUBLIC_API_BASE_URL` is undefined, so this is required.

## Architecture

This is a **Next.js 15 App Router** project (TypeScript, no Tailwind — plain CSS modules per page).

### Two distinct user-facing surfaces

1. **Admin panel** — authenticated, protected behind `AuthContext` (JWT stored in `localStorage`). Routes under `app/dashboard/`, `app/sales/`, `app/products/`, `app/clients/`, `app/purchases/`, `app/ecommerce/`.

2. **Public storefront** — unauthenticated. Two implementations exist side-by-side:
   - `app/store/` — static product list (hardcoded products), checkout via Wompi payment gateway (hardcoded to `localhost:8080`).
   - `app/store2/` — separate storefront variant.

### Auth flow

`app/context/AuthContext.tsx` provides `AuthProvider` wrapping the entire app in `app/layout.tsx`. It exposes `useAuth()` which returns `{ user, token, login, logout }`. Tokens (access + refresh) are persisted in `localStorage`.

### Shared layout pattern

Every admin page follows the same structure:

- Wraps content in `<div className="dashboard-page">` + `<Sidebar>` + `<main className="dashboard-main">`
- Imports `app/dashboard/dashboard.css` as the base stylesheet
- Adds a page-specific CSS file for overrides

`app/dashboard/Sidebar.tsx` is the single nav component for all admin pages, with collapsible submenus.

### API communication

All API calls use `process.env.NEXT_PUBLIC_API_BASE_URL` as base. Pages use both `fetch` (directly) and `axios` (in AuthContext). No centralized API client exists — each page calls the API independently.

### Electronic billing (Factus)

`app/sales/` handles the electronic invoicing flow:

- `sales/create` — create a venta (sale record in the backend)
- `sales/page` — list ventas; status `ERROR` is displayed as "APROBADA" (approved)
- `sales/[id]/facturar` — trigger Factus e-invoice generation
- `sales/[id]/invoices` — view generated invoices

Types for the Factus API response are in `types/factus.ts`. PDF generation is in `utils/BillPDFGenerator.ts` using jsPDF + html2canvas.

### Store customization (planned feature)

A planned admin feature will allow merchants to brand their public storefront. The design lives in `mockups/15-store-customizer.html` — a split-screen panel (controls left, live preview right) covering: logo, color palette, typography, hero content, categories, and footer. When implementing, config should be persisted per-tenant via the backend and applied at render time using CSS custom properties (`--primary`, `--accent`, `--radius-btn`, `--radius-card`).

### Build notes

- `next.config.js` sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` — TypeScript and ESLint errors will not fail the build.
- Path alias `@/*` maps to the repo root.
- All remote image hostnames are allowed (`hostname: '**'`).

## Mockups

`mockups/index.html` is the entry point to all UI mockups (open directly in a browser — no server needed). They use the project's real color palette (`#1F3B4D` primary, `#00d4aa` accent) and are interlinked. Use them as the visual reference when implementing new screens.
