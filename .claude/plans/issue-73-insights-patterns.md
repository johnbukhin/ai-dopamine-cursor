# Issue #73: Insights — patterns & achievements page (paid-only)

**Overall Progress:** `89%` (manual scenarios — Step 9 — pending user smoke-test)

## TLDR

Нова `View.INSIGHTS` сторінка з 8 achievement-style картками: lifetime aggregations з `urge_log` + `check_ins`. Дві точки входу: кнопка `Insights` зліва від `New conversation` у Coach (paid → Insights, free → ProGate через `View.AI_COACH`); кнопка в правому верхньому куті Clean/Slip banner у day-detail modal (Dashboard). Усі візуалізації — inline SVG/CSS, без нових deps.

## Critical Decisions

- **No journal in MVP** — per #66 plan, journal буде compressed у coach_memory prose, не структуровано. Insights tap'ить тільки `urge_log` + `check_ins`.
- **Inline SVG + CSS bars** замість chart library — consistent з рештою app, нуль нових deps. Бандл уже 920KB.
- **Pure aggregation у `insightsCalc.ts`** окремо від UI — unit-testable, легше iterate на formulae.
- **Coach Insights кнопка завжди видима** (не залежить від `isEmpty`). New conversation з'являється тільки при заповненому чаті — обидві кнопки сидять у спільному flex-row контейнері, який рендериться завжди.
- **Free user entry route = `View.AI_COACH`** (НЕ окремий `View.INSIGHTS_PROGATE`). Pro tier включає Coach/Urge Help/Insights одним пакетом — апселл вже існує.
- **Min sample threshold для "most effective"** = **3 tries** на action. Менше → action не показується у топ-3.
- **Empty state threshold**: 0 urges → hero illustration + copy, NO empty cards. Partial data → показати тільки cards для яких є дані, решта замінити "Need at least N sessions" inline.
- **Intensity trend** — monthly aggregation з `urge_log.endedAt`. Якщо <2 months даних — fallback на "Not enough data yet".
- **Mobile responsive** — grid `grid-cols-1 md:grid-cols-2` для cards.

## Tasks

- [x] 🟩 **Step 1: Types & View enum**
  - [x] 🟩 Додати `INSIGHTS = 'INSIGHTS'` до `View` enum у `webapp/types.ts`

- [x] 🟩 **Step 2: Pure aggregation library `insightsCalc.ts`**
  - [x] 🟩 Створити `webapp/src/lib/insightsCalc.ts`
  - [x] 🟩 `topEffectiveActions(log, minTries=3, limit=3)` → `{ id, title, successRate, tries }[]`
  - [x] 🟩 `actionEffectivenessAll(log, minTries=3)` → full ranked table
  - [x] 🟩 `timeOfDayBuckets(log)` → `{ morning, afternoon, evening, lateNight }` counts (5-12 / 12-17 / 17-22 / 22-5)
  - [x] 🟩 `outcomeBreakdown(log)` → `{ passed, stillHere, escalated, total }`
  - [x] 🟩 `bestStreak(checkIns)` → number (longest consecutive CLEAN run)
  - [x] 🟩 `topFeelings(log, limit=3)` → `{ id, label, count, pct }[]`
  - [x] 🟩 `monthlyIntensityTrend(log)` → `{ month: 'YYYY-MM', avgIntensity, sampleSize }[]` (skip months with 0 samples)
  - [x] 🟩 Усі функції pure + take `UrgeLogEntry[]` / `CheckIn[]` як input, return plain data (no React)

- [x] 🟩 **Step 3: `Insights.tsx` page component (achievement cards)**
  - [x] 🟩 Створити `webapp/components/Insights.tsx` (page-level)
  - [x] 🟩 Props: `urgeLog: UrgeLogEntry[]`, `checkIns: CheckIn[]`
  - [x] 🟩 Reuse `flex-1 overflow-y-auto pb-28 md:pb-8` layout pattern (як Dashboard)
  - [x] 🟩 Hero блок з `CoachLighthouse` (або новий HeroVariant — поки використати existing)
  - [x] 🟩 Grid `grid-cols-1 md:grid-cols-2 gap-4` для 8 cards
  - [x] 🟩 Card subcomponent з consistent layout: Lucide icon + uppercase label + big metric + one-line context
  - [x] 🟩 Card colors з `URGE_CATEGORY_META` (emerald/teal/sky/indigo тон per insight)
  - [x] 🟩 `animate-in fade-in slide-in-from-bottom-2` на mount, stagger через `animationDelay`
  - [x] 🟩 Empty state: `urgeLog.length === 0` → hero + motivational copy + return early
  - [x] 🟩 Partial state: per-card "Need at least N sessions" коли дані недостатні

- [x] 🟩 **Step 4: Inline SVG / CSS visualizations всередині cards**
  - [x] 🟩 Time-of-day bar chart: 4 vertical bars з висотою proportional до count (pure CSS h-[...])
  - [x] 🟩 Passed vs Escalated split bar: flex row з emerald + rose segments
  - [x] 🟩 Intensity trend line: inline SVG polyline з points scaled до viewBox

- [x] 🟩 **Step 5: Coach tab Insights button**
  - [x] 🟩 Модифікувати `AICoach.tsx` — створити flex-row контейнер що завжди рендериться (не gated на `!isEmpty`)
  - [x] 🟩 Insights кнопка зліва: Lucide `Sparkles` (або `BarChart3`) icon + "Insights" text
  - [x] 🟩 Той же стиль `animate-coach-reset-pulse` + `bg-white border-2 hover:bg-purple-50`
  - [x] 🟩 Click handler: `onChangeView(View.INSIGHTS)` (новий prop, plumbed від App)
  - [x] 🟩 Додати `onChangeView` prop до `AICoachProps`

- [x] 🟩 **Step 6: Dashboard day-detail modal Insights button**
  - [x] 🟩 Модифікувати Clean/Slip banner у `Dashboard.tsx` — flex row з heading зліва + Insights button справа
  - [x] 🟩 Кнопка висота = height "Clean Day"/"Slip Day" heading
  - [x] 🟩 Той же `animate-coach-reset-pulse` стиль
  - [x] 🟩 Click → `onChangeView(View.INSIGHTS)` (existing `onChangeView` prop)
  - [x] 🟩 Закрити modal перед navigation (`setSelectedDate(null)` + changeView)

- [x] 🟩 **Step 7: App.tsx wiring**
  - [x] 🟩 Додати `{currentView === View.INSIGHTS && ...}` render block
  - [x] 🟩 Paid: `<Insights urgeLog={urgeLogEntries} checkIns={checkIns} />`
  - [x] 🟩 Free: `<ProGate featureName="Insights" featureDescription="..." userEmail={userEmail} onUnlocked={grantUpsellAccess} />`
  - [x] 🟩 Прокинути `onChangeView={changeView}` до AICoach

- [x] 🟩 **Step 8: Typecheck + build**
  - [x] 🟩 `tsc --noEmit` clean
  - [x] 🟩 `npm run build` clean (bandle warning баланс — accept ~5KB grow от cards/SVG)

- [ ] 🟥 **Step 9: Manual scenarios** (user smoke-test on deploy)
  - [ ] 🟥 Paid user no data → empty state hero + copy
  - [ ] 🟥 Paid user з 1-2 urges → partial cards з "Need more" fallback
  - [ ] 🟥 Paid user з достатніми даними → всі 8 cards рендеряться correctly
  - [ ] 🟥 Free user click Insights з Coach → ProGate
  - [ ] 🟥 Free user click Insights з day-modal → ProGate
  - [ ] 🟥 Mobile viewport (375px) — cards stack vertically, кнопки fit
  - [ ] 🟥 Lifetime stat verification: spot-check 2 cards проти hand-calc з urge_log
