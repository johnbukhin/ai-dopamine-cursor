# Paywall Mobile Layout Audit

## Executive Summary

The paywall component has a **critical gap in mobile-specific styling**. The design uses `flex`, `grid`, and `display: flex` layouts without dedicated mobile overrides for key viewport sizes (320px, 375px, 428px). While there are global media queries for the quiz screens, **paywall-specific elements are excluded from them** using `.screen:not(.paywall-screen)` selectors. This creates potential horizontal overflow, text wrapping issues, and layout shifts on compact mobile devices.

---

## 1. File Inventory & Key Sections

### `funnel/app.js`
| Function | Lines | Description |
|---|---|---|
| `Screens.paywall()` | ~2808–2955 | Main orchestrator, 20+ sections |
| `Components.paywallHeader()` | ~1141–1153 | Fixed sticky header: timer + CTA |
| `Components.pricingCard()` | ~1241–1290 | Radio-button row card with flex layout |
| `Components.pricingTiers()` | ~1293–1303 | Vertical stack container |
| `Components.beforeAfter()` | ~1485–1530 | Grid comparison: `1fr auto 1fr` |
| `Components.promoTicket()` | ~1554–1585 | Flex ticket with split MM : SS timer |
| `Components.contextTags()` | ~1594–1616 | Two-tag flex row |
| `Components.moneyBackGuarantee()` | ~1413–1433 | Card with absolute-positioned medal |
| `Components.secondCtaBlock()` | ~1764–1780 | Full CTA repeat: headline + ticket + tags + pricing |

### `funnel/styles.css`
| Section | Approx. Lines |
|---|---|
| `:root` design tokens | 9–65 |
| Paywall header | 2739–2787 |
| Before/After | 2795–2950 |
| Promo ticket | 2936–3022 |
| Context tags | 3024–3062 |
| Pricing cards (redesign) | 3065–3225 |
| Stats section | 3295–3356 |
| Contrast lists | 3358–3440 |
| Money-back card | 3448–3495 |
| Pixel-perfect fixes (Issue #17) | 3568–3801 |

---

## 2. Design System & CSS Variables

### Colors
```css
--color-primary: #5B5BD6
--color-primary-hover: #4A4AC4
--color-primary-light: #E8E8F9
--color-background: #F8F8FC
--color-surface: #FFFFFF
--color-text-primary: #1A1A2E
--color-text-secondary: #6B6B80
--color-text-muted: #9999AA
--color-success: #10b981
--color-urgent: #ef4444
--color-border: #E5E5EE
```

### Spacing Scale
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px    /* standard section padding */
--spacing-lg: 24px    /* item margins, section spacing */
--spacing-xl: 32px
--spacing-2xl: 48px
```

### Border Radius
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
```

### Typography
```css
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-md: 16px
--font-size-lg: 20px
--font-size-xl: 24px
--font-size-2xl: 32px
```

---

## 3. Current Media Breakpoints

| Breakpoint | Rule | Applies to Paywall? |
|---|---|---|
| `max-width: 768px` | Global paywall — `pricing-tiers → 1fr`, stats → 1fr | ✅ Yes |
| `max-width: 480px` | Scattered: before/after, headlines, context-tags, per-day badge | ✅ Yes (partial) |
| `max-width: 374px` | Non-paywall screens only (`.screen:not(.paywall-screen)`) | ❌ No |
| `min-width: 375px and max-width: 428px` | Non-paywall screens only | ❌ No |
| `min-width: 429px and max-width: 768px` | Non-paywall screens only | ❌ No |

### Critical Gap
**The paywall has NO coverage for 320px–479px viewports.** Most iPhone users (375–428px) see paywall with desktop/tablet-sized styles.

---

## 4. Per-Section Issues

### A. Paywall Header (`.paywall-header`)
- `padding: 10px 16px` — no mobile override
- CTA button `white-space: nowrap` + 13px font may exceed safe tap zone on 375px
- Timer + button need tighter gap at compact sizes

**Fix:**
```css
@media (max-width: 430px) {
  .paywall-header { padding: 8px 12px; gap: 8px; }
  .paywall-header__cta { padding: 7px 14px; font-size: 12px; }
  .paywall-header__timer .countdown-timer__digits { font-size: 13px; }
}
```

---

### B. Pricing Cards (`.pricing-card`, `.pricing-card__per-day-badge`)
- `.pricing-card__per-day-badge { min-width: 72px }` — fixed minimum
- At 320px: content width ≈ 288px; radio (20px) + gap (12px) + badge (72px) = 104px minimum before text, leaving ~184px for plan name + prices — tight
- No mobile override under 480px

**Fix:**
```css
@media (max-width: 430px) {
  .pricing-card { padding: 12px 14px; gap: 10px; }
  .pricing-card__name { font-size: 14px; }
  .pricing-card__per-day-badge { min-width: 64px; padding: 4px 8px; }
  .per-day__integer { font-size: 20px; }
}
@media (max-width: 374px) {
  .pricing-card__per-day-badge { min-width: 60px; }
  .per-day__integer { font-size: 18px; }
  .per-day__label { font-size: 9px; }
}
```

---

### C. Context Tags (`.context-tag`)
- `min-width: 140px` — two tags = 280px + 8px gap = 288px minimum
- At 320px: container = 288px → no room for gap → tags overflow or squish
- Current stacking breakpoint is 480px (too wide)

**Fix:** Lower stacking breakpoint to 374px:
```css
@media (max-width: 374px) {
  .context-tag { flex: 0 0 100%; }
}
```

---

### D. Promo Ticket (`.promo-ticket__code`, `.countdown-mins`)
- `font-size: 15px` monospace code pill may overflow at 320px
- `countdown-mins / countdown-secs` at `font-size: 22px` — large for 320px

**Fix:**
```css
@media (max-width: 374px) {
  .promo-ticket__code { font-size: 13px; }
  .countdown-mins, .countdown-secs { font-size: 18px; }
}
```

---

### E. Before/After Images (`.ba-image`)
- `max-width: 150px` with no override until 480px
- At 320px: two 150px images + arrow + gaps = ~330px+ → horizontal overflow
- Current 480px fix (`max-width: 120px`) fires too early for tablets

**Fix:** Split into two breakpoints:
```css
@media (max-width: 429px) {
  .ba-image { max-width: 130px; }
}
@media (max-width: 374px) {
  .ba-image { max-width: 100px; }
}
```

---

### F. Stats Section (`.stat-callout__pct`)
- `font-size: 28px; min-width: 58px` — OK at 375px, tight at 320px
- Current 480px fix reduces to 24px/50px ✓ adequate

**Additional fix for 320px:**
```css
@media (max-width: 374px) {
  .stat-callout__pct { font-size: 22px; min-width: 45px; }
}
```

---

### G. Paywall Container (`.paywall`)
- `max-width: 800px; margin: 0 auto; padding-bottom: 32px` — **no side padding**
- Each sub-section defines its own padding independently (e.g. `.before-after { padding: 24px 16px }`) causing inconsistency

**Fix:**
```css
.paywall {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-md) var(--spacing-xl);
}
@media (max-width: 374px) {
  .paywall { padding: 0 12px var(--spacing-lg); }
}
```

---

## 5. Recommended Fixes (Priority Order)

### Priority 1 — Add 375–429px paywall breakpoint (~50 lines CSS)
Insert after line 2731 in `styles.css`:
```css
@media (min-width: 375px) and (max-width: 429px) {
  .paywall-header { padding: 8px 12px; gap: 8px; }
  .paywall-header__cta { padding: 7px 14px; font-size: 12px; }
  .paywall-screen .content { padding-top: 60px; }
  .paywall-headline { font-size: 18px; }
  .pricing-card { padding: 12px 14px; gap: 10px; }
  .pricing-card__name { font-size: 14px; }
  .pricing-card__per-day-badge { min-width: 64px; padding: 4px 8px; }
  .per-day__integer { font-size: 20px; }
  .per-day__currency, .per-day__decimal { font-size: 10px; }
  .context-tag { padding: 9px 12px; min-width: 130px; }
  .promo-ticket__code { font-size: 14px; }
  .ba-image { max-width: 130px; }
  .stat-callout__pct { font-size: 24px; min-width: 50px; }
}
```

### Priority 2 — Add sub-375px paywall breakpoint (~60 lines CSS)
```css
@media (max-width: 374px) {
  .paywall-header { padding: 8px 10px; gap: 6px; }
  .paywall-header__cta { padding: 6px 12px; font-size: 11px; }
  .paywall-screen .content { padding-top: 56px; }
  .paywall-headline { font-size: 17px; margin-bottom: 16px; }
  .pricing-card { padding: 12px 12px; gap: 8px; }
  .pricing-card__name { font-size: 13px; }
  .pricing-card__per-day-badge { min-width: 60px; padding: 3px 6px; }
  .per-day__integer { font-size: 18px; }
  .per-day__label { font-size: 9px; }
  .context-tag { flex: 0 0 100%; padding: 8px 10px; }
  .promo-ticket__top { padding: 10px 12px; font-size: 13px; }
  .promo-ticket__code { font-size: 13px; }
  .countdown-mins, .countdown-secs { font-size: 18px; }
  .ba-image { max-width: 100px; }
  .ba-metric__row { gap: 8px; }
  .stat-callout__pct { font-size: 22px; min-width: 45px; }
}
```

### Priority 3 — Standardize `.paywall` container padding (5 lines)
```css
.paywall {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-md) var(--spacing-xl);
}
```

### Priority 4 — Split before/after image breakpoints (8 lines)
```css
@media (max-width: 429px) { .ba-image { max-width: 130px; } }
@media (max-width: 374px) { .ba-image { max-width: 100px; } }
```

---

## 6. Summary Table

| Issue | Severity | Affected Devices | Fix |
|---|---|---|---|
| No 375–429px paywall breakpoint | **HIGH** | iPhone SE+, 12 mini, 13, 14 | Priority 1 |
| No sub-375px paywall breakpoint | **HIGH** | iPhone SE, budget Android | Priority 2 |
| Pricing badge `min-width: 72px` | **MED** | 320px — badge squishes text | Priority 1+2 |
| Context tags `min-width: 140px` | **MED** | 320px — tags overflow | Priority 2 |
| Before/after breakpoint at 480px | **MED** | 375–429px — images oversized | Priority 4 |
| No `.paywall` side padding | **LOW** | All sizes — inconsistent margins | Priority 3 |

---

## 7. Testing Checklist

- [ ] iPhone SE (320px) — pricing cards, context tags, promo ticket
- [ ] iPhone 12 mini / SE+ (375px) — header, pricing, before/after
- [ ] iPhone 13/14 (390px) — full scroll, all sections
- [ ] iPhone 14 Plus (430px) — transition to desktop styles
- [ ] Galaxy S10 (360px) — context tags stacking
- [ ] iPad (768px) — existing breakpoint still applies
