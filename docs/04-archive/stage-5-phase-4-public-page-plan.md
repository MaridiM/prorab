# Stage 5 Phase 4: Public Photo Reports Page - Implementation Plan

**Дата создания:** 2025-12-08
**Статус:** 📋 Готов к реализации
**Приоритет:** 🔴🔴🔴 Критический (Killer Feature)
**Оценка времени:** 6-8 часов

---

## Контекст

**Что уже сделано:**
- ✅ Phase 1: Backend Foundation (PhotoReport model, GraphQL API)
- ✅ Phase 2: Storage Integration (File upload, image processing)
- ✅ Phase 3: Frontend Components (CRUD forms, Photo uploader)

**Что нужно сделать:**
- 🎯 Phase 4: Public SSR Page для просмотра фотоотчётов по slug
- 📱 Адаптивная галерея с Lightbox
- 🔗 SEO оптимизация и Open Graph meta tags
- 👁️ View counter для аналитики

---

## Цели Phase 4

1. **Публичная страница фотоотчёта** (`/r/[slug]`)
   - SSR для SEO
   - Работает без авторизации
   - Красивая галерея фотографий

2. **Lightbox для просмотра**
   - Fullscreen режим
   - Навигация между фото (стрелки, swipe)
   - Zoom функционал
   - Подписи к фото

3. **SEO & Analytics**
   - Open Graph meta tags (title, description, image)
   - View counter (увеличивается при каждом просмотре)
   - Responsive на всех устройствах

---

## Архитектура

### 1. Маршруты

```
/r/[slug]/page.tsx          - Public SSR page для отчёта
```

**Routing Strategy:**
- Используем Next.js App Router с динамическим `[slug]`
- SSR через GraphQL fetch в Server Component
- No auth required - публичная страница

### 2. GraphQL API

**Уже есть (Phase 1):**
```graphql
type Query {
  publicPhotoReport(slug: String!): PublicPhotoReport
}

type PublicPhotoReport {
  id: ID!
  slug: String!
  title: String!
  description: String
  createdAt: DateTime!
  viewCount: Int!
  project: PublicProject!
  photos: [ReportPhoto!]!
}

type PublicProject {
  name: String!
  address: String
}
```

**Что добавим в backend:**
```typescript
// В PhotoReportsService
async incrementViewCount(reportId: string): Promise<void> {
  await this.db.photoReport.update({
    where: { id: reportId },
    data: { viewCount: { increment: 1 } }
  })
}
```

### 3. Frontend Components

**Новые компоненты:**

```
components/photo-reports/
├── PhotoGallery.tsx          - Masonry grid галерея
├── Lightbox.tsx              - Fullscreen просмотр
└── PublicReportHeader.tsx    - Header для публичной страницы
```

**Component Structure:**

```typescript
// PhotoGallery.tsx
interface PhotoGalleryProps {
  photos: ReportPhoto[]
  onPhotoClick: (index: number) => void
}

// Lightbox.tsx
interface LightboxProps {
  photos: ReportPhoto[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}
```

---

## Детальный план реализации

### Шаг 1: Backend - View Counter (30 мин)

**1.1. Обновить PhotoReportsService**

Файл: `apps/api/src/modules/photo-reports/photo-reports.service.ts`

```typescript
async incrementViewCount(reportId: string): Promise<void> {
  await this.db.photoReport.update({
    where: { id: reportId },
    data: { viewCount: { increment: 1 } }
  })
}

// Обновить метод findBySlugPublic
async findBySlugPublic(slug: string): Promise<PhotoReport> {
  const report = await this.db.photoReport.findUnique({
    where: { slug, isPublic: true },
    include: {
      photos: { orderBy: { orderIndex: 'asc' } },
      project: { select: { name: true, address: true } }
    }
  })

  if (!report) {
    throw new NotFoundException('Фотоотчёт не найден или не опубликован')
  }

  // Increment view count asynchronously (don't await)
  this.incrementViewCount(report.id).catch(err => {
    this.logger.error(`Failed to increment view count: ${err.message}`)
  })

  return report
}
```

**1.2. Тестирование**
```bash
# Запустить API и проверить query
npm run start:dev:api
```

---

### Шаг 2: Frontend - PhotoGallery Component (1.5 часа)

**2.1. Создать PhotoGallery.tsx**

Файл: `apps/web/src/packages/components/photo-reports/PhotoGallery.tsx`

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ReportPhoto } from '@/packages/api/graphql/generated'

interface PhotoGalleryProps {
  photos: ReportPhoto[]
  onPhotoClick: (index: number) => void
}

export function PhotoGallery({ photos, onPhotoClick }: PhotoGalleryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary cursor-pointer"
          onClick={() => onPhotoClick(index)}
        >
          <Image
            src={photo.thumbnailUrl || photo.photoUrl}
            alt={photo.caption || `Фото ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay на hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white text-center p-4">
                {photo.caption && (
                  <p className="text-sm font-medium">{photo.caption}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
```

**2.2. Обновить exports**

Файл: `apps/web/src/packages/components/photo-reports/index.ts`

```typescript
export { PhotoReportForm } from './photo-report-form'
export { PhotoUploader } from './photo-uploader'
export { PhotoReportCard } from './photo-report-card'
export { PhotoGallery } from './PhotoGallery'
```

---

### Шаг 3: Frontend - Lightbox Component (2 часа)

**3.1. Создать Lightbox.tsx**

Файл: `apps/web/src/packages/components/photo-reports/Lightbox.tsx`

```typescript
'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReportPhoto } from '@/packages/api/graphql/generated'

interface LightboxProps {
  photos: ReportPhoto[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev
}: LightboxProps) {
  const currentPhoto = photos[currentIndex]

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNext, onPrev])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!currentPhoto) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPrev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
            >
              <Image
                src={currentPhoto.photoUrl}
                alt={currentPhoto.caption || `Фото ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
          </div>

          {/* Caption & Counter */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
            <div className="max-w-7xl mx-auto">
              <p className="text-white text-center text-sm mb-2">
                {currentIndex + 1} / {photos.length}
              </p>
              {currentPhoto.caption && (
                <p className="text-white text-center text-lg font-medium">
                  {currentPhoto.caption}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**3.2. Обновить exports**

---

### Шаг 4: Public Page - SSR Implementation (2 часа)

**4.1. Создать публичную страницу**

Файл: `apps/web/src/app/r/[slug]/page.tsx`

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicPhotoReportDocument } from '@/packages/api/graphql/generated'
import { getClient } from '@/packages/libs/apollo/apollo-client'
import { PublicReportView } from './PublicReportView'

interface PageProps {
  params: { slug: string }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const client = getClient()

  try {
    const { data } = await client.query({
      query: PublicPhotoReportDocument,
      variables: { slug: params.slug }
    })

    const report = data.publicPhotoReport
    const firstPhoto = report.photos[0]

    return {
      title: `${report.title} - ${report.project.name}`,
      description: report.description || `Фотоотчёт по проекту ${report.project.name}`,
      openGraph: {
        title: report.title,
        description: report.description || undefined,
        images: firstPhoto ? [firstPhoto.photoUrl] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: report.title,
        description: report.description || undefined,
        images: firstPhoto ? [firstPhoto.photoUrl] : [],
      }
    }
  } catch {
    return {
      title: 'Фотоотчёт не найден',
    }
  }
}

export default async function PublicPhotoReportPage({ params }: PageProps) {
  const client = getClient()

  try {
    const { data } = await client.query({
      query: PublicPhotoReportDocument,
      variables: { slug: params.slug },
      fetchPolicy: 'no-cache', // Always fetch fresh data for view count
    })

    return <PublicReportView report={data.publicPhotoReport} />
  } catch (error) {
    notFound()
  }
}
```

**4.2. Создать Client Component для интерактивности**

Файл: `apps/web/src/app/r/[slug]/PublicReportView.tsx`

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { PhotoGallery } from '@/packages/components/photo-reports/PhotoGallery'
import { Lightbox } from '@/packages/components/photo-reports/Lightbox'
import type { PublicPhotoReport } from '@/packages/api/graphql/generated'

interface PublicReportViewProps {
  report: PublicPhotoReport
}

export function PublicReportView({ report }: PublicReportViewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handleNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % report.photos.length)
  }

  const handlePrev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + report.photos.length) % report.photos.length)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/30 bg-card/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{report.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{report.project.name}</span>
              </div>

              {report.project.address && (
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>{report.project.address}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(report.createdAt), 'd MMMM yyyy', { locale: ru })}</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{report.viewCount} просмотров</span>
              </div>
            </div>

            {report.description && (
              <p className="text-lg text-muted-foreground">{report.description}</p>
            )}
          </div>
        </div>
      </motion.header>

      {/* Gallery */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <PhotoGallery
            photos={report.photos}
            onPhotoClick={setLightboxIndex}
          />
        </div>
      </main>

      {/* Lightbox */}
      <Lightbox
        photos={report.photos}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Создано с помощью ProRab.space</p>
        </div>
      </footer>
    </div>
  )
}
```

---

### Шаг 5: Integration & Testing (1 час)

**5.1. Обновить GraphQL operations**

Файл: `apps/web/src/packages/api/graphql/photo-reports.graphql`

Проверить что есть query:
```graphql
query PublicPhotoReport($slug: String!) {
  publicPhotoReport(slug: $slug) {
    id
    slug
    title
    description
    createdAt
    viewCount
    project {
      name
      address
    }
    photos {
      id
      photoUrl
      thumbnailUrl
      caption
      orderIndex
    }
  }
}
```

**5.2. Запустить codegen**
```bash
cd apps/web
npm run codegen
```

**5.3. TypeScript проверка**
```bash
npx tsc --noEmit
```

**5.4. Тестирование**
- Создать тестовый фотоотчёт с isPublic: true
- Открыть `/r/{slug}` в браузере
- Проверить:
  - ✅ SSR работает (View Page Source - данные в HTML)
  - ✅ Галерея отображается
  - ✅ Lightbox открывается при клике
  - ✅ Навигация стрелками работает
  - ✅ View counter увеличивается
  - ✅ SEO meta tags присутствуют

---

## Чеклист реализации

### Backend
- [ ] Добавить метод incrementViewCount в PhotoReportsService
- [ ] Обновить findBySlugPublic для автоинкремента viewCount
- [ ] Протестировать query publicPhotoReport

### Frontend Components
- [ ] Создать PhotoGallery component (masonry grid)
- [ ] Создать Lightbox component (fullscreen view)
- [ ] Обновить exports в components/photo-reports/index.ts

### Public Page
- [ ] Создать /r/[slug]/page.tsx (SSR)
- [ ] Создать PublicReportView.tsx (Client Component)
- [ ] Добавить generateMetadata для SEO
- [ ] Обновить photo-reports.graphql (если нужно)

### Integration & Testing
- [ ] Запустить codegen
- [ ] TypeScript компиляция без ошибок
- [ ] Создать тестовый публичный отчёт
- [ ] Протестировать SSR (View Page Source)
- [ ] Протестировать галерею и lightbox
- [ ] Протестировать keyboard navigation (Escape, стрелки)
- [ ] Проверить responsive на mobile
- [ ] Проверить view counter

### Documentation
- [ ] Обновить CHANGELOG.md
- [ ] Обновить roadmap.md (Phase 4 → Complete)
- [ ] Обновить docs/app/pages-structure-diagram.md

---

## Acceptance Criteria

✅ **Публичная страница работает:**
- Отчёт доступен по `/r/{slug}` без авторизации
- SSR работает (данные в HTML при View Page Source)
- Meta tags для SEO/OG настроены

✅ **Галерея фотографий:**
- Masonry grid layout (3 колонки на desktop)
- Hover эффекты
- Клик открывает Lightbox

✅ **Lightbox функционал:**
- Fullscreen просмотр
- Навигация стрелками (UI + keyboard)
- Close на Escape или кнопку X
- Отображение caption и счётчика

✅ **Analytics:**
- View counter увеличивается при каждом просмотре
- Не ломается при множественных просмотрах

✅ **Responsive:**
- Работает на mobile (touch swipe для lightbox - опционально)
- Адаптивная галерея (1/2/3 колонки)

✅ **Quality:**
- TypeScript: 0 ошибок
- Все изображения оптимизированы (Next.js Image)
- Плавные анимации (Framer Motion)

---

## Оценка времени

- **Backend (incrementViewCount):** 30 мин
- **PhotoGallery component:** 1.5 часа
- **Lightbox component:** 2 часа
- **Public Page SSR:** 2 часа
- **Testing & Polish:** 1 час

**Итого:** ~7 часов

---

## Следующие шаги после Phase 4

**Phase 5: Analytics & Sharing (опционально, Post-MVP)**
- [ ] Share кнопки (WhatsApp, Telegram, копировать ссылку)
- [ ] QR код для печати
- [ ] Reactions (emoji реакции от клиентов)
- [ ] Download all photos (ZIP архив)

**Phase 6: Mobile Optimization**
- [ ] Touch swipe навигация в Lightbox
- [ ] PWA manifest для добавления на home screen
- [ ] Offline support (опционально)
