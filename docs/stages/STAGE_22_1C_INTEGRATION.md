# Stage 22: 1C Integration & Accounting

**Статус:** ⏳ PLANNED | **Версия:** v2.2.0 | **Приоритет:** P1 | **Длительность:** 12 дней (2-3 недели)

## 📋 ОБЗОР

Интеграция с 1C (российский стандарт ERP) для автоматической синхронизации данных с бухгалтерией. Критично для enterprise сегмента.

**Цели:**
- 1C API integration
- Expense → GL mapping
- Invoice generation
- Tax compliance (Russian standards)
- Bi-directional sync

**Бизнес-ценность:** +40% BUSINESS plan upgrades

## 🎯 SCOPE

**Включено ✅:**
- 1C:Enterprise API
- Expense categories mapping
- Invoice generation
- Accounting journal entries
- Webhook sync
- Tax reports (НДС, ЕСН)

**Не включено ❌:**
- Full ERP replacement
- Inventory management
- Advanced accounting features

## 📊 ARCHITECTURE

### Integration Service

```typescript
@Injectable()
export class OneCIntegrationService {
  async syncExpenses(teamId: string): Promise<SyncResult>
  async createInvoice(invoiceData: InvoiceDto): Promise<Invoice>
  async mapExpenseCategory(category: string): Promise<GLAccount>
  async exportJournalEntries(dateRange: DateRange): Promise<Entry[]>
}
```

### Database

```prisma
model OneCMapping {
  id String @id @default(uuid())
  teamId String
  expenseCategory String
  glAccount String // 1C счёт
  taxRate Float
}

model GeneratedInvoice {
  id String @id @default(uuid())
  teamId String
  number String
  amount Decimal
  taxAmount Decimal
  oneCDocumentId String?
  exportedAt DateTime?
}
```

## 🔧 IMPLEMENTATION

**Week 1: API Integration**
- 1C API client
- Authentication
- Basic sync

**Week 2: Mapping & Invoices**
- Category → GL mapping UI
- Invoice generation
- Tax calculations

**Week 3: Bi-directional & Testing**
- Webhooks from 1C
- Conflict resolution
- Testing & deployment

## 📊 METRICS

- **LOC:** ~2,800
- **API:** REST (1C web services)
- **Sync frequency:** Real-time + hourly batch

## ✅ SUCCESS

- ✅ 100% data consistency
- ✅ Sync latency < 5 minutes
- ✅ Zero manual data entry
- ✅ Tax reports accurate

---

**Created:** 2025-12-23 | **Version:** 1.0
