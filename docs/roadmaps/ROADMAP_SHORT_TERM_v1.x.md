# Roadmap: Short-Term (v1.x Завершение)

**Период:** Q1 2026 (январь - март)
**Фокус:** Завершение текущей версии, критичные функции
**Цель:** Production-ready v1.x с мобильным приложением

---

## 🎯 Обзор

Short-term roadmap фокусируется на завершении Stage 16 и реализации трёх критических Stages (17-19), которые разблокируют рост платформы и обеспечивают конкурентоспособность.

### Ключевые приоритеты
1. ✅ **Завершить Stage 16** (Day 14 Integration & Polish)
2. 🚀 **Email уведомления** (снять зависимость от Telegram)
3. 📱 **Мобильное приложение** (критично для строителей)
4. 📊 **Расширенная отчётность** (unlock enterprise сегмент)

### Целевые метрики
- **MAU Growth:** +50% за счёт мобильного приложения
- **Retention:** +25% через email engagement
- **ARPU:** +20% через enterprise reporting
- **Churn:** -15% благодаря mobile + automation

---

## 📋 Включённые Stages

### Stage 16: Advanced Team & Role Management ✅
**Статус:** 86% Complete (Days 8-14)
**Осталось:** Day 14 Integration & Polish

**Задачи:**
- [x] Days 8-13: Team Analytics, Role Builder, Member Management, Communications, Team Operations, Audit & Compliance
- [ ] Day 14: Navigation updates, permission verification, testing, documentation

**Timeline:** 1 день
**Priority:** P0 (завершить немедленно)

---

### Stage 17: Email Notifications & Automation 🎯
**Статус:** ⏳ Planned
**Длительность:** 8-10 дней (1-2 недели)

**Deliverables:**
- Email provider integration (Resend/SendGrid)
- Email templates library (10+ templates)
- Notification queue system (Bull/BullMQ)
- Recurring payouts automation
- User preference center UI

**Ключевые метрики:**
- 2,500 LOC
- 15 новых файлов
- Email delivery rate > 95%
- Automated payouts для 80%+ teams

**Business Impact:**
- Снижение зависимости от Telegram на 50%+
- Профессиональный имидж через branded emails
- Автоматизация payouts (экономия времени)

**Timeline:** Недели 1-2
**Priority:** P0 (Critical)

---

### Stage 18: Mobile Application MVP 📱
**Статус:** ⏳ Planned
**Длительность:** 14 дней (3-4 недели)

**Deliverables:**
- React Native iOS/Android app
- Core screens (Dashboard, Projects, Expenses, Time Tracking)
- Offline-first sync (WatermelonDB)
- Camera integration для фото расходов
- Push notifications (Firebase)

**Ключевые метрики:**
- 4,500 LOC
- 40 новых файлов
- App Store + Google Play submission

**Business Impact:**
- +40% feature adoption
- Realtime logging с объектов
- Competitive advantage
- Retention improvement

**Timeline:** Недели 3-6
**Priority:** P0 (Critical)

---

### Stage 19: Advanced Reporting & Exports 📊
**Статус:** ⏳ Planned
**Длительность:** 8 дней (1-2 недели)

**Deliverables:**
- PDF report generation (PDFKit)
- Excel exports (ExcelJS)
- Custom report builder UI
- Scheduled email reports
- Branding support (logo, colors)

**Ключевые метрики:**
- 2,000 LOC
- 10 новых файлов
- 8 pre-built templates
- Report generation < 5 seconds

**Business Impact:**
- +15% PROFESSIONAL plan adoption
- Unlock enterprise сегмент
- Бухгалтерская совместимость

**Timeline:** Недели 7-8
**Priority:** P0 (Critical)

---

## 📅 Timeline & Gantt Chart

```
Week 1-2: Stage 17 - Email Automation
├─ Week 1: Email provider + templates + queue
└─ Week 2: Recurring payouts + preferences UI

Week 3-6: Stage 18 - Mobile App MVP
├─ Week 3: React Native setup + Auth + Core screens
├─ Week 4: Offline sync + Camera integration
├─ Week 5: Time tracking + Payouts + Push
└─ Week 6: Testing + App Store submission

Week 7-8: Stage 19 - Advanced Reporting
├─ Week 7: PDF + Excel generation
└─ Week 8: Report builder + Scheduling

Total: 8 недель (2 месяца)
```

### Milestone Dates (примерно)

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Stage 16 Complete | Week 0 | 🚧 In Progress |
| Stage 17 Complete | Week 2 | ⏳ Planned |
| Stage 18 Beta (TestFlight) | Week 5 | ⏳ Planned |
| Stage 18 Production | Week 6 | ⏳ Planned |
| Stage 19 Complete | Week 8 | ⏳ Planned |
| **v1.5.0 Release** | **Week 8** | 🎯 **Target** |

---

## 💰 Resource Requirements

### Team Composition
- **Backend Developer:** 1-2 dev (Stages 17, 19)
- **Mobile Developer:** 2 dev (Stage 18)
- **Frontend Developer:** 1 dev (Stages 17, 19 UI)
- **QA Engineer:** 1 tester (все Stages)
- **DevOps:** 0.5 FTE (deployment)

### Infrastructure Costs
| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| Resend/SendGrid | $50-100 | Email provider |
| Firebase (FCM) | $0-50 | Push notifications (free tier likely) |
| Apple Developer | $99/year | App Store |
| Google Play | $25 one-time | Google Play |
| **Total** | ~$150-200/mo | Operational |

---

## 🎯 Success Criteria

### Functional
- ✅ All Stages 16-19 deployed to production
- ✅ Mobile app approved in App Store + Google Play
- ✅ Email delivery > 95% success rate
- ✅ Offline sync working без data loss

### Business
- ✅ MAU growth > 50% (mobile adoption)
- ✅ Email engagement > 30% open rate
- ✅ PROFESSIONAL plan upgrades > 15%
- ✅ Mobile app rating > 4.5 stars

### Technical
- ✅ API uptime > 99.5%
- ✅ Mobile app crash-free rate > 99%
- ✅ Email queue processing < 5 min latency
- ✅ Report generation < 10 seconds

---

## 🚨 Risks & Mitigation

### High-Risk Areas
1. **Mobile App Store Approval Delay**
   - Mitigation: Submit early, prepare TestFlight fallback
   - Impact: 1-2 week delay

2. **Email Deliverability Issues**
   - Mitigation: Proper DNS config, warm-up period
   - Impact: Low engagement if not resolved

3. **Offline Sync Complexity**
   - Mitigation: Use proven library (WatermelonDB)
   - Impact: User frustration if data loss

### Medium-Risk Areas
1. **Resource Availability** - Mitigated by clear priorities
2. **Scope Creep** - Mitigated by strict MVP scope
3. **Technical Debt** - Mitigated by code reviews

---

## 📊 Dependencies

```
Stage 16 (finish) → Stage 17 → Stage 18
                              ↘ Stage 19

Critical Path: Stage 16 → Stage 17 → Stage 18
Parallel Track: Stage 19 (can run alongside Stage 18 Week 5-6)
```

---

## 🔄 Post-v1.x Plans

После завершения Short-term roadmap (Stages 16-19), переход к:
- **Stage 20: AI Budget Forecasting** (v2.0 начало)
- **Stage 21: Team Collaboration Chat**
- См. [Medium-term Roadmap](./ROADMAP_MEDIUM_TERM_v2.0.md)

---

## 📚 References

### Stage Documents
- [Stage 16: Advanced Team Management](../stages/STAGE_16_ADVANCED_TEAM_MANAGEMENT.md)
- [Stage 17: Email Automation](../stages/STAGE_17_EMAIL_AUTOMATION.md)
- [Stage 18: Mobile App MVP](../stages/STAGE_18_MOBILE_APP_MVP.md)
- [Stage 19: Advanced Reporting](../stages/STAGE_19_ADVANCED_REPORTING.md)

### Related Roadmaps
- [Medium-term Roadmap (v2.0)](./ROADMAP_MEDIUM_TERM_v2.0.md)
- [Master Roadmap](./ROADMAP_MASTER.md)

---

**Created:** 2025-12-23
**Version:** 1.0
**Owner:** ProRab.space Product Team
