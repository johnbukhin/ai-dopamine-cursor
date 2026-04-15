# Feature Implementation Plan — Issue #17: Paywall UI Redesign

**Overall Progress:** `100%`

## TLDR
Rebuild the paywall screen to match the Liven competitor reference: new sticky minimal header, before/after comparison section, personalized headline, redesigned promo ticket with embedded timer, context tags, radio-button pricing cards, goals checklist, stats arc chart, contrast lists, second CTA block, and restyled FAQ/testimonials/guarantee. Purple color scheme and pricing unchanged.

## Critical Decisions

- **Header**: Paywall gets its own minimal sticky bar (timer + CTA only) — `Screens.paywall()` skips `Components.header()` and renders a dedicated `.paywall-header` instead
- **Timer**: Remove standalone countdown section from content; `CountdownTimer.updateDisplay()` updates both `.paywall-header__timer` and `.promo-ticket__timer` via `querySelectorAll`
- **Age screen**: Add `question_age` as second screen (after `landing`, before `question_1`) — `single_choice` type, no back-compat needed
- **Personalization**: Main challenge from `question_5` first answer; Goal from `question_31` first answer; Age from `question_age`; all with fallbacks
- **Promo code**: Update `generatePromoCode()` to format `Name_MonthYear` (e.g. `John_Apr2026`)
- **Pricing cards**: Redesign to radio-button style stacked vertically; per-day price in right-side grey badge; MOST POPULAR as full-width header bar above card
- **Images**: `assets/before_state.png` and `assets/after_state.png` already generated ✅
- **Second CTA**: Duplicate pricing tiers + CTA button rendered as a separate section after testimonials — reuses existing component functions, no new state

---

## Tasks

- [x] 🟩 **Step 1: JSON — Add age question + update paywall data**
  - [x] 🟩 Insert `question_age` screen (id, type: `single_choice`, options: 18-24, 25-34, 35-44, 45-54, 55+) as second item in `screens` array (after `landing`)
  - [x] 🟩 Add `beforeAfter` block to paywall JSON (metric rows: dopamine_system, self_control, mental_clarity with before/after labels)
  - [x] 🟩 Add `contextTags` block (mainChallenge mapping, goal mapping)
  - [x] 🟩 Add `goalsList` array (8 checklist items)
  - [x] 🟩 Add `contrastLists` block (withoutCompass X-list, withCompass ✓-list)
  - [x] 🟩 Add `legalDisclaimer` string to paywall
  - [x] 🟩 Update `companyInfo` with placeholder (Mind Compass Ltd, London address, support@mind-compass.app)
  - [x] 🟩 Update FAQ questions (replace "Liven" → "Compass", rewrite 4 Qs to dopamine-reset framing, add `?` icon flag)
  - [x] 🟩 Update testimonials (add `handle` field per entry, update author names/copy to reference Compass)

- [x] 🟩 **Step 2: `Components.generatePromoCode()` — append year**
  - [x] 🟩 Change output format from `NAME_APR_50` to `Name_Apr2026` (title-case name, full month abbrev, 4-digit year, no discount suffix)

- [x] 🟩 **Step 3: Paywall sticky header**
  - [x] 🟩 Add `Components.paywallHeader()` renderer — returns `.paywall-header` div with `.paywall-header__timer` span (left) and CTA pill button (right)
  - [x] 🟩 In `Screens.paywall()`, replace `${Components.header()}` with `${Components.paywallHeader(safeId)}`
  - [x] 🟩 Update `CountdownTimer.updateDisplay()` to `querySelectorAll('.countdown-timer__digits')` so all instances update together

- [x] 🟩 **Step 4: New component renderers**
  - [x] 🟩 `Components.beforeAfter(data)` — two-column layout, `before_state.png` / `after_state.png`, metric rows with progress bars
  - [x] 🟩 `Components.personalizedHeadline(ageGroup)` — `Your Dopamine Reset Plan for men {ageGroup} is ready!` with primary-color span on the plan name portion
  - [x] 🟩 `Components.promoTicket(promoCode)` — ticket-style card: top "Your promo code applied!" + tag icon; bottom split: code pill with ✓ | `.countdown-timer__digits` live digits
  - [x] 🟩 `Components.contextTags(mainChallenge, goal)` — two-chip row: brain icon + "Main challenge: X" | target icon + "Goal: X"
  - [x] 🟩 `Components.goalsList(items)` — "Our goals" heading + 8-item green ✓ checklist
  - [x] 🟩 `Components.statsWithChart(stats)` — heading + SVG arc/semicircle chart (3 concentric arcs, 45%/77%/83% labels with dotted lines) + 3 stat callout blocks with bold inline text
  - [x] 🟩 `Components.contrastLists(data)` — "Without Compass" grey ✕ card + "With Compass" green-bordered ✓ card
  - [x] 🟩 `Components.secondCtaBlock(tiers, selectedTierId, ctaText, screenId)` — repeat of pricing + CTA button, reuses `pricingTiers()` and `ctaButton()`
  - [x] 🟩 Update `Components.pricingCard()` — radio button circle left, per-day price badge (grey pill) right, MOST POPULAR as full-width header bar above card (not absolute badge)
  - [x] 🟩 Update `Components.moneyBackGuarantee()` — full bordered card, medal SVG badge bottom-right, "Learn more" link
  - [x] 🟩 Update `Components.faqAccordion()` — change heading to "People often ask", add `?` circle icon badge per question item
  - [x] 🟩 Update `Components.testimonialCard()` — orange stars, `handle` field right-aligned beside author

- [x] 🟩 **Step 5: Rebuild `Screens.paywall()`**
  - [x] 🟩 Read `question_age`, `question_5`, `question_31` from State and map to display strings with fallbacks
  - [x] 🟩 Render sections in order: paywallHeader → beforeAfter → personalizedHeadline → promoTicket → contextTags → pricingTiers → CTA → legalDisclaimer → paymentIcons → goalsList → mediaLogos → statsWithChart → contrastLists → awardBadge → faqAccordion → testimonials → secondCtaBlock → moneyBackGuarantee → companyFooter
  - [x] 🟩 Remove old `countdownTimer` section call (timer now in header + ticket only)

- [x] 🟩 **Step 6: Add `question_age` screen renderer**
  - [x] 🟩 `question_age` uses `screenType: 'single_choice'` in JSON — handled by existing `case 'single_choice':` in Router, no code changes needed

- [x] 🟩 **Step 7: CSS — New paywall styles**
  - [x] 🟩 `.paywall-header` — fixed top bar, flex row, timer color primary, CTA pill
  - [x] 🟩 `.before-after` + `.ba-*` — two-column grid, image containers, metric rows with progress bars (muted left, green right)
  - [x] 🟩 `.paywall-headline` + `.paywall-headline__highlight` — centered, large, primary color span
  - [x] 🟩 `.promo-ticket` + inner classes — ticket card, two-tone split, timer digits + label
  - [x] 🟩 `.context-tags` + `.context-tag__*` — flex row, pill chips, icon + label + value
  - [x] 🟩 `.pricing-card` — updated to radio-button style (flex row, left circle, right badge), MOST POPULAR as top bar, stacked vertical layout
  - [x] 🟩 `.paywall-legal` — small muted text, inline link
  - [x] 🟩 `.goals-list-section` + `.goals-list__*` — section heading, green circle ✓ items with SVG
  - [x] 🟩 `.stats-section` + `.stats-chart` + `.stat-callout__*` — SVG arc chart, callout blocks with large primary-color percentage
  - [x] 🟩 `.contrast-lists` + `.contrast-card__*` — two cards, grey X list vs green-border ✓ list
  - [x] 🟩 `.money-back-card__*` — bordered card, `.guarantee-medal` positioned bottom-right
  - [x] 🟩 FAQ + testimonial style updates (`.faq-q-icon` badge, orange `.testimonial-card__star`, `.testimonial-card__handle`)

- [x] 🟩 **Step 8: Restart server + smoke test**
  - [x] 🟩 Server running at http://localhost:8080/funnel/
  - [x] 🟩 app.js passes `node --check` (no syntax errors)
  - [x] 🟩 All JSON data fields validated (beforeAfter, goalsList, contrastLists, faq, testimonials, statistics, moneyBackGuarantee)
