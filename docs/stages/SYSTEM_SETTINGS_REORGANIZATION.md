# System Settings Reorganization - Централизация конфигураций

**Версия:** v1.4.2
**Дата начала:** 2025-12-24
**Статус:** 📋 В планировании
**Приоритет:** Высокий
**Категория:** UX/UI Improvement, Admin Panel

---

## 📋 Обзор

Реорганизация страницы System Settings в централизованный хаб всех конфигураций админ-панели. Объединение System Integrations (7 категорий) и Payment Providers на одной странице с двухуровневой навигацией и URL routing.

### Проблема

Текущая структура админ-панели разбросана по множеству страниц:
- System Settings (`/admin/settings`) - только интеграции (7 категорий)
- Payment Providers (`/admin/payment-providers`) - отдельная страница
- Нет URL routing для табов (нельзя поделиться ссылкой на конкретную категорию)
- 17 пунктов в sidebar создают путаницу

### Решение

Централизовать все конфигурации на странице **System Settings** с:
- **Группированными табами**: главные категории (Integrations, Providers) → подкатегории
- **URL routing**: каждый таб/подтаб имеет уникальный URL
- **Deep linking**: можно делиться ссылками на конкретные настройки
- **Упрощенная навигация**: меньше пунктов в sidebar

---

## 🎯 Цели

### Функциональные

1. ✅ Объединить System Integrations и Payment Providers на одной странице
2. ✅ Добавить URL routing для всех табов
3. ✅ Реализовать двухуровневую навигацию (main tabs → sub tabs)
4. ✅ Сохранить всю существующую функциональность
5. ✅ Обеспечить обратную совместимость (redirect старых URL)

### UX/UI

1. ✅ Упростить навигацию по конфигурациям
2. ✅ Возможность делиться прямыми ссылками
3. ✅ Breadcrumbs для понимания текущего местоположения
4. ✅ Логическая группировка настроек

### Технические

1. ✅ Компонентная изоляция (каждая категория - отдельный компонент)
2. ✅ Переиспользование кода
3. ✅ Минимальные изменения в GraphQL
4. ✅ Нулевые изменения в БД

---

## 📐 Архитектура

### URL Структура

```
/admin/settings                                      → Integrations/Payment (default)
/admin/settings?tab=integrations                     → Integrations/Payment
/admin/settings?tab=integrations&subtab=payment      → Integrations/Payment
/admin/settings?tab=integrations&subtab=email        → Integrations/Email
/admin/settings?tab=integrations&subtab=telegram     → Integrations/Telegram
/admin/settings?tab=integrations&subtab=storage      → Integrations/Storage
/admin/settings?tab=integrations&subtab=ai           → Integrations/AI
/admin/settings?tab=integrations&subtab=security     → Integrations/Security
/admin/settings?tab=integrations&subtab=general      → Integrations/General
/admin/settings?tab=providers                        → Payment Providers
```

### Компонентная структура

```
apps/web/src/
├── app/(root)/(protected)/admin/settings/
│   └── page.tsx                                    ← Упрощенная (40 строк), URL routing
│
└── packages/components/admin/settings/
    ├── index.ts                                    ← Barrel exports
    ├── system-settings-tabs.tsx                    ← Главный контейнер (главные табы)
    ├── integrations/
    │   ├── index.ts
    │   ├── integration-settings.tsx                ← Подтабы интеграций (7 категорий)
    │   └── settings-category-panel.tsx             ← Панель настроек (переиспользуемая)
    └── payment-providers/
        ├── index.ts
        ├── payment-providers-panel.tsx             ← Главная панель
        ├── provider-config-dialog.tsx              ← Диалог конфигурации
        └── provider-table.tsx                      ← Таблица провайдеров
```

### Главные табы (Primary Level)

| ID | Label | Описание |
|----|-------|----------|
| `integrations` | System Integrations | 7 категорий интеграций |
| `providers` | Payment Providers | Платежные провайдеры |

### Подтабы для Integrations (Secondary Level)

| ID | Category | Label | Icon | Описание |
|----|----------|-------|------|----------|
| `payment` | PAYMENT | Payment | CreditCard | Yookassa настройки |
| `email` | EMAIL | Email | Mail | Brevo настройки |
| `telegram` | TELEGRAM | Telegram | MessageSquare | Telegram bot |
| `storage` | STORAGE | Storage | Database | R2/Cloudinary |
| `ai` | AI | AI | Brain | AI сервисы |
| `security` | SECURITY | Security | Shield | 2FA, login attempts |
| `general` | GENERAL | General | Settings | App name, support email |

---

## 🏗️ Реализация

### День 1: Базовые компоненты (6-8 часов)

#### Утро (4 часа)

**1.1 Создать директории**
```bash
mkdir -p apps/web/src/packages/components/admin/settings/{integrations,payment-providers}
```

**1.2 Создать `settings-category-panel.tsx` (~1.5 часа)**

**Файл**: `apps/web/src/packages/components/admin/settings/integrations/settings-category-panel.tsx`

**Задача**: Переиспользуемая панель для отображения настроек одной категории

**Код взять из**:
- `apps/web/src/app/(root)/(protected)/admin/settings/page.tsx` строки 221-283
- Логика: editedValues, showSecrets, validation

**Интерфейс**:
```typescript
interface SettingsCategoryPanelProps {
  category: SettingCategory
}
```

**Компоненты**:
- Card container
- Settings input fields (encrypted support)
- Eye/EyeOff toggle для секретов
- Test Connection button
- Save Changes button
- Unsaved changes badge

**GraphQL**:
- useQuery(SystemSettingsDocument, { variables: { category } })
- useMutation(BulkUpdateSystemSettingsDocument)
- useMutation(TestServiceConnectionDocument)

**1.3 Создать `integration-settings.tsx` (~1 час)**

**Файл**: `apps/web/src/packages/components/admin/settings/integrations/integration-settings.tsx`

**Задача**: Контейнер с 7 подтабами для категорий интеграций

**Интерфейс**:
```typescript
interface IntegrationSettingsProps {
  selectedSubTab: string
  onSubTabChange: (subtab: string) => void
}
```

**Структура**:
- Tabs component (вторичный уровень)
- TabsList с 7 категориями (grid grid-cols-7)
- TabsContent для каждой категории
- Рендер SettingsCategoryPanel для активной категории

**Категории**:
```typescript
const categories = [
  { id: 'payment', category: SettingCategory.Payment, label: 'Payment', icon: CreditCard },
  { id: 'email', category: SettingCategory.Email, label: 'Email', icon: Mail },
  { id: 'telegram', category: SettingCategory.Telegram, label: 'Telegram', icon: MessageSquare },
  { id: 'storage', category: SettingCategory.Storage, label: 'Storage', icon: Database },
  { id: 'ai', category: SettingCategory.Ai, label: 'AI', icon: Brain },
  { id: 'security', category: SettingCategory.Security, label: 'Security', icon: Shield },
  { id: 'general', category: SettingCategory.General, label: 'General', icon: Settings },
]
```

**1.4 Обед перерыв (1 час)**

#### День (3-4 часа)

**1.5 Создать `provider-table.tsx` (~1 час)**

**Файл**: `apps/web/src/packages/components/admin/settings/payment-providers/provider-table.tsx`

**Код взять из**: `apps/web/src/app/(root)/(protected)/admin/payment-providers/page.tsx` строки 307-421

**Интерфейс**:
```typescript
interface ProviderTableProps {
  providers: PaymentProvider[]
  onConfigure: (provider: PaymentProvider) => void
  onTest: (provider: PaymentProvider) => void
  onToggleActive: (provider: PaymentProvider) => void
  onSetPrimary: (provider: PaymentProvider) => void
  onClearCache: (provider: PaymentProvider) => void
  testingProviderId?: string
}
```

**Колонки**:
- Provider Name (YOOKASSA, STRIPE)
- Status (Active/Inactive badge)
- Primary (Star icon)
- Shop ID / API Key (masked)
- Webhook URL (copy button)
- Actions (dropdown menu)

**1.6 Создать `provider-config-dialog.tsx` (~1 час)**

**Файл**: `apps/web/src/packages/components/admin/settings/payment-providers/provider-config-dialog.tsx`

**Код взять из**: `apps/web/src/app/(root)/(protected)/admin/payment-providers/page.tsx` строки 446-587

**Интерфейс**:
```typescript
interface ProviderConfigDialogProps {
  provider: PaymentProvider | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: ConfigFormData) => Promise<void>
  saving?: boolean
}

interface ConfigFormData {
  shopId: string
  secretKey: string
  webhookSecret: string
  publishableKey: string
  isActive: boolean
  isPrimary: boolean
}
```

**Поля** (зависят от типа):
- YOOKASSA: shopId, secretKey, webhookSecret
- STRIPE: publishableKey, secretKey, webhookSecret
- Общие: isActive switch, isPrimary switch

**1.7 Создать `payment-providers-panel.tsx` (~1 час)**

**Файл**: `apps/web/src/packages/components/admin/settings/payment-providers/payment-providers-panel.tsx`

**Код взять из**: `apps/web/src/app/(root)/(protected)/admin/payment-providers/page.tsx` (всё кроме page layout)

**Структура**:
- Stats Cards:
  - Total Providers
  - Active Providers
  - Primary Provider
- ProviderTable
- ProviderConfigDialog
- Info Card (инструкции по настройке)

**GraphQL**:
- useQuery(GetAdminPaymentProvidersDocument, { variables: { baseUrl } })
- useMutation(UpdateAdminPaymentProviderDocument)
- useMutation(TestPaymentProviderDocument)
- useMutation(ClearProviderCacheDocument)

---

### День 2: Главный контейнер и рефакторинг (3-4 часа)

#### Утро (2 часа)

**2.1 Создать `system-settings-tabs.tsx` (~1 час)**

**Файл**: `apps/web/src/packages/components/admin/settings/system-settings-tabs.tsx`

**Задача**: Главный контейнер с двухуровневыми табами

**Интерфейс**:
```typescript
interface SystemSettingsTabsProps {
  initialTab?: string
  initialSubTab?: string
  onTabChange?: (tab: string, subtab?: string) => void
}
```

**Структура**:
```tsx
<Tabs value={activeTab} onValueChange={handleMainTabChange}>
  <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
    <TabsTrigger value="integrations">
      <Settings className="h-4 w-4 mr-2" />
      System Integrations
    </TabsTrigger>
    <TabsTrigger value="providers">
      <Wallet className="h-4 w-4 mr-2" />
      Payment Providers
    </TabsTrigger>
  </TabsList>

  <TabsContent value="integrations">
    <IntegrationSettings
      selectedSubTab={activeSubTab}
      onSubTabChange={handleSubTabChange}
    />
  </TabsContent>

  <TabsContent value="providers">
    <PaymentProvidersPanel />
  </TabsContent>
</Tabs>
```

**Логика**:
- useState для activeTab и activeSubTab
- useEffect для синхронизации с initialTab/initialSubTab
- handleMainTabChange: обновляет activeTab и вызывает onTabChange
- handleSubTabChange: обновляет activeSubTab и вызывает onTabChange с tab и subtab

**2.2 Создать index файлы (~30 мин)**

**Файлы**:
- `apps/web/src/packages/components/admin/settings/index.ts`
- `apps/web/src/packages/components/admin/settings/integrations/index.ts`
- `apps/web/src/packages/components/admin/settings/payment-providers/index.ts`

**2.3 Рефакторинг `page.tsx` (~30 мин)**

**Файл**: `apps/web/src/app/(root)/(protected)/admin/settings/page.tsx`

**Действие**: ПОЛНОСТЬЮ заменить содержимое (с 338 строк до 40)

**Новый код**:
```typescript
'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SystemSettingsTabs } from '@/packages/components/admin/settings'

export default function SystemSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tab = searchParams.get('tab') || 'integrations'
  const subtab = searchParams.get('subtab') || 'payment'

  const handleTabChange = useCallback((newTab: string, newSubtab?: string) => {
    const params = new URLSearchParams()
    params.set('tab', newTab)
    if (newSubtab) {
      params.set('subtab', newSubtab)
    } else if (newTab === 'integrations') {
      params.set('subtab', 'payment')
    }
    router.push(`/admin/settings?${params.toString()}`, { scroll: false })
  }, [router])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage system-wide configuration and integrations
        </p>
      </div>

      <SystemSettingsTabs
        initialTab={tab}
        initialSubTab={subtab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}
```

#### День (1-2 часа)

**2.4 Создать redirect для Payment Providers (~30 мин)**

**Файл**: `apps/web/src/app/(root)/(protected)/admin/payment-providers/page.tsx`

**Действие**: ПОЛНОСТЬЮ заменить содержимое

**Новый код**:
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PaymentProvidersRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/settings?tab=providers')
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Redirecting to System Settings...</p>
    </div>
  )
}
```

**2.5 Обновить admin sidebar (~30 мин)**

**Файл**: `apps/web/src/packages/components/admin/admin-sidebar.tsx`

**Действие**: Удалить пункт "Payment Providers" (строки 101-106)

---

### День 3: Тестирование (2-3 часа)

#### Утро (1.5 часа)

**3.1 Тестирование URL routing**
- `/admin/settings` → Integrations/Payment
- `/admin/settings?tab=integrations` → Integrations/Payment
- `/admin/settings?tab=integrations&subtab=email` → Integrations/Email
- `/admin/settings?tab=providers` → Payment Providers
- Переключение табов обновляет URL
- Browser back/forward
- Deep linking (обновление страницы сохраняет таб)

**3.2 Тестирование Integrations**
- Загрузка настроек для всех 7 категорий
- Редактирование настроек
- Показ/скрытие encrypted полей
- Сохранение (bulk update)
- Тестирование подключений
- Отображение unsaved changes

#### День (1.5 часа)

**3.3 Тестирование Payment Providers**
- Загрузка провайдеров
- Stats cards корректны
- Конфигурация YOOKASSA
- Конфигурация STRIPE
- Тестирование провайдера
- Toggle Active
- Set Primary
- Clear Cache
- Webhook URL copy

**3.4 Тестирование redirect**
- `/admin/payment-providers` → `/admin/settings?tab=providers`
- Нет лишних записей в history

---

### День 4: Документация (1 час)

**4.1 Создать документацию**

**Файл**: `docs/SYSTEM_SETTINGS_REFACTOR.md`

**Контент**:
- Обзор изменений
- URL структура
- Компонентная архитектура
- Инструкции по использованию
- Migration guide

**4.2 Обновить CHANGELOG**

**Файл**: `CHANGELOG.md`

```markdown
## [v1.4.2] - 2025-12-24 - System Settings Reorganization

### Changed
- **System Settings**: Объединены System Integrations и Payment Providers
- **URL Structure**: Добавлен routing для табов настроек
- **Navigation**: Двухуровневая навигация (главные табы → подтабы)
- **Components**: Модульная архитектура с переиспользуемыми компонентами

### Deprecated
- `/admin/payment-providers` (redirects to `/admin/settings?tab=providers`)

### Removed
- "Payment Providers" из admin sidebar (доступно через System Settings)

### Technical
- 7 новых компонентов (~1,500 LOC)
- 2 файла изменены (упрощены)
- 1 пункт удален из sidebar
- 0 изменений в GraphQL
- 0 изменений в БД
```

---

## 📊 Метрики

### Код

| Метрика | Значение |
|---------|----------|
| Новых файлов | 10 (7 компонентов + 3 index) |
| Измененных файлов | 2 (page.tsx, sidebar.tsx) |
| Удаленных файлов | 0 (заменен на redirect) |
| Всего LOC | ~1,500 |
| Упрощение page.tsx | 338 → 40 строк (91% reduction) |

### Компоненты

| Компонент | LOC | Назначение |
|-----------|-----|------------|
| system-settings-tabs.tsx | ~150 | Главный контейнер |
| integration-settings.tsx | ~200 | Подтабы интеграций |
| settings-category-panel.tsx | ~300 | Панель настроек категории |
| payment-providers-panel.tsx | ~400 | Панель Payment Providers |
| provider-config-dialog.tsx | ~250 | Диалог конфигурации |
| provider-table.tsx | ~200 | Таблица провайдеров |

### UX

| Улучшение | До | После |
|-----------|-------|--------|
| Пунктов в sidebar | 17 | 16 (-1) |
| Страниц настроек | 2 | 1 |
| URL routing | Нет | Есть |
| Deep linking | Нет | Есть |
| Группировка | Плоская | Двухуровневая |

---

## ✅ Критерии готовности (Definition of Done)

### Функциональность
- [ ] Все 7 категорий интеграций работают
- [ ] Payment Providers полностью функционален
- [ ] URL routing работает для всех табов/подтабов
- [ ] Redirect с `/admin/payment-providers` работает
- [ ] Deep linking работает (можно делиться ссылками)
- [ ] Browser back/forward работает корректно

### Код
- [ ] Все компоненты созданы и работают
- [ ] Index файлы для экспорта созданы
- [ ] page.tsx упрощен до ~40 строк
- [ ] Sidebar обновлен (удален Payment Providers)
- [ ] Нет TypeScript ошибок
- [ ] Нет ESLint warnings

### Тестирование
- [ ] Загрузка настроек работает для всех категорий
- [ ] Сохранение настроек работает
- [ ] Тестирование подключений работает
- [ ] Конфигурация провайдеров работает
- [ ] Тестирование провайдеров работает
- [ ] Все stats cards отображаются корректно

### Документация
- [ ] SYSTEM_SETTINGS_REFACTOR.md создан
- [ ] CHANGELOG.md обновлен
- [ ] Roadmap обновлен

### Деплой
- [ ] Dev build успешен
- [ ] Production build успешен
- [ ] No breaking changes
- [ ] Обратная совместимость через redirect

---

## 🚀 Roadmap

### v1.4.2 (Эта реализация)
- ✅ Двухуровневая навигация
- ✅ URL routing
- ✅ Объединение Integrations + Providers
- ✅ Модульные компоненты

### v1.5.0 (Будущее)
- [ ] Поиск по настройкам (search/filter)
- [ ] History/Audit log для изменений настроек
- [ ] Real-time валидация настроек
- [ ] Import/Export конфигураций
- [ ] Environment profiles (dev/staging/prod)

### v2.0.0 (Долгосрочно)
- [ ] Visual config builder (no-code)
- [ ] API для external config management
- [ ] Multi-region config replication
- [ ] Config versioning and rollback
- [ ] A/B testing для настроек

---

## 🎯 Успешная реализация

Задача считается успешно выполненной когда:

1. ✅ Все настройки доступны на `/admin/settings`
2. ✅ URL routing работает для всех табов
3. ✅ Redirect с `/admin/payment-providers` работает
4. ✅ Вся функциональность сохранена
5. ✅ UX улучшен (меньше кликов, логичная группировка)
6. ✅ Код модульный и переиспользуемый
7. ✅ Нет breaking changes
8. ✅ Документация обновлена

**Дата завершения:** 2025-12-27 (планируемая)
**Версия релиза:** v1.4.2
