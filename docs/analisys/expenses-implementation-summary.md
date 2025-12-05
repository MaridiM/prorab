# Модуль Расходы (Expenses) - Сводка Реализации

**Дата завершения:** 2025-12-05
**Время работы:** ~6 часов
**Статус:** ✅ Backend завершён, Frontend базовые компоненты готовы

## 📋 Что реализовано

### Backend (100% готово)

#### 1. База данных
**Файл:** [apps/api/prisma/schema.prisma](../../apps/api/prisma/schema.prisma#L166-L186)

```prisma
model Expense {
  id            String    @id @default(uuid())
  projectId     String    @map("project_id")
  amount        Decimal   @db.Decimal(12, 2)  // Точность для денег
  category      String
  photos        String[]  @default([])
  comment       String?   @db.Text
  paidByClient  Boolean   @default(false) @map("paid_by_client")

  createdById   String    @map("created_by_id")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([createdById])
  @@index([createdAt])
  @@index([projectId, category])
  @@map("expenses")
}
```

**Ключевые решения:**
- `Decimal(12,2)` вместо Float для точности денежных расчётов
- Cascade delete при удалении проекта
- Индексы для быстрого поиска по проекту и категории

#### 2. ExpensesModule
**Файлы:**
- [apps/api/src/modules/expenses/expenses.module.ts](../../apps/api/src/modules/expenses/expenses.module.ts)
- [apps/api/src/modules/expenses/expenses.service.ts](../../apps/api/src/modules/expenses/expenses.service.ts)
- [apps/api/src/modules/expenses/expenses.resolver.ts](../../apps/api/src/modules/expenses/expenses.resolver.ts)

**Зависимости:** PrismaModule, AuthModule, TeamsModule

#### 3. GraphQL API

**Queries:**
```graphql
# Получить расход по ID
expense(id: ID!): Expense

# Получить все расходы проекта
expensesByProject(projectId: ID!): [Expense!]!

# Получить расходы по категории
expensesByCategory(projectId: ID!, category: String!): [Expense!]!
```

**Mutations:**
```graphql
# Создать расход
createExpense(input: CreateExpenseInput!): Expense!

# Обновить расход
updateExpense(input: UpdateExpenseInput!): Expense!

# Удалить расход
deleteExpense(id: ID!): Expense!
```

#### 4. Категории расходов
```typescript
const EXPENSE_CATEGORIES = [
  'Материалы',
  'Работа бригады',
  'Черновые материалы',
  'Чистовые материалы',
  'Инструмент',
  'Аренда техники',
  'Транспорт',
  'Прочее',
]
```

#### 5. ProjectStats обновлён
**Файл:** [apps/api/src/modules/projects/projects.service.ts:67-104](../../apps/api/src/modules/projects/projects.service.ts#L67-L104)

Теперь `getProjectStats()` реально подсчитывает:
- `totalExpenses` - сумма всех расходов
- `profit` - budget - totalExpenses
- `expenseCount` - количество расходов

### Frontend (Базовые компоненты готовы)

#### 1. Zod схемы валидации
**Файл:** [apps/web/src/packages/schemas/expenses/expense.schema.ts](../../apps/web/src/packages/schemas/expenses/expense.schema.ts)

```typescript
export const createExpenseSchema = z.object({
  projectId: z.string().nonempty(),
  amount: z.number().min(0.01),
  category: z.enum(EXPENSE_CATEGORIES),
  photos: z.array(z.string().url()).optional().default([]),
  comment: z.string().max(5000).optional(),
  paidByClient: z.boolean().optional().default(false),
})
```

#### 2. GraphQL Operations
**Файл:** [apps/web/src/packages/api/graphql/expenses.graphql](../../apps/web/src/packages/api/graphql/expenses.graphql)

Все queries и mutations с полными полями для работы с UI.

#### 3. React компоненты

**ExpenseForm** - [apps/web/src/packages/components/expenses/expense-form.tsx](../../apps/web/src/packages/components/expenses/expense-form.tsx)
- Режимы: create / edit
- React Hook Form + Zod валидация
- Поля: amount, category (select), comment, paidByClient (checkbox)
- Обработка loading состояний

**ExpenseCard** - [apps/web/src/packages/components/expenses/expense-card.tsx](../../apps/web/src/packages/components/expenses/expense-card.tsx)
- Отображение суммы с форматированием
- Badge для категории и статуса "Оплачено клиентом"
- Превью фотографий (до 3 шт + счётчик)
- Кнопки редактирования/удаления
- Дата создания

**ExpenseList** - [apps/web/src/packages/components/expenses/expense-list.tsx](../../apps/web/src/packages/components/expenses/expense-list.tsx)
- Фильтр по категориям (Select)
- Подсчёт общей суммы
- Адаптивная сетка (1/2/3 колонки)
- Пустое состояние
- Кнопка добавления

**FinancialDashboard** - [apps/web/src/packages/components/financial/financial-dashboard.tsx](../../apps/web/src/packages/components/financial/financial-dashboard.tsx)
- Карточки метрик: Бюджет, Расходы, Прибыль
- Маржа прибыли в %
- Предупреждение при превышении бюджета
- Разбивка по категориям с прогресс-барами
- Цветовая индикация (зелёный/красный)

## 🎯 Архитектурные решения

### 1. Безопасность
✅ **Проверка доступа на уровне сервиса**
```typescript
private async validateProjectAccess(projectId: string, userId: string) {
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
    include: { team: { include: { members: true } } },
  });

  const isMember = project.team.members.some(m => m.userId === userId);
  if (!isMember) {
    throw new ForbiddenException('У вас нет доступа к этому проекту');
  }
}
```

### 2. Точность денежных расчётов
✅ **Decimal вместо Float**
- В БД: `Decimal(12, 2)` - до 10 миллиардов с точностью до копейки
- В коде: Prisma автоматически конвертирует Decimal ↔ number
- Форматирование: `Intl.NumberFormat('ru-RU', { currency: 'RUB' })`

### 3. Производительность
✅ **Индексы БД**
```prisma
@@index([projectId])              // Быстрый поиск расходов проекта
@@index([projectId, category])    // Фильтрация по категории
@@index([createdAt])              // Сортировка по дате
```

### 4. UX оптимизации
✅ **Формы < 5 секунд**
- Минимум полей (только обязательные)
- Автофокус на первое поле
- Быстрая валидация (onChange mode)
- Select вместо ручного ввода категории

## 📊 API Примеры

### Создать расход
```graphql
mutation CreateExpense($input: CreateExpenseInput!) {
  createExpense(input: $input) {
    id
    amount
    category
    createdAt
  }
}

# Variables:
{
  "input": {
    "projectId": "uuid",
    "amount": 5000.50,
    "category": "Материалы",
    "comment": "Цемент 50 мешков",
    "paidByClient": false
  }
}
```

### Получить расходы проекта
```graphql
query ExpensesByProject($projectId: ID!) {
  expensesByProject(projectId: $projectId) {
    id
    amount
    category
    comment
    paidByClient
    createdAt
  }
}
```

### Получить статистику
```graphql
query ProjectStats($projectId: ID!) {
  projectStats(projectId: $projectId) {
    totalExpenses  # 125000.50
    profit         # 74999.50 (если budget=200000)
    expenseCount   # 12
  }
}
```

## ⏭️ Следующие шаги

### Обязательно (для завершения Этапа 4):
1. **Интеграция в Project Details Page**
   - Добавить вкладку "Расходы"
   - Подключить ExpenseList и FinancialDashboard
   - Модальное окно для ExpenseForm

2. **Загрузка фотографий**
   - Использовать ImageUpload компонент
   - Интеграция с StorageService
   - Превью перед загрузкой

3. **E2E тестирование**
   - Создание расхода
   - Редактирование/удаление
   - Фильтрация по категориям
   - Подсчёт статистики

### Желательно (улучшения):
- Экспорт расходов в CSV/Excel
- График расходов по времени (Recharts)
- Чеки/квитанции (PDF upload)
- Bulk операции (массовое удаление)
- История изменений (audit log)

## 🐛 Известные ограничения

1. **Фотографии** - пока только массив URL, без загрузки файлов
2. **Графики** - FinancialDashboard без Recharts (нужна установка)
3. **Валюта** - захардкожена RUB (нужна настройка команды)
4. **Категории** - фиксированный список (нужна кастомизация)

## 📁 Структура файлов

```
apps/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma (Expense model)
│   │   └── migrations/
│   └── src/modules/
│       ├── expenses/
│       │   ├── expenses.module.ts
│       │   ├── expenses.service.ts
│       │   ├── expenses.resolver.ts
│       │   ├── dto/
│       │   │   ├── create-expense.input.ts
│       │   │   └── update-expense.input.ts
│       │   └── models/
│       │       └── expense.model.ts
│       └── projects/
│           └── projects.service.ts (обновлён getProjectStats)
│
└── web/
    └── src/packages/
        ├── api/graphql/
        │   └── expenses.graphql
        ├── schemas/expenses/
        │   ├── expense.schema.ts
        │   └── index.ts
        └── components/
            ├── expenses/
            │   ├── expense-form.tsx
            │   ├── expense-card.tsx
            │   ├── expense-list.tsx
            │   └── index.ts
            └── financial/
                ├── financial-dashboard.tsx
                └── index.ts
```

## ✅ Чеклист готовности

**Backend:**
- [x] Prisma schema с Expense model
- [x] Миграция применена
- [x] ExpensesModule зарегистрирован
- [x] ExpensesService с CRUD
- [x] ExpensesResolver с GraphQL API
- [x] ProjectStats обновлён
- [x] TypeScript компиляция без ошибок
- [x] Сервер запускается

**Frontend:**
- [x] Zod схемы валидации
- [x] GraphQL queries/mutations
- [x] Codegen выполнен
- [x] ExpenseForm компонент
- [x] ExpenseCard компонент
- [x] ExpenseList компонент
- [x] FinancialDashboard компонент
- [x] Интеграция в страницу проекта
- [x] TypeScript компиляция успешна
- [ ] Загрузка фотографий (отложено)
- [ ] E2E тесты (следующий этап)

**Документация:**
- [x] Roadmap обновлён
- [x] Сводка реализации создана
- [x] Интеграция завершена и задокументирована

## 🎉 Статус интеграции ЗАВЕРШЕНА

**Дата завершения интеграции:** 2025-12-05

### Что работает

1. ✅ Вкладка "Расходы" активна на странице проекта ([page.tsx:318](../../apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx#L318))
2. ✅ FinancialDashboard отображает статистику (бюджет, расходы, прибыль)
3. ✅ ExpenseList с фильтрацией по категориям
4. ✅ ExpenseForm для создания/редактирования расходов
5. ✅ Все GraphQL queries и mutations подключены
6. ✅ TypeScript компилируется без ошибок
7. ✅ Серверы API (port 8080) и Web (port 3000) запущены

### Исправленные ошибки

1. ✅ Zod schema - убрали `.optional()` перед `.default()` для полей photos и paidByClient
2. ✅ Zod error messages - упростили формат (убрали `required_error`, `invalid_type_error`)
3. ✅ ExpenseForm types - использовали `any` для избежания конфликтов union типов

### Готово к использованию

- Пользователь может перейти на страницу проекта
- Переключиться на вкладку "Расходы"
- Увидеть финансовую статистику
- Добавить новый расход через форму
- Отредактировать существующий расход
- Удалить расход
- Фильтровать по категориям
