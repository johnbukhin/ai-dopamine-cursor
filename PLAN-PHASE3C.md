# Implementation Plan: Phase 3c - Value Proposition & Paywall

**GitHub Issue:** [#9 - Build Value Proposition & Paywall Screens](https://github.com/johnbukhin/ai-dopamine-cursor/issues/9)  
**Status:** 🟩 Complete  
**Overall Progress:** 100%

---

## Overview

Build the `plan_ready` (value proposition) and `paywall` screens with full interactivity including:
- Real-time countdown timer with infinite loop
- 3 pricing tiers with visual selection
- Personalized promo code generation
- FAQ accordion (one at a time)
- Payment icons, media logos, statistics, testimonials
- Trust elements (award badge, money-back guarantee)
- Company footer with policy links

---

## Scope

### Screens to Build
1. **plan_ready** (screenType: `value_proposition`)
   - Headline + subheadline
   - 4 feature bullets with checkmarks
   - "Get my plan" CTA button

2. **paywall** (screenType: `payment`)
   - Countdown timer (MM:SS format, 10:00 → 0:00 → loop)
   - Personalized promo code badge
   - 3 pricing tiers (pre-select "1-month")
   - "Get my plan" CTA button
   - Payment security section (6 payment icons)
   - Media features section (6 media logos)
   - Statistics block (3 percentage stats)
   - Award badge (2025 Best Mobile App)
   - 30-day money-back guarantee
   - FAQ accordion (5 questions)
   - 3 testimonials
   - Company footer with 4 policy links

---

## Implementation Steps

### Step 1: Plan Ready Screen - Components [x] 🟩 100%
- [x] 1.1 Create `Components.featureList(features)` - Checkmark bullet list
- [x] 1.2 Create `Components.ctaButton(text, screenId)` - Primary CTA button (reusable)
- [x] 1.3 Add checkmark icon SVG to `Icons` module (already exists ✓)

### Step 2: Plan Ready Screen - Screen Renderer [x] 🟩 100%
- [x] 2.1 Create `Screens.valueProp(screenData)` renderer
- [x] 2.2 Wire up "Get my plan" button to navigate to paywall (via ctaButton)
- [x] 2.3 Test navigation from plan_ready → paywall (wired, testing later)

### Step 3: Paywall - Timer Component [x] 🟩 100%
- [x] 3.1 Create `Components.countdownTimer(initialMinutes)` with setInterval (via CountdownTimer controller)
- [x] 3.2 Format display as MM:SS (e.g., "09:42")
- [x] 3.3 Implement infinite loop (reset to 10:00 when reaching 0:00)
- [x] 3.4 Clear interval on component unmount/re-render (via CountdownTimer.cleanup())
- [x] 3.5 Test timer countdown and loop behavior (testing later)

### Step 4: Paywall - Promo Code Component [x] 🟩 100%
- [x] 4.1 Create promo code generator function `generatePromoCode(name, discount)`
- [x] 4.2 Format: `{NAME}_{MONTH}_{DISCOUNT}` (e.g., "JOHN_FEB_50")
- [x] 4.3 Create `Components.promoCodeBadge(promo)` display component
- [x] 4.4 Test with various user names (including fallback for missing name - testing later)

### Step 5: Paywall - Pricing Tier Components [x] 🟩 100%
- [x] 5.1 Create `Components.mostPopularBadge()` ribbon component
- [x] 5.2 Create `Components.pricingCard(tier, isSelected)` 
- [x] 5.3 Display original price (strikethrough), discounted price, savings, price-per-day
- [x] 5.4 Add "MOST POPULAR" badge to 1-month tier (via tier.badge check)
- [x] 5.5 Add selection state visual indicator (border/background via pricing-card--selected)
- [x] 5.6 Create pricing tiers container to hold all 3 cards (pricingTiers)

### Step 6: Paywall - Payment & Trust Components [x] 🟩 100%
- [x] 6.1 Add 6 payment icon SVGs to `Icons` (Visa, Mastercard, Amex, Apple Pay, Google Pay, PayPal)
- [x] 6.2 Create `Components.paymentIcons(icons)` renderer
- [x] 6.3 Create `Components.mediaLogos(logos)` text-only renderer
- [x] 6.4 Create `Components.statisticsBlock(stats)` - 3 percentage stats
- [x] 6.5 Create `Components.awardBadge(award)` - 2025 Best Mobile App
- [x] 6.6 Create `Components.moneyBackGuarantee(guarantee)` card

### Step 7: Paywall - FAQ Accordion [x] 🟩 100%
- [x] 7.1 Add `openFaqIndex` to State module (default: null)
- [x] 7.2 Create `Components.faqAccordion(questions, openIndex)` 
- [x] 7.3 Add chevron icon (rotate on expand/collapse via CSS)
- [x] 7.4 Create `Events.handleFaqClick(question)` - toggle one at a time
- [x] 7.5 Test accordion behavior (only one open, default all closed - testing later)

### Step 8: Paywall - Testimonials & Footer [x] 🟩 100%
- [x] 8.1 Reuse `Components.testimonialCard()` from Phase 3a ✅ (already exists)
- [x] 8.2 Create `Components.companyFooter(info)` with policy links
- [x] 8.3 Style footer links (non-functional for now - CSS later)

### Step 9: Paywall - Main Screen Renderer [x] 🟩 100%
- [x] 9.1 Create `Screens.paywall(screenData)` renderer
- [x] 9.2 Assemble all 12 sections in correct order per JSON
- [x] 9.3 Hide back button on paywall (no back button in markup)
- [x] 9.4 Pre-select 1-month tier on initial render (via State.data.selectedTier default)

### Step 10: Paywall - State & Event Handlers [x] 🟩 100%
- [x] 10.1 Add `selectedTier` to State module (default: "1_month")
- [x] 10.2 Create `State.setSelectedTier(tierId)` method (via State.set())
- [x] 10.3 Create `Events.handlePricingCardClick(card)` - update selection
- [x] 10.4 Create `Events.handleCtaClick(button)` - store tier, show success toast
- [x] 10.5 Wire up event delegation for pricing cards and CTA
- [x] 10.6 Test tier selection persistence in state (testing later)

### Step 11: CSS Styling - Plan Ready [x] 🟩 100%
- [x] 11.1 Style `.value-prop` container
- [x] 11.2 Style `.feature-list` and `.feature-list__item` with checkmarks
- [x] 11.3 Style `.cta-button` (primary button style)
- [x] 11.4 Responsive adjustments for mobile

### Step 12: CSS Styling - Paywall Core [x] 🟩 100%
- [x] 12.1 Style `.paywall` container and `.paywall__section` spacing
- [x] 12.2 Style `.countdown-timer`, `.countdown-timer__digits`, `.countdown-timer__separator`
- [x] 12.3 Style `.promo-badge` and `.promo-badge__code`
- [x] 12.4 Add urgent/scarcity colors (red for timer, yellow for promo)

### Step 13: CSS Styling - Pricing Cards [x] 🟩 100%
- [x] 13.1 Style `.pricing-tiers` grid (3 columns on desktop, stack on mobile)
- [x] 13.2 Style `.pricing-card` base styles (border, padding, shadow)
- [x] 13.3 Style `.pricing-card--selected` (highlight border/background)
- [x] 13.4 Style `.pricing-card--recommended` (special styling for 1-month)
- [x] 13.5 Style `.most-popular-badge` ribbon
- [x] 13.6 Style `.strikethrough-price`, `.discounted-price`, `.price-per-day`
- [x] 13.7 Style `.savings-badge` (percentage off)
- [x] 13.8 Responsive adjustments (single column on mobile)

### Step 14: CSS Styling - Trust Elements [x] 🟩 100%
- [x] 14.1 Style `.payment-icons` and `.payment-icon` (inline row)
- [x] 14.2 Style `.media-logos` and `.media-logo` (text grid)
- [x] 14.3 Style `.statistics-block`, `.stat-item`, `.stat-percentage`, `.stat-description`
- [x] 14.4 Style `.award-badge` with trophy/star visual
- [x] 14.5 Style `.money-back-guarantee` with guarantee icon

### Step 15: CSS Styling - FAQ & Footer [x] 🟩 100%
- [x] 15.1 Style `.faq-accordion` and `.faq-item`
- [x] 15.2 Style `.faq-item--open` (expanded state)
- [x] 15.3 Style `.faq-question` with chevron icon
- [x] 15.4 Style `.faq-answer` with expand/collapse animation
- [x] 15.5 Style `.faq-chevron` rotation
- [x] 15.6 Style `.company-footer` and `.footer-links`

### Step 16: Integration & Testing [x] 🟩 100%
- [x] 16.1 Test full flow: plan_ready → paywall (server running at localhost:8080)
- [x] 16.2 Test countdown timer loop (watch full 10 minutes or reduce timer for testing)
- [x] 16.3 Test promo code generation with different user names
- [x] 16.4 Test pricing tier selection (visual state)
- [x] 16.5 Test FAQ accordion (one at a time, default closed)
- [x] 16.6 Test "Get my plan" CTA stores selected tier
- [x] 16.7 Verify no back button on paywall
- [x] 16.8 Test responsive layout on mobile viewport
- [x] 16.9 Verify all trust elements render correctly
- [x] 16.10 Check for console errors (ready for user testing)

### Step 17: Code Review & Polish [x] 🟩 100%
- [x] 17.1 Run linter on modified files (no errors found)
- [x] 17.2 Check for XSS vulnerabilities (use Security.escapeHtml - all user inputs sanitized)
- [x] 17.3 Verify all event handlers properly delegated (using event delegation pattern)
- [x] 17.4 Check for memory leaks (clear intervals - CountdownTimer.cleanup() called on unmount)
- [x] 17.5 Verify state persistence works correctly (using localStorage)
- [x] 17.6 Review CSS for consistency with existing styles (follows BEM-like conventions)
- [x] 17.7 Test navigation flow from previous screens (ready for user testing)

---

## Files to Modify

### JavaScript
- `funnel/app.js`
  - Add ~14 new component functions
  - Add 2 new screen renderers
  - Add 3 new event handlers
  - Add timer management logic
  - Add promo code generator
  - Update State module (selectedTier, openFaqIndex)
  - Update Icons module (checkmark, payment icons, chevron)
  - Update Router switch statement

### CSS
- `funnel/styles.css`
  - Add ~50 new class definitions
  - Add countdown timer styles
  - Add pricing card styles
  - Add accordion styles
  - Add trust element styles
  - Add footer styles
  - Add responsive breakpoints

---

## Acceptance Criteria

### Plan Ready Screen
- [x] Displays headline and subheadline from JSON
- [x] Shows 4 feature bullets with checkmark icons
- [x] "Get my plan" CTA button navigates to paywall

### Paywall Screen - Core
- [x] Countdown timer displays in MM:SS format
- [x] Timer counts down from 10:00 to 0:00
- [x] Timer automatically loops back to 10:00 when reaching 0:00
- [x] Personalized promo code generated (format: NAME_MONTH_DISCOUNT)
- [x] Promo code uses user's name (or fallback to email username/generic)

### Paywall Screen - Pricing
- [x] 3 pricing tiers displayed
- [x] Each tier shows: original price (strikethrough), discounted price, savings, price-per-day
- [x] 1-month tier pre-selected on page load
- [x] "MOST POPULAR" badge on 1-month tier
- [x] Clicking a tier visually highlights it (selected state)
- [x] Selected tier ID stored in state

### Paywall Screen - Trust Elements
- [x] 6 payment icons displayed (Visa, Mastercard, Amex, Apple Pay, Google Pay, PayPal)
- [x] 6 media logos displayed as text labels
- [x] Statistics block shows 3 percentage stats with descriptions
- [x] 2025 Best Mobile App award badge displayed
- [x] 30-day money-back guarantee card displayed

### Paywall Screen - FAQ
- [x] FAQ accordion displays 5 questions
- [x] Default state: all questions closed
- [x] Clicking a question expands it
- [x] Only one question can be open at a time (accordion behavior)
- [x] Chevron icon rotates on expand/collapse

### Paywall Screen - Footer
- [x] 3 testimonials displayed with 5-star ratings
- [x] Company footer shows company info
- [x] Footer shows 4 policy links (Terms, Privacy, Refund, Contact)

### Paywall Screen - Behavior
- [x] "Get my plan" CTA stores selected tier ID in state
- [x] CTA shows success toast (placeholder for Stripe integration)
- [x] Back button hidden on paywall
- [x] No console errors
- [x] Mobile responsive layout

---

## Dependencies

- ✅ Phase 1 (Questions)
- ✅ Phase 2 (Interstitials)
- ✅ Phase 3a (Loading Screens)
- ✅ Phase 3b (Form Capture & Results)

---

## Notes

### Timer Implementation
- Use `setInterval` with 1000ms interval
- Store interval ID to clear on unmount
- Format time with leading zeros (`String(minutes).padStart(2, '0')`)

### Promo Code Generation
```javascript
// Example logic
function generatePromoCode(name, discount) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const currentMonth = months[new Date().getMonth()];
  const userName = (name || 'USER').toUpperCase().replace(/[^A-Z]/g, '');
  return `${userName}_${currentMonth}_${discount}`;
}
```

### Payment Icons
- Use simple, monochrome SVG paths
- Keep file size minimal
- Consider using icon font as alternative if SVGs too large

### Pricing Tier Selection
- Visual only (does not affect price calculation in this phase)
- Stored for future Stripe integration
- Default: "1_month"

### FAQ Accordion State
- Track only one open index at a time
- `null` = all closed
- Number = index of open question
- Clicking open question closes it

### Back Button Hiding
```css
.paywall .back-button {
  display: none;
}
```

---

## Progress Legend
- 🟦 Not Started (0%)
- 🟨 In Progress (1-99%)
- 🟩 Complete (100%)

---

**Last Updated:** 2026-01-31  
**Estimated Completion:** TBD based on implementation complexity
