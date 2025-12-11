# Руководство по системе выплат (Payouts)

**Дата создания:** 2025-12-11
**Статус:** ✅ Завершено (Stage 6)
**Приоритет:** 🔴🔴🔴 Критический (Killer Feature #2)

---

## 📋 Оглавление

1. [Обзор](#обзор)
2. [Типы зарплат](#типы-зарплат)
3. [Настройка зарплаты участника](#настройка-зарплаты-участника)
4. [Расчёт выплат](#расчёт-выплат)
5. [Закрытие проекта](#закрытие-проекта)
6. [GraphQL API](#graphql-api)
7. [UI Компоненты](#ui-компоненты)

---

## Обзор

Система выплат (Payouts) - это автоматический калькулятор зарплаты для участников бригады при закрытии проекта.

### Проблема которую решаем:
**"Сколько кому платить в конце объекта?"**

### Что умеет система:
- ✅ Автоматический расчёт зарплаты по формуле
- ✅ 3 типа зарплат: Фикс, Процент, Нет
- ✅ Прозрачность расчётов для всех участников
- ✅ История выплат по проектам
- ✅ Копирование расчёта для отправки в мессенджер
- ✅ Финальная прибыль владельца после всех выплат

---

## Типы зарплат

### 1. FIXED - Фиксированная зарплата

**Описание:** Зарплата уже выплачена и учтена в расходах проекта.

**Пример:**
```
Мастер Иван получил 100,000 ₽ фиксированно
→ Добавлено в расходы как "Работа бригады"
→ При закрытии проекта не участвует в расчётах
```

**Когда использовать:**
- Наёмные работники
- Подрядчики
- Разовые выплаты

**Как настроить:**
1. Перейти на страницу настройки зарплаты участника
2. Выбрать тип "Фиксированная"
3. Добавить расход в категории "Работа бригады" на сумму выплаты

---

### 2. PERCENTAGE - Процент от прибыли

**Описание:** Зарплата рассчитывается как процент от чистой прибыли проекта.

**Формула:**
```
Выплата = Чистая прибыль × (Процент / 100)
```

**Пример:**
```
Партнёр Пётр: 30% от прибыли
Чистая прибыль: 500,000 ₽
Выплата = 500,000 × 0.30 = 150,000 ₽
```

**Когда использовать:**
- Партнёры
- Доля в прибыли
- Мотивированные участники

**Как настроить:**
1. Перейти на страницу настройки зарплаты участника
2. Выбрать тип "Процент от прибыли"
3. Указать процент (0-100%)

---

### 3. NONE - Без зарплаты

**Описание:** Участник не получает фиксированную или процентную зарплату.

**Пример:**
```
Владелец Сергей: Тип "Нет"
→ Получит остаток после всех выплат бригаде
```

**Когда использовать:**
- Владелец бригады (получит остаток)
- Временные помощники
- Стажёры

**Владелец получает:**
```
Прибыль владельца = Чистая прибыль - Σ(процентные выплаты)
```

---

## Настройка зарплаты участника

### Для владельца команды:

**Шаги:**
1. Открыть страницу команды
2. Найти участника в списке
3. Нажать кнопку "Настроить зарплату" (⚙️)
4. Выбрать тип зарплаты
5. Для процентной - указать процент
6. Сохранить

**Роуты:**
```
/teams/[teamId]/members/[memberId]/salary
```

**GraphQL:**
```graphql
mutation UpdateMemberSalary($input: UpdateMemberSalaryInput!) {
  updateMemberSalary(input: $input) {
    id
    salaryType
    salaryAmount
  }
}
```

---

## Расчёт выплат

### Формула расчёта:

```
1. Чистая прибыль:
   netProfit = budget - totalExpenses

2. Процентные выплаты:
   percentagePayout = netProfit × (percentage / 100)

3. Прибыль владельца:
   ownerProfit = netProfit - Σ(percentagePayouts)
```

### Пример полного расчёта:

```
Бюджет договора: 1,000,000 ₽
Расходы всего: 650,000 ₽
  - Материалы: 450,000 ₽
  - Работа бригады (FIXED зарплата Ивана): 100,000 ₽
  - Прочее: 100,000 ₽

Чистая прибыль = 1,000,000 - 650,000 = 350,000 ₽

Участники:
  - Иван (FIXED 100,000): 0 ₽ (уже вычтено из расходов)
  - Пётр (20% от прибыли): 350,000 × 20% = 70,000 ₽
  - Мария (15% от прибыли): 350,000 × 15% = 52,500 ₽
  - Сергей (NONE, владелец): остаток

Распределение 350,000 ₽:
  - Пётр: 70,000 ₽
  - Мария: 52,500 ₽
  - Сергей (владелец): 227,500 ₽

Проверка: 70,000 + 52,500 + 227,500 = 350,000 ✅
```

---

## Закрытие проекта

### Процесс:

1. **Открыть калькулятор выплат:**
   ```
   /teams/[teamId]/projects/[projectId]/payouts
   ```

2. **Просмотреть расчёт:**
   - Чистая прибыль
   - Выплаты каждому участнику
   - Прибыль владельца

3. **Скопировать расчёт:**
   - Нажать "Скопировать расчёт"
   - Отправить в WhatsApp/Telegram бригаде

4. **Закрыть проект:**
   - Нажать "Закрыть проект"
   - Проект переводится в архив
   - Расчёты фиксируются

### Формат копируемого текста:

```
Объект "Квартира на Ленина" закрыт

Пётр (20%): 70 000 ₽
Мария (15%): 52 500 ₽

Итого на бригаду: 122 500 ₽
Моя прибыль: 227 500 ₽
```

---

## GraphQL API

### Queries

#### 1. Получить расчёт выплат

```graphql
query PayoutSummary($projectId: ID!) {
  payoutSummary(projectId: $projectId) {
    projectId
    projectName
    budget
    totalExpenses
    netProfit
    totalPayouts
    ownerProfit
    members {
      memberId
      memberName
      salaryType
      salaryAmount
      calculatedPayout
      status
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "payoutSummary": {
      "projectId": "abc123",
      "projectName": "Квартира на Ленина",
      "budget": 1000000,
      "totalExpenses": 650000,
      "netProfit": 350000,
      "totalPayouts": 122500,
      "ownerProfit": 227500,
      "members": [
        {
          "memberId": "m1",
          "memberName": "Пётр",
          "salaryType": "PERCENTAGE",
          "salaryAmount": 20,
          "calculatedPayout": 70000,
          "status": "PENDING"
        }
      ]
    }
  }
}
```

#### 2. Получить выплаты проекта

```graphql
query ProjectPayouts($projectId: ID!) {
  projectPayouts(projectId: $projectId) {
    id
    calculatedAmount
    actualAmount
    status
    paidAt
    member {
      user {
        fullName
      }
    }
  }
}
```

#### 3. Получить выплаты участника

```graphql
query MemberPayouts($memberId: ID!) {
  memberPayouts(memberId: $memberId) {
    id
    calculatedAmount
    status
    project {
      name
    }
  }
}
```

### Mutations

#### 1. Обновить зарплату участника

```graphql
mutation UpdateMemberSalary($input: UpdateMemberSalaryInput!) {
  updateMemberSalary(input: $input) {
    id
    salaryType
    salaryAmount
  }
}
```

**Input:**
```typescript
{
  memberId: string
  salaryType: 'FIXED' | 'PERCENTAGE' | 'NONE'
  salaryAmount?: number // 0-100 для PERCENTAGE
}
```

#### 2. Закрыть проект

```graphql
mutation CloseProject($projectId: ID!) {
  closeProject(projectId: $projectId) {
    id
    status
    closedAt
    finalProfit
  }
}
```

#### 3. Создать выплату

```graphql
mutation CreatePayout($input: CreatePayoutInput!) {
  createPayout(input: $input) {
    id
    calculatedAmount
    status
  }
}
```

---

## UI Компоненты

### 1. MemberSalaryBadge

**Описание:** Бейдж с отображением типа зарплаты.

**Props:**
```typescript
interface MemberSalaryBadgeProps {
  salaryType: 'FIXED' | 'PERCENTAGE' | 'NONE'
  salaryAmount?: number | null
  className?: string
}
```

**Использование:**
```tsx
<MemberSalaryBadge
  salaryType="PERCENTAGE"
  salaryAmount={20}
/>
// Отображает: "🔢 20%"
```

---

### 2. SalarySettingsForm

**Описание:** Форма для настройки зарплаты участника.

**Props:**
```typescript
interface SalarySettingsFormProps {
  memberId: string
  memberName: string
  currentSalaryType?: 'FIXED' | 'PERCENTAGE' | 'NONE'
  currentSalaryAmount?: number | null
  onSubmit: (data: UpdateMemberSalaryInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}
```

**Использование:**
```tsx
<SalarySettingsForm
  memberId="m1"
  memberName="Пётр"
  currentSalaryType="PERCENTAGE"
  currentSalaryAmount={20}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

---

### 3. PayoutCalculator

**Описание:** Калькулятор выплат при закрытии проекта.

**Props:**
```typescript
interface PayoutCalculatorProps {
  summary: PayoutSummary
  onClose: (projectId: string) => Promise<void>
  isLoading?: boolean
}
```

**Использование:**
```tsx
<PayoutCalculator
  summary={payoutSummary}
  onClose={handleClose}
  isLoading={closing}
/>
```

---

### 4. PayoutHistory

**Описание:** История выплат участника или проекта.

**Props:**
```typescript
interface PayoutHistoryProps {
  payouts: PayoutHistoryItem[]
  emptyMessage?: string
}
```

**Использование:**
```tsx
<PayoutHistory
  payouts={memberPayouts}
  emptyMessage="Нет истории выплат"
/>
```

---

## Zod Schemas

### UpdateMemberSalarySchema

```typescript
const updateMemberSalarySchema = z.object({
  memberId: z.string().min(1),
  salaryType: z.enum(['FIXED', 'PERCENTAGE', 'NONE']),
  salaryAmount: z.number()
    .min(0)
    .max(100)
    .optional()
    .nullable()
}).refine(
  (data) => {
    if (data.salaryType === 'PERCENTAGE') {
      return data.salaryAmount > 0 && data.salaryAmount <= 100
    }
    return true
  },
  {
    message: 'Для процентной зарплаты укажите процент от 0 до 100',
    path: ['salaryAmount']
  }
)
```

---

## Безопасность

### Права доступа:

1. **Настройка зарплат:**
   - ✅ Только владелец команды
   - ❌ Участники не могут редактировать

2. **Просмотр расчётов:**
   - ✅ Владелец видит полный расчёт
   - ✅ Участники видят только свою выплату

3. **Закрытие проекта:**
   - ✅ Только владелец команды
   - Автоматический перевод в архив

---

## Примеры использования

### Сценарий 1: Настройка процентной зарплаты

```typescript
// 1. Обновить зарплату участника
const handleUpdateSalary = async () => {
  await updateMemberSalary({
    variables: {
      input: {
        memberId: 'm1',
        salaryType: 'PERCENTAGE',
        salaryAmount: 25
      }
    }
  })
}
```

### Сценарий 2: Расчёт и закрытие проекта

```typescript
// 1. Загрузить расчёт
const { data } = useQuery(PayoutSummaryDocument, {
  variables: { projectId: 'p1' }
})

// 2. Закрыть проект
const handleClose = async () => {
  await closeProject({
    variables: { projectId: 'p1' }
  })
  // Проект переведён в архив
  router.push('/dashboard')
}
```

---

## FAQ

**Q: Можно ли изменить зарплату после закрытия проекта?**
A: Нет, после закрытия расчёты фиксируются.

**Q: Что если прибыль отрицательная?**
A: Калькулятор покажет убыток, выплаты будут 0 ₽.

**Q: Можно ли комбинировать типы зарплат?**
A: Да, разные участники могут иметь разные типы.

**Q: Как добавить фиксированную зарплату?**
A: Установить тип FIXED + добавить расход "Работа бригады".

---

**Документ создан:** 2025-12-11
**Автор:** AI Assistant
**Версия:** 1.0
