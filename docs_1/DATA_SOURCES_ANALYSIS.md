# Анализ источников данных в приложении

**Дата:** 2025-12-18

---

## 📊 Откуда берутся данные

### 1. **Основной источник: GraphQL API**

Все данные в приложении получаются через **GraphQL API**, который находится на:
- **URL:** `http://localhost:8080/graphql` (по умолчанию)
- **WebSocket:** `ws://localhost:8080/graphql` (для subscriptions)
- **Конфигурация:** `apps/web/src/packages/constants/url.ts`

### 2. **Apollo Client**

Приложение использует **Apollo Client** для работы с GraphQL:
- **Конфигурация:** `apps/web/src/packages/libs/apollo/apollo-client.config.ts`
- **Provider:** `apps/web/src/packages/libs/apollo/apollo-client.provider.tsx`
- **HTTP Link:** Использует `UploadHttpLink` для поддержки загрузки файлов
- **WebSocket Link:** Используется для subscriptions

### 3. **Переменные окружения**

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/graphql
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔍 Где используется мок (mock data)

### 1. **Страница зарплаты участника** ⚠️ КРИТИЧНО

**Файл:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/members/[memberId]/salary/page.tsx`

**Проблема:**
```typescript
// TODO: Implement TeamMembersDocument query to get actual member data
// For now using mock data for demonstration
const member = {
    id: memberId,
    userId: 'mock-user-id',
    role: 'MEMBER',
    salaryType: 'NONE' as const,
    salaryAmount: null,
    user: {
        id: 'mock-user-id',
        fullName: 'Участник команды',
        email: 'member@example.com'
    }
}
```

**Что нужно сделать:**
- Использовать запрос `TeamMembersDocument` для получения реальных данных участника
- Запрос уже существует в `apps/web/src/packages/api/graphql/teams.graphql`
- Нужно заменить мок на реальный GraphQL запрос

### 2. **Лендинг (главная страница)** ✅ Нормально

**Файл:** `apps/web/src/app/page.tsx`

**Использование:**
- `PhoneMockup()` - компонент для демонстрации мобильного интерфейса
- `ReportMockup()` - компонент для демонстрации фотоотчетов

**Статус:** Это нормально - это UI компоненты для демонстрации, не реальные данные.

---

## ✅ Что нужно сделать

### Приоритет 1: Исправить мок данных участника

**Файл:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/members/[memberId]/salary/page.tsx`

**Текущий код:**
```typescript
// TODO: Implement TeamMembersDocument query to get actual member data
// For now using mock data for demonstration
const member = {
    id: memberId,
    userId: 'mock-user-id',
    role: 'MEMBER',
    salaryType: 'NONE' as const,
    salaryAmount: null,
    user: {
        id: 'mock-user-id',
        fullName: 'Участник команды',
        email: 'member@example.com'
    }
}
```

**Нужно заменить на:**
```typescript
// Загрузка данных участников команды
const { data: teamMembersData, loading: membersLoading } = useQuery(
    TeamMembersDocument,
    {
        variables: { teamId },
        skip: !teamId,
    }
)

// Найти участника по memberId
const member = teamMembersData?.teamMembers?.find((m) => m.id === memberId)
```

**Шаги:**
1. Импортировать `TeamMembersDocument` из `@/packages/api/graphql`
2. Добавить `useQuery` для загрузки участников команды
3. Найти нужного участника из массива по `memberId`
4. Удалить мок данные
5. Добавить обработку состояния загрузки и ошибок

---

## 📋 Все GraphQL запросы для работы с участниками

### 1. **TeamMembers Query**

**Файл:** `apps/web/src/packages/api/graphql/teams.graphql`

```graphql
query TeamMembers($teamId: ID!) {
  teamMembers(teamId: $teamId) {
    id
    teamId
    userId
    role
    position
    salaryType
    salaryAmount
    joinedAt
    user {
      id
      email
      fullName
      phone
      avatarUrl
    }
    stats {
      projectCount
      totalPayouts
      averagePayoutPerProject
      completedPayoutsCount
      pendingPayoutsCount
    }
  }
}
```

**Используется в:**
- ✅ `apps/web/src/app/(root)/(protected)/teams/[teamId]/page.tsx`
- ✅ `apps/web/src/app/components/work-logs/work-log-dialog.tsx`
- ❌ **НЕ используется в:** `apps/web/src/app/(root)/(protected)/teams/[teamId]/members/[memberId]/salary/page.tsx` (используется мок)

### 2. **MemberSalaryHistory Query**

**Файл:** `apps/web/src/packages/api/graphql/payouts.graphql` (предположительно)

```graphql
query MemberSalaryHistory($memberId: ID!) {
  memberSalaryHistory(memberId: $memberId) {
    # поля истории изменений зарплаты
  }
}
```

**Используется в:**
- ✅ `apps/web/src/app/(root)/(protected)/teams/[teamId]/members/[memberId]/salary/page.tsx` (уже используется)

---

## 🔧 Конфигурация API

### Apollo Client Configuration

**Файл:** `apps/web/src/packages/libs/apollo/apollo-client.config.ts`

**Ключевые моменты:**
- HTTP Link: `http://localhost:8080/graphql`
- WebSocket Link: `ws://localhost:8080/graphql`
- Поддержка загрузки файлов через `UploadHttpLink`
- Обработка ошибок аутентификации
- Автоматический редирект на `/auth/login` при ошибках аутентификации

### URL Constants

**Файл:** `apps/web/src/packages/constants/url.ts`

```typescript
export const SERVER_URL = 
  process.env.NEXT_PUBLIC_SERVER_URL ?? 
  'http://localhost:8080/graphql';
  
export const WEBSOCKET_URL = 
  process.env.NEXT_PUBLIC_WEBSOCKET_URL || 
  'ws://localhost:8080/graphql';
```

---

## 📝 Резюме

### ✅ Что работает правильно:
1. Все данные получаются через GraphQL API
2. Apollo Client правильно настроен
3. Большинство страниц используют реальные GraphQL запросы
4. Seed данные создаются через `apps/api/prisma/seed.ts`

### ⚠️ Что нужно исправить:
1. **КРИТИЧНО:** Заменить мок данные участника на реальный GraphQL запрос в `salary/page.tsx`
   - Файл: `apps/web/src/app/(root)/(protected)/teams/[teamId]/members/[memberId]/salary/page.tsx`
   - Строки: 53-66
   - Запрос уже существует: `TeamMembersDocument`

### 📌 Дополнительные заметки:
- Моки на главной странице (`page.tsx`) - это нормально, это UI компоненты для демонстрации
- Все остальные данные получаются из реального API
- Seed данные доступны через `npm run prisma:seed` в `apps/api`

---

## 🚀 План действий

1. **Исправить мок в salary/page.tsx:**
   - Добавить `useQuery(TeamMembersDocument)`
   - Найти участника из массива
   - Удалить мок данные
   - Добавить обработку загрузки

2. **Проверить работу:**
   - Убедиться, что данные загружаются
   - Проверить обработку ошибок
   - Проверить состояние загрузки

3. **Тестирование:**
   - Проверить с реальными данными из seed
   - Проверить с пустыми данными
   - Проверить обработку ошибок API



