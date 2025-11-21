# Changelog (frontend)

## 2025-11-21
- Scaffolded Next.js 16 app in `apps/web` with pnpm workspace wiring.
- Added Tailwind 3 + shadcn/ui setup (theme tokens, animate plugin, utility helpers).
- Built landing page highlighting stack and quick links to GraphQL playground/shadcn docs.
- Added base UI button component and utility `cn` helper.
# Changelog (frontend)

## Module: Frontend Monorepo Setup

### Step 1: Next.js + Tailwind + shadcn Scaffold

:calendar: `2025-11-21`

**Added**

- ✅ Next.js 16 app scaffolded under `apps/web` with pnpm workspace wiring.
- ✅ Tailwind 3 + shadcn/ui configuration (`tailwind.config.ts`, theme tokens, animate plugin).
- ✅ Base UI button component and `cn` helper utilities.
- ✅ Hero landing page highlighting stack links and GraphQL examples.

**Changed**

- ✅ Updated global styles to design system tokens and dark mode support.
- ✅ PostCSS pipeline switched to Tailwind + Autoprefixer config.

**Fixed**

- ✅ Resolved lint warning for anonymous default export in `postcss.config.mjs`.

**Removed**

- ❌ Default Next.js starter hero content.

**Files Modified**

- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/postcss.config.mjs`
- `apps/web/package.json`
- `apps/web/tailwind.config.ts`

**Files Created**

- `apps/web/components.json`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/lib/utils.ts`
- `pnpm-workspace.yaml`
- `package.json`
- `.gitignore`
- `changelog.frontend.md`

---

## Module: Frontend Monorepo Setup

### Step 3: Turborepo Schema Update

:calendar: `2025-11-21`

**Added**

- ✅ N/A.

**Changed**

- ✅ Updated `turbo.json` to new `tasks` schema (was `pipeline`) for Turbo 2.6 compatibility.

**Fixed**

- ✅ Dev command `pnpm dev` now runs without Turbo schema error.

**Removed**

- ❌ N/A.

**Files Modified**

- `turbo.json`

**Files Created**

- N/A

---

### Step 2: Turborepo Integration for Frontend Pipelines

:calendar: `2025-11-21`

**Added**

- ✅ Turborepo configuration to orchestrate frontend dev/build/lint tasks.

**Changed**

- ✅ Root scripts now run through Turborepo (`dev`, `build`, `lint`) with parallel dev support.
- ✅ `.gitignore` updated to exclude Turborepo caches.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `package.json`
- `.gitignore`

**Files Created**

- `turbo.json`

---
