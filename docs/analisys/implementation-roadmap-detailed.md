# План реализации ProRab.space MVP - Детальный Roadmap

**Дата создания:** 2025-12-05
**Статус:** Планирование следующих этапов
**Версия:** 1.0

---

## Оглавление

1. [Текущее состояние проекта](#текущее-состояние-проекта)
2. [Что осталось реализовать](#что-осталось-реализовать)
3. [Детальные планы по этапам](#детальные-планы-по-этапам)
4. [Архитектурные требования](#архитектурные-требования)
5. [Технические детали](#технические-детали)
6. [Риски и митигация](#риски-и-митигация)
7. [Метрики успеха](#метрики-успеха)
8. [Итоговая оценка и рекомендации](#итоговая-оценка-и-рекомендации)

---

## Текущее состояние проекта

### ✅ Что уже реализовано (завершено)

#### Инфраструктура (100% готово)
- ✅ **Монорепо Turborepo** - структура apps/ + packages/
- ✅ **Next.js 16 (App Router)** - web приложение с SSR
- ✅ **NestJS 11 + GraphQL** - API с Apollo Server (code-first)
- ✅ **PostgreSQL + Prisma ORM v7** - база данных с миграциями
- ✅ **Redis** - хранение сессий авторизации
- ✅ **Docker окружение** - PostgreSQL (5433), Redis (6379)
- ✅ **Tailwind CSS v4** - дизайн-система с темной/светлой темой
- ✅ **GraphQL Codegen** - автогенерация TypeScript типов

#### Аутентификация (100% готово)
- ✅ **Кастомная auth система** (без SuperTokens)
  - Email/Password вход с Argon2 хешированием
  - Redis сессии (7 дней session, 30 дней refresh token)
  - HTTP-only cookies для безопасного хранения токенов
  - Rate Limiting: 5 попыток входа / 15 минут
- ✅ **Email верификация** через Brevo
- ✅ **Сброс пароля** с токеном (1 час действия)
- ✅ **GraphQL Guards и Decorators** для защиты resolvers
- ✅ **Управление сессиями** (список, удаление, массовая инвалидация)
- ✅ **Frontend страницы**: login, register, forgot-password, reset-password

#### Онбординг - Этап 2.1 (100% готово)
**Период:** 2024-12-03 - 2025-12-05
**Время разработки:** ~40 часов (3 недели)

- ✅ **3-шаговый wizard** создания команды:
  - Step 1: Название бригады
  - Step 2: Логотип (upload изображения ИЛИ выбор иконки/цвета)
  - Step 3: Первый проект (название, адрес, бюджет, описание)
- ✅ **Система приглашений** с 6-значными кодами
- ✅ **Upload логотипа** с Sharp обработкой (resize 512x512, WebP конвертация)
- ✅ **Валидация**: владелец может иметь только 1 команду
- ✅ **Celebration анимация** (confetti) после завершения
- ✅ **Route Protection** - автоматический redirect на /onboarding для новых пользователей
- ✅ **Mobile-first дизайн** - компактный UI, responsive на всех экранах
- ✅ **E2E тестирование** - 7 критических багов найдено и исправлено

**Backend:**
- ✅ Teams Module (Service + Resolver)
- ✅ Атомарная транзакция completeOnboarding (Team → TeamMember → Project → User update)
- ✅ StorageService для загрузки файлов (локальное хранение, Sharp processing)

**Frontend:**
- ✅ Zod validation schemas (team.schema.ts, project.schema.ts, invite.schema.ts)
- ✅ UI компоненты (Stepper, ImageUpload, IconPicker, TeamLogo)
- ✅ GraphQL integration (CompleteOnboarding mutation, MyTeams query)
- ✅ AuthContext с hasCompletedOnboarding tracking
- ✅ Next.js middleware для защиты маршрутов

#### Проекты - Этап 3 (100% готово)
**Дата:** 2025-12-05
**Время разработки:** 1 день (!)

- ✅ **Backend API** - 8 GraphQL операций:
  - **Queries (3):** `project`, `projectsByTeam`, `projectStats`
  - **Mutations (5):** `createProject`, `updateProject`, `archiveProject`, `restoreProject`, `updateProgress`
- ✅ **Frontend компоненты**:
  - DatePicker (react-day-picker + русская локализация)
  - Badge (5 вариантов: default, success, warning, danger, secondary)
  - ProgressBar (автоматический выбор цвета, 3 размера)
  - ProjectCard (отображение всех полей + hover эффекты)
  - ProjectForm (режимы create/edit, React Hook Form + Zod)
- ✅ **4 страницы**:
  - Dashboard (`/teams/[teamId]`) - список проектов с фильтрами и поиском
  - Create (`/teams/[teamId]/projects/new`) - создание проекта
  - Details (`/teams/[teamId]/projects/[projectId]`) - детали с вкладками (Информация/Расходы/Задачи/Фотоотчёты)
  - Edit (`/teams/[teamId]/projects/[projectId]/edit`) - редактирование
- ✅ **Функционал**:
  - Фильтрация по статусу (Все/Активные/Завершённые/Архив)
  - Поиск по названию и адресу в реальном времени
  - Автоматический COMPLETED при progress = 100%
  - Лимит 10 активных проектов на команду
  - Toast уведомления для всех операций
  - Skeleton loaders, Empty states, Error handling
- ✅ **Prisma миграция** `20251205_add_teams_and_projects_stage3` применена

#### UI/UX (100% готово)
- ✅ **Landing Page** с современными анимациями (Framer Motion):
  - Hero секция с мокапом приложения
  - Problems секция - "Три боли прораба"
  - **How It Works секция** - 4 шага процесса (01-04)
  - Features секция - "Всё что нужно. Ничего лишнего"
  - **Before/After секция** - сравнение "Было/Стало"
  - Reports секция - публичные фотоотчёты
  - Pricing секция - 3 тарифа
  - Testimonials секция - отзывы прорабов
  - Final CTA - призыв к действию
- ✅ **Dashboard заглушка** с feature cards (Команды, Проекты, Расходы "скоро", Фотоотчёты "скоро")
- ✅ **Teams List страница** (`/teams`) - список команд с навигацией
- ✅ **Централизованная Toast система** (Zustand) - глобальные уведомления
- ✅ **Mobile-first responsive дизайн** - адаптивность на всех экранах (375px, 768px, 1024px, 1440px)

#### Документация
- ✅ Onboarding Implementation Plan
- ✅ Stage 3 Projects Implementation Plan
- ✅ E2E Testing Log (2025-12-05)
- ✅ Changelog Frontend
- ✅ Roadmap.md с детальной хронологией

---

## Что осталось реализовать

### 🔴 Tier 1: КРИТИЧНЫЕ фичи (блокируют MVP)

Без этих фич продукт не может выйти на рынок, так как не решает заявленные **"три боли прораба"**.

#### 1. Учет расходов (Expenses) - **ФАЗА 1**

**Приоритет:** 🔴🔴🔴 Максимальный
**Оценка времени:** 2-3 дня
**Блокирует:** Финансовый виджет, расчет прибыли, расчет зарплаты

**Почему критично:**
- Это **первая из "трех болей прораба"** - "Где мои деньги?"
- Без учета расходов нет финансового дашборда
- Фундамент для всех остальных финансовых фич
- **Core value proposition** продукта

**Технические детали:**

**Backend (API):**

1. **Prisma Schema** для Expense:
```prisma
model Expense {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  amount        Decimal  @db.Decimal(12, 2)
  category      String
  photos        String[] @default([])  // URLs фото чеков
  comment       String?  @db.Text
  paidByClient  Boolean  @default(false)
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("expenses")
  @@index([projectId])
  @@index([createdById])
  @@index([createdAt])
}
```

2. **GraphQL Types** (`apps/api/src/modules/expenses/models/`):
```typescript
@ObjectType()
export class Expense {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  projectId: string;

  @Field(() => Project)
  project: Project;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  category: string;

  @Field(() => [String])
  photos: string[];

  @Field(() => String, { nullable: true })
  comment?: string;

  @Field(() => Boolean)
  paidByClient: boolean;

  @Field(() => User)
  createdBy: User;

  @Field(() => Date)
  createdAt: Date;
}

@InputType()
export class CreateExpenseInput {
  @Field(() => ID)
  projectId: string;

  @Field(() => Float)
  @Min(0)
  amount: number;

  @Field(() => String)
  @MinLength(1)
  category: string;

  @Field(() => [Upload])
  @ArrayMaxSize(5)
  photos: FileUpload[];

  @Field(() => String, { nullable: true })
  comment?: string;

  @Field(() => Boolean, { defaultValue: false })
  paidByClient: boolean;
}

@InputType()
export class UpdateExpenseInput {
  @Field(() => Float, { nullable: true })
  @Min(0)
  amount?: number;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => [Upload], { nullable: true })
  @ArrayMaxSize(5)
  photos?: FileUpload[];

  @Field(() => String, { nullable: true })
  comment?: string;

  @Field(() => Boolean, { nullable: true })
  paidByClient?: boolean;
}

@ObjectType()
export class CategorySummary {
  @Field(() => String)
  category: string;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}
```

3. **ExpensesService** (`apps/api/src/modules/expenses/expenses.service.ts`):
```typescript
@Injectable()
export class ExpensesService extends CoreService {
  constructor(
    prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {
    super(prisma);
  }

  async create(userId: string, input: CreateExpenseInput): Promise<Expense> {
    // 1. Валидация доступа к проекту
    await this.validateProjectAccess(userId, input.projectId);

    // 2. Upload фото чеков в Cloudflare R2
    const photoUrls = await this.uploadPhotos(input.photos);

    // 3. Создание расхода
    return this.prisma.expense.create({
      data: {
        projectId: input.projectId,
        amount: input.amount,
        category: input.category,
        photos: photoUrls,
        comment: input.comment,
        paidByClient: input.paidByClient,
        createdById: userId,
      },
      include: {
        project: true,
        createdBy: true,
      },
    });
  }

  async update(userId: string, id: string, input: UpdateExpenseInput): Promise<Expense> {
    // 1. Проверка прав доступа
    const expense = await this.findById(id);
    await this.validateProjectAccess(userId, expense.projectId);

    // 2. Upload новых фото (если есть)
    let photoUrls = expense.photos;
    if (input.photos) {
      photoUrls = await this.uploadPhotos(input.photos);
    }

    // 3. Обновление
    return this.prisma.expense.update({
      where: { id },
      data: {
        amount: input.amount ?? expense.amount,
        category: input.category ?? expense.category,
        photos: photoUrls,
        comment: input.comment ?? expense.comment,
        paidByClient: input.paidByClient ?? expense.paidByClient,
      },
      include: {
        project: true,
        createdBy: true,
      },
    });
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const expense = await this.findById(id);
    await this.validateProjectAccess(userId, expense.projectId);

    // Удаление фото из storage
    await this.deletePhotos(expense.photos);

    await this.prisma.expense.delete({ where: { id } });
    return true;
  }

  async findByProject(
    userId: string,
    projectId: string,
    filters?: { category?: string; skip?: number; take?: number }
  ): Promise<Expense[]> {
    await this.validateProjectAccess(userId, projectId);

    return this.prisma.expense.findMany({
      where: {
        projectId,
        ...(filters?.category && { category: filters.category }),
      },
      include: {
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: filters?.skip ?? 0,
      take: filters?.take ?? 50,
    });
  }

  async getCategorySummary(userId: string, projectId: string): Promise<CategorySummary[]> {
    await this.validateProjectAccess(userId, projectId);

    const expenses = await this.prisma.expense.findMany({
      where: { projectId },
      select: { category: true, amount: true },
    });

    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach((e) => {
      const existing = categoryMap.get(e.category) || { amount: 0, count: 0 };
      categoryMap.set(e.category, {
        amount: existing.amount + Number(e.amount),
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalAmount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }));
  }

  private async uploadPhotos(files: FileUpload[]): Promise<string[]> {
    return Promise.all(
      files.map(file => this.storageService.uploadExpensePhoto(file))
    );
  }

  private async deletePhotos(photoUrls: string[]): Promise<void> {
    await Promise.all(
      photoUrls.map(url => this.storageService.deleteFile(url))
    );
  }

  private async validateProjectAccess(userId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: { include: { members: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.team.members.some(m => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Access denied to this project');
    }
  }

  private async findById(id: string): Promise<Expense> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }
}
```

4. **ExpensesResolver** (`apps/api/src/modules/expenses/expenses.resolver.ts`):
```typescript
@Resolver(() => Expense)
export class ExpensesResolver {
  constructor(private readonly expensesService: ExpensesService) {}

  @Query(() => [Expense])
  @UseGuards(AuthGuard)
  async projectExpenses(
    @CurrentUser() user: User,
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('category', { type: () => String, nullable: true }) category?: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<Expense[]> {
    return this.expensesService.findByProject(user.id, projectId, { category, skip, take });
  }

  @Query(() => [CategorySummary])
  @UseGuards(AuthGuard)
  async expensesCategorySummary(
    @CurrentUser() user: User,
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<CategorySummary[]> {
    return this.expensesService.getCategorySummary(user.id, projectId);
  }

  @Mutation(() => Expense)
  @UseGuards(AuthGuard)
  async createExpense(
    @CurrentUser() user: User,
    @Args('input') input: CreateExpenseInput,
  ): Promise<Expense> {
    return this.expensesService.create(user.id, input);
  }

  @Mutation(() => Expense)
  @UseGuards(AuthGuard)
  async updateExpense(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateExpenseInput,
  ): Promise<Expense> {
    return this.expensesService.update(user.id, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteExpense(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.expensesService.delete(user.id, id);
  }
}
```

5. **Cloudflare R2 Integration** (расширение StorageService):
```typescript
// apps/api/src/core/storage/storage.service.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { FileUpload } from 'graphql-upload-minimal';
import sharp from 'sharp';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: configService.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: configService.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('R2_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = configService.get('R2_BUCKET_NAME');
    this.publicUrl = configService.get('R2_PUBLIC_URL');
  }

  async uploadExpensePhoto(file: FileUpload): Promise<string> {
    const { createReadStream, filename, mimetype } = await file;

    // Валидация
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(mimetype)) {
      throw new BadRequestException('Only PNG, JPG, JPEG, WEBP images allowed');
    }

    // Чтение и обработка изображения
    const buffer = await this.streamToBuffer(createReadStream());
    const processedBuffer = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    // Проверка размера (max 5MB)
    if (processedBuffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB after processing');
    }

    // Генерация уникального имени
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const key = `expenses/${timestamp}-${randomString}.webp`;

    // Upload в R2
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: processedBuffer,
        ContentType: 'image/webp',
      })
    );

    return `${this.publicUrl}/${key}`;
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, '');
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
```

**Frontend (Web):**

1. **Zod Schemas** (`apps/web/src/packages/schemas/expenses/expense.schema.ts`):
```typescript
import { z } from 'zod';

export const createExpenseSchema = z.object({
  projectId: z.string().cuid(),
  amount: z.number().min(0, 'Сумма должна быть положительной'),
  category: z.string().min(1, 'Выберите категорию'),
  photos: z.array(z.instanceof(File)).min(1, 'Добавьте минимум 1 фото чека').max(5, 'Максимум 5 фото'),
  comment: z.string().optional(),
  paidByClient: z.boolean().default(false),
});

export const updateExpenseSchema = z.object({
  amount: z.number().min(0).optional(),
  category: z.string().min(1).optional(),
  photos: z.array(z.instanceof(File)).max(5).optional(),
  comment: z.string().optional(),
  paidByClient: z.boolean().optional(),
});

export const expenseFilterSchema = z.object({
  category: z.string().optional(),
  skip: z.number().min(0).optional(),
  take: z.number().min(1).max(100).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseFilter = z.infer<typeof expenseFilterSchema>;

// Predefined categories
export const EXPENSE_CATEGORIES = [
  'Материалы',
  'Работа бригады',
  'Черновые материалы',
  'Чистовые материалы',
  'Инструмент',
  'Аренда техники',
  'Транспорт',
  'Прочее',
] as const;
```

2. **GraphQL Schema** (`apps/web/src/packages/api/graphql/expenses.graphql`):
```graphql
type Expense {
  id: ID!
  projectId: ID!
  project: Project!
  amount: Float!
  category: String!
  photos: [String!]!
  comment: String
  paidByClient: Boolean!
  createdBy: User!
  createdAt: DateTime!
}

type CategorySummary {
  category: String!
  totalAmount: Float!
  count: Int!
  percentage: Float!
}

input CreateExpenseInput {
  projectId: ID!
  amount: Float!
  category: String!
  photos: [Upload!]!
  comment: String
  paidByClient: Boolean
}

input UpdateExpenseInput {
  amount: Float
  category: String
  photos: [Upload!]
  comment: String
  paidByClient: Boolean
}

type Query {
  projectExpenses(
    projectId: ID!
    category: String
    skip: Int
    take: Int
  ): [Expense!]!

  expensesCategorySummary(projectId: ID!): [CategorySummary!]!
}

type Mutation {
  createExpense(input: CreateExpenseInput!): Expense!
  updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
  deleteExpense(id: ID!): Boolean!
}
```

3. **ExpenseForm Component** (`apps/web/src/packages/components/expenses/ExpenseForm.tsx`):
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from  '@apollo/client/react';
import { Camera, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/packages/components/ui';
import { createExpenseSchema, type CreateExpenseInput, EXPENSE_CATEGORIES } from '@/packages/schemas/expenses';
import { CreateExpenseDocument, ProjectExpensesDocument } from '@/packages/api/output';
import { useToast } from '@/packages/hooks';

interface ExpenseFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({ projectId, onSuccess, onCancel }: ExpenseFormProps) {
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      projectId,
      amount: 0,
      category: '',
      photos: [],
      comment: '',
      paidByClient: false,
    },
  });

  const [createExpense] = useMutation(CreateExpenseDocument, {
    refetchQueries: [{ query: ProjectExpensesDocument, variables: { projectId } }],
  });

  const photos = watch('photos');

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + photos.length > 5) {
      showToast('error', 'Максимум 5 фото');
      return;
    }

    // Валидация размера
    const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showToast('error', 'Максимальный размер файла: 5MB');
      return;
    }

    // Валидация типа
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const invalidTypes = files.filter(f => !validTypes.includes(f.type));
    if (invalidTypes.length > 0) {
      showToast('error', 'Только PNG, JPG, JPEG, WEBP');
      return;
    }

    setValue('photos', [...photos, ...files]);

    // Превью
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setValue('photos', photos.filter((_, i) => i !== index));
    setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateExpenseInput) => {
    try {
      await createExpense({ variables: { input: data } });
      showToast('success', 'Расход добавлен');
      onSuccess?.();
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Ошибка при создании расхода');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium mb-2">Сумма*</label>
        <input
          type="number"
          step="0.01"
          autoFocus
          {...register('amount', { valueAsNumber: true })}
          className="w-full px-4 py-3 text-2xl font-bold border rounded-2xl focus:ring-2 focus:ring-primary"
          placeholder="0.00"
        />
        {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Категория*</label>
        <select
          {...register('category')}
          className="w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary"
        >
          <option value="">Выберите категорию</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium mb-2">Фото чеков* (1-5 фото)</label>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {photosPreviews.map((preview, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border">
              <img src={preview} alt={`Фото ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {photos.length < 5 && (
            <label className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center transition-colors">
              <Camera className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Добавить</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={handlePhotosChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {errors.photos && <p className="text-sm text-red-500">{errors.photos.message}</p>}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2">Комментарий (необязательно)</label>
        <textarea
          {...register('comment')}
          rows={3}
          className="w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary resize-none"
          placeholder="Детали расхода..."
        />
      </div>

      {/* Paid by client */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          {...register('paidByClient')}
          className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
        />
        <label className="text-sm font-medium">Оплатил клиент напрямую</label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Отмена
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Сохранение...' : 'Добавить расход'}
        </Button>
      </div>
    </form>
  );
}
```

4. **ExpenseCard Component** (`apps/web/src/packages/components/expenses/ExpenseCard.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { useMutation } from  '@apollo/client/react';

import { Badge, Button } from '@/packages/components/ui';
import { DeleteExpenseDocument, ProjectExpensesDocument } from '@/packages/api/output';
import { useToast } from '@/packages/hooks';
import type { Expense } from '@/packages/api/output';

interface ExpenseCardProps {
  expense: Expense;
  projectId: string;
  onEdit?: (expense: Expense) => void;
}

export function ExpenseCard({ expense, projectId, onEdit }: ExpenseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { showToast } = useToast();

  const [deleteExpense] = useMutation(DeleteExpenseDocument, {
    refetchQueries: [{ query: ProjectExpensesDocument, variables: { projectId } }],
  });

  const handleDelete = async () => {
    if (!confirm('Удалить этот расход?')) return;

    setIsDeleting(true);
    try {
      await deleteExpense({ variables: { id: expense.id } });
      showToast('success', 'Расход удалён');
    } catch (error) {
      showToast('error', 'Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-6 rounded-3xl bg-card border border-border hover:border-border/60 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(expense.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Добавил: {expense.createdBy.fullName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {expense.paidByClient && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Оплатил клиент
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(expense)}
              className="p-2"
            >
              <Edit className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Amount & Category */}
        <div className="flex items-baseline gap-3 mb-4">
          <p className="text-3xl font-bold">
            {expense.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
          </p>
          <Badge>{expense.category}</Badge>
        </div>

        {/* Photos */}
        {expense.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {expense.photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="aspect-square rounded-xl overflow-hidden border border-border hover:border-primary transition-colors"
              >
                <img
                  src={photo}
                  alt={`Чек ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        )}

        {/* Comment */}
        {expense.comment && (
          <p className="text-sm text-muted-foreground">{expense.comment}</p>
        )}
      </div>

      {/* Lightbox (можно использовать yet-another-react-lightbox) */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <img
            src={expense.photos[lightboxIndex]}
            alt={`Чек ${lightboxIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}
```

5. **ExpenseList Component** (`apps/web/src/packages/components/expenses/ExpenseList.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Filter } from 'lucide-react';

import { ExpenseCard } from './ExpenseCard';
import { Badge, Spinner } from '@/packages/components/ui';
import { ProjectExpensesDocument, ExpensesCategorySummaryDocument } from '@/packages/api/output';
import { EXPENSE_CATEGORIES } from '@/packages/schemas/expenses';
import type { Expense } from '@/packages/api/output';

interface ExpenseListProps {
  projectId: string;
  onEdit?: (expense: Expense) => void;
}

export function ExpenseList({ projectId, onEdit }: ExpenseListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data, loading, error } = useQuery(ProjectExpensesDocument, {
    variables: { projectId, category: selectedCategory },
  });

  const { data: summaryData } = useQuery(ExpensesCategorySummaryDocument, {
    variables: { projectId },
  });

  const expenses = data?.projectExpenses || [];
  const categorySummary = summaryData?.expensesCategorySummary || [];
  const totalAmount = categorySummary.reduce((sum, cat) => sum + cat.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Ошибка загрузки расходов
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Фильтр по категориям</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === undefined ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(undefined)}
            className="cursor-pointer"
          >
            Все ({expenses.length})
          </Badge>

          {EXPENSE_CATEGORIES.map(cat => {
            const summary = categorySummary.find(s => s.category === cat);
            if (!summary) return null;

            return (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'secondary'}
                onClick={() => setSelectedCategory(cat)}
                className="cursor-pointer"
              >
                {cat} ({summary.count})
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Итого */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <p className="text-sm text-muted-foreground mb-1">Итого потрачено</p>
        <p className="text-3xl font-bold">
          {totalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
        </p>
      </div>

      {/* Список расходов */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {selectedCategory ? 'Нет расходов в этой категории' : 'Пока нет расходов'}
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              projectId={projectId}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Интеграция в страницу проекта:**
- Добавить вкладку "Расходы" на `/teams/[teamId]/projects/[projectId]`
- FAB кнопка "+" внизу страницы для открытия ExpenseForm в модальном окне
- ExpenseList отображается в контенте вкладки

**Критерии успеха:**
- ✅ Прораб может добавить расход за 3-5 секунд
- ✅ Фото чеков загружаются и отображаются корректно
- ✅ Фильтры по категориям работают
- ✅ Итоговая сумма рассчитывается правильно

---

#### 2. Финансовый виджет - **ФАЗА 1 (продолжение)**

**Приоритет:** 🔴🔴🔴 Максимальный
**Оценка времени:** 1 день
**Зависит от:** Expenses API

**Почему критично:**
- Ключевая фича - показывает реальную прибыль
- Делает прорабов богаче на 10-20% (core value prop)
- Дифференциатор от конкурентов

**Технические детали:**

**Backend (API):**

1. **Расширение ProjectStats GraphQL type**:
```typescript
@ObjectType()
export class ProjectStats {
  @Field(() => ID)
  projectId: string;

  @Field(() => Float)
  budget: number;

  @Field(() => Float)
  totalExpenses: number;

  @Field(() => Float)
  remainingBudget: number;

  @Field(() => Float)
  profit: number;

  @Field(() => Float)
  profitPercentage: number;

  @Field(() => [CategoryExpense])
  expensesByCategory: CategoryExpense[];

  @Field(() => [Expense])
  topExpenses: Expense[];
}

@ObjectType()
export class CategoryExpense {
  @Field(() => String)
  category: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  percentage: number;

  @Field(() => String)
  color: string; // для диаграммы
}
```

2. **Метод calculateStats в ProjectsService**:
```typescript
async calculateStats(userId: string, projectId: string): Promise<ProjectStats> {
  // 1. Валидация доступа (только OWNER!)
  await this.validateOwnerAccess(userId, projectId);

  // 2. Получение проекта
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
    include: {
      expenses: {
        orderBy: { amount: 'desc' },
      },
    },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  // 3. Расчет total expenses
  const totalExpenses = project.expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // 4. Расчет прибыли
  const budget = Number(project.budget);
  const remainingBudget = budget - totalExpenses;
  const profit = remainingBudget;
  const profitPercentage = budget > 0 ? (profit / budget) * 100 : 0;

  // 5. Group by category
  const categoryMap = new Map<string, number>();
  project.expenses.forEach((e) => {
    const existing = categoryMap.get(e.category) || 0;
    categoryMap.set(e.category, existing + Number(e.amount));
  });

  // 6. Prepare category expenses
  const categoryColors = {
    'Материалы': '#3b82f6',
    'Работа бригады': '#10b981',
    'Черновые материалы': '#f59e0b',
    'Чистовые материалы': '#8b5cf6',
    'Инструмент': '#ec4899',
    'Аренда техники': '#06b6d4',
    'Транспорт': '#84cc16',
    'Прочее': '#6b7280',
  };

  const expensesByCategory = Array.from(categoryMap.entries()).map(
    ([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: categoryColors[category] || '#6b7280',
    })
  );

  // 7. Top 5 expenses
  const topExpenses = project.expenses.slice(0, 5);

  return {
    projectId,
    budget,
    totalExpenses,
    remainingBudget,
    profit,
    profitPercentage,
    expensesByCategory,
    topExpenses,
  };
}

private async validateOwnerAccess(userId: string, projectId: string): Promise<void> {
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: { members: true },
      },
    },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  // Check if user is OWNER
  const member = project.team.members.find(m => m.userId === userId);
  if (!member || member.role !== 'OWNER') {
    throw new ForbiddenException('Only team owner can access financial data');
  }
}
```

**Frontend (Web):**

1. **Установка зависимости**:
```bash
pnpm add recharts
```

2. **FinancialDashboard Component** (`apps/web/src/packages/components/financial/FinancialDashboard.tsx`):
```typescript
'use client';

import { useQuery } from '@apollo/client';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

import { Spinner, Badge } from '@/packages/components/ui';
import { ProjectStatsDocument } from '@/packages/api/output';
import { formatCurrency } from '@/packages/utils';

interface FinancialDashboardProps {
  projectId: string;
}

export function FinancialDashboard({ projectId }: FinancialDashboardProps) {
  const { data, loading, error } = useQuery(ProjectStatsDocument, {
    variables: { projectId },
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
        Ошибка загрузки финансовых данных
      </div>
    );
  }

  const stats = data?.projectStats;
  if (!stats) return null;

  const profitColor = stats.profit >= 0 ? 'text-emerald-500' : 'text-red-500';
  const ProfitIcon = stats.profit >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-6">
      {/* Крупные цифры */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Бюджет */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">Сумма договора</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.budget)}</p>
        </div>

        {/* Потрачено */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-muted-foreground">Потрачено всего</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</p>
        </div>

        {/* Осталось */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="w-5 h-5 text-violet-500" />
            <p className="text-sm text-muted-foreground">Осталось в бюджете</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.remainingBudget)}</p>
        </div>

        {/* Прибыль */}
        <div className={`p-6 rounded-2xl bg-gradient-to-br ${
          stats.profit >= 0
            ? 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
            : 'from-red-500/10 to-pink-500/10 border-red-500/20'
        } border`}>
          <div className="flex items-center gap-2 mb-2">
            <ProfitIcon className={`w-5 h-5 ${profitColor}`} />
            <p className="text-sm text-muted-foreground">Прибыль объекта</p>
          </div>
          <p className={`text-2xl font-bold ${profitColor}`}>
            {formatCurrency(stats.profit)}
          </p>
          <Badge variant={stats.profit >= 0 ? 'success' : 'danger'} className="mt-2">
            {stats.profitPercentage.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Диаграмма + Топ расходов */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Круговая диаграмма */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-lg font-bold mb-4">Расходы по категориям</h3>

          {stats.expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.expensesByCategory}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.percentage.toFixed(1)}%`}
                >
                  {stats.expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Нет данных по расходам
            </p>
          )}
        </div>

        {/* Топ-5 расходов */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-lg font-bold mb-4">Топ-5 самых дорогих статей</h3>

          {stats.topExpenses.length > 0 ? (
            <div className="space-y-3">
              {stats.topExpenses.map((expense, i) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      {expense.comment && (
                        <p className="text-xs text-muted-foreground">{expense.comment}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Нет данных по расходам
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

3. **Интеграция в страницу проекта** (`apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx`):
```typescript
'use client';

import { useAuth } from '@/packages/libs/auth';
import { FinancialDashboard } from '@/packages/components/financial';

export default function ProjectDetailsPage({ params }: { params: { projectId: string, teamId: string } }) {
  const { user } = useAuth();

  // Fetch project data...
  const project = ...;

  // Check if user is OWNER
  const isOwner = project?.team?.ownerId === user?.id;

  return (
    <div>
      {/* Project header */}

      {/* Financial Dashboard - только для владельца! */}
      {isOwner && (
        <div className="mb-8">
          <FinancialDashboard projectId={params.projectId} />
        </div>
      )}

      {/* Tabs (Информация, Расходы, Задачи, Фотоотчёты) */}
    </div>
  );
}
```

**Видимость:**
- **Только для владельца бригады (OWNER)**
- Участники (MEMBER) НЕ видят финансовый виджет
- Backend валидация в `validateOwnerAccess()`
- Frontend условный рендеринг `{isOwner && ...}`

**Критерии успеха:**
- ✅ Финансовый виджет показывает точную прибыль
- ✅ Диаграмма расходов по категориям рисуется корректно
- ✅ Только владелец видит виджет (проверка роли)
- ✅ 0 ошибок в расчетах

---

#### 3. Публичные фотоотчеты (Killer Feature #1) - **ФАЗА 2**

**Приоритет:** 🔴🔴🔴 Максимальный
**Оценка времени:** 2-3 дня
**Блокирует:** Виральный механизм роста

**Почему критично:**
- **Вторая из "трех болей"** - "Как отчитаться клиенту?"
- **Killer feature #1** - уникальная фича, за которую платят сразу
- Виральный рост через клиентов (они делятся ссылками)
- Сокращает звонки клиентов в 3 раза (по отзывам)

**Технические детали:**

*Детальная реализация Фазы 2 (Фотоотчеты) будет добавлена в следующем разделе документа для сохранения структуры*

---

### 🟡 Tier 2: ВАЖНЫЕ для full MVP

#### 4. Управление командой и участниками - **ФАЗА 3**

**Приоритет:** 🟡 Высокий
**Оценка времени:** 1-2 дня

*Детальная реализация будет добавлена после согласования приоритетов*

---

#### 5. Автоматический расчет зарплаты (Killer Feature #2) - **ФАЗА 3 (продолжение)**

**Приоритет:** 🟡 Высокий
**Оценка времени:** 1-2 дня
**Зависит от:** Expenses API, Team Members API

**Почему важно:**
- **Третья из "трех болей"** - "Сколько кому платить?"
- **Killer feature #2** - экономит часы и избегает скандалов
- Закрывает последнюю боль прораба

*Детальная реализация будет добавлена после согласования приоритетов*

---

### 🟢 Tier 3: Nice to have (post-MVP)

#### 6. Kanban Tasks - **ФАЗА 4**
#### 7. Страница тарифов - **ФАЗА 4**
#### 8. User Profile - **ФАЗА 4**
#### 9. Invite Acceptance - **ФАЗА 4**

*Детали этих фич будут добавлены по запросу*

---

## Архитектурные требования

### Разделение прав доступа (КРИТИЧНО!)

**Необходимо реализовать на 3 уровнях:**

#### 1. Backend (GraphQL resolvers)

```typescript
// Проверка роли в context
@Resolver()
export class FinancialResolver {
  @Query(() => ProjectStats)
  @UseGuards(AuthGuard)
  async projectStats(
    @CurrentUser() user: User,
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<ProjectStats> {
    // Валидация: только OWNER может видеть финансы
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: { members: true },
        },
      },
    });

    const member = project.team.members.find(m => m.userId === user.id);
    if (!member || member.role !== 'OWNER') {
      throw new ForbiddenError('Only team owner can access financial data');
    }

    return this.projectsService.calculateStats(user.id, projectId);
  }
}
```

#### 2. Frontend (Components)

```typescript
// Условный рендеринг на основе роли
export default function ProjectDetailsPage() {
  const { user } = useAuth();
  const { data: project } = useQuery(ProjectDocument, { ... });

  const isOwner = project?.team?.ownerId === user?.id;

  return (
    <div>
      {/* Финансовый виджет - только для владельца */}
      {isOwner && (
        <FinancialDashboard projectId={projectId} />
      )}

      {/* Расходы - доступны всем участникам */}
      <ExpenseList projectId={projectId} />
    </div>
  );
}
```

#### 3. Middleware (Route Protection)

```typescript
// apps/web/src/middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защита финансовых страниц
  if (pathname.includes('/financial')) {
    const user = await getUser(request);
    const teamId = extractTeamId(pathname);

    const isOwner = await checkOwnership(user.id, teamId);
    if (!isOwner) {
      return NextResponse.redirect('/dashboard');
    }
  }

  return NextResponse.next();
}
```

### Таблица прав доступа

| Роль | Финансы | Зарплаты | Настройки команды | Расходы | Отчеты | Задачи |
|------|---------|----------|-------------------|---------|--------|--------|
| **OWNER** | ✅ Полный доступ | ✅ Полный доступ | ✅ Полный доступ | ✅ CRUD | ✅ CRUD | ✅ CRUD |
| **MEMBER** | ❌ Скрыто | ❌ Скрыто | ❌ Скрыто | ✅ Добавить/Просмотр | ✅ Создать/Просмотр | ✅ Просмотр |

**Правила:**
- **OWNER** (владелец бригады):
  - Видит ВСЕ, включая финансы, прибыль, зарплаты
  - Может редактировать настройки команды
  - Может удалять участников
  - Полный контроль над проектами

- **MEMBER** (участник бригады):
  - НЕ видит финансовый виджет
  - НЕ видит расчет зарплат
  - Может добавлять расходы (помогает прорабу)
  - Может создавать фотоотчёты
  - Может просматривать задачи

---

## Технические детали

### Текущий стек технологий

**Frontend:**
- Next.js 16+ (App Router) - SSR, RSC
- React 18+ - UI библиотека
- TypeScript 5+ - типизация
- Tailwind CSS v4 - стилизация
- Framer Motion - анимации
- Apollo Client - GraphQL клиент
- React Hook Form + Zod - формы с валидацией
- Zustand - глобальный state (Toast, UI)

**Backend:**
- Node.js 20+ - runtime
- NestJS 11 - framework
- GraphQL (Apollo Server) - API
- Prisma ORM v7 - database ORM
- PostgreSQL 16 - база данных
- Redis 8 - сессии и кеш
- Argon2 - хеширование паролей
- Sharp - обработка изображений

**Infrastructure:**
- Turborepo - монорепо
- Docker - контейнеризация
- Cloudflare R2 - file storage (планируется)

### Новые зависимости (потребуются)

**NPM пакеты для установки:**

```json
{
  "recharts": "^2.12.0",                       // Диаграммы для финансового виджета
  "@dnd-kit/core": "^6.1.0",                   // Drag & Drop для Kanban
  "@dnd-kit/sortable": "^8.0.0",               // Sortable lists
  "yet-another-react-lightbox": "^3.17.0",     // Lightbox для фото галереи
  "qrcode": "^1.5.3",                          // QR коды для invite links
  "nanoid": "^5.0.4",                          // Генерация slug для фотоотчетов
  "browser-image-compression": "^2.0.2",       // Сжатие фото на клиенте
  "@aws-sdk/client-s3": "^3.490.0",            // Cloudflare R2 SDK
  "date-fns": "^4.1.0"                         // Работа с датами (уже установлено)
}
```

**Команды установки:**

```bash
# Frontend (web)
cd apps/web
pnpm add recharts yet-another-react-lightbox nanoid browser-image-compression

# Backend (api)
cd apps/api
pnpm add @aws-sdk/client-s3 qrcode

# Для Фазы 4 (Kanban)
pnpm add @dnd-kit/core @dnd-kit/sortable
```

### Web APIs (встроенные в браузеры)

**Web Speech API** - голосовой ввод для комментариев:
```typescript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'ru-RU';
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  setValue('comment', transcript);
};
recognition.start();
```

**Clipboard API** - копирование ссылок:
```typescript
await navigator.clipboard.writeText(reportUrl);
showToast('success', 'Ссылка скопирована');
```

### Cloudflare R2 Configuration

**Переменные окружения** (добавить в `.env`):

```env
# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<your-access-key>
R2_SECRET_ACCESS_KEY=<your-secret-key>
R2_BUCKET_NAME=prorab-files
R2_PUBLIC_URL=https://files.prorab.space
```

**Настройка R2 Bucket:**
1. Создать bucket в Cloudflare Dashboard
2. Включить Public Access для папки `expenses/` и `reports/`
3. Настроить CORS:
```json
{
  "AllowedOrigins": ["https://prorab.space", "http://localhost:3000"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

---

## Риски и митигация

### Риск 1: Безопасность публичных отчетов

**Проблема:**
Страница `/r/[slug]` доступна всем без авторизации - потенциальная утечка информации

**Митигация:**
- ✅ **Уникальные slug** - используем nanoid с 21 символом = 2^126 вариантов (практически невозможно угадать)
- ✅ **Rate limiting** - ограничение на публичный endpoint (max 100 запросов/мин с 1 IP)
- ✅ **Никаких sensitive данных** - НЕ показываем:
  - Телефоны прораба/клиента
  - Адрес объекта
  - Финансовые данные
  - Персональные данные участников
- ✅ **Только необходимое** - показываем:
  - Название бригады + логотип
  - Название объекта (без адреса)
  - Фото + комментарий
  - Прогресс-бар (%)
  - Реакции

**Пример slug:** `r/3k4h7j2n9p1q5t8w6v0x`

---

### Риск 2: Ошибки в расчетах зарплаты

**Проблема:**
Некорректные формулы расчета зарплаты → скандалы с бригадой, потеря репутации

**Митигация:**
- ✅ **Unit тесты для ВСЕХ типов оплаты:**
  ```typescript
  describe('SalaryCalculation', () => {
    it('should calculate percentage salary correctly', () => {
      const profit = 100000;
      const rate = 20; // 20%
      expect(calculatePercentageSalary(profit, rate)).toBe(20000);
    });

    it('should calculate fixed salary', () => {
      expect(calculateFixedSalary(50000)).toBe(50000);
    });

    it('should calculate per square meter salary', () => {
      const area = 50; // м²
      const rate = 1000; // ₽/м²
      expect(calculatePerSqmSalary(area, rate)).toBe(50000);
    });

    it('should calculate per day salary', () => {
      const days = 30;
      const rate = 3000; // ₽/день
      expect(calculatePerDaySalary(days, rate)).toBe(90000);
    });

    it('should calculate hourly salary', () => {
      const hours = 160;
      const rate = 500; // ₽/час
      expect(calculateHourlySalary(hours, rate)).toBe(80000);
    });
  });
  ```

- ✅ **Превью расчета** - показывать breakdown ПЕРЕД закрытием объекта:
  ```
  Иван (20% от прибыли): 50 000 ₽ - 20 000 ₽ = 30 000 ₽
  ```

- ✅ **Логирование всех расчетов** в БД:
  ```prisma
  model SalaryCalculation {
    id          String   @id @default(cuid())
    projectId   String
    memberId    String
    formula     String   // "profit * 0.2"
    result      Decimal
    createdAt   DateTime @default(now())
  }
  ```

- ✅ **Audit Trail** - история изменений расчетов
- ✅ **Confirmation dialog** - двойное подтверждение перед закрытием проекта

---

### Риск 3: Перегрузка фото (Performance)

**Проблема:**
Загрузка 20 фото по 10MB каждое = 200MB трафика, медленная загрузка страниц

**Митигация:**
- ✅ **Сжатие на клиенте** с `browser-image-compression`:
  ```typescript
  import imageCompression from 'browser-image-compression';

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,          // max 1MB после сжатия
    maxWidthOrHeight: 1024, // max размер стороны
    useWebWorker: true,     // не блокирует UI
  });
  ```

- ✅ **Лимит на размер** - max 5MB на фото ПОСЛЕ сжатия
- ✅ **Лимит на количество** - max 5 фото для расходов, max 20 для отчетов
- ✅ **WebP конвертация** на сервере (Sharp):
  ```typescript
  const processedBuffer = await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  ```

- ✅ **Lazy loading** с `next/image`:
  ```typescript
  <Image
    src={photo}
    alt="Фото"
    loading="lazy"
    placeholder="blur"
    quality={85}
  />
  ```

- ✅ **CDN** - Cloudflare R2 с глобальной доставкой
- ✅ **Progressive JPEG** для больших изображений

---

### Риск 4: Безопасность загрузки файлов

**Проблема:**
Загрузка вредоносных файлов (malware, XSS через SVG)

**Митигация:**
- ✅ **Валидация MIME type** на клиенте и сервере
- ✅ **Whitelist расширений** - только `.png, .jpg, .jpeg, .webp`
- ✅ **Content-Type проверка** - не доверяем расширению файла
- ✅ **Sharp re-encoding** - конвертируем все изображения через Sharp (убивает payload)
- ✅ **Отдельный домен** для UGC - `files.prorab.space` (не основной домен)
- ✅ **Content-Security-Policy** headers:
  ```
  Content-Security-Policy: default-src 'self'; img-src 'self' https://files.prorab.space;
  ```

---

### Риск 5: Rate Limiting и DDoS

**Проблема:**
Атака на публичный endpoint `/r/[slug]` или массовая загрузка файлов

**Митигация:**
- ✅ **Rate Limiting на NestJS**:
  ```typescript
  @ThrottlerGuard({ limit: 100, ttl: 60 }) // 100 req/min
  @Query(() => PhotoReport)
  async photoReportBySlug(@Args('slug') slug: string) {
    return this.photoReportsService.findBySlug(slug);
  }
  ```

- ✅ **Cloudflare WAF** - защита от DDoS на уровне CDN
- ✅ **Upload rate limit** - max 10 файлов / 5 минут с одного IP
- ✅ **CAPTCHA** для подозрительной активности (опционально)

---

## Метрики успеха

### После Этапа 1 (Расходы + Финансовый виджет)

**Функциональные метрики:**
- ✅ Прораб добавляет расход за **< 5 секунд** (UX requirement)
- ✅ Финансовый виджет показывает **точную прибыль** (0 ошибок в расчетах)
- ✅ Фото чеков загружаются и отображаются **корректно** (WebP, 1024x1024)
- ✅ Фильтры по категориям **работают** (мгновенная фильтрация)
- ✅ Итоговая сумма рассчитывается **правильно** (проверка на реальных данных)

**Бизнес-метрики:**
- ✅ Прораб видит реальную прибыль объекта
- ✅ **10-20% дополнительной прибыли** благодаря прозрачности расходов
- ✅ 0 потерянных чеков (все с фото)

**Технические метрики:**
- ✅ Время загрузки финансового виджета: < 1 секунда
- ✅ Upload фото: < 3 секунды (с сжатием)
- ✅ 0 критических багов

---

### После Этапа 2 (Фотоотчеты)

**Функциональные метрики:**
- ✅ Создание отчета за **< 1 минуты** (upload фото + комментарий)
- ✅ Клиент открывает `/r/[slug]` **без багов** (cross-browser testing)
- ✅ Реакции работают **real-time** (мгновенное обновление)
- ✅ Ссылка копируется и открывается в **WhatsApp/Telegram** (deep links)
- ✅ SEO оптимизация: og:image, og:title, og:description (для шаринга)

**Бизнес-метрики:**
- ✅ **90%+ клиентов используют вместо звонков** (по отзывам)
- ✅ Звонки клиентов сокращаются в **3 раза**
- ✅ Виральный рост: клиенты делятся ссылками с друзьями
- ✅ **Killer feature** - прорабы платят за эту фичу сразу

**Технические метрики:**
- ✅ Время загрузки публичной страницы: < 2 секунды (SSR)
- ✅ Lightbox открывается мгновенно
- ✅ Mobile responsive (375px, 768px, 1024px)
- ✅ 0 утечек sensitive данных (security audit)

---

### После Этапа 3 (Зарплата)

**Функциональные метрики:**
- ✅ Расчет зарплаты за **< 2 секунды** (для всех участников)
- ✅ **0 ошибок в формулах** для всех типов оплаты (unit tests 100% coverage)
- ✅ WhatsApp сообщение генерируется **корректно** (форматирование)
- ✅ Объект закрывается с **фиксацией расчетов** (audit trail)

**Бизнес-метрики:**
- ✅ **Экономия часов** на ручной расчет зарплаты
- ✅ **0 скандалов** из-за ошибок в расчетах
- ✅ Все 3 "боли прораба" закрыты
- ✅ Готово к монетизации

**Технические метрики:**
- ✅ Unit tests: 100% coverage для salary calculation
- ✅ Integration tests: все типы оплаты протестированы
- ✅ Audit log: все расчеты сохраняются в БД

---

### После всех этапов (Полный MVP)

**Глобальные метрики:**
- ✅ **Все 3 "боли прораба" закрыты:**
  1. "Где мои деньги?" - Учет расходов ✅
  2. "Как отчитаться клиенту?" - Фотоотчеты ✅
  3. "Сколько кому платить?" - Автоматический расчет ✅

- ✅ **Готово к продакшн-запуску:**
  - Security audit пройден
  - Performance оптимизирован (< 2s load time)
  - Mobile responsive на всех экранах
  - Cross-browser compatibility (Chrome, Safari, Firefox)
  - Error handling + logging
  - Backup и recovery

- ✅ **Готово к масштабированию:**
  - Database indexes оптимизированы
  - Cloudflare CDN подключен
  - Redis caching настроен
  - Horizontal scaling возможен (stateless backend)
  - **Поддерживает 10k+ активных пользователей**

---

## Итоговая оценка и рекомендации

### Таблица трудозатрат

| Этап | Функционал | Сложность | Сроки | Приоритет |
|------|-----------|-----------|-------|-----------|
| **Этап 1** | Расходы + Финансовый виджет | Средняя | **2-3 дня** | 🔴 КРИТИЧНО |
| **Этап 2** | Фотоотчеты (killer feature) | Высокая | **2-3 дня** | 🔴 КРИТИЧНО |
| **Этап 3** | Команда + Зарплата | Высокая | **2-3 дня** | 🟡 ВАЖНО |
| **Этап 4** | Задачи + Тарифы + Профиль | Средняя | **2-3 дня** | 🟢 СРЕДНИЙ |

**Итого:** **8-12 дней разработки** для полного MVP

---

### Рекомендуемая последовательность

#### ✅ Этап 1: Финансовый учет (2-3 дня) - **НАЧАТЬ НЕМЕДЛЕННО**

**День 1:**
- Backend: Prisma schema для Expense + миграция
- Backend: ExpensesModule + Service (CRUD methods)
- Backend: Cloudflare R2 integration (StorageService)

**День 2:**
- Backend: ExpensesResolver (GraphQL API)
- Frontend: Zod schemas + GraphQL schema + codegen
- Frontend: ExpenseForm component (modal, 3-5 sec UX)

**День 3:**
- Frontend: ExpenseCard + ExpenseList components
- Frontend: FinancialDashboard (recharts, role-based)
- Integration: Вкладка "Расходы" на странице проекта
- Testing: E2E flow, bug fixes

**Результат:** Прораб может видеть "Где мои деньги?" - **1 боль закрыта ✅**

---

#### ✅ Этап 2: Фотоотчеты клиенту (2-3 дня)

**День 1:**
- Backend: Prisma schemas для PhotoReport + ReportReaction
- Backend: PhotoReportsModule + Service (slug generation, reactions)
- Backend: ПУБЛИЧНЫЙ endpoint (без auth!)

**День 2:**
- Frontend: PhotoReportForm (drag-to-reorder, голосовой ввод)
- Frontend: Publичная страница `/r/[slug]` (lightbox, SEO)
- Frontend: ReactionButtons (❤️ ✅ ❓)

**День 3:**
- Frontend: ReportCard + ReportsList
- Integration: Вкладка "Фотоотчёты" на странице проекта
- Integration: Deep links WhatsApp/Telegram
- Testing: E2E flow, security audit, bug fixes

**Результат:** Клиенты смотрят отчеты сами - **2 боль закрыта ✅**

---

#### ✅ Этап 3: Команда и зарплата (2-3 дня)

**День 1:**
- Backend: Расширение TeamMembersAPI (payment settings)
- Backend: SalaryCalculation logic (5 типов оплаты)
- Unit tests: 100% coverage для расчетов

**День 2:**
- Frontend: Team Settings page + Member Payment Settings
- Frontend: SalaryCalculator component (modal + WhatsApp copy)

**День 3:**
- Integration: Кнопка "Закрыть объект" на странице проекта
- Integration: CloseProject mutation
- Testing: E2E flow, formula verification

**Результат:** Автоматический расчет зарплаты - **3 боль закрыта ✅**

---

#### ✅ Этап 4: Дополнительные функции (2-3 дня) - **ОПЦИОНАЛЬНО**

1. Kanban Tasks (Drag & Drop)
2. Pricing Page + ЮKassa integration
3. User Profile
4. Invite Acceptance page

**Результат:** Полный MVP готов к продакшн-запуску 🚀

---

### 🎯 Главная рекомендация

**Начать НЕМЕДЛЕННО с Этапа 1 (Расходы + Финансовый виджет)**, потому что:

1. **Фундамент для всех остальных фич:**
   - Без расходов нет финансового дашборда
   - Без финансов нет расчета зарплаты
   - Блокирует Этап 3

2. **Закрывает первую из "трех болей прораба":**
   - "Где мои деньги?" - самый частый вопрос прораба
   - Реальная прибыль видна в моменте
   - **10-20% дополнительной прибыли** сразу

3. **Средняя сложность:**
   - Не самая сложная из трех этапов
   - Хорошо знакомый стек (Prisma, GraphQL, React)
   - Cloudflare R2 - похож на S3, есть примеры

4. **Быстрая обратная связь:**
   - Можно показать пользователям рабочий прототип через 3 дня
   - Собрать фидбек до реализации Этапов 2-3
   - Скорректировать приоритеты

---

### Следующие действия (сегодня)

**1. Подтверждение от пользователя:**
- ✅ Согласовать приоритеты (начать с Этапа 1?)
- ✅ Уточнить timeline (2-3 дня на этап реально?)
- ✅ Обсудить вопросы по архитектуре

**2. Подготовка к разработке:**
- 📚 Изучить Cloudflare R2 API (похож на AWS S3)
- 🗃️ Подготовить тестовые данные для расходов
- 🎨 Создать Figma/мокапы для ExpenseForm (опционально)

**3. Старт разработки Этапа 1:**
- 🏗️ Backend: Prisma schema для Expense
- 🔧 Backend: ExpensesModule + Service + Resolver
- 📝 Frontend: Zod schemas + GraphQL queries
- 🎨 Frontend: ExpenseForm component

---

## Приложение: Структура файлов

### Новые файлы для создания (Этап 1)

```
apps/api/src/modules/expenses/
├── expenses.module.ts
├── expenses.service.ts
├── expenses.resolver.ts
├── models/
│   ├── expense.model.ts
│   └── category-summary.model.ts
└── dto/
    ├── create-expense.input.ts
    ├── update-expense.input.ts
    └── expense-filter.input.ts

apps/api/src/core/storage/
└── storage.service.ts           # Расширить для R2

apps/web/src/packages/
├── api/graphql/
│   └── expenses.graphql         # Новый файл
├── schemas/expenses/
│   └── expense.schema.ts        # Новый файл
├── components/expenses/
│   ├── ExpenseForm.tsx          # Новый компонент
│   ├── ExpenseCard.tsx          # Новый компонент
│   └── ExpenseList.tsx          # Новый компонент
└── components/financial/
    └── FinancialDashboard.tsx   # Новый компонент

apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/
└── page.tsx                     # Обновить (добавить вкладку Расходы)
```

---

## Конец документа

**Статус:** Готов к согласованию и началу разработки
**Следующий шаг:** Подтверждение приоритетов от пользователя → Старт Этапа 1

**Контакты для вопросов:**
Claude Code - готов помочь с реализацией! 🚀
