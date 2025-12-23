# Roadmap: Medium-Term (v2.0)

**Период:** Q1-Q2 2026 (январь - июнь)
**Фокус:** Продуктовая зрелость, AI & интеграции
**Цель:** Production-ready v2.0 с AI, мобильным приложением и enterprise интеграциями

---

## 🎯 Обзор

Medium-term roadmap охватывает переход от v1.x к v2.0, добавляя критические функции для конкурентоспособности и enterprise сегмента.

### Ключевые приоритеты
1. ✅ **Завершить все P0 Stages** (17-19): Email, Mobile, Reporting
2. 🚀 **AI дифференциация** (Stage 20): Budget forecasting
3. 💬 **Team Collaboration** (Stage 21): Встроенный chat
4. 🔗 **Enterprise интеграции** (Stage 22): 1C, accounting
5. 🏢 **Multi-team поддержка** (Stages 23-25): Масштаб

### Целевые метрики v2.0
- **MAU Growth:** +150% (mobile + AI features)
- **ARPU:** +40% (enterprise features)
- **Retention:** +35% (chat + automation)
- **Enterprise Clients:** 50+ teams (multi-team + 1C)
- **API Integrations:** 100+ active (marketplace)

---

## 📋 Включённые Stages

### Phase 1: Critical Foundation (v1.x Completion) ✅

#### Stage 17: Email Notifications & Automation
**Статус:** ⏳ Planned | **Длительность:** 8-10 дней (Weeks 1-2)

**Deliverables:**
- Email provider integration (Resend/SendGrid)
- Email templates library (10+ templates)
- Notification queue system (Bull/BullMQ)
- Recurring payouts automation
- User preference center UI

**Business Impact:**
- Снижение зависимости от Telegram на 50%+
- Профессиональный имидж через branded emails
- Автоматизация payouts (экономия времени)

**Priority:** P0 - CRITICAL

---

#### Stage 18: Mobile Application MVP
**Статус:** ⏳ Planned | **Длительность:** 14 дней (Weeks 3-6)

**Deliverables:**
- React Native iOS/Android app
- Core screens (Dashboard, Projects, Expenses, Time Tracking)
- Offline-first sync (WatermelonDB)
- Camera integration для фото расходов
- Push notifications (Firebase)

**Business Impact:**
- +40% feature adoption
- Realtime logging с объектов
- Competitive advantage
- Retention improvement

**Priority:** P0 - CRITICAL

---

#### Stage 19: Advanced Reporting & Exports
**Статус:** ⏳ Planned | **Длительность:** 8 дней (Weeks 7-8)

**Deliverables:**
- PDF report generation (PDFKit)
- Excel exports (ExcelJS)
- Custom report builder UI
- Scheduled email reports
- Branding support (logo, colors)

**Business Impact:**
- +15% PROFESSIONAL plan adoption
- Unlock enterprise сегмент
- Бухгалтерская совместимость

**Priority:** P0 - CRITICAL

---

### Phase 2: AI & Collaboration (v2.0 Core) 🚀

#### Stage 20: AI-Powered Budget Forecasting
**Статус:** ⏳ Planned | **Длительность:** 10 дней (Weeks 9-10)

**Deliverables:**
- Expense AI categorization (Claude API)
- Budget recommendations engine
- Predictive analytics dashboard
- Cost optimization suggestions
- Anomaly detection alerts

**Business Impact:**
- Competitive differentiation через AI
- +25% PROFESSIONAL upgrades
- Reduce budget overruns на 30%

**Tech Stack:** Claude API, PostgreSQL ML extensions
**Cost:** ~$100-200/month API costs

**Priority:** P1 - HIGH VALUE

---

#### Stage 21: Team Collaboration & Chat
**Статус:** ⏳ Planned | **Длительность:** 10 дней (Weeks 11-12)

**Deliverables:**
- Real-time team chat (Socket.IO)
- Project-specific channels
- Direct messaging (DMs)
- File sharing in chat
- @mentions and notifications
- Activity feed & search

**Business Impact:**
- Снижение зависимости от внешних инструментов (Telegram, WhatsApp)
- +20% DAU engagement
- Better team coordination

**Tech Stack:** Socket.IO, Redis PubSub

**Priority:** P1 - HIGH VALUE

---

#### Stage 22: 1C Integration & Accounting
**Статус:** ⏳ Planned | **Длительность:** 12 дней (Weeks 13-15)

**Deliverables:**
- 1C:Enterprise API integration
- GL (General Ledger) mapping
- Automated invoice generation
- Tax compliance reports
- Bi-directional sync

**Business Impact:**
- Unlock Russian enterprise сегмент
- +40% BUSINESS plan upgrades
- Бухгалтерская автоматизация

**Tech Stack:** 1C API, background sync jobs

**Priority:** P1 - HIGH VALUE

---

### Phase 3: Enterprise Expansion (v2.0 Advanced) 🏢

#### Stage 23: Multi-Team Enterprise
**Статус:** ⏳ Planned | **Длительность:** 12 дней (Weeks 16-18)

**Deliverables:**
- Parent company → teams hierarchy
- Consolidated reporting dashboard
- Cross-team analytics
- Unified member directory
- Bulk operations UI

**Business Impact:**
- Поддержка крупных подрядчиков (10+ teams)
- +50% ENTERPRISE plan adoption
- Cross-team visibility

**Database Changes:**
```prisma
model Company {
  id String @id @default(uuid())
  name String
  teams Team[]
}

model Team {
  companyId String?
  company Company? @relation(fields: [companyId], references: [id])
}
```

**Priority:** P2 - NICE TO HAVE

---

#### Stage 24: Advanced Role & Permission System
**Статус:** ⏳ Planned | **Длительность:** 10 дней (Weeks 19-20)

**Deliverables:**
- Custom role creation UI (visual builder)
- Hierarchical roles (role inheritance)
- Permission granularity (per-project, per-module)
- Role templates library
- Delegation support

**Business Impact:**
- Поддержка больших команд (10+ members)
- +15% BUSINESS plan retention
- Fine-grained access control

**Priority:** P2 - NICE TO HAVE

---

#### Stage 25: API Marketplace & Integrations
**Статус:** ⏳ Planned | **Длительность:** 14 дней (Weeks 21-23)

**Deliverables:**
- Public REST API v1
- Webhook event publishing
- OAuth 2.0 for apps
- App marketplace catalog UI
- Zapier integration connector
- Developer documentation portal
- Partner dashboard

**Business Impact:**
- Создание экосистемы интеграций
- +20% retention (стоимость переключения)
- +5% new revenue stream (partner commissions)

**Tech Stack:**
- REST API (NestJS)
- Webhook system (Bull/BullMQ)
- OAuth 2.0 (Passport)
- Zapier platform

**Priority:** P2 - NICE TO HAVE

---

## 📅 Timeline & Gantt Chart

```
╔══════════════════════════════════════════════════════════════════╗
║                     v2.0 Development Timeline                     ║
╚══════════════════════════════════════════════════════════════════╝

Phase 1: Critical Foundation (Weeks 1-8) ─────────────────
├─ Week 1-2:   Stage 17 - Email Automation           [P0]
├─ Week 3-6:   Stage 18 - Mobile App MVP             [P0]
└─ Week 7-8:   Stage 19 - Advanced Reporting         [P0]
                           ↓ v1.5.0 RELEASE

Phase 2: AI & Collaboration (Weeks 9-15) ─────────────────
├─ Week 9-10:  Stage 20 - AI Budget Forecasting      [P1]
├─ Week 11-12: Stage 21 - Team Collaboration Chat    [P1]
└─ Week 13-15: Stage 22 - 1C Integration            [P1]
                           ↓ v2.0-beta RELEASE

Phase 3: Enterprise Expansion (Weeks 16-23) ──────────────
├─ Week 16-18: Stage 23 - Multi-Team Enterprise      [P2]
├─ Week 19-20: Stage 24 - Advanced Roles             [P2]
└─ Week 21-23: Stage 25 - API Marketplace            [P2]
                           ↓ v2.0 PRODUCTION RELEASE

Total Duration: 23 недели (~5.5 месяцев)
```

### Milestone Dates (примерно)

| Milestone | Week | Target Date | Version | Status |
|-----------|------|-------------|---------|--------|
| Stage 16 Complete | 0 | Week 0 | v1.4.0 | 🚧 In Progress |
| Stage 17 Complete | 2 | Week 2 | v1.5.0-alpha | ⏳ Planned |
| Stage 18 Beta (TestFlight) | 5 | Week 5 | v1.5.0-beta | ⏳ Planned |
| Stage 18 Production | 6 | Week 6 | - | ⏳ Planned |
| Stage 19 Complete | 8 | Week 8 | v1.5.0 | ⏳ Planned |
| **v1.5.0 Release** | **8** | **Week 8** | **v1.5.0** | 🎯 **Milestone** |
| Stage 20 Complete | 10 | Week 10 | v2.0-alpha | ⏳ Planned |
| Stage 21 Complete | 12 | Week 12 | v2.0-alpha | ⏳ Planned |
| Stage 22 Complete | 15 | Week 15 | v2.0-beta | ⏳ Planned |
| **v2.0-beta Release** | **15** | **Week 15** | **v2.0-beta** | 🎯 **Milestone** |
| Stage 23 Complete | 18 | Week 18 | v2.0-rc | ⏳ Planned |
| Stage 24 Complete | 20 | Week 20 | v2.0-rc | ⏳ Planned |
| Stage 25 Complete | 23 | Week 23 | v2.0 | ⏳ Planned |
| **v2.0 Production** | **23** | **Week 23** | **v2.0** | 🎯 **TARGET** |

---

## 💰 Resource Requirements

### Team Composition (Peak)

| Role | FTE | Stages | Notes |
|------|-----|--------|-------|
| Backend Developer | 2 | All | NestJS, GraphQL, Prisma |
| Mobile Developer | 2 | 18 | React Native (Weeks 3-6) |
| Frontend Developer | 1.5 | 17, 19, 23-25 | Next.js, React |
| AI/ML Engineer | 1 | 20 | Claude API integration |
| QA Engineer | 1 | All | E2E testing, mobile testing |
| DevOps Engineer | 0.5 | All | Deployment, monitoring |
| **Total** | **8-9 FTE** | - | Peak weeks 3-6 |

### Infrastructure Costs (Monthly)

| Service | Cost | Stages | Notes |
|---------|------|--------|-------|
| Resend/SendGrid | $50-100 | 17 | Email provider |
| Firebase (FCM) | $0-50 | 18 | Push notifications |
| Claude API | $100-200 | 20 | Budget forecasting |
| Redis Cloud | $50-100 | 21, 26 | Chat PubSub, caching |
| Apple Developer | $99/year | 18 | App Store |
| Google Play | $25 one-time | 18 | Google Play |
| **Total** | **~$300-500/mo** | - | Operational costs |

### One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| App Store submission | $99 | Yearly |
| Google Play submission | $25 | One-time |
| 1C API documentation | $0-500 | May need consulting |
| **Total** | **~$124-624** | - |

---

## 🎯 Success Criteria

### v1.5.0 Release (Week 8)

**Functional:**
- ✅ Email delivery > 95% success rate
- ✅ Mobile app approved in App Store + Google Play
- ✅ Offline sync working без data loss
- ✅ PDF/Excel exports functional

**Business:**
- ✅ MAU growth > 50% (mobile adoption)
- ✅ Email engagement > 30% open rate
- ✅ PROFESSIONAL plan upgrades > 15%
- ✅ Mobile app rating > 4.5 stars

**Technical:**
- ✅ API uptime > 99.5%
- ✅ Mobile app crash-free rate > 99%
- ✅ Report generation < 10 seconds

---

### v2.0-beta Release (Week 15)

**Functional:**
- ✅ AI budget forecasting accuracy > 80%
- ✅ Real-time chat latency < 500ms
- ✅ 1C sync working bi-directionally

**Business:**
- ✅ PROFESSIONAL plan upgrades > 25% (AI feature)
- ✅ DAU engagement > 40% (chat adoption)
- ✅ BUSINESS plan upgrades > 40% (1C integration)

**Technical:**
- ✅ WebSocket connection uptime > 99%
- ✅ AI API response time < 3 seconds
- ✅ 1C sync latency < 5 minutes

---

### v2.0 Production Release (Week 23)

**Functional:**
- ✅ Multi-team hierarchy working (3+ levels)
- ✅ Custom roles operational
- ✅ API marketplace with 10+ apps
- ✅ Zapier integration functional

**Business:**
- ✅ ENTERPRISE plan adoption > 50 teams
- ✅ MAU growth > 150% (vs. v1.4.0)
- ✅ ARPU increase > 40%
- ✅ Partner revenue > $5k MRR
- ✅ Retention > 85%

**Technical:**
- ✅ Overall API uptime > 99.5%
- ✅ Public API response time < 200ms (p95)
- ✅ Webhook delivery rate > 98%
- ✅ Zero critical security vulnerabilities

---

## 🚨 Risks & Mitigation

### Critical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Mobile App Store Rejection** | High (2-week delay) | Medium | Submit early, TestFlight fallback |
| **AI API Cost Overrun** | Medium | Medium | Budget caps, usage monitoring |
| **1C API Documentation Gap** | High | High | Hire 1C consultant, fallback to manual |
| **Email Deliverability** | Medium | Low | Resend (best-in-class), DNS config |

### High Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Offline Sync Data Loss** | High | Low | WatermelonDB (proven), extensive testing |
| **WebSocket Scalability** | Medium | Medium | Redis PubSub, horizontal scaling |
| **Resource Availability** | Medium | Medium | Clear priorities, backup contractors |

### Medium Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Scope Creep** | Medium | High | Strict MVP scope per stage |
| **Technical Debt** | Low | Medium | Code reviews, refactoring sprints |
| **Partner Adoption** | Low | Medium | Incentive program, developer support |

---

## 📊 Dependencies & Critical Path

### Stage Dependencies

```
           ┌─> Stage 19 (Reporting) ──┐
           │                           │
Stage 16 ──┼─> Stage 17 (Email) ───────┼─> Stage 18 (Mobile)
           │                           │
           └─────────────────────────> Stage 20 (AI) ─┐
                                                       │
                                       Stage 21 (Chat) ┼─> Stage 23 (Multi-Team)
                                                       │
                                       Stage 22 (1C) ──┘
                                                       │
                                                       ├─> Stage 24 (Roles)
                                                       │
                                                       └─> Stage 25 (API)

Critical Path: 16 → 17 → 18 → 20 → 21 → 22 → 23 → 25
Parallel Tracks: 19 (can run Week 7-8 alongside 18)
```

### Feature Dependencies

1. **Stage 20 (AI) requires Stage 17 (Email)** - для AI рекомендаций нужны email alerts
2. **Stage 21 (Chat) requires Stage 17 (Email)** - email fallback для offline messages
3. **Stage 22 (1C) requires Stage 19 (Reporting)** - экспорты нужны для 1C sync
4. **Stage 23 (Multi-Team) requires Stages 21 + 22** - enterprise нужны chat + 1C
5. **Stage 25 (API) requires Stage 17** - webhooks используют email notifications

---

## 🔄 Post-v2.0 Plans

После завершения v2.0 (Week 23), переход к:

### Performance & Scale (v2.x)
- **Stage 26: Performance Optimization** (2 weeks)
  - Database optimization, Redis caching, CDN
  - Goal: 10x faster queries, 10,000+ teams support

### Compliance & Governance (v2.x)
- **Stage 27: Compliance & Data Governance** (2 weeks)
  - GDPR compliance, data retention, audit logs
  - Enterprise compliance requirement

### Advanced Mobile Features (v2.x)
- **Stage 28: Geolocation & Site Tracking** (2 weeks)
  - GPS tracking, geofencing, auto clock-in/out
  - +30% BUSINESS plan retention

**См. [Long-term Roadmap](./ROADMAP_LONG_TERM_2025-2026.md)**

---

## 📈 Business Metrics Tracking

### KPIs by Phase

| Metric | v1.4.0 (Current) | v1.5.0 (Week 8) | v2.0-beta (Week 15) | v2.0 (Week 23) |
|--------|------------------|-----------------|---------------------|----------------|
| **MAU** | 1,000 | 1,500 (+50%) | 2,000 (+100%) | 2,500 (+150%) |
| **ARPU** | $15 | $18 (+20%) | $20 (+33%) | $21 (+40%) |
| **Retention** | 65% | 75% (+15%) | 80% (+23%) | 85% (+31%) |
| **Enterprise** | 10 teams | 20 teams | 35 teams | 50+ teams |
| **Mobile Users** | 0% | 40% | 60% | 70% |
| **API Integrations** | 0 | 0 | 10 apps | 100+ zaps |

### Revenue Projections

| Plan | v1.4.0 MRR | v2.0 MRR | Growth |
|------|------------|----------|--------|
| LITE | $0 | $0 | - |
| FOREMAN | $5,000 | $7,500 | +50% |
| BRIGADE | $8,000 | $12,000 | +50% |
| ENTERPRISE | $2,000 | $10,000 | +400% |
| **Total MRR** | **$15,000** | **$29,500** | **+97%** |

---

## 📚 References

### Stage Documents
- [Stage 16: Advanced Team Management](../stages/STAGE_16_ADVANCED_TEAM_MANAGEMENT.md)
- [Stage 17: Email Automation](../stages/STAGE_17_EMAIL_AUTOMATION.md)
- [Stage 18: Mobile App MVP](../stages/STAGE_18_MOBILE_APP_MVP.md)
- [Stage 19: Advanced Reporting](../stages/STAGE_19_ADVANCED_REPORTING.md)
- [Stage 20: AI Budget Forecasting](../stages/STAGE_20_AI_BUDGET_FORECASTING.md)
- [Stage 21: Team Collaboration](../stages/STAGE_21_TEAM_COLLABORATION.md)
- [Stage 22: 1C Integration](../stages/STAGE_22_1C_INTEGRATION.md)
- [Stage 23: Multi-Team Enterprise](../stages/STAGE_23_MULTI_TEAM_ENTERPRISE.md)
- [Stage 24: Advanced Roles](../stages/STAGE_24_ADVANCED_ROLES.md)
- [Stage 25: API Marketplace](../stages/STAGE_25_API_MARKETPLACE.md)

### Related Roadmaps
- [Short-term Roadmap (v1.x)](./ROADMAP_SHORT_TERM_v1.x.md)
- [Long-term Roadmap (2025-2026)](./ROADMAP_LONG_TERM_2025-2026.md)
- [Master Roadmap](./ROADMAP_MASTER.md)

### Technical Documentation
- [Database Schema](../database/schema.prisma)
- [API Documentation](../api/README.md)
- [Architecture Overview](../ARCHITECTURE.md)

---

**Created:** 2025-12-23
**Version:** 1.0
**Owner:** ProRab.space Product Team
**Last Updated:** 2025-12-23
