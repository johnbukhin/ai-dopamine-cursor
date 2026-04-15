# Create Onboarding Screen

You are creating a new onboarding screen for the Mind Compass funnel app.

## Architecture context

Screens live in one of two places:
- `funnel/funnels/<funnel>/screens.json` — funnel-specific screens (questions, interstitials, loading)
- `funnel/screens/registry.json` — shared screens reusable across multiple funnels (paywall variants, checkout, etc.)

The engine (`funnel/engine/app.js`) renders screens. Each funnel defines its screen order in `funnel/funnels/<funnel>/config.json` as a `sequence` array of screen IDs.

## Naming convention

Screen IDs use the `ob_` prefix and are descriptive and short:
- `ob_age` — age selection screen
- `ob_q_stress` — a question about stress
- `ob_paywall_1` — first paywall variant
- `ob_paywall_2` — second paywall variant (different pricing/copy)
- `ob_interstitial_dopamine` — an educational interstitial about dopamine
- For A/B variants of the same screen: `ob_age_a`, `ob_age_b`

## Your task

1. **Ask the user** (if not already provided in the arguments):
   - What is the screen ID? (suggest one based on description, user can override)
   - What type of screen? (see types below)
   - Which funnel(s) should it appear in? (`v1`, `v2`, both, or global registry)
   - Where in the sequence should it go? (after which existing screen ID)
   - What is the screen content? (question text, options, copy, etc.)

2. **Read the relevant files** before making changes:
   - `funnel/engine/app.js` — to verify the screen type renderer exists and understand what JSON fields it needs
   - The target `screens.json` file — to understand existing screen structure
   - The target `config.json` — to find the right insertion point in the sequence

3. **Create the screen JSON object** with the correct fields for its type (see reference below)

4. **Add it to the right file:**
   - If funnel-specific: add to `funnel/funnels/<funnel>/screens.json`
   - If shared/reusable: add to `funnel/screens/registry.json`

5. **Insert the ID into the sequence** in `funnel/funnels/<funnel>/config.json` at the correct position

6. **Validate** that the new screen ID resolves — run:
   ```bash
   python3 -c "
   import json
   reg = json.load(open('funnel/screens/registry.json'))
   local = json.load(open('funnel/funnels/v1/screens.json'))
   cfg = json.load(open('funnel/funnels/v1/config.json'))
   all_ids = {s['id'] for s in reg + local}
   missing = [sid for sid in cfg['sequence'] if sid not in all_ids]
   print('Missing IDs:', missing or 'NONE')
   "
   ```
   (adjust path for v2 or other funnel)

---

## Screen type reference

### `single_choice` — tap one option, auto-advances
```json
{
  "id": "ob_age",
  "type": "single_choice",
  "screenType": "single_choice",
  "questionNumber": 1,
  "question": "How old are you?",
  "options": [
    { "id": "18_24", "label": "18–24" },
    { "id": "25_34", "label": "25–34" },
    { "id": "35_44", "label": "35–44" },
    { "id": "45_54", "label": "45–54" },
    { "id": "55_plus", "label": "55+" }
  ]
}
```

### `multiple_choice` — select multiple, Continue button
```json
{
  "id": "ob_q_triggers",
  "type": "multiple_choice",
  "screenType": "multiple_choice",
  "questionNumber": 5,
  "question": "What triggers your urges most?",
  "options": [
    { "id": "stress", "label": "Stress" },
    { "id": "boredom", "label": "Boredom" },
    { "id": "loneliness", "label": "Loneliness" }
  ]
}
```

### `likert` — 1–5 rating with icons, auto-advances
```json
{
  "id": "ob_q_confidence",
  "type": "likert",
  "screenType": "likert",
  "questionNumber": 12,
  "question": "How confident do you feel in social situations?",
  "scale": {
    "low": "Not at all",
    "high": "Very confident"
  }
}
```

### `interstitial` — educational/trust screen, Continue button
```json
{
  "id": "ob_interstitial_science",
  "type": "interstitial",
  "screenType": "interstitial",
  "interstitialType": "trust_building",
  "headline": "Science-backed approach",
  "content": {
    "icon": "checkmark",
    "body": "Our method is grounded in neuroscience research.",
    "bullets": ["Clinically validated", "Used by 2.5M people"]
  }
}
```

### `loading` — animated progress screen, auto-advances
```json
{
  "id": "ob_loading_profile",
  "type": "loading",
  "screenType": "loading",
  "loadingType": "profile_creation",
  "headline": "Building your profile...",
  "duration": 4000
}
```

### `form_capture` — text/email input
```json
{
  "id": "ob_email",
  "type": "form_capture",
  "screenType": "form_capture",
  "formType": "email",
  "headline": "Where should we send your plan?",
  "placeholder": "your@email.com"
}
```

### `paywall` — pricing + CTA (uses Issue #17 design)
```json
{
  "id": "ob_paywall_2",
  "type": "paywall",
  "screenType": "payment",
  "headline": "Your Recovery Plan for {gender} {ageGroup} is ready!",
  "beforeAfter": {
    "nowLabel": "Now",
    "goalLabel": "Your Goal",
    "nowImage": "../../assets/before_state.png",
    "goalImage": "../../assets/after_state.png",
    "metrics": [
      { "label": "Self-control", "nowState": "Hijacked", "goalState": "Restored", "nowFill": 0.2, "goalFill": 0.9 }
    ]
  },
  "pricingTiers": [
    {
      "id": "1_month",
      "name": "1-MONTH PLAN",
      "badge": "MOST POPULAR",
      "originalPrice": "$59.99",
      "discountedPrice": "$39.99",
      "pricePerDay": "$1.33/day"
    }
  ],
  "ctaButton": { "text": "GET MY PLAN" },
  "legalDisclaimer": "By clicking 'GET MY PLAN' you agree to auto-renewal. Cancel anytime. See Subscription Policy for details.",
  "goalsList": ["Goal 1", "Goal 2"],
  "contrastLists": {
    "withoutHeadline": "Without Compass",
    "withoutItems": ["Item 1"],
    "withHeadline": "With Compass",
    "withItems": ["Item 1"]
  },
  "trustElements": {
    "paymentSecurity": { "headline": "Pay Safe & Secure", "icons": ["Visa", "Mastercard", "Apple Pay", "PayPal"] },
    "statistics": [
      { "percentage": "83%", "description": "of users improved in 6 weeks" }
    ],
    "moneyBackGuarantee": {
      "headline": "30-Day Money-Back Guarantee",
      "description": "Full refund if you don't see results within 30 days."
    }
  },
  "faq": {
    "headline": "People often ask",
    "questions": [
      { "question": "Is this right for me?", "answer": "Yes, because..." }
    ]
  },
  "testimonials": [
    { "rating": 5, "title": "Life-changing", "content": "...", "author": "user123", "handle": "@user123" }
  ],
  "companyInfo": {
    "name": "Mind Compass Ltd",
    "address": "London, UK",
    "links": ["Terms of Use", "Privacy Policy", "Subscription Policy"]
  }
}
```

---

## Personalization placeholders (usable in any text field)

- `{name}` — user's first name from name capture screen
- `{gender}` — "men" or "women" from landing screen selection
- `{ageGroup}` — e.g. "25–34" from age selection screen

---

## After creating the screen

Tell the user:
- The screen ID and where it was added
- The test URL: `http://localhost:8080/funnel/funnels/<funnel>/` (start server first with the command in CLAUDE.md)
- Remind them to restart the server after any JS/JSON change
