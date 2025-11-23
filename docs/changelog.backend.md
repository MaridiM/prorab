# Changelog (backend)

## 2025-11-21
- Scaffolded NestJS API in `apps/api` with pnpm workspace wiring.
- Configured GraphQL (Apollo driver) + ConfigModule, Prisma module/service, and health query.
- Added Prisma schema for `Project` model and generated Prisma client.
- Implemented Projects resolver/service with create + list operations.
- Updated E2E test to target GraphQL health endpoint; lint fixed.
# Changelog (backend)

## Module: Backend Monorepo Setup

### Step 1: NestJS GraphQL + Prisma Bootstrap

:calendar: `2025-11-21`

**Added**

- ✅ NestJS API scaffolded under `apps/api` with GraphQL (Apollo driver) and ConfigModule.
- ✅ Prisma integration with `PrismaModule`/`PrismaService` and Postgres connection via `.env`.
- ✅ Projects module with GraphQL resolver, DTO, model, and Prisma service for create/list.
- ✅ Health query resolver and e2e test targeting `/graphql`.
- ✅ Prisma schema defining `Project` model and generated Prisma client.
- ✅ Workspace scripts for Prisma commands and dev workflows.

**Changed**

- ✅ `main.ts` bootstrapping enhanced with CORS, validation pipe, graceful shutdown, and startup logging.
- ✅ `app.module.ts` now wires GraphQL auto-schema, ConfigModule env loading, Prisma, and Projects module.

**Fixed**

- ✅ Lint issues in tests and bootstrap (await handling, typed response checks).

**Removed**

- ❌ Default Nest controller/service and sample e2e test hitting `/`.

**Files Modified**

- `apps/api/src/app.module.ts`
- `apps/api/src/main.ts`
- `apps/api/test/app.e2e-spec.ts`
- `apps/api/package.json`
- `package.json`

**Files Created**

- `apps/api/.env`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/app.resolver.ts`
- `apps/api/src/prisma/prisma.module.ts`
- `apps/api/src/prisma/prisma.service.ts`
- `apps/api/src/projects/dto/create-project.input.ts`
- `apps/api/src/projects/models/project.model.ts`
- `apps/api/src/projects/projects.module.ts`
- `apps/api/src/projects/projects.resolver.ts`
- `apps/api/src/projects/projects.service.ts`
- `changelog.backend.md`

---

## Module: Backend Monorepo Setup

### Step 7: GraphQL Type Metadata Fix

:calendar: `2025-11-21`

**Added**

- ✅ Explicit GraphQL field type declarations for optional `description` fields.

**Changed**

- ✅ `Project` model and `CreateProjectInput` now specify `@Field(() => String, { nullable: true })` to avoid undefined type metadata.

**Fixed**

- ✅ Resolved GraphQL schema build error (`Undefined type error` for `description`).

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/src/projects/models/project.model.ts`
- `apps/api/src/projects/dto/create-project.input.ts`

**Files Created**

- N/A

---

## Module: Backend Monorepo Setup

### Step 8: Core Module Skeleton & Prisma Move

:calendar: `2025-11-21`

**Added**

- ✅ Core module wiring config/env loading, GraphQL module setup, and Prisma module exposure.
- ✅ Config helpers for app defaults and GraphQL options.

**Changed**

- ✅ AppModule now composes CoreModule + ProjectsModule, simplifying bootstrap.
- ✅ PrismaService relocated under `core/prisma` with clean shutdown hooks.
- ✅ ESLint config adjusted to remove redundant project setting; tsconfig now includes tests.
- ✅ Workspace dev dependency added for `@trivago/prettier-plugin-sort-imports` to satisfy lint tooling.

**Fixed**

- ✅ Lint project-service parsing errors; ensured test files are part of TS project for linting.

**Removed**

- ❌ Legacy `src/prisma` module/service copies.

**Files Modified**

- `apps/api/src/app.module.ts`
- `apps/api/eslint.config.mjs`
- `apps/api/tsconfig.json`
- `package.json`

**Files Created**

- `apps/api/src/core/core.module.ts`
- `apps/api/src/core/config/app.config.ts`
- `apps/api/src/core/config/graphql.config.ts`
- `apps/api/src/core/prisma/prisma.module.ts`
- `apps/api/src/core/prisma/prisma.service.ts`
- `docs/architecture.backend.md`

---

### Step 9: Dependency Refresh & Version Bump

:calendar: `2025-11-21`

**Added**

- ✅ Upgraded Prisma packages to 6.19.0 and Node typings to current major.

**Changed**

- ✅ API package version set to `0.0.2`.

**Fixed**

- ✅ N/A.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/package.json`

**Files Created**

- N/A

---

### Step 10: GraphQL Context Typing & Prisma Path Fix

:calendar: `2025-11-21`

**Added**

- ✅ Typed GraphQL context parameters to avoid implicit any.

**Changed**

- ✅ Updated PrismaService imports to the new core location across main/bootstrap and services.

**Fixed**

- ✅ Resolved TypeScript errors for missing Prisma path and implicit any in GraphQL context.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/src/core/config/graphql.config.ts`
- `apps/api/src/main.ts`
- `apps/api/src/projects/projects.service.ts`

**Files Created**

- N/A

---

### Step 11: Prisma Client Output Alignment

:calendar: `2025-11-22`

**Added**

- ✅ Regenerated Prisma client to `prisma/__generated__` with Prisma 6.19.0.

**Changed**

- ✅ PrismaService now imports PrismaClient from `@prisma/__generated__`.

**Fixed**

- ✅ Resolved TypeScript errors about missing PrismaClient exports and model accessors.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/src/core/prisma/prisma.service.ts`

**Files Created**

- `apps/api/prisma/__generated__/*` (via `pnpm --filter api exec prisma generate`).

---

### Step 6: ValidationPipe Dependencies Added

:calendar: `2025-11-21`

**Added**

- ✅ Installed `class-validator` and `class-transformer` to support global `ValidationPipe`.

**Changed**

- ✅ API runtime now resolves ValidationPipe package requirement.

**Fixed**

- ✅ Runtime error complaining about missing `class-validator` on startup.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/package.json`

**Files Created**

- N/A

---

### Step 5: Prisma Shutdown Hook Fix

:calendar: `2025-11-21`

**Added**

- ✅ Lifecycle hook `onModuleDestroy` to disconnect Prisma safely.

**Changed**

- ✅ Prisma shutdown handling now uses Nest `enableShutdownHooks` without `$on('beforeExit')` type issues.

**Fixed**

- ✅ Resolved TypeScript error for `$on('beforeExit')` in `PrismaService` and ensured clean shutdown.

**Removed**

- ❌ Deprecated `$on('beforeExit')` handler that broke compilation.

**Files Modified**

- `apps/api/src/prisma/prisma.service.ts`
- `apps/api/src/main.ts`

**Files Created**

- N/A

---

### Step 4: Turbo Dev Runs API

:calendar: `2025-11-21`

**Added**

- ✅ `dev` npm script in `apps/api` to participate in the monorepo `turbo run dev`.

**Changed**

- ✅ `pnpm dev` now launches both Next.js (3000) and NestJS API (3001) via Turborepo.

**Fixed**

- ✅ Eliminated missing-script issue where Turbo only started the web app.

**Removed**

- ❌ N/A.

**Files Modified**

- `apps/api/package.json`

**Files Created**

- N/A

---

### Step 3: Turborepo Schema Update

:calendar: `2025-11-21`

**Added**

- ✅ N/A.

**Changed**

- ✅ Updated `turbo.json` to use the new `tasks` key (Turbo 2.6 requirement) for backend workflows.

**Fixed**

- ✅ Dev pipeline `pnpm dev` now runs without Turbo schema errors.

**Removed**

- ❌ N/A.

**Files Modified**

- `turbo.json`

**Files Created**

- N/A

---

### Step 2: Turborepo Orchestration for API Workflows

:calendar: `2025-11-21`

**Added**

- ✅ Turborepo pipeline to coordinate backend dev/build/lint runs across packages.

**Changed**

- ✅ Root scripts now use Turborepo for `dev`, `build`, and `lint` commands.
- ✅ `.gitignore` updated to exclude Turborepo cache artifacts.

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

### Step 14: Prisma v7 Finalization (adapter, schema, config)

:calendar: `2025-11-22`

**Added**

- ✅ Prisma v7 packages (`@prisma/client`, `prisma`, `@prisma/adapter-pg`) and Postgres typings.
- ✅ `prisma.config.ts` with dotenv loading and centralized datasource/migrations config.

**Changed**

- ✅ Prisma schema uses `provider = "prisma-client"` outputting to `prisma/generated`; datasource URL handled in config.
- ✅ PrismaService uses PrismaPg adapter with shared pg Pool and imports from `@prisma/generated/client`.
- ✅ API version bumped to `0.0.4`; tsconfig paths updated to new generated location.

**Fixed**

- ✅ Removed schema-embedded URL per v7 requirements and cleaned old `prisma/__generated__` artifacts.

**Removed**

- ❌ Old Prisma v6 generated client directory `prisma/__generated__`.

**Files Modified**

- `apps/api/package.json`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/core/prisma/prisma.service.ts`
- `apps/api/tsconfig.json`

**Files Created**

- `prisma.config.ts`
- `apps/api/prisma/generated/*` (new client)

---

### Step 15: Prisma DB Sync & Regeneration

:calendar: `2025-11-22`

**Added**

- ✅ Ran `prisma migrate reset`, `migrate dev --name sync-v7`, `db push`, and regenerated client.

**Changed**

- ✅ Ensured database state matches v7 schema; cleaned old generated artifacts.

**Fixed**

- ✅ Resolved lingering Prisma TS errors by removing legacy outputs and re-emitting client.

**Removed**

- ❌ Stale Prisma generate outputs in `prisma/__generated__`.

**Files Modified**

- `apps/api/prisma/schema.prisma`
- `apps/api/src/core/prisma/prisma.service.ts`
- `apps/api/tsconfig.json`
- `apps/api/tsconfig.build.json`

**Files Created**

- `apps/api/prisma/generated/*`
- `apps/api/prisma/__migrations__/20251122000241_sync_v7/migration.sql`

---

### Step 16: Roadmap Refresh

:calendar: `2025-11-22`

**Added**

- ✅ Roadmap rewritten with clear phases, statuses, and completed ORM/Prisma tasks.

**Changed**

- ✅ Document now reflects completed Prisma v7 setup and pending feature tracks.

**Fixed**

- ✅ Removed unreadable text; clarified deliverables and timeline.

**Removed**

- ❌ N/A.

**Files Modified**

- `docs/roadmap.md`

**Files Created**

- N/A

---
## 2025-11-23
- Нет изменений в backend-коде в этой итерации; обновлены только документация и фронтенд-лендинг.
