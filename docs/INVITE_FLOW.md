# 🔗 Процесс приглашения участников

## Обзор

Система поддерживает приглашение новых участников в команду через одноразовые ссылки-приглашения с ограниченным сроком действия.

## 🎯 Сценарии использования

### 1️⃣ Незарегистрированный пользователь (новый пользователь)

**Флоу:**
```
1. Получает ссылку: /invite/ABC12345
2. Нажимает "Создать аккаунт и присоединиться"
3. Регистрируется: /auth/register?redirect=/invite/ABC12345
4. После регистрации → автоматический редирект на /invite/ABC12345
5. Автоматическое присоединение к команде
6. Перенаправление на страницу команды: /teams/{teamId}
```

**Важно:** 
- Код приглашения сохраняется в `sessionStorage` как `pendingInviteCode`
- Параметр `redirect` в URL обеспечивает возврат на страницу приглашения
- После регистрации пользователь пропускает онбординг и сразу присоединяется к команде

### 2️⃣ Зарегистрированный, но не авторизованный пользователь

**Флоу:**
```
1. Получает ссылку: /invite/ABC12345
2. Нажимает "Войти и присоединиться"
3. Логинится: /auth/login?redirect=/invite/ABC12345
4. После логина → автоматический редирект на /invite/ABC12345
5. Автоматическое присоединение к команде
6. Перенаправление на страницу команды: /teams/{teamId}
```

### 3️⃣ Авторизованный пользователь

**Флоу:**
```
1. Получает ссылку: /invite/ABC12345
2. Открывает страницу приглашения
3. Нажимает "Присоединиться к команде"
4. Мгновенное присоединение
5. Перенаправление на страницу команды: /teams/{teamId}
```

## 🔐 Безопасность и валидация

### На странице приглашения (`/invite/[code]/page.tsx`)

1. **Проверка авторизации:**
   - Если `!user` → показать кнопки "Войти" и "Создать аккаунт"
   - Если `user` → показать кнопку "Присоединиться к команде"

2. **Сохранение контекста:**
   ```typescript
   // При переходе на логин/регистрацию
   sessionStorage.setItem('pendingInviteCode', code)
   router.push('/auth/login?redirect=/invite/' + code)
   ```

3. **Автоматическое присоединение:**
   ```typescript
   useEffect(() => {
     const pendingCode = sessionStorage.getItem('pendingInviteCode')
     if (user && pendingCode === code && !data && !loading && !error) {
       sessionStorage.removeItem('pendingInviteCode')
       // Call joinTeamByInvite directly to avoid dependency issues
       joinTeamByInvite({
         variables: { code },
       })
     }
   }, [user, code, data, loading, error, joinTeamByInvite])
   ```

### На backend (`teams.service.ts`)

```typescript
async joinTeamByInvite(userId: string, code: string) {
  // 1. Проверка существования кода
  const inviteCode = await prisma.inviteCode.findUnique({ 
    where: { code } 
  })
  
  if (!inviteCode) {
    throw new BadRequestException('Код приглашения не найден')
  }
  
  // 2. Проверка что код не использован
  if (inviteCode.usedBy) {
    throw new BadRequestException('Код уже использован')
  }
  
  // 3. Проверка срока действия
  if (inviteCode.expiresAt < new Date()) {
    throw new BadRequestException('Срок действия кода истёк')
  }
  
  // 4. Проверка дублей
  const existingMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: inviteCode.teamId,
        userId,
      },
    },
  })
  
  if (existingMembership) {
    throw new BadRequestException('Вы уже состоите в этой команде')
  }
  
  // 5. Создание участника
  const teamMember = await prisma.teamMember.create({
    data: {
      teamId: inviteCode.teamId,
      userId,
      role: 'member',
    },
  })
  
  // 6. Отметка кода как использованного
  await prisma.inviteCode.update({
    where: { id: inviteCode.id },
    data: {
      usedBy: userId,
      usedAt: new Date(),
    },
  })
  
  return teamMember
}
```

## 📱 UI компоненты

### Страница приглашения

```tsx
// Для незарегистрированных
<Button onClick={handleJoinTeam}>
  Войти и присоединиться
</Button>
<Button variant="outline" onClick={handleRegister}>
  Создать аккаунт и присоединиться
</Button>

// Для авторизованных
<Button onClick={handleJoinTeam}>
  Присоединиться к команде
</Button>
```

### Диалог создания ссылки (`InviteLinkDialog`)

```tsx
// Владелец выбирает срок действия
<Select value={expiresInDays} onValueChange={setExpiresInDays}>
  <SelectItem value="1">1 день</SelectItem>
  <SelectItem value="3">3 дня</SelectItem>
  <SelectItem value="7">7 дней (рекомендуется)</SelectItem>
  <SelectItem value="14">14 дней</SelectItem>
  <SelectItem value="30">30 дней</SelectItem>
</Select>

// Создание ссылки
<Button onClick={handleCreateInvite}>
  Создать ссылку
</Button>

// Список активных ссылок
{activeInvites.map(invite => (
  <div>
    <code>{invite.code}</code>
    <Button onClick={() => handleCopyLink(invite.code)}>
      Копировать
    </Button>
    <Button onClick={() => handleDeleteInvite(invite.id)}>
      Удалить
    </Button>
  </div>
))}
```

## 🔄 Интеграция с auth системой

### Страница логина

```typescript
// Получаем redirect URL из query params
const redirectUrl = searchParams.get('redirect')

// Ссылка на регистрацию сохраняет redirect
const registerUrl = redirectUrl 
  ? `/auth/register?redirect=${encodeURIComponent(redirectUrl)}` 
  : '/auth/register'

// После логина проверяем redirect
if (redirectUrl) {
  router.push(redirectUrl)
}
```

### Страница регистрации

```typescript
// Получаем redirect URL из query params
const redirectUrl = searchParams.get('redirect')

// Ссылка на логин сохраняет redirect
const loginUrl = redirectUrl 
  ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` 
  : '/auth/login'

// После регистрации проверяем redirect
if (redirectUrl) {
  router.push(redirectUrl) // Вернуться на страницу приглашения
} else {
  router.push('/onboarding') // Обычный флоу
}
```

## 🎨 UX моменты

### Сообщения для пользователя

**Успешное присоединение:**
```
✅ Успешно!
Вы присоединились к команде "{team.name}"
```

**Ошибки:**
- "Код приглашения не найден"
- "Этот код приглашения уже был использован"
- "Срок действия кода приглашения истёк"
- "Вы уже состоите в этой команде"

### Визуальные состояния

1. **Загрузка:** Спиннер + "Загрузка..."
2. **Успех:** Зеленая галочка + "Вы в команде!"
3. **Ошибка:** Красная иконка + описание ошибки
4. **Ожидание действия:** Иконка команды + "Приглашение в команду"

## 📊 База данных

### Модель InviteCode

```prisma
model InviteCode {
  id        String    @id @default(uuid())
  teamId    String
  code      String    @unique  // 8-символьный код (A-Z, 0-9)
  expiresAt DateTime
  usedBy    String?   // ID пользователя
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  
  team      Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  @@index([teamId])
  @@index([code])
}
```

### Генерация кода

```typescript
private generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
```

## 🧪 Тестовые сценарии

### Позитивные

1. ✅ Незарегистрированный пользователь создает аккаунт и присоединяется
2. ✅ Существующий пользователь логинится и присоединяется
3. ✅ Авторизованный пользователь мгновенно присоединяется
4. ✅ Код становится неактивным после использования
5. ✅ Владелец видит статистику использования кодов

### Негативные

1. ❌ Использование несуществующего кода
2. ❌ Использование истёкшего кода
3. ❌ Повторное использование одного кода
4. ❌ Попытка присоединиться к команде дважды
5. ❌ Создание кода не-владельцем команды

## 👥 Множественные команды

**Важно:** Пользователь может быть участником нескольких команд одновременно!

### Поведение системы:

1. **Если у пользователя уже есть своя команда:**
   - ✅ Пользователь остается владельцем своей команды
   - ✅ Пользователь добавляется как "member" в новую команду
   - ✅ Пользователь видит обе команды в списке `myTeams`
   - ✅ Пользователь может переключаться между командами

2. **Если пользователь уже участник другой команды:**
   - ✅ Пользователь остается в первой команде
   - ✅ Пользователь добавляется во вторую команду
   - ✅ Пользователь видит все команды
   - ✅ Может работать в обеих командах параллельно

3. **Роли:**
   - **Owner** - владелец команды (может быть владельцем нескольких команд)
   - **Member** - участник команды (может быть участником неограниченного количества команд)
   - При приглашении всегда создается роль **"member"**

### Проверки на backend:

```typescript
// Проверка дублей - нельзя состоять в команде дважды
const existingMembership = await prisma.teamMember.findUnique({
  where: {
    teamId_userId: { teamId, userId }
  }
})

if (existingMembership) {
  throw new BadRequestException('Вы уже состоите в этой команде')
}
```

**Подробнее:** См. `docs/MULTIPLE_TEAMS.md`

## 🚀 Будущие улучшения

- [ ] Email-приглашения (отправка ссылки напрямую на email)
- [ ] QR-коды для приглашений
- [ ] Массовое приглашение (список email)
- [ ] Роли при приглашении (сразу назначить роль)
- [ ] Статистика кликов по ссылкам
- [ ] Webhook при присоединении нового участника
- [ ] Лимиты на количество участников по тарифу
- [ ] Передача владения командой
- [ ] Выход из команды (self-leave)

