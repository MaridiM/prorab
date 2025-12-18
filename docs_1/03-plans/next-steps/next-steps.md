# Следующие шаги - Stage 9 Phase 2

**Обновлено:** 2025-12-16, 23:45
**Текущий статус:** Day 8 - 95% завершен

---

## 🎯 Немедленные задачи (Завершение Day 8)

### 1. Исправить финальную ошибку сборки ⏱️ 10-15 мин
**Файл:** `apps/web/src/app/(root)/(protected)/settings/page.tsx:231`
**Проблема:** `Property 'me' does not exist on type '{}'.`

**Действия:**
1. Открыть файл и найти строку 231
2. Проверить GraphQL query (вероятно использует inline `gql` вместо Document)
3. Мигрировать на сгенерированный Document (как в admin pages)
4. Или добавить правильную типизацию

**Пример исправления:**
```typescript
// Было:
const { data } = useQuery(gql`...`);
const user = data?.me; // Error: me doesn't exist

// Должно быть:
import { MeDocument } from '@/packages/api/graphql/__generated__/output';
const { data } = useQuery(MeDocument);
const user = data?.me; // ✅ Типизировано
```

### 2. Проверка сборки ⏱️ 5 мин
```bash
cd apps/web
npm run build
```
**Ожидаемый результат:** ✅ Успешная сборка без ошибок

### 3. Проверка dev окружения ⏱️ 10 мин
```bash
# Terminal 1: Backend
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

**Проверить:**
- ✅ Frontend запускается на http://localhost:3000
- ✅ Backend запускается на http://localhost:8080
- ✅ GraphQL Playground доступен: http://localhost:8080/graphql
- ✅ Нет ошибок в консоли

### 4. Базовое тестирование WorkLog API ⏱️ 15 мин

**GraphQL Playground:** http://localhost:8080/graphql

**Тесты:**

1. **Создать WorkLog:**
```graphql
mutation {
  createWorkLog(input: {
    memberId: "cm54vhxp20000134bwxmr7jxy"
    projectId: "cm54vhxp20000134bwxmr7jxz"
    date: "2025-12-16"
    hours: 8
    description: "Backend development"
  }) {
    id
    hours
    description
    date
  }
}
```

2. **Получить список:**
```graphql
query {
  workLogs {
    id
    hours
    description
    date
    member {
      user {
        fullName
      }
    }
    project {
      name
    }
  }
}
```

3. **Получить мои WorkLogs:**
```graphql
query {
  myWorkLogs {
    id
    hours
    description
    date
  }
}
```

4. **Подсчет часов:**
```graphql
query {
  totalHours(filters: {
    dateFrom: "2025-12-01"
    dateTo: "2025-12-31"
  })
}
```

---

## 📅 Day 9: Time Tracking Page (Frontend)

**Длительность:** 1 полный день
**Приоритет:** 🔴 Высокий

### Цель
Создать полнофункциональную страницу учета рабочего времени для сотрудников.

### Задачи

#### 1. GraphQL Integration ⏱️ 30 мин

**Создать файл:** `apps/web/src/packages/api/graphql/work-logs.graphql`

```graphql
# Fragments
fragment WorkLogFields on WorkLog {
  id
  projectId
  memberId
  date
  hours
  description
  createdAt
  updatedAt
}

# Queries
query WorkLogs($filters: WorkLogFilters) {
  workLogs(filters: $filters) {
    ...WorkLogFields
    member {
      id
      user {
        id
        fullName
        email
      }
    }
    project {
      id
      name
      status
    }
  }
}

query MyWorkLogs($filters: WorkLogFilters) {
  myWorkLogs(filters: $filters) {
    ...WorkLogFields
    project {
      id
      name
    }
  }
}

query TotalHours($filters: WorkLogFilters) {
  totalHours(filters: $filters)
}

# Mutations
mutation CreateWorkLog($input: CreateWorkLogInput!) {
  createWorkLog(input: $input) {
    ...WorkLogFields
  }
}

mutation UpdateWorkLog($id: String!, $input: UpdateWorkLogInput!) {
  updateWorkLog(id: $id, input: $input) {
    ...WorkLogFields
  }
}

mutation DeleteWorkLog($id: String!) {
  deleteWorkLog(id: $id)
}
```

**После создания:**
```bash
cd apps/web
npm run codegen
```

#### 2. Компоненты ⏱️ 3-4 часа

**Структура:**
```
apps/web/src/app/(root)/(protected)/teams/[teamId]/time-tracking/
├── page.tsx                    # Главная страница
└── components/
    ├── WorkLogList.tsx         # Список записей
    ├── WorkLogForm.tsx         # Форма создания/редактирования
    ├── WorkLogFilters.tsx      # Фильтры
    ├── WorkLogStats.tsx        # Статистика
    └── WorkLogCalendar.tsx     # Календарь (опционально)
```

##### 2.1 WorkLogList Component
**Функционал:**
- Таблица с записями времени
- Сортировка по дате, проекту, часам
- Пагинация
- Действия: редактировать, удалить
- Отображение: проект, дата, часы, описание

##### 2.2 WorkLogForm Component
**Функционал:**
- Выбор проекта (dropdown)
- Выбор даты (date picker)
- Ввод часов (number input, min: 0.5, max: 24)
- Описание работы (textarea)
- Валидация
- Режимы: создание / редактирование

##### 2.3 WorkLogFilters Component
**Фильтры:**
- По проекту
- По периоду (date range)
- По сотруднику (для админов/менеджеров)
- Быстрые фильтры: Сегодня, Эта неделя, Этот месяц

##### 2.4 WorkLogStats Component
**Статистика:**
- Всего часов за период
- Часов по проектам (pie chart или bar chart)
- Средние часы в день
- Рабочих дней в периоде

#### 3. Страница Time Tracking ⏱️ 2 часа

**Файл:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/time-tracking/page.tsx`

**Layout:**
```
┌────────────────────────────────────┐
│ Time Tracking                      │
│ [+ Add Entry] [Filters ▼]         │
├────────────────────────────────────┤
│ Stats: 160h total this month       │
│ ┌────────┬────────┬────────┐      │
│ │Project │  Hours │ Days   │      │
│ ├────────┼────────┼────────┤      │
│ │Proj A  │   80h  │  10    │      │
│ │Proj B  │   80h  │  10    │      │
│ └────────┴────────┴────────┘      │
├────────────────────────────────────┤
│ Work Log Entries                   │
│ ┌──────────────────────────────┐  │
│ │ Date    Project  Hours  Desc │  │
│ │ 16.12   Proj A    8h    ...  │  │
│ │ 15.12   Proj B    7.5h  ...  │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Основной код:**
```typescript
'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import {
  MyWorkLogsDocument,
  CreateWorkLogDocument,
  UpdateWorkLogDocument,
  DeleteWorkLogDocument,
  TotalHoursDocument,
} from '@/packages/api/graphql/__generated__/output'

export default function TimeTrackingPage({ params }: { params: { teamId: string } }) {
  const [filters, setFilters] = useState({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLog, setEditingLog] = useState(null)

  const { data, loading, refetch } = useQuery(MyWorkLogsDocument, {
    variables: { filters }
  })

  const { data: statsData } = useQuery(TotalHoursDocument, {
    variables: { filters }
  })

  const [createWorkLog] = useMutation(CreateWorkLogDocument, {
    onCompleted: () => {
      refetch()
      setIsFormOpen(false)
    }
  })

  // ... остальная логика
}
```

#### 4. UI Components to use ⏱️ 1 час

**shadcn/ui components:**
- `Card` - для статистики и форм
- `Table` - для списка записей
- `Button` - действия
- `Input`, `Textarea` - форма
- `Select` - выбор проекта
- `DatePicker` - выбор даты
- `Dialog` - модальное окно для формы
- `Badge` - статусы

**Дополнительно установить:**
```bash
npm install date-fns react-day-picker recharts
```

#### 5. Тестирование ⏱️ 1 час

**Чек-лист:**
- ✅ Создание записи
- ✅ Редактирование записи
- ✅ Удаление записи
- ✅ Фильтрация по дате
- ✅ Фильтрация по проекту
- ✅ Подсчет часов
- ✅ Валидация формы
- ✅ Отображение ошибок
- ✅ Пагинация работает
- ✅ Сортировка работает

---

## 📅 Day 10-11: Analytics Dashboard

**Цель:** Добавить аналитику и отчеты по рабочему времени

### Компоненты:

1. **Time Analytics Dashboard**
   - Графики распределения времени
   - Топ проектов по часам
   - Тренды (линейный график)
   - Сравнение периодов

2. **Reports Generation**
   - Отчет по сотруднику
   - Отчет по проекту
   - Отчет по периоду
   - Экспорт в PDF/Excel

3. **Team Analytics** (для менеджеров)
   - Загрузка команды
   - Распределение по проектам
   - Производительность

---

## 📅 Day 12-14: Salary Integration

**Цель:** Интеграция учета времени с расчетом зарплаты

### Задачи:

1. **Hourly Rate Management**
   - CRUD для почасовых ставок
   - История изменений ставок
   - Привязка к сотрудникам

2. **Salary Calculation**
   - Расчет по рабочим часам
   - Учет овертайма
   - Бонусы и вычеты
   - Preview расчета

3. **Payroll Reports**
   - Ведомость по зарплате
   - Детализация по сотрудникам
   - Экспорт для бухгалтерии

---

## 🎯 Приоритеты

**Критические (Day 8-9):**
1. ✅ Исправить последнюю ошибку сборки
2. ✅ Проверить работу backend API
3. ✅ Создать Time Tracking Page

**Важные (Day 10-11):**
4. Analytics Dashboard
5. Reports Generation

**Желательные (Day 12-14):**
6. Salary Integration
7. Advanced Features

---

## 📝 Заметки

- Все новые компоненты создавать с TypeScript
- Использовать shadcn/ui для консистентности
- Следовать паттерну: GraphQL → Codegen → Document import
- Добавлять error handling и loading states
- Тесты писать по мере разработки

---

## 🔗 Ссылки

- [Build Fixes Summary](./BUILD_FIXES_SUMMARY.md) - Детали исправлений
- [Roadmap](./roadmap.md) - Общий план
- [Changelog](./changelog.backend.md) - История изменений
- [shadcn/ui Docs](https://ui.shadcn.com/) - UI компоненты
- [Recharts](https://recharts.org/) - Графики
