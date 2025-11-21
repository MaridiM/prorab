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
