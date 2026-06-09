/**
 * Mind Compass — Brand & Creative Context
 *
 * Purpose: machine-readable library used to fine-tune winning creatives from
 * other niches (weight-loss, productivity, finance, fitness, etc.) into
 * Mind Compass equivalents — primarily for Meta (FB/IG) where the word
 * "porn" and explicit framing are not allowed.
 *
 * Consumers (e.g. NanoBanana): use `compliance.euphemism_dictionary` to swap
 * source-ad language, `creative_swap_patterns` to map source visual/copy
 * patterns to Mind Compass equivalents, and the tagged `hooks` / `punchlines`
 * arrays to fill the new ad with on-brand copy. Filter by `tags.angle`,
 * `tags.persona`, `tags.platform`, etc.
 *
 * IMPORTANT: every string in `hooks` and `punchlines` is Meta-compliant
 * (no "porn", "masturbation", "addiction" used as a direct medical claim,
 * no sexual imagery references). The direct-language version lives only on
 * the funnel landing page, not in ads.
 */

export const BRAND_CONTEXT = {
  meta: {
    company_name: "Mind Compass",
    product_name: "Mind Compass",
    product_category: "Self-help app — habit recovery & dopamine reset",
    funnel_type: "Quiz-to-paywall (3-min quiz → personalized 4-week plan)",

    target_geo: ["US", "UK", "CA", "AU", "EU (English-speaking)"],
    primary_language: "English",

    offer: {
      currency: "EUR",
      pricing_tiers: [
        { id: "7_day",  name: "7-Day Plan",   original: "€49.99", discounted: "€10.50", per_day: "€1.50/day", savings: "79% OFF" },
        { id: "1_month", name: "1-Month Plan", original: "€49.99", discounted: "€19.99", per_day: "€0.66/day", savings: "60% OFF", badge: "MOST POPULAR" },
        { id: "3_month", name: "3-Month Plan", original: "€99.99", discounted: "€34.99", per_day: "€0.38/day", savings: "65% OFF" },
      ],
      discount_mechanic: "Scratch card reveals 50% off before paywall",
      payment_methods: ["PayPal", "Apple Pay", "Visa", "Mastercard", "Maestro", "Discover", "Amex"],
      access_type: "Auto-renewing subscription, cancel anytime",
    },

    format_notes: {
      hook_definition: "Longer, ad-ready opener (1–3 sentences). Opens a script or primary text and leads naturally into proof / quiz / offer.",
      punchline_definition: "Short, sticky phrase for on-image text, headline, end-card, or CTA badge. Max ~8 words.",
      script_definition: "Full ad copy frame (problem → mechanism → proof → CTA). Used as a template for video scripts and longer static carousels.",
    },
  },

  /* -------------------------------------------------------------------------
   *  COMPLIANCE — what to say and what to NEVER say in ads
   * ----------------------------------------------------------------------- */
  compliance: {
    platform_rules: {
      meta: "No 'porn', 'pornography', 'masturbation', 'sexual addiction', explicit anatomy, before/after with shame framing, or personal attributes targeting (do NOT say 'you' watching late-night videos as accusation). Use first-person/community framing instead.",
      google: "Similar to Meta, plus avoid medical claims ('cure', 'treat addiction'). Use 'support', 'help', 'tools for'.",
      tiktok: "Native, story-driven. Slightly looser but same forbidden words list applies. Use creator-style POV.",
    },

    forbidden_terms: [
      "porn", "pornography", "pornographic",
      "masturbation", "masturbate",
      "addiction" /* as direct medical claim */,
      "addict",
      "ejaculation", "orgasm",
      "NoFap" /* brand name with community baggage */,
      "relapse" /* clinical, can trigger moderation */,
      "rehab",
      "withdrawal" /* clinical */,
      "cure" /* medical claim */,
      "treat" /* medical claim */,
    ],

    /** Drop-in replacements. NanoBanana: when adapting a source ad that mentions
     *  any forbidden term or explicit framing, swap with one of these. */
    euphemism_dictionary: {
      "porn":                  ["late-night content", "the content", "what plays at 2am", "the videos", "the loop", "the scroll", "high-intensity content"],
      "pornography":           ["high-stimulation content", "the content"],
      "masturbation":          ["the habit", "the private habit", "the routine"],
      "addiction":             ["compulsive pattern", "the loop", "an unhealthy pattern", "dopamine dysregulation"],
      "addict":                ["someone stuck in the loop", "someone caught in the cycle"],
      "relapse":               ["slip back into old patterns", "fall back into the loop"],
      "urge":                  ["urge" /* allowed */, "craving", "pull"],
      "quit porn":             ["break the loop", "reset your dopamine", "take back control"],
      "stop watching":         ["step out of the loop", "cut the cycle"],
      "you watch porn":        ["if you've been stuck in the late-night loop", "if the scroll keeps pulling you back"],
      "before / after":        ["foggy morning vs clear morning", "scattered focus vs sharp focus", "guilt-loop vs guilt-free"],
    },

    safe_framing_patterns: [
      "First-person ('I used to…', 'I broke the loop…')",
      "Community framing ('100,000+ people are…')",
      "Mechanism-led ('Your dopamine system can be retrained…')",
      "Quiz-led ('3-min quiz reveals…')",
      "Hypothetical second-person ('If you've ever woken up foggy…')",
    ],

    avoid_framing_patterns: [
      "Direct accusatory 'you' ('you watch X…', 'you can't stop…')",
      "Shame-based ('admit it', 'be honest with yourself')",
      "Medical claims ('cure', 'treat', 'diagnose')",
      "Religious / moral framing ('sin', 'purity')",
      "Gender stereotypes ('real men don't…')",
    ],
  },

  /* -------------------------------------------------------------------------
   *  POSITIONING
   * ----------------------------------------------------------------------- */
  positioning: {
    one_liner: "A 4-week, expert-designed plan that helps you reset your dopamine system and break the late-night content loop — built on CBT and reviewed by licensed therapists.",
    elevator_pitch:
      "Mind Compass is a self-help app for people whose brains have been rewired by high-stimulation content. A 3-minute quiz builds a personalized recovery plan grounded in Cognitive Behavioral Therapy, so you can rebalance your reward system, regain self-control, and feel like yourself again in about 4 weeks.",
    differentiators: [
      "Personalized 4-week plan, not generic advice",
      "Built on CBT, reviewed by licensed mental health professionals",
      "Evidence-based, drawing on research from Harvard, Oxford, Cambridge",
      "Visible dopamine recovery curve — week-by-week progress",
      "Private, judgment-free, no community shaming",
    ],
  },
} as const;

export type BrandContext = typeof BRAND_CONTEXT;
