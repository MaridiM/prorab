# Stage 9: Personnel & Payments Management - Usage Guide

## Обзор

Stage 9 предоставляет полный набор инструментов для управления персоналом, зарплатами, учета рабочего времени и аналитики по проектам.

## 1. Управление Зарплатами

### Типы зарплат:

1. **NONE** - Зарплата не установлена
2. **FIXED** - Фиксированная ставка (уже учтена в расходах проекта)
3. **PERCENTAGE** - Процент от чистой прибыли проекта

### Установка зарплаты участнику:

**GraphQL Mutation:**
```graphql
mutation UpdateMemberSalary($input: UpdateMemberSalaryInput!) {
  updateMemberSalary(input: $input) {
    id
    salaryType
    salaryAmount
    position
  }
}
```

**Variables:**
```json
{
  "input": {
    "memberId": "member-id",
    "salaryType": "PERCENTAGE",
    "salaryAmount": 10,
    "reason": "Годовой пересмотр зарплат"
  }
}
```

**Frontend:**
- Перейдите в People Management
- Нажмите на участника → Edit
- Установите Salary Type и Amount
- Укажите причину изменения (optional)

### Массовое обновление зарплат:

**GraphQL Mutation:**
```graphql
mutation BulkUpdateSalaries($input: BulkUpdateSalaryInput!) {
  bulkUpdateMemberSalaries(input: $input) {
    success
    failed
    results
  }
}
```

**Variables:**
```json
{
  "input": {
    "updates": [
      {
        "memberId": "member-1",
        "salaryType": "PERCENTAGE",
        "salaryAmount": 15
      },
      {
        "memberId": "member-2",
        "salaryType": "FIXED",
        "salaryAmount": 80000
      }
    ],
    "reason": "Q4 2025 Salary Review"
  }
}
```

**Особенности:**
- Каждое обновление валидируется отдельно
- Partial success: если одно обновление fail, остальные продолжаются
- Автоматические Telegram уведомления для каждого успешного обновления
- История изменений логируется автоматически

---

## 2. Учет Рабочего Времени (Work Logs)

### Создание записи времени:

**GraphQL Mutation:**
```graphql
mutation CreateWorkLog($input: CreateWorkLogInput!) {
  createWorkLog(input: $input) {
    id
    date
    hours
    description
    member {
      user {
        fullName
      }
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "projectId": "project-id",
    "memberId": "member-id",
    "date": "2025-12-12",
    "hours": 8.5,
    "description": "Работа на объекте: установка окон"
  }
}
```

**Validation:**
- Hours: 0.01 - 24.00
- Description: max 2000 символов
- Date: любая дата

**Frontend:**
- Time Tracking page: `/teams/{teamId}/projects/{projectId}/time-tracking`
- Кнопка "Добавить запись"
- Заполните форму
- Submit

### Массовое создание записей:

**GraphQL Mutation:**
```graphql
mutation BulkCreateWorkLogs($input: BulkCreateWorkLogInput!) {
  bulkCreateWorkLogs(input: $input) {
    success
    failed
    results
  }
}
```

**Variables:**
```json
{
  "input": {
    "workLogs": [
      {
        "projectId": "project-id",
        "memberId": "member-1",
        "date": "2025-12-10",
        "hours": 8,
        "description": "Работа на объекте"
      },
      {
        "projectId": "project-id",
        "memberId": "member-2",
        "date": "2025-12-10",
        "hours": 6.5,
        "description": "Работа на объекте"
      }
    ]
  }
}
```

**Use Cases:**
- Импорт из Excel/CSV
- Автоматическое заполнение за неделю
- Копирование записей между проектами

---

## 3. Аналитика Персонала

### Получение аналитики:

**GraphQL Query:**
```graphql
query PersonnelAnalytics($teamId: ID!) {
  personnelAnalytics(teamId: $teamId) {
    teamName
    totalMembers
    totalHoursWorked
    totalPayouts
    averageHoursPerMember
    averagePayoutPerMember

    members {
      memberId
      memberName
      memberEmail
      position
      salaryType
      salaryAmount
      projectsCount
      totalHoursWorked
      totalPayouts
      averagePayoutPerProject
    }

    projects {
      projectId
      projectName
      budget
      totalHoursWorked
      totalPayouts
      membersCount
      status
    }
  }
}
```

**Frontend:**
- Personnel Analytics page: `/teams/{teamId}/analytics/personnel`
- KPI Cards (4): Total Members, Hours, Payouts, Average
- Member Performance Table (sortable, searchable)
- Project Performance Table (sortable, searchable)

**Metrics:**
- Total hours worked (per member, per project)
- Total payouts (completed только)
- Average payout per project
- Projects count per member

---

## 4. Расчет Выплат

### Расчет выплат по проекту:

**GraphQL Query:**
```graphql
query CalculatePayouts($projectId: ID!) {
  calculateProjectPayouts(projectId: $projectId) {
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

**Логика расчета:**

1. **Net Profit = Budget - Total Expenses**
2. **Для каждого участника:**
   - FIXED: payout = 0 (уже в expenses)
   - PERCENTAGE: payout = netProfit × (percentage / 100)
   - NONE: payout = 0

3. **Owner Profit = Net Profit - Σ(PERCENTAGE payouts)**

### Создание/обновление выплаты:

**GraphQL Mutation:**
```graphql
mutation CreatePayout($input: CreatePayoutInput!) {
  createPayout(input: $input) {
    id
    actualAmount
    status
    paidAt
    notes
  }
}
```

**Variables:**
```json
{
  "input": {
    "projectId": "project-id",
    "memberId": "member-id",
    "amount": 50000,
    "notes": "Выплата за декабрь 2025"
  }
}
```

**Особенности:**
- Автоматическое Telegram уведомление участнику
- Status автоматически устанавливается в "PAID"
- paidAt устанавливается в текущее время
- Если выплата уже exists - обновляет amount и notes

---

## 5. Telegram Уведомления

### Настройка уведомлений:

**Автоматические уведомления отправляются при:**
1. Изменении зарплаты участника
2. Создании/обновлении выплаты

**Настройки в БД (NotificationSettings):**
```prisma
model NotificationSettings {
  telegramEnabled        Boolean @default(true)
  telegramSalaryChanges  Boolean @default(true)
  telegramPayouts        Boolean @default(true)
}
```

**Проверка настроек:**
- Если `telegramEnabled = false` - все Telegram уведомления отключены
- Если `telegramSalaryChanges = false` - только уведомления о зарплате отключены
- Если `telegramPayouts = false` - только уведомления о выплатах отключены

### Формат уведомлений:

**Изменение зарплаты:**
```
💼 Изменение зарплаты

👤 Участник: Иван Петров
🏢 Команда: Строители Pro

📋 Тип зарплаты: Не установлена → Процент
📈 Сумма: 0 ₽ → 50 000 ₽ (+50 000 ₽)

📅 12.12.25, 15:30
```

**Выплата:**
```
✅ Выплата завершена

👤 Участник: Иван Петров
🏗 Проект: Ремонт квартиры
💰 Сумма: 50 000 ₽
📝 Описание: Выплата за декабрь

📅 12.12.25, 15:30
```

### Requirements:
- User должен иметь `telegramChatId` (через OAuth login)
- NotificationSettings должны быть включены
- Бот: @ProRabSpaceBot

---

## 6. Экспорт в CSV

### Экспорт Work Logs:

**GraphQL Query:**
```graphql
query ExportWorkLogs($projectId: ID!) {
  exportProjectWorkLogs(projectId: $projectId)
}
```

**Возвращает:** CSV строку

**CSV Columns:**
- Дата
- Участник
- Часы
- Описание
- Проект
- Создано

**Frontend:**
- Time Tracking page
- Кнопка "Экспорт CSV"
- Автоматическое скачивание файла: `work-logs-{projectId}-{date}.csv`

### Экспорт Personnel Analytics:

**GraphQL Query:**
```graphql
query ExportPersonnelAnalytics($teamId: ID!) {
  exportPersonnelAnalytics(teamId: $teamId)
}
```

**CSV Columns (13 полей):**
- Участник
- Email
- Роль
- Должность
- Тип зарплаты
- Сумма зарплаты
- Количество проектов
- Всего часов
- Всего выплат
- Средняя выплата
- Завершенные выплаты
- Ожидающие выплаты
- Дата присоединения

**Frontend:**
- Personnel Analytics page
- Кнопка "Экспорт CSV"
- Автоматическое скачивание: `personnel-analytics-{teamId}-{date}.csv`

---

## 7. История Изменений Зарплат (Audit Log)

### Получение истории:

**GraphQL Query:**
```graphql
query MemberSalaryHistory($memberId: ID!) {
  memberSalaryHistory(memberId: $memberId) {
    id
    previousType
    previousAmount
    newType
    newAmount
    reason
    changedAt
    changedBy {
      fullName
      email
    }
  }
}
```

**Особенности:**
- Автоматическое логирование при каждом изменении зарплаты
- Хранит old и new значения
- Опциональная причина изменения
- Кто и когда изменил
- Только owner может просматривать историю

---

## 8. Должности Участников (Positions)

### Установка должности:

**GraphQL Mutation:**
```graphql
mutation UpdateMemberPosition($input: UpdateMemberPositionInput!) {
  updateMemberPosition(input: $input) {
    id
    position
  }
}
```

**Variables:**
```json
{
  "input": {
    "memberId": "member-id",
    "position": "Прораб"
  }
}
```

**Примеры должностей:**
- Прораб
- Мастер
- Рабочий
- Инженер
- Бригадир

**Frontend:**
- People Management → Edit Member
- Personnel Analytics (column)

---

## 9. Access Control

### Permissions:

**Owner Only:**
- Update member salary
- View salary history
- Calculate/create payouts
- Export analytics
- Update member position

**Owner + Self:**
- Create work logs
- View own work logs

**Owner + Creator:**
- Update/delete work logs

**All Team Members:**
- View project work logs
- View personnel analytics (read-only)

---

## 10. Best Practices

### Работа с выплатами:

1. **Перед закрытием проекта:**
   - Убедитесь, что все work logs введены
   - Проверьте budget и expenses
   - Рассчитайте payouts
   - Создайте payouts для всех участников

2. **Fixed salary:**
   - Добавляйте как expense в начале проекта
   - Payout = 0 (уже учтено в expenses)

3. **Percentage salary:**
   - Автоматически рассчитывается от net profit
   - Сумма показывается в payout summary

### Учет времени:

1. **Ежедневно:**
   - Вводите work logs в конце дня
   - Указывайте детальное описание

2. **Еженедельно:**
   - Проверяйте total hours
   - Используйте bulk create для быстрого заполнения

### Экспорт данных:

1. **Для отчетности:**
   - Экспортируйте CSV в конце месяца/проекта
   - Храните копии для бухгалтерии

2. **Для анализа:**
   - Используйте personnel analytics
   - Фильтруйте по member/project
   - Экспортируйте для Excel analysis

---

## Troubleshooting

### Telegram уведомления не приходят:

1. Проверьте `telegramChatId` пользователя
2. Проверьте `notificationSettings.telegramEnabled`
3. Убедитесь, что пользователь авторизовался через @ProRabSpaceBot
4. Проверьте логи сервера для ошибок

### CSV экспорт не работает:

1. Проверьте права доступа (owner only)
2. Убедитесь, что есть данные для экспорта
3. Проверьте browser console для ошибок

### Bulk операции failed:

1. Проверьте `results` array для details
2. Каждый failed item содержит error message
3. Successful items были обработаны
4. Повторите только для failed items

---

## Roadmap (Optional Enhancements)

**Day 20: UX Enhancements**
- [ ] Charts (recharts) в Personnel Analytics
- [ ] Date range filters для Work Logs
- [ ] Calendar view для Work Logs
- [ ] Performance optimization (caching)

**Future:**
- [ ] Frontend UI для bulk operations
- [ ] Telegram settings UI в Settings page
- [ ] Export to PDF
- [ ] Advanced filtering и sorting
- [ ] Mobile app

---

**Документация обновлена:** 2025-12-12
**Stage 9 Status:** ✅ COMPLETE
