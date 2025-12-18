# Исправление ошибки: Unknown type "CompleteOnboardingInput"

## Проблема

При нажатии кнопки "Завершить" на Step 3 появляется ошибка:
```
Unknown type "CompleteOnboardingInput".
Cannot query field "completeOnboarding" on type "Mutation".
```

## Причина

GraphQL сервер на бэкенде не знает о типе `CompleteOnboardingInput`. Это может происходить по следующим причинам:

1. **Бэкенд не запущен** - GraphQL endpoint недоступен
2. **Схема не обновилась** - `schema.gql` не был перегенерирован после изменений
3. **Бэкенд не перезапущен** - изменения в коде не применены

## Решение

### Шаг 1: Убедитесь, что бэкенд запущен

```bash
# В корне проекта
pnpm dev:api
# или
cd apps/api
pnpm start:dev
```

Бэкенд должен быть доступен на `http://localhost:8080/graphql`

### Шаг 2: Проверьте, что schema.gql содержит CompleteOnboardingInput

```bash
cd apps/api
grep -i "CompleteOnboardingInput" schema.gql
```

Должна быть строка:
```graphql
input CompleteOnboardingInput {
  ...
}
```

### Шаг 3: Если schema.gql не содержит тип, перезапустите бэкенд

NestJS автоматически генерирует `schema.gql` при запуске, если в конфигурации указано:
```typescript
autoSchemaFile: join(process.cwd(), 'schema.gql'),
```

### Шаг 4: Перегенерируйте типы на фронтенде

```bash
cd apps/web
pnpm codegen
```

Это обновит типы в `apps/web/src/packages/api/graphql/__generated__/output.ts`

### Шаг 5: Перезапустите фронтенд

```bash
cd apps/web
pnpm dev
```

## Проверка

После выполнения всех шагов:

1. Откройте `http://localhost:3000/onboarding/step-3`
2. Заполните форму
3. Нажмите "Завершить"
4. Ошибка должна исчезнуть

## Альтернативное решение (если проблема сохраняется)

Если проблема сохраняется, проверьте:

1. **Правильность импорта типов:**
   ```typescript
   import { CompleteOnboardingDocument, type CompleteOnboardingInput } from '@/packages/api/graphql'
   ```

2. **Правильность использования мутации:**
   ```typescript
   const [completeOnboarding] = useMutation(CompleteOnboardingDocument, {
     client: apolloClient,
   })
   ```

3. **Правильность структуры input:**
   ```typescript
   const input: CompleteOnboardingInput = {
     teamName: step1Data.name,
     projectName: data.name,
     // ...
   }
   ```

## Дополнительная информация

- **Файл схемы:** `apps/api/schema.gql` (автогенерируется)
- **Конфигурация GraphQL:** `apps/api/src/core/config/graphql.config.ts`
- **Resolver:** `apps/api/src/modules/teams/teams.resolver.ts`
- **DTO:** `apps/api/src/modules/teams/dto/complete-onboarding.input.ts`
- **Frontend типы:** `apps/web/src/packages/api/graphql/__generated__/output.ts`


















