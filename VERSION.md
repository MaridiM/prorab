# ProRab Version Information

**Current Version:** v1.6.2
**Release Date:** 2025-12-28
**Status:** 🟢 Production Ready

---

## Version History

### v1.6.2 (2025-12-28) - Payment Provider Auto-Selection & Bug Fixes

**Bug Fixes:**

- ✅ Fixed "Select plan" button not responding for new users
- ✅ Fixed team ID resolution for users without existing subscriptions
- ✅ Fixed Prisma validation error for plan enum field
- ✅ Fixed payment provider database initialization
- ✅ Fixed async provider initialization (constructors can't await)
- ✅ Fixed payment flow for existing subscriptions (plan changes)

**Improvements:**

- 🌍 Automatic payment provider selection based on IP geolocation
  - Russia/Belarus/CIS → Yookassa
  - Europe/Ukraine/International → Stripe
- 🚀 Direct redirect to payment without manual provider selection
- 🧪 Development mode mock payments (test UI without real credentials)
- 📦 Added `pnpm prisma:seed:providers` script for easy setup
- 📝 Comprehensive fix documentation in [QUICK_FIX.md](QUICK_FIX.md)
- 🔧 Lazy initialization pattern for payment providers

**New Features:**

- **Development Mode Mock Payments**
  - Test subscription flow without Stripe/Yookassa credentials
  - Mock payment URLs: `?mock=true&provider=stripe&amount=XXX`
  - Automatic detection of missing credentials in dev environment
  - Warning logs indicate when running in mock mode
  - Production mode still requires real credentials

**New Files:**

- `apps/api/src/modules/payments/utils/geo-provider.util.ts` - IP-based provider detection
- `apps/api/prisma/seed-payment-providers.ts` - Provider setup script
- `apps/api/prisma/setup-payment-providers.sql` - SQL provider setup
- `apps/api/prisma/cleanup-duplicate-subscriptions.sql` - Cleanup script
- `QUICK_FIX.md` - Manual fix instructions
- `TESTING_v1.6.2.md` - Complete testing guide

**Modified Files:**

- `apps/api/src/core/payments/providers/stripe.provider.ts` - Added lazy init + mock mode
- `apps/api/src/core/payments/providers/yookassa.provider.ts` - Added lazy init + mock mode
- `apps/api/src/modules/payments/payments.service.ts` - Auto-provider selection
- `apps/api/src/modules/payments/payments.resolver.ts` - IP extraction
- `apps/api/src/modules/subscriptions/subscriptions.service.ts` - Plan enum mapping
- `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - Team ID resolution + payment init

**Statistics:**

- Backend: +120 LOC (geolocation utilities, provider seeding, mock implementations)
- Frontend: +15 LOC (MyTeams query, teamId resolution)
- Documentation: 2 comprehensive guides (QUICK_FIX.md, TESTING_v1.6.2.md)

**Breaking Changes:** None

**Upgrade Path:**

```bash
# 1. Setup payment providers
cd apps/api
pnpm prisma:seed:providers

# 2. Restart services
pnpm dev

# 3. Test mock mode (no credentials needed)
# OR configure real credentials in .env
```

---

### v1.6.0 (2025-12-28) - Full Subscription System with Multi-Provider Payments

**Major Features:**
- ✅ Multi-provider payment support (Yookassa + Stripe)
- ✅ Complete subscription management UI
- ✅ Comprehensive limit enforcement (Projects, Members, Storage)
- ✅ Upgrade experience (Button + Widget + Prompts)
- ✅ Downgrade protection with detailed error handling

**Statistics:**
- Backend: ~525 LOC across 7 components
- Frontend: ~650 LOC across 7 components
- Documentation: 4 comprehensive documents
- Tests: 17+ test cases

**Breaking Changes:** None

---

### v1.5.0 - Payment System Foundation

**Features:**
- Yookassa payment integration
- Payment webhook processing
- Subscription trials
- Basic limit enforcement

---

### v1.4.5 - Admin Panel & Team Management

**Features:**
- Advanced admin panel
- Team management
- Role-based permissions
- Analytics dashboard

---

### v1.4.2 - Enhanced Admin Features

**Features:**
- Announcement handling
- User role management
- Improved UX

---

## Package Versions

### Monorepo
- **Package:** `prorab-monorepo`
- **Version:** `1.6.2`
- **Location:** `./package.json`

### Backend API
- **Package:** `api`
- **Version:** `1.6.2`
- **Location:** `./apps/api/package.json`
- **Framework:** NestJS 11
- **Database:** PostgreSQL + Prisma

### Frontend Web
- **Package:** `web`
- **Version:** `1.6.2`
- **Location:** `./apps/web/package.json`
- **Framework:** Next.js 16
- **UI:** React 19

---

## Environment Variables

### Frontend (.env)
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:8080/graphql
NEXT_PUBLIC_APP_VERSION=1.6.2
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://...

# JWT & Cookies
JWT_SECRET=...
COOKIE_SECRET=...

# Payment Providers
YOOKASSA_SHOP_ID=...
YOOKASSA_SECRET_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

---

## Git Tags

```bash
# List all version tags
git tag -l "v*"

# Show tag details
git show v1.6.0

# Checkout specific version
git checkout v1.6.0
```

---

## Deployment

### Current Production Version
**Version:** v1.6.2
**Deployed:** TBD
**Environment:** Production

### Staging
**Version:** v1.6.2
**Environment:** Staging
**URL:** https://staging.prorab.space

---

## Upgrade Path

### From v1.6.0 to v1.6.2

**No breaking changes** - Safe to upgrade directly.

**Steps:**

1. Pull latest code: `git pull origin main`
2. Install dependencies: `pnpm install`
3. Update environment variables: `NEXT_PUBLIC_APP_VERSION=1.6.2`
4. **Setup payment providers:**

   ```bash
   cd apps/api
   pnpm prisma:seed:providers
   ```

5. Build: `pnpm build`
6. Restart services

**Database Setup Required:**

- Run `pnpm prisma:seed:providers` to create payment provider records
- Or follow instructions in [QUICK_FIX.md](QUICK_FIX.md) for manual setup

**Database Migrations:** None required (schema unchanged)

### From v1.5.0 to v1.6.0

**No breaking changes** - Safe to upgrade directly.

**Steps:**

1. Pull latest code: `git pull origin main`
2. Install dependencies: `pnpm install`
3. Update environment variables (add `NEXT_PUBLIC_APP_VERSION`)
4. Build: `pnpm build`
5. Restart services

**Database Migrations:** None required (schema unchanged)

**Configuration Required:**

- Set up payment providers in admin panel
- Configure at least one provider as primary
- Test payment flow on staging

---

## Version Scheme

ProRab follows **Semantic Versioning** (SemVer):

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes, major rewrites
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, minor improvements

**Examples:**
- `1.6.0` → New features (subscription system)
- `1.6.1` → Bug fix
- `2.0.0` → Breaking changes

---

## Release Checklist

Before tagging a new version:

- [ ] Update `package.json` in root
- [ ] Update `apps/api/package.json`
- [ ] Update `apps/web/package.json`
- [ ] Update `apps/web/.env` with `NEXT_PUBLIC_APP_VERSION`
- [ ] Update this `VERSION.md` file
- [ ] Update changelog documents
- [ ] Create git tag: `git tag -a vX.Y.Z -m "Release message"`
- [ ] Push tag: `git push origin vX.Y.Z`

---

## Documentation

For detailed information about v1.6.0:

- **Testing Guide:** `docs/testing/custom_tests/v1.6.0.md`
- **Release Summary:** `docs/changelog/v1.6.0_SUMMARY.md`
- **Integration Guide:** `docs/features/SUBSCRIPTION_INTEGRATION.md`
- **Production Readiness:** `docs/PRODUCTION_READINESS_v1.6.0.md`

---

## Support

**Issues:** https://github.com/your-org/prorab/issues
**Changelog:** `docs/changelog/`
**Documentation:** `docs/`

---

**Last Updated:** 2025-12-28
**Next Version:** v1.7.0 (TBD)
