# Stage 23: Multi-Team Enterprise

**Статус:** ⏳ PLANNED | **Версия:** v2.3.0 | **Приоритет:** P2 | **Длительность:** 12 дней (2-3 недели)

## 📋 ОБЗОР

Иерархия команд для крупных подрядчиков: Parent company → множество teams. Консолидированная отчётность, unified member directory, bulk operations.

**Цели:**
- Team hierarchy (parent/child)
- Consolidated reporting
- Cross-team analytics
- Unified member management
- Bulk operations

**Бизнес-ценность:** +50% average contract value (ENTERPRISE tier)

## 🎯 SCOPE

**Включено ✅:**
- Parent company model
- Team hierarchy (2 levels)
- Consolidated dashboards
- Cross-team reports
- Unified search
- Bulk member import/export

**Не включено ❌:**
- Unlimited hierarchy levels
- Cross-team resource sharing
- Matrix organizational structure

## 📊 ARCHITECTURE

```prisma
model Company {
  id String @id @default(uuid())
  name String
  teams Team[]
  createdAt DateTime @default(now())
}

model Team {
  // ... existing fields
  companyId String?
  parentTeamId String? // For sub-teams
  company Company? @relation(fields: [companyId], references: [id])
  parentTeam Team? @relation("TeamHierarchy", fields: [parentTeamId], references: [id])
  childTeams Team[] @relation("TeamHierarchy")
}
```

### Services

```typescript
@Injectable()
export class CompanyService {
  async createCompany(dto: CreateCompanyDto): Promise<Company>
  async addTeam(companyId: string, teamId: string): Promise<void>
  async getConsolidatedDashboard(companyId: string): Promise<ConsolidatedDashboard>
  async getCrossTeamReport(companyId: string, reportType: string): Promise<Report>
  async bulkImportMembers(file: File): Promise<ImportResult>
}
```

## 🔧 IMPLEMENTATION

**Week 1: Hierarchy & Models**
- Company model
- Team hierarchy
- Migration strategy
- Basic CRUD

**Week 2: Consolidated Reporting**
- Dashboard aggregation
- Cross-team analytics
- Unified search

**Week 3: Bulk Operations & UI**
- CSV import/export
- Bulk member management
- Admin UI
- Testing

## 📊 METRICS

- **LOC:** ~3,500
- **Models:** 2 new, 3 updated
- **Performance:** Aggregations < 2 seconds for 100+ teams

## ✅ SUCCESS

- ✅ Companies can manage 100+ teams
- ✅ Consolidated reports accurate
- ✅ Bulk import 1000+ members < 1 minute
- ✅ Cross-team search < 500ms

---

**Created:** 2025-12-23 | **Version:** 1.0
