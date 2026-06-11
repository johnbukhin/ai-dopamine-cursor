# Issue #61: Coach modal auto-send + scroll/input bug fix

**Overall Progress:** `0%`

## TLDR

Коли user тисне "I want to talk it through" на Reflect-стейджі, Coach modal
зараз відкривається з generic welcome-повідомленням, не дає скролити чи
писати, і змушує user самостійно формулювати запит у urge-state. Робимо:
(1) auto-генеруємо і auto-send структуроване повідомлення з контекстом
(feeling + intensity + actionsTried) у Coach, (2) фіксимо scroll/input bug
у модалці.

## Critical Decisions

- **Divider як new `ChatMessage.role`** ('divider') — простіше за окремий
  state-array; зберігається в DB; рендериться окремо; фільтрується перед
  Anthropic API і coach-reset payload.
- **Divider content = ISO timestamp** — рендеринг витягує `Date` із content,
  формат `── New urge session · 2:34 PM ──` (повна дата якщо >24h).
- **Одне auto-message замість N** — економить квоту, чистіший UI, urge-mode
  prompt дає одну цілісну відповідь.
- **`UrgeContextSeed.actionAttempted` → `actionsTried[]`** — і system prompt,
  і auto-message бачать весь ланцюжок технік.
- **Welcome скіпається тільки коли `messages.length === 1`** (порожній чат);
  інакше divider + auto-message append'аться до існуючої історії.
- **Auto-send fires одразу на mount** через `useEffect` з guard'ом проти
  повторного спрацьовування.
- **`urgeAutoMessage.ts` як shared module** — `buildUrgeAutoMessage()` і
  `formatDividerLabel()` в одному місці.
- **Scroll bug = `vh` → `dvh`** на mobile (гіпотеза, перевіримо при /execute).

## Tasks

- [ ] 🟥 **Step 1: Types & shared helpers**
  - [ ] 🟥 Розширити `ChatMessage.role`: `'user' | 'assistant' | 'divider'` у `webapp/types.ts`
  - [ ] 🟥 Замінити `UrgeContextSeed.actionAttempted: UrgeActionId | null` на `actionsTried: UrgeActionId[]`
  - [ ] 🟥 Створити `webapp/lib/urgeAutoMessage.ts` з:
    - `buildUrgeAutoMessage(feeling, intensity, actionsTried): string`
    - `formatDividerLabel(isoTimestamp): string`
    - `createDividerMessage(): ChatMessage` (content = ISO now)

- [ ] 🟥 **Step 2: Update `UrgeHelp.tsx`**
  - [ ] 🟥 `openCoach`: передати весь `actionsTried` у seed (заміна `actionsTried[actionsTried.length - 1] ?? null`)
  - [ ] 🟥 Додати в seed prop `autoMessage: string` (згенерований через `buildUrgeAutoMessage`)
  - [ ] 🟥 Прокинути `autoMessage` через `<CoachModal>` пропс

- [ ] 🟥 **Step 3: Update `formatUrgeContext` в `AICoach.tsx`**
  - [ ] 🟥 Рендерити весь `actionsTried[]` (joined `→`) замість одного `actionAttempted`
  - [ ] 🟥 Оновити підпис системного промпта ("Most recent action they tried" → "Actions they've tried")

- [ ] 🟥 **Step 4: Auto-send в `AICoach.tsx`**
  - [ ] 🟥 Додати prop `autoMessage?: string` (опціональний, спрацьовує тільки в compact mode)
  - [ ] 🟥 `useEffect` на mount: якщо `autoMessage` є → append divider (якщо чат не порожній) → append user message → виклик `getCoachResponse` → append response
  - [ ] 🟥 Guard через `useRef` щоб не спрацьовувало двічі (StrictMode, re-mount)
  - [ ] 🟥 Welcome message: НЕ показувати якщо `compact && autoMessage && messages.length === 1` (чистий старт у модалці)
  - [ ] 🟥 Філтрувати `divider` із payload до `/api/coach`: `messagesRef.current.slice(1).filter(m => m.role !== 'divider').slice(-10)`
  - [ ] 🟥 Не фільтрувати дивайдери у `toStore` upsert (зберігаються в DB)
  - [ ] 🟥 `isEmpty` логіка: враховувати тільки `user`/`assistant` турни

- [ ] 🟥 **Step 5: Render divider в `AICoach.tsx`**
  - [ ] 🟥 У `messages.map` — якщо `role === 'divider'`, рендерити горизонтальний rule + label через `formatDividerLabel(content)`
  - [ ] 🟥 Стиль: тонка лінія + центрований текст, purple-tinted, відрізняється від bubble

- [ ] 🟥 **Step 6: Fix scroll/input bug в `CoachModal.tsx`**
  - [ ] 🟥 Замінити `max-h-[90vh]` на `max-h-[90dvh]` (dynamic viewport — фіксить mobile keyboard)
  - [ ] 🟥 Перевірити рендер на mobile (Safari iOS DevTools) з відкритою клавіатурою
  - [ ] 🟥 Якщо `dvh` не вирішує — додати `overflow-y: auto` явно на wrapper AICoach

- [ ] 🟥 **Step 7: Filter divider в `ResetChatModal.tsx`**
  - [ ] 🟥 Перед `resetCoachChat(messagesToSave)` — `.filter(m => m.role !== 'divider')`
  - [ ] 🟥 `disabled` check для "Save & start fresh": використати відфільтрований масив

- [ ] 🟥 **Step 8: Manual testing**
  - [ ] 🟥 Запустити webapp локально (`npm run dev` або per project script)
  - [ ] 🟥 Сценарій A: порожній чат → Help → escalate → бачимо тільки auto-message + response (без welcome)
  - [ ] 🟥 Сценарій B: чат з історією → Help → escalate → бачимо divider + auto-message + response after існуючої історії
  - [ ] 🟥 Сценарій C: 2 actions → "Still here" → ще 1 action → escalate → auto-message містить всі 3 в порядку
  - [ ] 🟥 Сценарій D: скрол у модалці працює, input видимий, можна дописати наступне повідомлення
  - [ ] 🟥 Сценарій E: Reset chat ("Save") після auto-message не падає
  - [ ] 🟥 Mobile viewport (Cmd+Opt+I → device toolbar): модалка не обрізається

- [ ] 🟥 **Step 9: Build & smoke**
  - [ ] 🟥 `npm run build` у `webapp/` — no errors
  - [ ] 🟥 TypeScript: всі типи проходять
  - [ ] 🟥 (Smoke test за README запустимо в /execute коли push)
