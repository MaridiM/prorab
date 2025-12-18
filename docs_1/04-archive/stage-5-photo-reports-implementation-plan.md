# План реализации: Этап 5 - Фотоотчёты (Photo Reports)

## Статус: 📋 ПЛАНИРУЕТСЯ

**Предыдущий этап:** Этап 4 (Расходы) завершён ✅
**Текущая задача:** Реализовать публичные фотоотчёты с уникальными slug для шаринга клиентам
**Цель:** Пользователи могут создавать красивые фотогалереи и делиться ими через WhatsApp/Telegram
**Приоритет:** 🔴🔴🔴 Критический (Killer Feature #1)
**Оценка времени:** 2-3 недели
**Блокирует:** Виральный механизм роста

---

## Бизнес-ценность

### 💰 Impact

**Проблема которую решаем:** "Как быстро и красиво отчитаться перед клиентом?"

**Текущая ситуация:**
- Прораб отправляет фото в WhatsApp по одной
- Клиент теряет фото в переписке
- Нет красивой подачи
- Клиент звонит постоянно спросить о прогрессе

**После внедрения:**
- 1 клик - создание отчёта
- Красивая галерея с датой и описанием
- Ссылка работает вечно
- Клиент может показать друзьям → виральность
- Звонки клиента сокращаются в 3 раза

**Монетизация:**
- Это killer feature - за которую платят сразу
- Конкурентное преимущество (только у ProRab в СНГ)
- Виральный рост через клиентов

---

## Текущее состояние

### ✅ Что уже есть:
- Database: Project model с возможностью relations
- Backend: Модули Projects, Teams, Auth
- Frontend: Project Details Page с табами
- Storage: StorageService для загрузки изображений (локально)

### ❌ Что нужно добавить:
- Database: PhotoReport и ReportPhoto models
- Backend: PhotoReportsModule с CRUD API
- Backend: Публичный endpoint без авторизации
- Storage: Cloudflare R2/S3 для постоянного хранения
- Frontend: Форма создания отчёта
- Frontend: Публичная страница /r/[slug] (SSR/SSG)
- Features: Slug generation, lightbox, reactions, WhatsApp sharing

---

## Критические решения

### 🔴 РЕШЕНИЕ #1: Slug Generation Strategy

**Варианты:**
1. **nanoid (7 chars)** - короткий, читабельный: `/r/A3bK9mN`
2. **UUID v4** - длинный, гарантия уникальности: `/r/f47ac10b-58cc-4372-a567-0e02b2c3d479`
3. **Custom (project + timestamp)** - читабельный: `/r/kvartira-perovo-2025-12-06`

**Выбор:** nanoid (7 chars)
- ✅ Короткий - удобно копировать
- ✅ URL-safe символы
- ✅ Достаточная уникальность (3.5 млрд комбинаций)
- ✅ Collision-resistant
- ❌ Нельзя угадать другие отчёты

### 🔴 РЕШЕНИЕ #2: Storage Strategy

**Варианты:**
1. **Локальное хранилище** - текущее решение
2. **Cloudflare R2** - S3-compatible, дешевле
3. **AWS S3** - стандарт индустрии

**Выбор:** Cloudflare R2
- ✅ Бесплатно 10GB storage
- ✅ S3-compatible API
- ✅ CDN из коробки (fast loading)
- ✅ Дешевле AWS (no egress fees)
- ✅ Prisma integration через @aws-sdk/client-s3

**Migration path:**
- Phase 1: Локальные файлы (MVP для теста)
- Phase 2: Migrate to R2 (production)

### 🔴 РЕШЕНИЕ #3: Public Access Security

**Проблема:** Публичная страница без auth - как защитить от абуза?

**Решение:**
- ✅ Slug генерируется криптографически (невозможно угадать)
- ✅ No listing endpoint (нельзя получить список всех отчётов)
- ✅ Rate limiting на публичном endpoint (10 req/min per IP)
- ✅ CORS настроен только для домена ProRab
- ❌ Не используем: password protection (слишком сложно для клиента)

### 🔴 РЕШЕНИЕ #4: SSR vs CSR для /r/[slug]

**Варианты:**
1. **CSR (Client-Side Rendering)** - проще
2. **SSR (Server-Side Rendering)** - лучше SEO
3. **SSG (Static Site Generation)** - fastest

**Выбор:** SSR с ISR (Incremental Static Regeneration)
- ✅ SEO оптимизация (OpenGraph для WhatsApp)
- ✅ Быстрая загрузка первого экрана
- ✅ Next.js 16 App Router с async components
- ✅ ISR revalidation каждые 60 секунд
- ✅ Fallback на CSR если ISR не готов

---

## Архитектура решения

### 1. DATABASE SCHEMA

**Новые таблицы:**

**PhotoReport:**
```prisma
model PhotoReport {
  id          String       @id @default(uuid())
  slug        String       @unique @db.VarChar(10)  // nanoid (7-10 chars)
  projectId   String       @map("project_id")
  title       String       @db.VarChar(200)
  description String?      @db.Text
  coverPhotoUrl String?    @map("cover_photo_url")
  isPublic    Boolean      @default(true) @map("is_public")
  viewCount   Int          @default(0) @map("view_count")
  createdById String       @map("created_by_id")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")
  publishedAt DateTime?    @map("published_at")

  // Relations
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  photos      ReportPhoto[]

  // Indexes
  @@index([slug])
  @@index([projectId])
  @@index([createdAt])
  @@index([isPublic])
  @@map("photo_reports")
}
```

**ReportPhoto:**
```prisma
model ReportPhoto {
  id          String      @id @default(uuid())
  reportId    String      @map("report_id")
  photoUrl    String      @map("photo_url")
  thumbnailUrl String?    @map("thumbnail_url")
  caption     String?     @db.Text
  orderIndex  Int         @default(0) @map("order_index")
  width       Int?
  height      Int?
  fileSize    Int?        @map("file_size")  // bytes
  createdAt   DateTime    @default(now()) @map("created_at")

  // Relations
  report      PhotoReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  reactions   PhotoReaction[]

  // Indexes
  @@index([reportId, orderIndex])
  @@map("report_photos")
}
```

**PhotoReaction (опционально - Phase 2):**
```prisma
model PhotoReaction {
  id        String      @id @default(uuid())
  photoId   String      @map("photo_id")
  emoji     String      @db.VarChar(10)  // ❤️ ✅ ❓ 👍
  clientId  String?     @map("client_id")  // Cookie/fingerprint
  createdAt DateTime    @default(now()) @map("created_at")

  // Relations
  photo     ReportPhoto @relation(fields: [photoId], references: [id], onDelete: Cascade)

  // Unique constraint: один emoji от одного клиента на фото
  @@unique([photoId, emoji, clientId])
  @@index([photoId])
  @@map("photo_reactions")
}
```

**Обновить Project:**
```prisma
model Project {
  // ... существующие поля
  photoReports PhotoReport[]  // Relation
}
```

**Миграция:**
```bash
npx prisma db push
npx prisma generate
```

---

### 2. BACKEND API

**Структура модуля:**
```
apps/api/src/modules/photo-reports/
├── dto/
│   ├── create-photo-report.input.ts     [CREATE]
│   ├── update-photo-report.input.ts     [CREATE]
│   └── add-photo.input.ts               [CREATE]
├── models/
│   ├── photo-report.model.ts            [CREATE]
│   ├── report-photo.model.ts            [CREATE]
│   └── public-photo-report.model.ts     [CREATE] - для публичного API
├── photo-reports.module.ts              [CREATE]
├── photo-reports.service.ts             [CREATE]
├── photo-reports.resolver.ts            [CREATE]
└── public-photo-reports.resolver.ts     [CREATE] - без @UseGuards
```

#### 2.1. DTOs

**CreatePhotoReportInput:**
```typescript
@InputType()
export class CreatePhotoReportInput {
  @Field(() => String)
  projectId: string;

  @Field(() => String)
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @Field(() => String, { nullable: true })
  @MaxLength(2000)
  description?: string;

  @Field(() => Boolean, { nullable: true })
  isPublic?: boolean;  // Default: true
}
```

**AddPhotoInput:**
```typescript
@InputType()
export class AddPhotoInput {
  @Field(() => String)
  reportId: string;

  @Field(() => GraphQLUpload)
  file: FileUpload;  // GraphQL Upload scalar

  @Field(() => String, { nullable: true })
  @MaxLength(500)
  caption?: string;

  @Field(() => Int, { nullable: true })
  orderIndex?: number;
}
```

**UpdatePhotoReportInput:**
```typescript
@InputType()
export class UpdatePhotoReportInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true })
  isPublic?: boolean;
}
```

#### 2.2. GraphQL Models

**PhotoReport (authenticated):**
```typescript
@ObjectType()
export class PhotoReport {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  projectId: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  coverPhotoUrl?: string;

  @Field(() => Boolean)
  isPublic: boolean;

  @Field(() => Int)
  viewCount: number;

  @Field(() => String)
  createdById: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => [ReportPhoto])
  photos: ReportPhoto[];

  // Computed field
  @Field(() => String)
  publicUrl: string;  // Resolver: `https://prorab.space/r/${slug}`
}
```

**ReportPhoto:**
```typescript
@ObjectType()
export class ReportPhoto {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  photoUrl: string;

  @Field(() => String, { nullable: true })
  thumbnailUrl?: string;

  @Field(() => String, { nullable: true })
  caption?: string;

  @Field(() => Int)
  orderIndex: number;

  @Field(() => Int, { nullable: true })
  width?: number;

  @Field(() => Int, { nullable: true })
  height?: number;

  @Field(() => Date)
  createdAt: Date;
}
```

**PublicPhotoReport (для публичного API):**
```typescript
@ObjectType()
export class PublicPhotoReport {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => [PublicReportPhoto])
  photos: PublicReportPhoto[];

  // Брендинг
  @Field(() => String)
  teamName: string;

  @Field(() => String, { nullable: true })
  teamLogo?: string;

  // Metadata для OpenGraph
  @Field(() => String)
  coverPhotoUrl: string;

  @Field(() => Int)
  photoCount: number;
}
```

#### 2.3. Service Layer

**PhotoReportsService:**
```typescript
class PhotoReportsService extends CoreService {
  // Private methods
  private generateUniqueSlug(): string {
    const { customAlphabet } = require('nanoid');
    const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7);
    return nanoid();
  }

  private async ensureUniqueSlug(): Promise<string> {
    let attempts = 0;
    while (attempts < 10) {
      const slug = this.generateUniqueSlug();
      const exists = await this.prisma.photoReport.findUnique({ where: { slug } });
      if (!exists) return slug;
      attempts++;
    }
    throw new Error('Failed to generate unique slug');
  }

  // Queries
  async findBySlug(slug: string): Promise<PhotoReport | null>
  async findByProject(projectId: string, userId: string): Promise<PhotoReport[]>
  async findById(id: string, userId: string): Promise<PhotoReport>

  // Public endpoint (no auth)
  async findPublicBySlug(slug: string): Promise<PublicPhotoReport | null>

  // Mutations
  async create(input: CreatePhotoReportInput, userId: string): Promise<PhotoReport>
  async update(id: string, input: UpdatePhotoReportInput, userId: string): Promise<PhotoReport>
  async delete(id: string, userId: string): Promise<PhotoReport>
  async addPhoto(input: AddPhotoInput, userId: string): Promise<ReportPhoto>
  async removePhoto(photoId: string, userId: string): Promise<ReportPhoto>
  async reorderPhotos(reportId: string, photoIds: string[], userId: string): Promise<PhotoReport>
  async publish(reportId: string, userId: string): Promise<PhotoReport>

  // Analytics
  async incrementViewCount(slug: string): Promise<void>
}
```

#### 2.4. Resolver Layer

**PhotoReportsResolver (authenticated):**
```typescript
@Resolver(() => PhotoReport)
export class PhotoReportsResolver {
  constructor(private readonly photoReportsService: PhotoReportsService) {}

  // Queries
  @Query(() => PhotoReport)
  @UseGuards(AuthGraphqlGuard)
  async photoReport(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<PhotoReport> {
    return this.photoReportsService.findById(id, user.id);
  }

  @Query(() => [PhotoReport])
  @UseGuards(AuthGraphqlGuard)
  async photoReportsByProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<PhotoReport[]> {
    return this.photoReportsService.findByProject(projectId, user.id);
  }

  // Mutations
  @Mutation(() => PhotoReport)
  @UseGuards(AuthGraphqlGuard)
  async createPhotoReport(
    @Args('input') input: CreatePhotoReportInput,
    @CurrentUser() user: UserPayload,
  ): Promise<PhotoReport> {
    return this.photoReportsService.create(input, user.id);
  }

  @Mutation(() => ReportPhoto)
  @UseGuards(AuthGraphqlGuard)
  async addPhotoToReport(
    @Args('input') input: AddPhotoInput,
    @CurrentUser() user: UserPayload,
  ): Promise<ReportPhoto> {
    return this.photoReportsService.addPhoto(input, user.id);
  }

  @Mutation(() => PhotoReport)
  @UseGuards(AuthGraphqlGuard)
  async publishPhotoReport(
    @Args('reportId', { type: () => ID }) reportId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<PhotoReport> {
    return this.photoReportsService.publish(reportId, user.id);
  }

  // ... другие mutations
}
```

**PublicPhotoReportsResolver (NO AUTH):**
```typescript
@Resolver(() => PublicPhotoReport)
export class PublicPhotoReportsResolver {
  constructor(private readonly photoReportsService: PhotoReportsService) {}

  @Query(() => PublicPhotoReport, { nullable: true })
  async publicPhotoReport(
    @Args('slug') slug: string,
  ): Promise<PublicPhotoReport | null> {
    // Increment view count
    await this.photoReportsService.incrementViewCount(slug);

    return this.photoReportsService.findPublicBySlug(slug);
  }
}
```

---

### 3. STORAGE INTEGRATION

**StorageService Enhancement:**

**Файл:** `apps/api/src/core/storage/storage.service.ts`

**Новые методы:**
```typescript
class StorageService {
  // Existing: uploadTeamLogo()

  // NEW: Upload report photo
  async uploadReportPhoto(
    file: FileUpload,
    reportId: string,
  ): Promise<{ url: string; thumbnailUrl: string; width: number; height: number }> {
    const { createReadStream, filename, mimetype } = await file;

    // Validate
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP allowed');
    }

    // Generate unique filename
    const ext = filename.split('.').pop();
    const uniqueName = `${nanoid()}.${ext}`;
    const key = `photo-reports/${reportId}/${uniqueName}`;

    // Process image with Sharp
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    // Create full-size version (max 2048px)
    const fullImage = await sharp(buffer)
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();

    // Create thumbnail (400px)
    const thumbnail = await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    // Get metadata
    const metadata = await sharp(buffer).metadata();

    // Upload to R2/S3
    const fullUrl = await this.uploadToR2(key, fullImage, 'image/webp');
    const thumbUrl = await this.uploadToR2(`${key}-thumb`, thumbnail, 'image/webp');

    return {
      url: fullUrl,
      thumbnailUrl: thumbUrl,
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  }

  // Upload to Cloudflare R2
  private async uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year
    }));

    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
}
```

**Environment variables (.env):**
```env
# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=prorab-photos
R2_PUBLIC_URL=https://photos.prorab.space
```

---

### 4. FRONTEND - VALIDATION SCHEMAS

**Файл:** `apps/web/src/packages/schemas/photo-reports/photo-report.schema.ts`

```typescript
import { z } from 'zod'

// Schema для создания отчёта
export const createPhotoReportSchema = z.object({
  projectId: z.string().min(1, 'Выберите проект'),
  title: z.string().min(3, 'Минимум 3 символа').max(200, 'Максимум 200 символов'),
  description: z.string().max(2000, 'Максимум 2000 символов').optional(),
  isPublic: z.boolean().default(true),
})

// Schema для добавления фото
export const addPhotoSchema = z.object({
  reportId: z.string().min(1),
  file: z.instanceof(File).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Только JPEG, PNG, WebP',
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'Максимум 10 МБ',
  ),
  caption: z.string().max(500).optional(),
})

export type CreatePhotoReportInput = z.infer<typeof createPhotoReportSchema>
export type AddPhotoInput = z.infer<typeof addPhotoSchema>
```

---

### 5. FRONTEND - GRAPHQL OPERATIONS

**Файл:** `apps/web/src/packages/api/graphql/photo-reports.graphql`

```graphql
fragment PhotoReportFields on PhotoReport {
  id
  slug
  projectId
  title
  description
  coverPhotoUrl
  isPublic
  viewCount
  createdAt
  publishedAt
  publicUrl
  photos {
    id
    photoUrl
    thumbnailUrl
    caption
    orderIndex
    width
    height
  }
}

fragment PublicPhotoReportFields on PublicPhotoReport {
  slug
  title
  description
  createdAt
  teamName
  teamLogo
  coverPhotoUrl
  photoCount
  photos {
    id
    photoUrl
    thumbnailUrl
    caption
    orderIndex
  }
}

# Authenticated Queries

query PhotoReport($id: ID!) {
  photoReport(id: $id) {
    ...PhotoReportFields
  }
}

query PhotoReportsByProject($projectId: ID!) {
  photoReportsByProject(projectId: $projectId) {
    ...PhotoReportFields
  }
}

# Public Query (no auth)

query PublicPhotoReport($slug: String!) {
  publicPhotoReport(slug: $slug) {
    ...PublicPhotoReportFields
  }
}

# Mutations

mutation CreatePhotoReport($input: CreatePhotoReportInput!) {
  createPhotoReport(input: $input) {
    ...PhotoReportFields
  }
}

mutation AddPhotoToReport($input: AddPhotoInput!) {
  addPhotoToReport(input: $input) {
    id
    photoUrl
    thumbnailUrl
  }
}

mutation PublishPhotoReport($reportId: ID!) {
  publishPhotoReport(reportId: $reportId) {
    ...PhotoReportFields
  }
}
```

---

### 6. FRONTEND - UI COMPONENTS

#### 6.1. PhotoReportForm Component

**Файл:** `apps/web/src/packages/components/photo-reports/photo-report-form.tsx`

**Features:**
- ✅ Создание нового отчёта
- ✅ Заголовок и описание
- ✅ Выбор проекта (если не задан)
- ✅ Public/Private toggle

#### 6.2. PhotoUploader Component

**Файл:** `apps/web/src/packages/components/photo-reports/photo-uploader.tsx`

**Features:**
- ✅ Drag & drop область
- ✅ Multiple file select
- ✅ Preview перед загрузкой
- ✅ Caption для каждого фото
- ✅ Upload progress bar
- ✅ Reorder photos (drag & drop)

#### 6.3. PhotoGallery Component

**Файл:** `apps/web/src/packages/components/photo-reports/photo-gallery.tsx`

**Features:**
- ✅ Masonry grid layout
- ✅ Lazy loading images
- ✅ Click to открыть lightbox
- ✅ Caption overlay on hover

#### 6.4. Lightbox Component

**Файл:** `apps/web/src/packages/components/photo-reports/lightbox.tsx`

**Features:**
- ✅ Full-screen overlay
- ✅ Next/Previous navigation
- ✅ Zoom in/out
- ✅ Keyboard shortcuts (arrow keys, ESC)
- ✅ Swipe gestures (mobile)
- ✅ Display caption

---

### 7. FRONTEND - PUBLIC PAGE

**Файл:** `apps/web/src/app/(public)/r/[slug]/page.tsx`

**Features:**
- ✅ SSR с ISR (revalidate: 60)
- ✅ OpenGraph meta tags
- ✅ Team branding (logo + name)
- ✅ Photo gallery
- ✅ Share buttons (WhatsApp, Telegram, Copy link)
- ✅ Watermark "Создано в ProRab.space"

**Implementation:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await getPublicReport(params.slug);

  if (!report) {
    return { title: 'Отчёт не найден' };
  }

  return {
    title: report.title,
    description: report.description || `Фотоотчёт от команды ${report.teamName}`,
    openGraph: {
      title: report.title,
      description: report.description,
      images: [report.coverPhotoUrl],
      type: 'website',
    },
  };
}

export default async function PublicPhotoReportPage({ params }: Props) {
  const report = await getPublicReport(params.slug);

  if (!report) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with team branding */}
      <header>
        <TeamLogo src={report.teamLogo} />
        <h1>{report.title}</h1>
        <p>{report.description}</p>
        <ShareButtons slug={params.slug} />
      </header>

      {/* Photo Gallery */}
      <PhotoGallery photos={report.photos} />

      {/* Footer watermark */}
      <footer>
        <a href="https://prorab.space">
          Создано в ProRab.space
        </a>
      </footer>
    </div>
  );
}
```

---

## Пошаговая реализация

### Фаза 1: Backend Foundation (неделя 1)

**День 1-2: Database & Models**
- [ ] Создать PhotoReport и ReportPhoto models в Prisma
- [ ] Добавить PhotoReaction model (Phase 2)
- [ ] Применить миграцию
- [ ] Установить nanoid: `pnpm add nanoid`

**День 3-4: PhotoReportsService**
- [ ] Создать PhotoReportsModule
- [ ] Реализовать slug generation
- [ ] Реализовать CRUD методы
- [ ] Реализовать validateProjectAccess

**День 5: Resolvers**
- [ ] Создать PhotoReportsResolver (authenticated)
- [ ] Создать PublicPhotoReportsResolver (no auth)
- [ ] Добавить в AppModule

---

### Фаза 2: Storage Integration (неделя 1-2)

**День 6-7: Cloudflare R2 Setup**
- [ ] Создать R2 bucket в Cloudflare
- [ ] Настроить CORS
- [ ] Настроить public access
- [ ] Добавить env variables
- [ ] Установить @aws-sdk/client-s3

**День 8: StorageService Enhancement**
- [ ] Добавить uploadReportPhoto метод
- [ ] Sharp processing (resize, thumbnail, WebP)
- [ ] Upload to R2
- [ ] Return URLs

**День 9: Testing**
- [ ] Test upload через GraphQL playground
- [ ] Verify public URLs работают
- [ ] Test image quality

---

### Фаза 3: Frontend Components (неделя 2)

**День 10-11: Schemas & GraphQL**
- [ ] Создать photo-report.schema.ts
- [ ] Создать photo-reports.graphql
- [ ] Запустить codegen

**День 12-13: UI Components**
- [ ] PhotoReportForm
- [ ] PhotoUploader (drag & drop)
- [ ] PhotoGallery (masonry grid)
- [ ] Lightbox

**День 14: Integration в Project Page**
- [ ] Добавить вкладку "Фотоотчёты"
- [ ] Список отчётов проекта
- [ ] Кнопка "Создать отчёт"
- [ ] Modal с формой

---

### Фаза 4: Public Page (неделя 2-3)

**День 15-16: SSR Page**
- [ ] Создать /r/[slug]/page.tsx
- [ ] SSR data fetching
- [ ] OpenGraph meta tags
- [ ] Team branding

**День 17: Gallery & Lightbox**
- [ ] Responsive grid
- [ ] Lightbox integration
- [ ] Keyboard navigation
- [ ] Mobile gestures

**День 18: Sharing Features**
- [ ] WhatsApp share button
- [ ] Telegram share button
- [ ] Copy link button
- [ ] QR code generation (optional)

---

### Фаза 5: Polish & Testing (неделя 3)

**День 19: Performance**
- [ ] Image lazy loading
- [ ] ISR configuration
- [ ] CDN caching
- [ ] Lighthouse optimization

**День 20: UX Polish**
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Toast notifications

**День 21: Testing & Documentation**
- [ ] E2E tests
- [ ] Update documentation
- [ ] Update roadmap
- [ ] Create changelog entries

---

## Success Criteria

### Must Have (MVP)
- [ ] Пользователь может создать отчёт за 2 минуты
- [ ] Загрузка до 20 фото за раз
- [ ] Публичная страница открывается без логина
- [ ] Красивая галерея с lightbox
- [ ] WhatsApp sharing работает (preview с OpenGraph)
- [ ] Mobile responsive
- [ ] Slug уникальный и короткий (7 chars)

### Nice to Have (Phase 2)
- [ ] Reactions на фото (❤️ ✅ ❓)
- [ ] QR code для печати
- [ ] Watermark на фото
- [ ] Download all photos as ZIP
- [ ] Password protection (опционально)
- [ ] Analytics (view tracking)

---

## Технический долг

**Отложено на Phase 2:**
- [ ] Reactions на фото
- [ ] Real-time updates (WebSocket)
- [ ] Batch photo upload optimization
- [ ] Video support
- [ ] PDF export

---

## Риски и Mitigation

### Риск #1: Cloudflare R2 Costs
**Вероятность:** Средняя
**Impact:** Высокий
**Mitigation:**
- Start с Free tier (10GB)
- Monitor usage через dashboard
- Set billing alerts
- Plan B: AWS S3 (более дорого, но backup)

### Риск #2: OpenGraph не работает в WhatsApp
**Вероятность:** Низкая
**Impact:** Критический (killer feature зависит от этого)
**Mitigation:**
- Test на staging до production
- Use WhatsApp preview debugger
- Ensure meta tags правильные
- Fallback на текстовую ссылку

### Риск #3: Abuse публичных ссылок
**Вероятность:** Средняя
**Impact:** Средний
**Mitigation:**
- Rate limiting на публичном endpoint
- No listing всех отчётов
- Cryptographic slug (невозможно угадать)
- Monitor view count

---

## Dependencies

**Backend:**
- ✅ Prisma 7
- ✅ NestJS 11
- ✅ GraphQL Upload
- 🆕 nanoid (slug generation)
- 🆕 @aws-sdk/client-s3 (R2 integration)
- ✅ Sharp (image processing)

**Frontend:**
- ✅ Next.js 16 (App Router + SSR)
- ✅ Apollo Client
- 🆕 react-image-gallery или photoswipe (lightbox)
- 🆕 react-dropzone (drag & drop upload)
- 🆕 qrcode (QR generation - optional)

---

## Документация

**Будет создано:**
- [ ] `docs/analisys/stage-5-photo-reports-implementation-plan.md` (этот файл)
- [ ] `docs/changelog.backend.md` - Backend changes
- [ ] `docs/changelog.frontend.md` - Frontend changes
- [ ] `docs/api/photo-reports-api.md` - API documentation

**Будет обновлено:**
- [ ] `docs/roadmap.md` - Этап 5 progress
- [ ] `docs/PROJECT_DASHBOARD.md` - Overall progress

---

**Plan Created:** 2025-12-06
**Planned Start:** TBD
**Estimated Duration:** 2-3 недели
**Priority:** 🔴🔴🔴 Critical (Killer Feature)
**Status:** 📋 Planning

---

_Детальный план готов к выполнению. Ожидает подтверждения для начала реализации._
