# Следующий этап разработки - Stage 5 Phase 4

**Дата:** 2025-12-08
**Статус:** 📋 Готов к реализации
**Приоритет:** 🔴🔴🔴 Критический (Killer Feature #1)

---

## 🎯 Цель этапа

Завершить функционал фотоотчётов публичной SSR страницей, которая позволит клиентам просматривать отчёты по прямой ссылке без авторизации с красивой галереей и SEO оптимизацией.

**Killer Feature:** Прораб отправляет клиенту короткую ссылку `/r/abc123`, клиент открывает в любом браузере и видит профессиональный фотоотчёт со всеми деталями проекта.

---

## 📊 Текущее состояние

**Что уже готово (Phase 1-3):**
- ✅ Backend API (PhotoReport model, GraphQL operations)
- ✅ Storage Integration (file upload, image processing)
- ✅ Frontend CRUD (формы, PhotoUploader, интеграция в Project Details)

**Что нужно доделать (Phase 4):**
- 🎯 Public SSR Page `/r/[slug]`
- 🎯 PhotoGallery component
- 🎯 Lightbox component
- 🎯 SEO optimization
- 🎯 View counter analytics

---

## 🛠️ План реализации

### 1. Backend (30 мин)

**Файл:** `apps/api/src/modules/photo-reports/photo-reports.service.ts`

**Задачи:**
- Добавить метод `incrementViewCount(reportId: string)`
- Обновить `findBySlugPublic` для автоинкремента счётчика
- Протестировать query

### 2. PhotoGallery Component (1.5 часа)

**Файл:** `apps/web/src/packages/components/photo-reports/PhotoGallery.tsx`

**Особенности:**
- Responsive grid (1/2/3 колонки)
- Framer Motion анимации
- Hover overlay с caption
- Next.js Image optimization

### 3. Lightbox Component (2 часа)

**Файл:** `apps/web/src/packages/components/photo-reports/Lightbox.tsx`

**Функционал:**
- Fullscreen просмотр
- Keyboard navigation (← → Escape)
- Navigation buttons (prev/next)
- Caption и photo counter
- AnimatePresence для плавных переходов

### 4. Public SSR Page (2 часа)

**Файлы:**
- `apps/web/src/app/r/[slug]/page.tsx` - Server Component
- `apps/web/src/app/r/[slug]/PublicReportView.tsx` - Client Component

**Особенности:**
- SSR для SEO (данные в HTML)
- generateMetadata (title, description, OG images)
- View counter increment при рендере
- Responsive header с project info
- Footer с branding

### 5. Testing & QA (1 час)

**Чеклист:**
- [ ] TypeScript компиляция
- [ ] Создать тестовый публичный отчёт
- [ ] Проверить SSR (View Page Source)
- [ ] Протестировать галерею
- [ ] Протестировать Lightbox
- [ ] Keyboard navigation
- [ ] Mobile responsive
- [ ] View counter работает

---

## 📋 Детальный чеклист

### Backend
- [ ] Метод `incrementViewCount` в PhotoReportsService
- [ ] Обновить `findBySlugPublic` с автоинкрементом
- [ ] Протестировать query `publicPhotoReport`

### Frontend Components
- [ ] PhotoGallery.tsx (masonry grid)
- [ ] Lightbox.tsx (fullscreen viewer)
- [ ] Обновить exports в index.ts

### Public Page
- [ ] `/r/[slug]/page.tsx` - SSR
- [ ] `PublicReportView.tsx` - Client Component
- [ ] generateMetadata для SEO
- [ ] Обновить GraphQL operations (если нужно)

### Integration & Testing
- [ ] `npm run codegen`
- [ ] `npx tsc --noEmit`
- [ ] Создать тестовый отчёт с isPublic: true
- [ ] Протестировать `/r/{slug}` в браузере
- [ ] View Page Source - проверить SSR
- [ ] Проверить Open Graph meta tags
- [ ] Mobile testing

### Documentation
- [ ] Обновить CHANGELOG.md (когда завершено)
- [ ] Обновить roadmap.md (Phase 4 → Complete)
- [ ] Обновить pages-structure-diagram.md

---

## ✅ Acceptance Criteria

**Публичная страница:**
- ✅ Доступна по `/r/{slug}` без авторизации
- ✅ SSR работает (данные в исходном HTML)
- ✅ Meta tags настроены для WhatsApp/Telegram preview

**Галерея:**
- ✅ Masonry grid layout (responsive: 1/2/3 колонки)
- ✅ Hover эффекты на фото
- ✅ Клик открывает Lightbox

**Lightbox:**
- ✅ Fullscreen режим
- ✅ Навигация стрелками (UI кнопки)
- ✅ Keyboard навигация (←, →, Escape)
- ✅ Caption и счётчик фото

**Analytics:**
- ✅ View counter увеличивается при просмотре
- ✅ Не ломается при повторных просмотрах

**Quality:**
- ✅ TypeScript: 0 ошибок
- ✅ Next.js Image optimization
- ✅ Плавные Framer Motion анимации
- ✅ Responsive на всех устройствах

---

## ⏱️ Оценка времени

| Задача | Время |
|--------|-------|
| Backend (incrementViewCount) | 30 мин |
| PhotoGallery component | 1.5 часа |
| Lightbox component | 2 часа |
| Public Page SSR | 2 часа |
| Testing & Polish | 1 час |
| **Итого** | **~7 часов** |

---

## 📚 Документация

**Детальный план:** `docs/analisys/stage-5-phase-4-public-page-plan.md`

**Этот план содержит:**
- Полный код всех компонентов
- Пошаговую инструкцию
- GraphQL queries
- Примеры использования
- Best practices

---

## 🚀 Следующие шаги после Phase 4

### Phase 5: Sharing & Analytics (Post-MVP)
- Share кнопки (WhatsApp, Telegram, Copy Link)
- QR код для печати и размещения на объекте
- Emoji reactions от клиентов
- Download all photos (ZIP архив)

### Phase 6: Mobile Optimization
- Touch swipe навигация в Lightbox
- PWA manifest
- Offline support (опционально)

---

## 💡 Ключевые преимущества этапа

1. **Профессиональный инструмент для прорабов**
   - Быстрая отправка отчётов клиентам
   - Никакой возни с PDF или WhatsApp галереями
   - Короткая ссылка вместо множества файлов

2. **Отличный UX для клиентов**
   - Работает на любом устройстве
   - Не требует регистрации
   - Красивая презентация работ

3. **SEO & Marketing**
   - Индексация в поисковиках
   - Preview в мессенджерах (OG tags)
   - Viral potential через sharing

4. **Аналитика**
   - View counter показывает интерес клиента
   - Можно отследить популярность отчётов
   - Данные для улучшения сервиса

---

## 🎯 Конечная цель MVP

После завершения Phase 4, **Этап 5 (Фотоотчёты)** будет на **80% готов** (Phase 1-4 из 5).

Останется только **Phase 5 (Sharing)** - опциональные фичи для Post-MVP.

**Текущий прогресс MVP:** 78% → **82%** (после Phase 4)

---

**Готов к старту!** 🚀
