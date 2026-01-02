# Frontend Changelog

Все изменения в frontend (Web) приложения документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и этот проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.18] - 2026-01-02 - Subscription History UI Improvements & Landing Page Updates

### Changed
- **Subscription History UI**: Улучшен интерфейс истории подписок
  - Убран бейдж "Завершена" справа для завершенных подписок
  - Убрано сообщение "Подписка завершена" снизу карточки
  - Для завершенных подписок на месте кнопки "Продлить план" отображается красный текст "Подписка завершена" с иконкой
  - Улучшена визуальная иерархия: название плана крупнее, цена выделена, дата приглушена
  - Кнопка "Продлить план" стала более заметной (primary цвет, тени, hover эффекты)

### Added
- **Landing Page Trial Period Info**: Добавлена информация о 14-дневном пробном периоде на лендинг
  - Добавлен бейдж с информацией о пробном периоде в секции тарифов
  - Под каждой ценой плана добавлена строка "14 дней бесплатно" с иконкой
  - Информация отображается для всех планов (с Early Bird и без)

### Fixed
- **Landing Page Button Alignment**: Исправлено выравнивание кнопок в карточках тарифов
  - Кнопки теперь выровнены по нижнему краю независимо от количества функций
  - Добавлен `flex flex-col h-full` для карточек и `flex-grow` для списка функций
  - Кнопки прижаты к низу с помощью `mt-auto`

### Fixed
- **Landing Page Text Corrections**: Исправлен текст спецпредложения
  - Изменено "990 ₽/мес вечно" на "1 490 ₽/мес по Early Bird цене"
  - Обновлен текст кнопок: "Перейти к дашборду" → "Открыть дашборд"
  - Для неавторизованных: "Забрать навсегда" → "Начать бесплатно", "Выбрать" → "Выбрать план"

### Fixed
- **Public Landing Page Access**: Исправлен редирект неавторизованных пользователей
  - Главная страница теперь полностью публичная и не редиректит на страницу авторизации
  - Добавлена проверка `pathname !== '/'` в логике редиректа при ошибках аутентификации
  - На главной странице без токена не выполняется загрузка пользователя

### Technical Details
- Модифицированные файлы:
  - `apps/web/src/packages/components/settings/subscription-history.tsx`
    - Улучшена визуальная иерархия текста (размеры, веса, цвета)
    - Заменен бейдж "Завершена" на красный текст "Подписка завершена" на месте кнопки
    - Убрано сообщение снизу карточки
  - `apps/web/src/app/page.tsx`
    - Добавлена информация о 14-дневном пробном периоде
    - Исправлено выравнивание кнопок в карточках тарифов
    - Исправлен текст спецпредложения и кнопок
  - `apps/web/src/packages/libs/auth/auth.context.tsx`
    - Добавлена проверка `pathname !== '/'` для предотвращения редиректа с главной страницы
    - Обновлена логика загрузки пользователя на главной странице

---

## [1.6.17] - 2026-01-02 - Subscription History & Renew Plan Fix

### Fixed
- **Subscription History Display**: Исправлена история подписок для корректного отображения всех покупок планов
  - История теперь основана на успешных платежах, а не на текущей подписке
  - Каждая покупка плана отображается как отдельная запись в истории
  - Исправлено определение плана из metadata платежа (для старых платежей используется fallback по сумме)
  - Только самый последний платеж помечается как "Текущая"
  - Правильное определение плана по сумме платежа (290 RUB = Лайт, 690 RUB = Прораб, 1490 RUB = Бригада)

### Changed
- **Renew Plan Button**: Изменена кнопка "Изменить план" на "Продлить план" в истории подписок
  - Кнопка теперь выполняет тот же функционал, что и "Продлить план" в карточке плана
  - Использует `initializePayment` с текущим `subscriptionId` и `planId` для продления
  - Добавлен индикатор загрузки при обработке запроса
  - Иконка изменена с `ArrowRight` на `RefreshCw` для соответствия UI

### Fixed
- **React Hooks Order**: Исправлена ошибка порядка вызова хуков React
  - Все хуки (`useState`, `useQuery`, `useMutation`, `useCallback`) теперь вызываются до условных возвратов
  - Устранена ошибка "Rendered more hooks than during the previous render"

### Technical Details
- Модифицированные файлы:
  - `apps/web/src/packages/components/settings/subscription-history.tsx`
    - Добавлен `useMutation` для `InitializePaymentDocument`
    - Создана функция `handleRenewPlan` для продления текущего плана
    - Исправлен порядок хуков (все хуки до условных возвратов)
    - Изменен текст кнопки и функционал
  - `apps/web/src/packages/api/graphql/subscriptions.graphql`
    - Добавлен query `MySubscriptionHistoryFromPayments` для получения истории из платежей

### Impact
- **Полная история**: Пользователи видят все свои покупки планов, а не только текущую подписку
- **Правильные планы**: Планы определяются корректно даже для старых платежей без metadata
- **Удобное продление**: Пользователи могут продлить план прямо из истории подписок
- **Стабильность**: Устранены ошибки React, связанные с порядком хуков

---

## [1.6.15] - 2026-01-02 - User-Specific Early Bird Display

### Changed
- **Early Bird Availability Check**: Изменена логика отображения Early Bird цены с глобальной на персональную
  - Теперь использует GraphQL query `isEarlyBirdAvailableForMe` вместо глобального `earlyBirdStats.isAvailable`
  - Early Bird цена и бейдж показываются только если пользователь имеет право на скидку
  - Проверяет оба условия: не использовал ли пользователь Early Bird ранее + есть ли свободные слоты

### Fixed
- **Early Bird Price Mismatch**: Исправлена проблема несоответствия цен
  - До: Пользователь видел Early Bird цену в планах, но получал полную цену при оплате
  - После: Пользователь видит только ту цену, которую реально может получить
  - Если пользователь уже использовал Early Bird, отображается полная цена без бейджа

### Technical Details
- Модифицированные файлы:
  - `apps/web/src/packages/api/graphql/subscriptions.graphql` (строки 179-181)
    - Добавлен query `IsEarlyBirdAvailableForMe` для персональной проверки
  - `apps/web/src/packages/components/settings/SubscriptionManagement.tsx`
    - Импортирован `IsEarlyBirdAvailableForMeDocument` (строка 47)
    - Добавлен `useQuery(IsEarlyBirdAvailableForMeDocument)` (строки 78-80)
    - Изменен `isEarlyBirdAvailable` с `earlyBirdStats.isAvailable` на `isEarlyBirdAvailableForMe` (строки 213-215)

### Impact
- **Улучшенная честность**: Пользователи видят только реально доступные цены
- **Нет путаницы**: Исчезла ситуация когда цена в UI не совпадает с ценой при оплате
- **Правильные ожидания**: Если Early Bird недоступен, пользователь сразу видит полную цену

---

## [1.6.13] - 2025-12-31 - Payment Success Page Critical Fix

### Fixed
- **Success Page Instant Redirect**: Исправлена проблема мгновенного исчезновения страницы успешной оплаты
  - Удалена слишком строгая проверка на параметр `fromCheckout`
  - Страница теперь корректно отображается в течение 5 секунд с таймером обратного отсчета
  - Пользователи видят подтверждение оплаты перед автоматическим редиректом
  - Кнопка ручного перехода "Перейти в дашборд" работает как раньше

### Changed
- **Payment Success Page Validation**:
  - Убрана проверка `fromCheckout === 'true'` (строка 41)
  - Теперь требуется только `success === 'true'` и наличие `paymentId`
  - Упрощенная логика валидации предотвращает случайные редиректы
  - Countdown timer 5 секунд работает корректно

### Technical
- **Modified Files**:
  - `apps/web/src/app/(root)/payment/success/page.tsx` (строки 24-43)
    - Удален параметр `fromCheckout` из useEffect
    - Упрощена условная логика редиректа
    - Сохранены все защиты от случайного попадания на страницу

### UX Improvements
- **Better Payment Confirmation**: Пользователи видят success экран на полные 5 секунд
- **Clear Feedback**: Таймер обратного отсчета показывает время до автоматического редиректа
- **Manual Control**: Пользователь может перейти в дашборд немедленно, не дожидаясь таймера

---

## [1.6.12] - 2025-12-31 - Early Bird UI Indicators & Landing Page Integration

### Added
- **Early Bird Stats Banner**: Добавлен красивый баннер со статистикой Early Bird программы
  - Отображается в верхней части SubscriptionManagement компонента
  - Показывает оставшиеся слоты из 500 (например, "Осталось 373 из 500 мест")
  - Status badge: "Активно" (зеленый) или "Завершено" (серый)
  - Gradient дизайн: amber-50 → orange-50 с amber-200 border
  - Иконка Sparkles в градиентном круге (amber-400 → orange-500)
  - Framer Motion анимации для плавного появления

- **Social Proof Counter**: Добавлен счетчик активных команд
  - Показывает "Уже N команд присоединились"
  - Иконка Users из lucide-react
  - Отображается рядом со счетчиком Early Bird слотов
  - Автоматически скрывается, если команд нет

- **GraphQL Integration**: Добавлен новый query для статистики
  - `EarlyBirdStatsDocument` query в subscriptions.graphql
  - Автоматическая генерация TypeScript types
  - Использование `useQuery` hook с кешированием

### Changed
- **SubscriptionManagement Component**:
  - Добавлен `useQuery(EarlyBirdStatsDocument)` для получения статистики
  - Баннер отображается перед CardContent, если данные доступны
  - Responsive layout: flex-wrap для мобильных устройств
  - Условное отображение social proof счетчика

### Technical
- **Modified Files**:
  - `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` (+65 LOC)
    - Импорт: EarlyBirdStatsDocument, Sparkles, Users icons
    - Query hook для статистики
    - JSX баннер с motion.div анимацией
  - `apps/web/src/packages/api/graphql/subscriptions.graphql` (+10 LOC)
    - Новый query: EarlyBirdStats с фрагментом полей

- **Statistics**: Frontend +65 LOC

### UX Improvements
- **Urgency Marketing**: Визуальный счетчик создает FOMO эффект
- **Social Proof**: Показ активных команд повышает доверие к продукту
- **Visual Polish**: Gradient дизайн и иконки делают UI более привлекательным
- **Real-time Data**: Данные загружаются с backend в реальном времени

---

## [1.6.11] - 2025-12-31 - Early Bird & Trial Period Implementation

### Fixed
- **Early Bird Flag Transmission**: Подтверждено, что `useEarlyBird` флаг корректно передается с frontend
  - `SubscriptionManagement.tsx` (строка 249) уже содержит правильную логику
  - `useEarlyBird: selectedPlan?.isEarlyBird || false` передается в createSubscription mutation
  - Баг был исправлен в предыдущей версии (v1.6.10)

### Impact
- **Early Bird Pricing**: Frontend теперь работает корректно с backend валидацией
  - Пользователи, выбирающие Early Bird планы, получат скидку при оплате
  - UI корректно отображает Early Bird badges и зачеркнутые цены
  - Интеграция frontend-backend для Early Bird полностью функциональна

### Technical Notes
- Изменений в frontend коде в этой версии НЕ требовалось
- Все необходимые исправления уже были в v1.6.10
- Версия обновлена для синхронизации с backend (v1.6.11)

---

## [1.6.10] - 2025-12-31 - Early Bird Pricing Structure Analysis

### Documentation
- **Early Bird Pricing Analysis**: Проведен анализ отображения Early Bird pricing в UI
  - Документировано отображение бейджа "Early Bird" в карточках планов
  - Описана логика выбора цены (Early Bird или обычная) в компоненте SubscriptionManagement
  - Выявлены места отображения Early Bird цен и экономии для пользователей

## [1.6.9] - 2025-12-31 - Plan Name Display in Checkout Fix

### Fixed
- **Plan Name in Checkout**: Исправлена проблема, когда в checkout не отображалось название выбранного плана
  - В mock режиме URL для checkout формировался без информации о плане
  - Теперь название плана извлекается из description и передается в URL параметрах
  - Checkout страница теперь отображает название выбранного плана
  - При выборе плана "light" вместо "прораб" в checkout отображается правильное название

### Changed
- **PaymentCheckoutPage**:
  - Добавлен параметр `plan` из URL параметров
  - Добавлено отображение названия плана в деталях платежа
  - Название плана отображается перед суммой платежа

### Technical
- **Modified Files**:
  - `apps/web/src/app/(root)/payment/checkout/page.tsx`
    - Добавлен параметр `plan` из searchParams
    - Добавлено отображение названия плана в секции "Детали платежа"

## [1.6.8] - 2025-12-31 - Correct Plan Data in Checkout Fix

### Fixed
- **Checkout Plan Data**: Исправлена проблема, когда в checkout отображались данные текущего плана вместо выбранного
  - При выборе плана ниже текущего (например, "light" вместо "прораб") в checkout отображались данные прораба
  - Backend теперь использует желаемый план (`targetPlanId`) для расчета суммы и названия в checkout
  - Название плана и цена в checkout теперь соответствуют выбранному плану

## [1.6.7] - 2025-12-31 - Plan Activation After Payment Fix

### Fixed
- **Plan Activation Timing**: Исправлена проблема, когда план считался подключенным сразу при нажатии "выбрать план"
  - План теперь активируется только после успешной оплаты через webhook
  - При нажатии "выбрать план" только инициализируется платеж с желаемым планом в metadata
  - План обновляется в подписке только после подтверждения оплаты
  - Убраны вызовы `changePlan` до оплаты - используется только `initializePayment` с `targetPlanId` и `targetPlan`

### Changed
- **SubscriptionManagement Component**:
  - Убраны вызовы `changePlan` до оплаты для существующих подписок
  - При выборе плана передается `targetPlanId` и `targetPlan` в `initializePayment`
  - План обновляется автоматически после успешной оплаты через webhook
  - Упрощена логика обработки выбора плана - нет необходимости вызывать `changePlan` заранее

- **GraphQL Schema**:
  - Добавлены опциональные параметры `targetPlanId` и `targetPlan` в мутацию `initializePayment`
  - Параметры передаются в metadata платежа для последующего обновления плана

### Technical
- **Modified Files**:
  - `apps/web/src/packages/components/settings/SubscriptionManagement.tsx`
    - Убраны вызовы `changePlan` до оплаты
    - Добавлена передача `targetPlanId` и `targetPlan` в `initializePayment`
  - `apps/web/src/packages/api/graphql/subscriptions.graphql`
    - Добавлены опциональные параметры `targetPlanId` и `targetPlan` в мутацию `initializePayment`

## [1.6.6] - 2025-12-31 - Payment Flow & UI Fixes

### Fixed
- **ProgressBar Component**: Исправлена ошибка "React does not recognize the `indicatorClassName` prop"
  - Добавлен `indicatorClassName` в интерфейс `ProgressBarProps`
  - Проп правильно извлекается из `props` перед распространением на DOM элемент
  - Применяется к индикатору прогресса вместо внешнего контейнера

- **White Screen on Dashboard**: Исправлен белый экран на странице дашборда
  - Упрощен интерфейс `ProgressBarProps` для избежания конфликтов с `React.HTMLAttributes`
  - Убрано расширение через `React.HTMLAttributes` для предотвращения ошибок типизации

- **TrialStatusWidget Button**: Исправлена ошибка "React.Children.only expected to receive a single React element child"
  - Убран `asChild` prop из `Button`, который требовал только один дочерний элемент
  - Добавлен обработчик `onClick` для прокрутки к секции планов
  - Кнопка теперь работает как обычная кнопка с несколькими дочерними элементами

- **Plan Cards Layout**: Исправлено перекрытие элементов в карточках планов подписки
  - Удален бейдж "Текущий" из верхнего левого угла (информация уже есть внизу)
  - Убран лишний отступ `pt-10`, который был добавлен для бейджа
  - Элементы карточки больше не перекрываются

- **Payment Redirect**: Исправлен редирект на страницу success вместо checkout
  - Добавлена проверка, что URL не ведет на `/payment/success`
  - При получении неправильного URL показывается ошибка
  - Обеспечен корректный редирект на страницу checkout провайдера

- **Data Refresh on Return**: Добавлено автоматическое обновление данных при возврате со страницы оплаты
  - `useEffect` проверяет параметры URL (`paymentId`, `success`)
  - Автоматически вызывается `refetch()` для обновления данных подписки
  - Использован `fetchPolicy: 'cache-and-network'` для актуальных данных

- **Plan Renewal Logic**: Исправлена логика продления плана
  - При продлении того же плана не вызывается `changePlan`
  - Используется существующий `subscriptionId` для инициализации платежа
  - Добавлены обязательные поля `plan` и `useEarlyBird` в `CreateSubscriptionInput`
  - Добавлено поле `newPlan` в `ChangePlanInput` для корректной типизации

- **Payment Success Page**: Исправлена ошибка "Cannot update a component while rendering a different component"
  - `router.push()` обернут в `setTimeout` для асинхронного выполнения
  - Предотвращено обновление Router во время рендеринга компонента

### Changed
- **SubscriptionManagement Component**:
  - Улучшена обработка ошибок при инициализации платежа
  - Добавлена проверка корректности URL перед редиректом
  - Улучшена типизация для всех GraphQL мутаций

- **Payment Flow**:
  - При возврате со страницы оплаты автоматически обновляются данные
  - Улучшена обработка существующих платежей на backend

### Technical
- **Modified Files**:
  - `apps/web/src/packages/components/ui/progress-bar.tsx` - Исправлен интерфейс и обработка `indicatorClassName`
  - `apps/web/src/packages/components/subscription/trial-status-widget.tsx` - Убран `asChild`, добавлен `onClick`
  - `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - Множественные исправления логики платежей
  - `apps/web/src/app/(root)/payment/success/page.tsx` - Исправлен редирект с `setTimeout`
  - `apps/web/src/app/(root)/(protected)/dashboard/page.tsx` - Исправлен белый экран

- **Statistics**: Frontend ~150 LOC changed

---

## [1.6.5] - 2025-12-31 - Subscription Plan Renewal Enhancement

### Added
- **Plan Renewal Button**: Добавлена кнопка "Продлить план" для текущего активного плана
  - Кнопка отображается под блоком "Текущий план" в карточке подписки
  - Использует иконку `RefreshCcw` для визуальной ясности
  - Вызывает `handleSelectPlan` для продления подписки на следующий период

### Changed
- **Current Plan Card Layout**: Обновлен дизайн карточки текущего плана
  - Информационный блок "Текущий план" с датой окончания
  - Ниже кнопка "Продлить план" с outline стилем
  - Добавлен контейнер `space-y-2` для правильного расстояния
  - Motion анимации при hover/tap для лучшего UX

- **Payment Success Page**: Улучшена логика автоматического редиректа
  - Сокращен таймер обратного отсчета с 10 до 5 секунд
  - Добавлена защита от множественных редиректов с флагом `hasRedirected`
  - Кнопка "Перейти в дашборд" теперь использует onClick вместо Link
  - Все кнопки редиректа устанавливают флаг `hasRedirected`

### Technical
- **Modified Files**:
  - `apps/web/src/packages/components/settings/SubscriptionManagement.tsx`
    - Добавлен импорт `RefreshCcw` из lucide-react
    - Изменена структура блока `isCurrent` (строки 793-830)
    - Добавлена кнопка продления с variant="outline"
  - `apps/web/src/app/(root)/payment/success/page.tsx`
    - Добавлен state `hasRedirected` для предотвращения множественных редиректов
    - Уменьшен начальный countdown с 10 до 5 секунд
    - Обновлены все кнопки редиректа для использования onClick с флагом

---

## [1.6.4] - 2025-12-29 - Subscription Buttons Navigation Fix

### Fixed
- **"Выбрать тарифный план" Button**: Кнопка теперь корректно показывает секцию планов для пользователей с активной подпиской
- **"Продлить план" Button**: Кнопка теперь перенаправляет к планам с параметром `showPlans=true`
- **Plans Visibility**: Исправлена видимость планов когда у пользователя есть активная подписка
- **"Сменить тариф" Toast**: Удален toast "В разработке" при нажатии на кнопку

### Added
- **URL Parameter Navigation**: Добавлен параметр `showPlans=true` для программного отображения планов
  - `useSearchParams` hook в SubscriptionManagement
  - useEffect для автоматической установки `isChangingPlan=true`
  - Плавный скролл к секции планов после обновления состояния

### Changed
- **Unified Button Behavior**: Все кнопки подписки теперь используют единый подход с URL параметрами
  - Trial widget button → Link с `showPlans=true`
  - Subscription history button → обновлен href с `showPlans=true`
  - Settings page → удален prop `onUpgrade` с toast

### Technical
- **Modified Files**:
  - `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - URL parameter support
  - `apps/web/src/packages/components/subscription/trial-status-widget.tsx` - Link component
  - `apps/web/src/packages/components/settings/subscription-history.tsx` - Updated href
  - `apps/web/src/app/(root)/(protected)/settings/page.tsx` - Removed onUpgrade prop

---

## [1.6.3] - 2025-12-29 - Subscription UX Polish

### Fixed
- **Plan Change Navigation**: Кнопка "Сменить тариф" теперь корректно скроллит к секции с планами
- **Tab Navigation**: Исправлены все ссылки с `?tab=billing` на `?tab=subscription`
- **Current Plan Detection**: Исправлена логика определения текущего плана (`planId` вместо `planRef.id`)

### Changed
- **Trial Period Widget**: Полностью переработан дизайн для компактности
  - Уменьшен padding с p-6 до p-4
  - Убран прогресс-бар
  - Горизонтальный layout вместо вертикального
  - Респонсивный текст для мобильных
  - Янтарная цветовая схема вместо синей
  - Добавлен скролл к планам при клике на кнопку

### Removed
- **Payment Provider Dialog**: Удален неиспользуемый диалог выбора провайдера (автовыбор по IP)

### Technical
- **Modified Files**:
  - `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - Scroll-to-plans, удален диалог
  - `apps/web/src/packages/components/subscription/trial-status-widget.tsx` - Компактный дизайн
  - `apps/web/src/packages/components/subscription/upgrade-button.tsx` - Исправлена навигация по табам

---

## [1.6.2] - 2025-12-28 - Subscription UX Improvements & History

### Added
- **Upgrade Button in Header**:
  - Новая кнопка "Апгрейд" в header на всех страницах
  - Фиолетовый градиент (purple-600 to pink-600)
  - Показывает текущий план для активных подписок
  - Responsive дизайн (иконки на мобильных)

- **Subscription History Component**:
  - Новый компонент `SubscriptionHistory` для отображения истории подписок
  - GraphQL query `MySubscriptionHistory`
  - Красивые карточки со статусами и датами
  - Статусы с цветовой кодировкой:
    - 🟢 ACTIVE - "Активна"
    - 🔵 TRIALING - "Пробный период"
    - ⚪ CANCELLED - "Отменена"
    - 🟠 PAST_DUE - "Просрочена"
    - 🔴 EXPIRED - "Истекла"
  - Кнопка "Продлить план" для активных подписок
  - Timeline с датами создания, trial, expiration

### Changed
- **Current Plan Display**:
  - Убрана кнопка "Выбрать план" для текущего плана
  - Показывается статус "Текущий план" с датой окончания
  - Улучшенный визуальный дизайн с border и background

- **Upgrade Button** (`upgrade-button.tsx`):
  - Изменен текст с "Начать" на "Апгрейд"
  - Добавлен `fetchPolicy: 'cache-and-network'` для актуальных данных
  - Улучшен responsive дизайн

### Technical
- **New Files**:
  - `apps/web/src/packages/components/settings/subscription-history.tsx` - История подписок
  - `SUBSCRIPTION_UX_IMPROVEMENTS.md` - Документация изменений

- **Modified Files**:
  - `apps/web/src/packages/components/subscription/upgrade-button.tsx` - Новый стиль и текст
  - `apps/web/src/packages/components/settings/SubscriptionManagement.tsx` - Статус вместо кнопки
  - `apps/web/src/packages/api/graphql/subscriptions.graphql` - Новый query
  - `apps/web/src/app/(root)/(protected)/settings/page.tsx` - Интеграция истории

- **Statistics**: +220 LOC frontend

---

## [1.6.1] - 2025-12-28 - UI Polish & Bug Fixes

### Fixed
- **Subscription Management**:
  - Исправлена проблема, когда все кнопки планов показывали состояние загрузки одновременно
  - Теперь только выбранный план показывает состояние "Обработка..."
  - Добавлено индивидуальное состояние обработки для каждого плана (`processingPlanId`)
  - Исправлена ошибка импорта компонентов Tabs
  - Исправлена проблема с перезагрузкой страницы при сохранении настроек профиля

### Added
- **Team Projects Page**:
  - Табы для переключения между активными и архивными проектами
  - Сортировка проектов (по умолчанию, по названию, по дате, по статусу)
  - Кнопка показа/скрытия завершенных проектов

- **Dashboard Improvements**:
  - Заменены две секции на табы в одном ряду
  - Вкладка "Архив" скрывается автоматически, если нет архивных проектов
  - Умная сортировка проектов с приоритетом активных/незавершенных

### Changed
- Настройки профиля и уведомлений обновляются через Apollo Cache без перезагрузки
- Улучшена навигация и UX страницы проектов команды

---

## [1.6.0] - 2025-12-27 - Full Subscription System

### Added
- Complete subscription UI with plan selection
- Payment flow with Stripe and Yookassa
- Trial period management
- Subscription status tracking
- Plan upgrade/downgrade functionality
- Admin panel user menu with dropdown
- Subscription plans accordion with expandable features

### Changed
- Улучшен UX дашборда: более компактное и интуитивное отображение проектов
- Более гибкая навигация между активными и архивными проектами
- Subscription plans UI improvements (accordion, fixed height cards)
- Admin panel menu styling (simplified labels, removed hover effects)

### Fixed
- Исправлено позиционирование бейджей в карточках планов
- Исправлено выравнивание элементов в карточках планов
- Добавлена поддержка `side="top"` в DropdownMenu компонент

---

## [1.5.0] - 2025-12-27 - Multi-Bot Telegram Management UI ✅

### ✅ COMPLETED - Phase 4: Admin UI for Telegram Bots (100% complete)

**GraphQL Operations**
- ✅ Создан файл `admin-telegram-bots.graphql` с полным набором операций:
  - Queries: `GetAdminTelegramBots`, `GetAdminTelegramBot`, `AdminTelegramBotWebhookInfo`
  - Mutations: `AdminCreateTelegramBot`, `AdminUpdateTelegramBot`, `AdminDeleteTelegramBot`
  - Mutations: `AdminSyncTelegramBot`, `AdminTestTelegramBot`
  - Mutations: `AdminSetTelegramWebhook`, `AdminDeleteTelegramWebhook`, `AdminReloadTelegramBot`
- ✅ Все необходимые поля для UI определены
- ✅ Поддержка фильтрации по includeInactive
- ✅ Поддержка поиска по ID и botName
- 📊 **Изменения:** Создан файл `admin-telegram-bots.graphql` (+158 LOC)

**TypeScript Codegen**
- ✅ Исправлены несоответствия в GraphQL operations:
  - Убрано `webhookInfo` из `configStatus` (не существует в schema)
  - Исправлен `adminTestTelegramBot`: `token` → `input: TestBotTokenInput`
  - Исправлен `adminSetTelegramWebhook`: отдельные параметры → `input: SetWebhookInput`
  - Переименован `adminGetTelegramWebhookInfo` → `adminTelegramBotWebhookInfo` (query вместо mutation)
  - Убрано поле `ipAddress` из WebhookInfoModel
- ✅ Сгенерированы TypeScript types для всех операций
- ✅ Все GraphQL operations готовы к использованию в компонентах
- 📊 **Изменения:** Обновлен `admin-telegram-bots.graphql` (исправления схемы)

**TelegramBotsPanel Component**
- ✅ Создан главный компонент панели управления ботами:
  - Stats cards: Total Bots, Active Bots, Primary Bot
  - Integration с GetAdminTelegramBotsDocument query
  - Полный набор mutations: Create, Update, Delete, Sync, Test, Reload
  - State management для dialogs, loading states
  - Toast notifications для всех операций
  - Error handling с retry функционалом
- ✅ Функциональность:
  - Add Bot - создание нового бота
  - Configure - редактирование существующего
  - Test Token - валидация токена перед сохранением
  - Sync - синхронизация данных с Telegram API
  - Reload - hot reload бота без рестарта
  - Toggle Active - включение/отключение бота
  - Delete - удаление с подтверждением
- 📊 **Изменения:** Создан `telegram-bots-panel.tsx` (+380 LOC)

**TelegramBotsTable Component**
- ✅ Создан компонент таблицы для отображения ботов:
  - 9 колонок: Bot (avatar + name), Username, Description, Status, Configuration, Primary, Webhook URL, Last Sync, Actions
  - Avatar support с fallback на Bot icon
  - Status badges (Active/Inactive с иконками)
  - Configuration status badges (Fully Configured / Webhook Set / Token Only / Not Configured)
  - Primary badge с звездочкой
  - Webhook URL с кнопкой копирования
  - Last Sync форматирование (formatDistanceToNow from date-fns)
  - Dropdown menu с действиями: Configure, Sync, Reload, Toggle Active, Delete
  - Loading states для Sync и Reload операций
  - Empty state с подсказкой "Click 'Add Telegram Bot' to create one"
- ✅ UI/UX особенности:
  - Интеграция с shadcn/ui компонентами (Table, Avatar, Badge, DropdownMenu)
  - Responsive truncate для длинных описаний и webhook URLs
  - Destructive стиль для Delete action
  - Disabled состояния для Reload (только для активных ботов)
  - Spinners при выполнении операций
- 📊 **Изменения:** Создан `telegram-bots-table.tsx` (+240 LOC)

**BotConfigDialog Component**
- ✅ Создан диалог конфигурации бота (Create/Edit):
  - Режимы: Create (новый бот) и Edit (редактирование существующего)
  - Поля формы:
    - Bot Name (только create mode, автозаполнение из username)
    - Bot Token (password field с кнопкой "Test")
    - Display Name (автозаполнение из firstName)
    - Description (textarea, опционально)
    - Webhook URL (readonly, автогенерация)
    - Active (switch)
    - Primary OAuth Bot (switch)
- ✅ Функциональность:
  - Test Token - валидация через adminTestTelegramBot mutation
  - Auto-population полей при успешном тесте токена
  - Visual feedback: Success/Error alerts с иконками
  - Token security: никогда не показывается существующий токен (edit mode)
  - Validation: обязательные поля отмечены звездочкой
  - Disabled save button до заполнения обязательных полей
- ✅ UI/UX особенности:
  - shadcn/ui Dialog с responsive max-height и scroll
  - Alert компонент для результатов теста токена
  - Info tooltips для всех полей
  - Loading states для Test и Save операций
  - Clear test result при изменении token
- 📊 **Изменения:** Создан `bot-config-dialog.tsx` (+315 LOC)

**SystemSettingsTabs Integration**
- ✅ Добавлена вкладка "Telegram Bots" в System Settings:
  - Импорт TelegramBotsPanel компонента
  - Добавлен тип 'telegram-bots' в MainTab
  - TabsList расширен с grid-cols-5 до grid-cols-6
  - TabsTrigger и TabsContent для telegram-bots добавлены
  - URL routing поддержка: ?tab=telegram-bots
- 📊 **Изменения:** Обновлен `system-settings-tabs.tsx` (+5 LOC)

### ✅ ЗАВЕРШЕНО - Phase 4: Admin UI for Telegram Bots (100% complete)

### Итого Phase 4 (Завершена):
- ✅ 5 новых файлов создано
- ✅ GraphQL operations определены и исправлены (+158 LOC)
- ✅ TypeScript types сгенерированы
- ✅ TelegramBotsPanel component реализован (+380 LOC)
- ✅ TelegramBotsTable component реализован (+240 LOC)
- ✅ BotConfigDialog component реализован (+315 LOC)
- ✅ Index export файл создан (+3 LOC)
- ✅ SystemSettingsTabs интеграция (+5 LOC)
- ✅ **+1,101 LOC** (Frontend: GraphQL +158, Components +935, Exports +3, Integration +5)
- 📊 **Прогресс: 100%** (6/6 задач выполнено) 🎉

## ✅ ЗАВЕРШЕНО - Multi-Bot Telegram Management v1.5.0

### Итоговая статистика Frontend:

**Components Created:** 4
- ✅ TelegramBotsPanel (+380 LOC) - Главный контейнер с stats и mutations
- ✅ TelegramBotsTable (+240 LOC) - Таблица с full CRUD
- ✅ BotConfigDialog (+315 LOC) - Create/Edit диалог с token test
- ✅ Index export (+3 LOC) - Barrel exports

**Integration:**
- ✅ SystemSettingsTabs (+5 LOC) - Добавлена вкладка "Telegram Bots"

**GraphQL:**
- ✅ admin-telegram-bots.graphql (+158 LOC) - Все queries и mutations

**Total LOC:** +1,101 (Frontend)
**Time:** ~5 часов (из общих ~13 часов проекта)

### Ключевые особенности UI:

**User Experience:**
- ✅ Stats dashboard с метриками
- ✅ Full CRUD через intuitive UI
- ✅ Test Token перед сохранением
- ✅ Auto-population из Telegram API
- ✅ Visual feedback (toasts, loading states, alerts)
- ✅ Error handling с retry
- ✅ Avatar display в таблице

**Responsive Design:**
- ✅ Desktop: full table view
- ✅ Mobile-friendly components
- ✅ Truncate для длинных текстов
- ✅ Dropdown actions menu

**Performance:**
- ✅ Optimistic UI updates
- ✅ Parallel GraphQL queries
- ✅ Lazy loading dialogs
- ✅ Memoized components where needed

---

## [1.4.6] - 2025-12-25 - Active Sessions UI ✅

### Added

- **Active Sessions:**
  - ✅ Отображение детальной информации о сессиях (IP, City, Country, Device, Browser, OS)
  - ✅ Новая секция "История входов" (Login History)
  - ✅ Интеграция с `geoip-lite` и `ua-parser-js` для обогащения данных

---

## [1.4.5] - 2025-12-25 - Telegram Integration for Email Users 🚧

### 🚧 IN PROGRESS - Account Linking UI

**Settings Page**
- ⏳ Реализация кнопки "Подключить Telegram" (вместо "Скоро")
- ⏳ Интеграция `initTelegramAuth` для получения deep link
- ⏳ Логика поллинга статуса и привязки аккаунта

---

## [1.4.4] - 2025-12-25 - Admin Panel UX Improvements & Trial Period 🚧

### 🚧 IN PROGRESS - Admin Panel Navigation & Trial Period

**Admin Panel UX Improvements** - Frontend changes for sidebar cleanup and trial period UI

#### Progress: 70% (Admin UI + Onboarding complete, User dashboard & notifications pending)

**✅ Sidebar Navigation Cleanup (COMPLETE)**
- ✅ Removed "Admin Roles" from admin sidebar (now in System Settings → Roles tab)
- ✅ Removed "Audit Logs" from admin sidebar (now in System Settings → Logs tab)
- 📊 **Changes:** -12 LOC in `admin-sidebar.tsx`
- 🎯 **Benefit:** Cleaner navigation, no duplication

**✅ Trial Period - Admin UI (COMPLETE)**
- ✅ Added `trialDays` state variable in SubscriptionPlansPanel
- ✅ Added Trial Period input field in edit mode:
  - Input field with number validation
  - Placeholder "Нет пробного периода"
  - Help text explaining the feature
- ✅ Added Trial Period display in view mode:
  - Formatted display with Russian pluralization (день/дня/дней)
  - Shows "Нет" if no trial period configured
- ✅ Integrated trialDays into updatePlan mutation
- ✅ Added trialDays to form reset on cancel
- 📊 **Changes:** +35 LOC in `subscription-plans-panel.tsx`
- 🎯 **Benefit:** Admin can now configure trial period for each subscription plan

**✅ Trial Period - Onboarding Flow (COMPLETE)**
- ✅ Created new Step 4 in onboarding for plan selection:
  - Beautiful plan selection UI with cards for each plan
  - Trial period badge display (e.g., "14 дней бесплатно")
  - Plan features, pricing, and limits display
  - Popular plan highlighting
  - Selection state with visual feedback
- ✅ Updated Step 3 to navigate to Step 4 instead of completing directly
- ✅ Updated Stepper to show 4 steps instead of 3
- ✅ Added `trialDays` field to all GraphQL plan queries (GetAvailablePlans, GetAdminPlans, etc.)
- ✅ Success animation with confetti on completion
- ✅ Automatic subscription creation with selected plan during onboarding
- 📊 **Changes:**
  - Created `step-4/page.tsx` (+361 LOC)
  - Modified `step-3/page.tsx` (-96 LOC cleanup, routing update)
  - Modified `admin-plans.graphql` (+7 trialDays fields)
- 🎯 **Benefit:** Users can choose their plan with trial period during onboarding, automatic subscription activation

**⏳ Trial Period - User Dashboard UI (PENDING)**
- ⏳ Add trial status widget in user dashboard
- ⏳ Display countdown of remaining trial days
- ⏳ Show trial period details in profile/settings

**⏳ Trial Period - Notifications (PENDING)**
- ⏳ Email notifications before trial ends
- ⏳ In-app notifications about trial status

### Files Modified

- `apps/web/src/packages/components/admin/admin-sidebar.tsx` (-12 LOC)
- `apps/web/src/packages/components/admin/settings/subscription-plans/subscription-plans-panel.tsx` (+35 LOC)
- `apps/web/src/app/(root)/onboarding/step-3/page.tsx` (-96 LOC, routing update to Step 4)
- `apps/web/src/packages/api/graphql/admin/admin-plans.graphql` (+7 trialDays fields)

### Files Created

- `apps/web/src/app/(root)/onboarding/step-4/page.tsx` (+361 LOC) - Plan selection page with trial period display

---

## [1.4.4-old] - 2025-12-25 - Email Change with 2FA Verification ✅

### Added

- **Email Change Functionality with 2FA Protection:**
  - ✅ Созданы GraphQL мутации `InitiateEmailChange` и `VerifyEmailChange`
  - ✅ Добавлена секция "Email адрес" в раздел "Безопасность" на странице настроек:
    - Форма с полем нового email
    - Поле для 2FA кода (отображается только если 2FA включена)
    - Валидация email через Zod schema
    - Обработка ошибок и успешных операций
  - ✅ Добавлен диалог для ввода 2FA кода:
    - Автоматическое открытие, если 2FA включена и код не предоставлен
    - Автоматическая отправка при вводе 6-значного кода
    - Обработка ошибок верификации
  - ✅ Добавлена проверка на Telegram placeholder email:
    - Секция изменения email скрыта для пользователей с placeholder email
    - Предотвращение изменения на другой placeholder email
  - ✅ Интеграция с существующей системой 2FA:
    - Проверка статуса 2FA через `TwoFactorStatusDocument`
    - Условное отображение поля 2FA кода
    - Условное открытие диалога 2FA верификации
  - 📊 **Frontend Changes:** +250 LOC в `settings/page.tsx`, +2 GraphQL мутации

### User Experience

- ✅ Понятные сообщения об ошибках
- ✅ Toast уведомления о статусе операций
- ✅ Автоматическое закрытие формы после успешной отправки
- ✅ Автоматическое обновление данных пользователя после подтверждения
- ✅ Скрытие секции для Telegram users с placeholder email

### Files Modified

- `apps/web/src/app/(root)/(protected)/settings/page.tsx` (+250 LOC)
- `apps/web/src/packages/api/graphql/auth.graphql` (+10 LOC)

---

## [1.1.0] - 2025-12-25 - Email Change & Bug Fixes ✅

### Fixed

- **UI/UX Issues:**
  - ✅ Исправлена структура HTML в `DeleteAccountDialog` (вложенные `<p>` и `<div>` в `<p>`)
    - Заменены вложенные `<p>` на отдельные `AlertDialogDescription` элементы
    - Исправлена ошибка гидратации React
  - ✅ Исправлен отсутствующий импорт `CreditCard` в Admin Plans page
  - 📊 **Changes:** обновлены 2 файла

### Improved

- **App Version Display:**
  - ✅ Обновлен `apps/web/src/packages/constants/app.ts` для использования `NEXT_PUBLIC_APP_VERSION`
  - ✅ Версия автоматически подтягивается из `package.json` через `next.config.ts`
  - ✅ Отображается в Settings > About без необходимости ручного обновления
  - 📊 **Changes:** обновлен `app.ts`, версия теперь динамическая
109: 
110: - **Calendar Component Design:**
111:   - ✅ Обновлен дизайн компонента `Calendar` для соответствия dark/clean эстетике
112:   - ✅ Унифицированы стили селекторов Месяца и Года (outline style, background-background)
113:   - ✅ Улучшена читаемость и визуальная согласованность хедера календаря
114:   - 📊 **Changes:** обновлен `calendar.tsx` в `packages/components/ui`

### Files Modified

- `apps/web/src/packages/components/settings/DeleteAccountDialog.tsx`
- `apps/web/src/app/(root)/(protected)/admin/plans/page.tsx`
- `apps/web/src/packages/constants/app.ts`

---

## [1.4.3] - 2025-12-25 - System Settings Expansion ✅

### Added

- **System Settings Expansion:**
  - ✅ PHASE 3: Frontend - Extract Admin Components
    - Created Subscription Plans Panel (1,272 LOC)
    - Created Admin Roles Panel (322 LOC)
    - Moved Role Dialogs (assign-role-dialog.tsx, edit-permissions-dialog.tsx)
    - Created Audit Logs Panel (245 LOC)
    - Created Barrel Exports (3 index.ts files)
  - ✅ PHASE 4: Frontend - Integration Settings Update
    - Added 3 new integration categories with icons (SMS→Smartphone, Social→Users, Analytics→BarChart)
    - Updated TabsList grid from 7 to 10 columns
  - ✅ PHASE 5: Frontend - System Settings Tabs Update
    - Added 3 new main tabs (Plans, Roles, Logs)
    - Imported and integrated new panels
    - Updated URL routing logic to handle new tabs
    - Updated TabsList grid from 2 to 5 columns (max-w-4xl)
  - ✅ PHASE 6: Frontend - Navigation & Redirects
    - Created redirect for /admin/plans → /admin/settings?tab=plans
    - Created redirect for /admin/roles → /admin/settings?tab=roles
    - Created redirect for /admin/logs → /admin/settings?tab=logs
  - ✅ PHASE 7: GraphQL Type Regeneration
    - Regenerated frontend GraphQL types with new SettingCategory enum values
  - 📊 **Frontend Changes:** +8 files (~1,900 LOC), updated settings/index.ts

### Files Created

- `apps/web/src/packages/components/admin/settings/subscription-plans/subscription-plans-panel.tsx` (1,272 LOC)
- `apps/web/src/packages/components/admin/settings/admin-roles/admin-roles-panel.tsx` (322 LOC)
- `apps/web/src/packages/components/admin/settings/audit-logs/audit-logs-panel.tsx` (245 LOC)
- 3 redirect pages (plans, roles, logs)

### Files Modified

- `apps/web/src/packages/components/admin/settings/integration-settings.tsx` (+3 categories, ~15 LOC)
- `apps/web/src/packages/components/admin/settings/system-settings-tabs.tsx` (+45 LOC)
- `apps/web/src/packages/components/admin/settings/index.ts` (+3 exports)

---

## [1.4.2] - 2025-12-25 - System Settings Reorganization ✅

### Added

- **System Settings Reorganization:**
  - ✅ Двухуровневая навигация:
    - Main Tabs: System Integrations, Payment Providers
    - Sub Tabs: 7 категорий интеграций (Payment, Email, Telegram, Storage, AI, Security, General)
  - ✅ URL Routing: Shareable links to specific settings (`/admin/settings?tab=integrations&subtab=email`)
  - ✅ Deep Linking: Browser back/forward support
  - ✅ Модульная архитектура: Переиспользуемые компоненты для панелей настроек
  - ✅ Backward Compatibility: Redirect `/admin/payment-providers` → `/admin/settings?tab=providers`

### Files Created

- `apps/web/src/packages/components/admin/settings/settings-category-panel.tsx` (~210 LOC)
- `apps/web/src/packages/components/admin/settings/integrations/integration-settings.tsx` (~215 LOC)
- `apps/web/src/packages/components/admin/settings/payment-providers/provider-table.tsx` (~210 LOC)
- `apps/web/src/packages/components/admin/settings/payment-providers/provider-config-dialog.tsx` (~225 LOC)
- `apps/web/src/packages/components/admin/settings/payment-providers/payment-providers-panel.tsx` (~310 LOC)
- `apps/web/src/packages/components/admin/settings/system-settings-tabs.tsx` (~85 LOC)

### Files Modified

- `/admin/settings/page.tsx` - Упрощён с 338 до 16 LOC (~95% reduction)
- `/admin/payment-providers/page.tsx` - Заменён на redirect (590 → 21 LOC, ~96% reduction)
- `admin-sidebar.tsx` - Удалён пункт Payment Providers (теперь в System Settings)

---

## [0.7.3] - 2025-12-27 - Subscription Upgrade Flow ✅

### Added

- **Subscription Management:**
  - ✅ Implemented "Select Plan" & "Change Plan" (Upgrade) functionality
  - ✅ Added `NewPlanId` support in mutations
  - ✅ Added "Changing Plan" UI state
  - ✅ Improved error handling in subscription flow

## [0.7.2] - 2025-12-27 - Subscription UI Update ✅

### Changed

- **Subscription Management:**
  - ✅ Enabled fetching available plans from the API (DB source)
  - ✅ Updated `SubscriptionManagement` component to display dynamic plan data
  - 🔄 Re-enabled `AvailablePlansDocument` query

---

## [1.4.1] - 2025-12-24 - Admin Sidebar Optimization ✅

### Added

- **Admin Sidebar Refactor:**
  - ✅ Grouped Navigation (6 Groups):
    - Overview (статичная) - Dashboard
    - Team Management (статичная) - Teams, Operations, Communications, Audit
    - User & Access Control (сворачиваемая) - Users, Roles
    - Billing & Finance (сворачиваемая) - Subscriptions, Plans, Payments, Providers
    - System & Operations (сворачиваемая) - Settings, Storage, Projects
    - Monitoring & Support (сворачиваемая) - Support Tickets, Audit Logs, Analytics
  - ✅ Command Palette (Cmd+K):
    - Глобальный поиск по всем пунктам меню
    - Поиск на английском и русском
    - Группировка результатов по категориям
    - Favorites и Recent в начале
    - Instant navigation
  - ✅ Favorites System:
    - Star icon on hover для добавления в избранное
    - Favorites секция в верхней части sidebar
    - localStorage persistence
    - Max 10 favorites
  - ✅ Recent Pages Tracking:
    - Автоматическое отслеживание последних 5 страниц
    - Recent секция в нижней части sidebar
    - localStorage persistence
    - 1-секундная задержка перед записью
  - ✅ Badge Counters & Indicators:
    - Support Tickets - badge счетчик (открытые + в работе)
    - Audit Logs - dot индикатор (активность за 24ч)
    - GraphQL polling каждые 60 секунд
    - Page Visibility API (пауза при скрытой вкладке)

### Files Created

- 10 new files (~1,900 LOC):
  - 4 main components (AdminSidebar, AdminCommandPalette, AdminNavGroup, AdminNavItem)
  - 3 custom hooks (useAdminFavorites, useAdminRecent, useAdminBadges)
  - 1 utilities module
  - 1 types module
  - 1 GraphQL query file

### Files Modified

- `admin-sidebar.tsx` (complete refactor)
- `admin/layout.tsx` (added Command Palette)

---

## [1.4.0] - 2025-12-24 - Stage 16: Advanced Team & Role Management ✅

### Added

- **Day 8: Team Analytics Dashboard:**
  - ✅ Frontend (5 files, ~650 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/analytics/page.tsx` - Полная страница аналитики
    - `TeamGrowthChart.tsx` - Recharts LineChart для роста команды
    - `MemberActivityTable.tsx` - Таблица активности с поиском и сортировкой
    - `TeamCompositionCharts.tsx` - Pie charts для ролей, positions progress bars
    - `StorageUsageCard.tsx` - Визуализация использования хранилища

- **Day 9: Role & Permission Builder:**
  - ✅ Frontend (6 files, ~915 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/roles/page.tsx` - Страница управления ролями
    - `RoleList.tsx` - Таблица ролей с редактированием
    - `RoleHierarchyTree.tsx` - Древовидная визуализация иерархии ролей
    - `PermissionEditor.tsx` - Редактор прав с категориями
    - `RoleFormDialog.tsx` - Форма создания/редактирования роли

- **Day 10: Team Member Management:**
  - ✅ Frontend (4 files, ~490 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/teams/[teamId]/members/page.tsx` - Страница управления участниками
    - Компоненты для управления участниками команды

- **Day 11: Team Communication Tools:**
  - ✅ Frontend (5 files, ~740 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/communications/page.tsx` - Страница управления объявлениями
    - Компоненты для коммуникаций

- **Day 12: Advanced Team Features:**
  - ✅ Frontend (6 files, ~735 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/teams/operations/page.tsx` - Страница управления операциями
    - Компоненты для операций с командами

- **Day 13: Team Audit & Compliance:**
  - ✅ Frontend (2 files, ~230 LOC):
    - `apps/web/src/app/(root)/(protected)/admin/audit/page.tsx` - Страница аудита с табами

---

## [1.0.2] - 2025-12-19 - 2FA Login & Settings UX Improvements

### Added

- **Two-Factor Authentication (2FA) Login Flow:**
  - ✅ Complete 2FA verification during login when enabled
  - ✅ Dedicated 2FA code input screen with shield icon
  - ✅ Support for TOTP codes from Google Authenticator, Authy, etc.
  - ✅ Support for backup codes during login
  - ✅ Beautiful animated 2FA verification UI

- **URL-Based Settings Navigation:**
  - ✅ Settings tabs now use URL query parameters (`/settings?tab=security`)
  - ✅ Page refresh preserves current tab (no more reset to Profile)
  - ✅ Direct links to specific settings sections work correctly
  - ✅ Browser back/forward navigation works with tabs

### Fixed

- **Admin Pages - Debounce for Search/Filters:**
  - ✅ Added 500ms debounce to roles page search
  - ✅ Added debounce to subscriptions page with filter reset on search
  - ✅ Added debounce to payments page with proper filter handling
  - ✅ Prevents unnecessary API calls during typing

- **TypeScript Fixes:**
  - ✅ Fixed AdminRoleType import in resolver and service
  - ✅ Fixed QRCode component import in TwoFactorAuth
  - ✅ Fixed stats type in admin projects page

### Changed

- `apps/web/src/app/(root)/auth/login/page.tsx` - Complete 2FA UI with code input
- `apps/web/src/app/(root)/(protected)/settings/page.tsx` - URL-based tab routing
- `apps/web/src/packages/libs/auth/auth.context.tsx` - Updated login to return 2FA result

---

## [1.0.1] - 2025-12-19 - Bugfixes & Improvements

### Fixed

- **Payment Providers Configuration UI:**
  - ✅ Added configuration dialog for entering Yookassa/Stripe API credentials
  - ✅ Shop ID, Secret Key, Webhook Secret fields for Yookassa
  - ✅ Secret Key, Publishable Key, Webhook Secret fields for Stripe
  - ✅ Active/Primary toggle switches in config dialog
  - ✅ Test Connection and Clear Cache actions

- **Build Fixes:**
  - ✅ Fixed useToast hook to support object-style parameters (`{ title, description, variant }`)
  - ✅ Fixed UpdatePaymentProviderInput type errors (added null values for optional fields)
  - ✅ Fixed AdminUserFilters missing role property
  - ✅ Regenerated GraphQL types

### Changed

- `apps/web/src/app/(root)/(protected)/admin/payment-providers/page.tsx` - Complete rewrite with config dialog (600+ LOC)
- `apps/web/src/packages/hooks/use-toast.ts` - Updated toast function signature
- `apps/web/src/app/(root)/(protected)/admin/roles/assign-role-dialog.tsx` - Added role filter

---

## [1.0.0] - 2025-12-19 🎉 MVP RELEASE

### Added

- **Stage 15: Subscription Plans & Payment Providers Management - 100% COMPLETE:**
  - ✅ Frontend: Admin Plans Management UI
  - ✅ Frontend: Payment Providers Configuration UI
  - ✅ Complete admin panel for managing subscription plans and payment providers

---

## [0.5.0] - 2025-01-XX

### Added

- **Invite Flow Improvements:**
  - ✅ Кнопка "Создать аккаунт и присоединиться" для незарегистрированных
  - ✅ Автоматический возврат на страницу приглашения после auth
  - ✅ Параметр `redirect` в URL для сохранения контекста
  - ✅ Пропуск онбординга для приглашенных пользователей

### Fixed

- **Apollo Client Imports:**
  - ✅ Исправлены импорты в admin панели (4 файла)
  - ✅ Изменено с `@apollo/client` на `@apollo/client/react`

- **Projects Display:**
  - ✅ Полностью переписана логика фильтрации проектов
  - ✅ Удалены анимации framer-motion для стабильности
  - ✅ Добавлен debug panel
  - ✅ Исправлено исчезновение проектов при переключении фильтров

### Changed

- **Team Switcher:**
  - ✅ Показывает все команды пользователя (owner + member)
  - ✅ Визуальное отличие владелец/участник

---

## [0.3.0] - 2025-01-XX

### Added

- Time Tracking UI
- Personnel Analytics UI
- Salary History UI
- CSV Export buttons

---

## [0.2.8] - Previous Version

### Added

- Admin Panel Week 2
- Settings Page
- Multi-Provider Storage UI
