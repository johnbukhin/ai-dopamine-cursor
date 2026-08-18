/* ============================================================================
   Mind Compass — landing v2 shared controller
   ----------------------------------------------------------------------------
   Drives both variants:
     /landing-quiz/    window.LANDING_CONFIG.flow === 'quiz'
     /landing-direct/  window.LANDING_CONFIG.flow === 'direct'

   Backend is the funnel's existing serverless API:
     /api/prices             live multi-currency pricing
     /api/create-checkout    Stripe PaymentIntent for the embedded checkout
     /api/provision-account  Supabase account + session handoff

   Currency + MetaPixel logic mirrors funnel/engine/app.js — keep in sync.
   ============================================================================ */
(function () {
  'use strict';

  const CFG = Object.assign({
    flow: 'direct',
    funnelVersion: 'landing-direct',
    pixelContentName: 'LandingDirect',
    webappUrl: 'https://mind-compass-webapp.vercel.app',
    stripePk: 'pk_live_51RGn19EIAGyjtjbOlAiSpPQ3NnuzFCSg7ReDs1bE1zYzCuNkmZC1HvdT5tsbLu1vzMOLMwYluxHJy6TBbP38rWML00rdVcYbRg',
    contentUrl: '../landing-shared/content.json',
  }, window.LANDING_CONFIG || {});

  const isDev = () => ['localhost', '127.0.0.1'].includes(location.hostname);
  const el = (id) => document.getElementById(id);
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const esc = (s) => {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  };

  // ==========================================================================
  // Icons — inline SVG line set. v1 used emoji here, which is the single
  // loudest "generated page" tell; these also inherit currentColor per theme.
  // ==========================================================================
  const P = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra || ''}</svg>`;
  const ICON = {
    compass: P('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
    lock:    P('<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    check:   P('<path d="m4 12.5 5 5L20 6.5"/>'),
    cross:   P('<path d="M6 6l12 12M18 6 6 18"/>'),
    spark:   P('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
    flame:   P('<path d="M12 2c3 4 6 6 6 10a6 6 0 0 1-12 0c0-2 1-3.5 2-5 .5 1.5 1.5 2 2.5 2 0-3 .5-5 1.5-7z"/>'),
    swirl:   P('<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7a5 5 0 1 1-5 5"/><path d="M12 11a1 1 0 1 0 1 1"/>'),
    fog:     P('<path d="M6 10a5 5 0 0 1 9.7-1.7A4 4 0 0 1 18 16H7a4 4 0 0 1-1-6z"/><path d="M4 20h6M14 20h6"/>'),
    rotate:  P('<path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 20v-6h6"/>'),
    star:    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
    shield:  P('<path d="M12 3 5 6v6c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    chevron: P('<path d="m6 9 6 6 6-6"/>'),
    arrow:   P('<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>'),
    swipe:   P('<path d="M4 12h13"/><path d="m12 7 5 5-5 5"/><path d="M20 8v8"/>'),
    sparkle: P('<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.5 6.5 2.5 2.5M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5"/>'),
    loader:  P('<path d="M12 3v4"/><path d="M12 17v4" opacity=".3"/><path d="M5.6 5.6 8.5 8.5"/><path d="m15.5 15.5 2.9 2.9" opacity=".3"/><path d="M3 12h4" opacity=".6"/><path d="M17 12h4" opacity=".3"/>'),
  };
  const ic = (name) => ICON[name] || '';

  // ==========================================================================
  // Currency — compact port of engine/app.js Currency
  // ==========================================================================
  const Currency = {
    _META: { usd: { symbol: '$' }, eur: { symbol: '€' }, gbp: { symbol: '£' }, cad: { symbol: 'CA$' }, aud: { symbol: 'A$' } },
    PRICES: {},
    _fetched: false,
    _detected: null,

    _fmt(cents, c) { return `${this._META[c]?.symbol || c.toUpperCase()}${(cents / 100).toFixed(2)}`; },
    _perDay(cents, days, c) { return `${this._META[c]?.symbol || ''}${(cents / days / 100).toFixed(2)}/day`; },

    populate(raw) {
      const SUPPORTED = ['usd', 'eur', 'gbp', 'cad', 'aud'];
      const TIERS = [
        { id: '7_day',   introKey: 'intro_7day',   regularKey: 'regular_monthly',   days: 7 },
        { id: '1_month', introKey: 'intro_1month', regularKey: 'regular_monthly',   days: 30 },
        { id: '3_month', introKey: 'intro_3month', regularKey: 'regular_quarterly', days: 90 },
      ];
      const amt = (key, c) => {
        const p = raw[key];
        if (!p) return 0;
        return p.currency_amounts?.[c] ?? p.currency_amounts?.[p.base_currency] ?? 0;
      };
      for (const c of SUPPORTED) {
        const t = {};
        for (const tier of TIERS) {
          t[tier.id] = {
            original: this._fmt(amt(tier.regularKey, c), c),
            discounted: this._fmt(amt(tier.introKey, c), c),
            perDay: this._perDay(amt(tier.introKey, c), tier.days, c),
          };
        }
        this.PRICES[c] = t;
      }
      this._fetched = true;
    },

    fetch() {
      if (this._fetched) return Promise.resolve();
      try {
        const raw = sessionStorage.getItem('_mc_prices_v1');
        if (raw) {
          const { data, ts } = JSON.parse(raw);
          if (Date.now() - ts < 3_600_000) { this.populate(data); return Promise.resolve(); }
        }
      } catch (_) {}
      return fetch('/api/prices')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then(({ prices }) => {
          this.populate(prices);
          try { sessionStorage.setItem('_mc_prices_v1', JSON.stringify({ data: prices, ts: Date.now() })); } catch (_) {}
        })
        .catch(() => { /* keep the static EUR fallback from content.json */ });
    },

    detect() {
      if (this._detected) return this._detected;
      const override = new URLSearchParams(location.search).get('currency');
      if (override && this._META[override.toLowerCase()]) return (this._detected = override.toLowerCase());
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
          if (/^Europe\//.test(tz)) return (this._detected = tz === 'Europe/London' ? 'gbp' : 'eur');
          if (/^Australia\//.test(tz) || tz === 'Pacific/Auckland') return (this._detected = 'aud');
          if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Regina|Halifax|St_Johns|Moncton|Whitehorse|Yellowknife|Dawson)/.test(tz))
            return (this._detected = 'cad');
          return (this._detected = 'usd');
        }
      } catch (_) {}
      return (this._detected = 'eur');
    },

    live(tierId, code) { return this.PRICES[code || this.detect()]?.[tierId] || null; },

    disclaimer(tierId, code) {
      let c = code || this.detect();
      let t = this.PRICES[c]?.[tierId];
      const tail = 'Cancel anytime via aicompass.tech@gmail.com. See our Subscription Policy for details.';
      // If /api/prices never landed, fall back to the static EUR figures rather
      // than a single fixed string — the renewal terms shown must always match
      // the tier the buyer actually has selected.
      if (!t) {
        const s = CONTENT?.pricing?.tiers?.find((x) => x.id === tierId);
        if (!s) return CONTENT?.pricing?.legalDisclaimer || tail;
        t = { original: s.originalPrice, discounted: s.discountedPrice };
        c = 'eur';
      }
      const vat = ['eur', 'gbp'].includes(c) ? ' (prices incl. VAT)' : '';
      const cta = CONTENT?.pricing?.cta || 'Start today';
      if (tierId === '7_day')
        return `By clicking "${cta}", you agree to automatic subscription renewal. First week is ${t.discounted}, then ${t.original}/month${vat}. ${tail}`;
      if (tierId === '3_month')
        return `By clicking "${cta}", you agree to automatic subscription renewal. First 3 months are ${t.discounted}, then ${t.original} every 3 months${vat}. ${tail}`;
      return `By clicking "${cta}", you agree to automatic subscription renewal. First month is ${t.discounted}, then ${t.original}/month${vat}. ${tail}`;
    },
  };

  // ==========================================================================
  // Meta Pixel — content_name carries the variant so the A/B is measurable
  // ==========================================================================
  const Pixel = {
    _value(tierId, c) {
      const cc = (c || 'usd').toLowerCase();
      const raw = Currency.PRICES[cc]?.[tierId]?.discounted || Currency.PRICES.usd?.[tierId]?.discounted || '';
      return parseFloat(raw.replace(/[^0-9.]/g, '')) || 19.99;
    },
    track(ev, params, eventId) {
      if (typeof fbq !== 'function') return;
      if (eventId) fbq('track', ev, params, { eventID: eventId });
      else fbq('track', ev, params);
    },
    viewContent() { this.track('ViewContent', { content_name: CFG.pixelContentName, content_type: 'product' }); },
    lead() { this.track('Lead', { content_name: CFG.pixelContentName }); },
    initiateCheckout(tierId, c) {
      this.track('InitiateCheckout', {
        value: this._value(tierId, c), currency: (c || 'USD').toUpperCase(),
        content_ids: [tierId], content_name: CFG.pixelContentName, num_items: 1,
      });
    },
    purchase(tierId, c, subId) {
      this.track('Purchase', {
        value: this._value(tierId, c), currency: (c || 'USD').toUpperCase(),
        content_ids: [tierId], content_name: CFG.pixelContentName, content_type: 'product',
      }, subId ? `purchase_${subId}` : undefined);
    },
  };

  // ==========================================================================
  // State
  // ==========================================================================
  let CONTENT = null;
  let selectedTier = '1_month';
  let quizResult = null;   // { challenge, stage, goal, answers }

  const QUIZ_KEY = 'mc_landing_quiz_v1';

  function loadQuiz() {
    try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || 'null'); } catch (_) { return null; }
  }
  function saveQuiz(r) {
    try { localStorage.setItem(QUIZ_KEY, JSON.stringify(r)); } catch (_) {}
  }

  const fill = (tpl, r) => String(tpl || '').replace(/\{(\w+)\}/g, (_, k) => r[k] || '');

  // ==========================================================================
  // Renderers
  // ==========================================================================
  function renderHeader(c) {
    el('hdr').innerHTML = `
      <div class="container hdr__inner">
        <a class="hdr__brand" href="#top">${ic('compass')}${esc(c.brand.name)}</a>
        <button class="btn btn--cta btn--sm" data-cta="header">${esc(primaryCtaLabel())}</button>
      </div>`;
  }

  // Before the quiz the button promises the plan, because that is what the
  // click delivers. Once the plan exists the promise is spent: "See my plan"
  // would send a decided buyer back to a card they have already read, so from
  // here on every CTA carries the buying label and lands on the tiers.
  function primaryCtaLabel() {
    if (CFG.flow === 'quiz' && !quizResult) return CONTENT.quiz?.openCta || 'Build my plan';
    return CONTENT.pricing.cta;
  }

  function renderHero(c) {
    const h = c.hero;
    let title = esc(h.headline);
    if (h.headlineAccent) {
      const a = esc(h.headlineAccent);
      title = title.replace(a, `<span class="mark">${a}</span>`);
    }
    el('hero').innerHTML = `
      <div class="container">
        <div class="hero__grid">
          <div class="hero__copy rv">
            <span class="hero__badge">${ic('lock')}${esc(h.eyebrow)}</span>
            <h1 class="hero__title">${title}</h1>
            <p class="hero__sub">${esc(h.subheadline)}</p>
            <div class="hero__actions">
              <button class="btn btn--cta btn--lg" data-cta="hero">${esc(primaryCtaLabel())}${ic('arrow')}</button>
            </div>
            <p class="hero__reassure">${esc(h.reassurance)}</p>
          </div>
          <div class="hero__media rv">
            <span class="hero__blob" aria-hidden="true"></span>
            <img src="${esc(h.image)}" alt="${esc(h.imageAlt)}" width="1406" height="768" fetchpriority="high">
          </div>
        </div>
      </div>`;
  }

  function renderProof(c) {
    el('proof').innerHTML = `
      <div class="container">
        <div class="proof__row">
          ${c.proof.stats.map((s) => `
            <div class="proof__cell">
              <div class="proof__value">${esc(s.value)}${s.isRating ? ic('star') : ''}</div>
              <div class="proof__label">${esc(s.label)}</div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderProblem(c) {
    const p = c.problem;
    el('problem').innerHTML = `
      <div class="container">
        <div class="problem__grid">
          <div class="rv">
            <span class="eyebrow">${esc(p.eyebrow)}</span>
            <h2 class="h2">${esc(p.headline)}</h2>
            <p class="lede">${esc(p.body)}</p>
          </div>
          <ul class="problem__list rv">
            ${p.painPoints.map((t) => `<li class="problem__item">${ic('cross')}<span>${esc(t)}</span></li>`).join('')}
          </ul>
        </div>
      </div>`;

    // The loop lives in its own inverted band directly underneath — one dark
    // stripe is what stops the page reading as an endless light-grey scroll.
    el('loop').innerHTML = `
      <div class="container">
        <div class="loop__label rv">${esc(p.loopLabel)}</div>
        <div class="loop__steps rv">
          ${p.loop.map((s) => `
            <div class="loop__step">
              <span class="loop__icon">${ic(s.icon)}</span>
              <div>
                <h3 class="loop__step-title">${esc(s.title)}</h3>
                <p class="loop__step-body">${esc(s.body)}</p>
              </div>
            </div>`).join('')}
        </div>
        <div class="loop__note rv">${ic('rotate')}${esc(p.loopNote)}</div>
        <div class="loop__break rv">
          <span class="loop__break-label">${esc(p.breakout.label)}</span>
          <p class="loop__break-body">${esc(p.breakout.body)}</p>
        </div>
      </div>`;
  }

  function renderPersonas(c) {
    const p = c.personas;
    el('personas').innerHTML = `
      <div class="container">
        <div class="rv">
          <span class="eyebrow">${esc(p.eyebrow)}</span>
          <h2 class="h2">${esc(p.headline)}</h2>
        </div>
        <div class="personas__grid">
          ${p.items.map((x, i) => `
            <div class="persona rv">
              <div class="persona__idx">0${i + 1}</div>
              <div>
                <h3 class="persona__title">${esc(x.title)}</h3>
                <p class="persona__body">${esc(x.body)}</p>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderHow(c) {
    const h = c.how;
    el('how').innerHTML = `
      <div class="container">
        <div class="rv">
          <span class="eyebrow">${esc(h.eyebrow)}</span>
          <h2 class="h2">${esc(h.headline)}</h2>
        </div>
        <div class="how__steps">
          ${h.steps.map((s, i) => `
            <div class="how__step rv">
              <div class="how__num">0${i + 1}</div>
              <h3 class="how__step-title">${esc(s.title)}</h3>
              <p class="how__step-body">${esc(s.body)}</p>
            </div>`).join('')}
        </div>
        <div class="how__chips rv">
          ${h.chips.map((t) => `<span class="chip">${ic('check')}${esc(t)}</span>`).join('')}
        </div>
      </div>`;
  }

  // --------------------------------------------------------------------------
  // Testimonials. Deliberately motion-free: a CSS multi-column wall on desktop
  // and a native scroll-snap strip on mobile. v1 animated a 6320px-wide flex
  // track with will-change:transform, which iOS Safari promotes to an oversized
  // composited layer that intermittently never paints — that is why three
  // successive "fix the marquee" attempts all failed. Nothing here can do that:
  // no transform, no rAF, no element wider than its own column.
  // --------------------------------------------------------------------------
  const VISIBLE_REVIEWS = 6;

  function renderTestimonials(c) {
    const t = c.testimonials;
    const stars = (n) => Array.from({ length: n }, () => ic('star')).join('');
    const card = (x, i) => `
      <article class="tw__card${i >= VISIBLE_REVIEWS ? ' tw__card--extra' : ''}">
        <div class="tw__stars" aria-label="${x.rating} out of 5">${stars(x.rating)}</div>
        <h3 class="tw__title">${esc(x.title)}</h3>
        <p class="tw__quote">${esc(x.content)}</p>
        <div class="tw__by">
          <span class="tw__name">${esc(x.author)}</span>
          ${x.badge ? `<span class="tw__badge">${esc(x.badge)}</span>` : ''}
        </div>
      </article>`;

    el('testimonials').innerHTML = `
      <div class="container">
        <div class="rv">
          <span class="eyebrow">${esc(t.eyebrow)}</span>
          <h2 class="h2">${esc(t.headline)}</h2>
        </div>
        <div class="tw__wall" id="tw-wall">${t.items.map(card).join('')}</div>
        <div class="tw__progress" aria-hidden="true"><div class="tw__progress-bar" id="tw-bar"></div></div>
        <div class="tw__swipe">${ic('swipe')} Swipe for more</div>
        <div class="tw__more">
          <button class="btn btn--quiet btn--sm" id="tw-more">${esc(t.moreLabel)}</button>
        </div>
        <p class="tw__note">${esc(t.note)}</p>
      </div>`;

    const wall = el('tw-wall');
    const bar = el('tw-bar');
    const more = el('tw-more');

    more.addEventListener('click', () => {
      const open = wall.classList.toggle('tw__wall--open');
      more.textContent = open ? t.lessLabel : t.moreLabel;
    });

    // Mobile progress indicator, driven straight off scrollLeft — no observer,
    // no timers, degrades to a static bar if the browser reports nothing.
    const sync = () => {
      const max = wall.scrollWidth - wall.clientWidth;
      const pct = max > 0 ? (wall.scrollLeft / max) * 78 + 22 : 100;
      bar.style.width = `${Math.min(100, pct)}%`;
    };
    wall.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  function tierCard(t) {
    const p = Currency.live(t.id) || {};
    return `
      <div class="tier ${t.id === selectedTier ? 'tier--on' : ''}" data-tier="${esc(t.id)}"
           role="button" tabindex="0" aria-pressed="${t.id === selectedTier}">
        ${t.badge ? `<span class="tier__badge">${esc(t.badge)}</span>` : ''}
        <span class="tier__radio"></span>
        <div>
          <div class="tier__name">${esc(t.name)}</div>
          <div class="tier__perday" data-perday>${esc(p.perDay || t.pricePerDay)}</div>
          ${t.savings ? `<span class="tier__savings">${esc(t.savings)}</span>` : ''}
        </div>
        <div class="tier__prices">
          <div class="tier__was" data-was>${esc(p.original || t.originalPrice)}</div>
          <div class="tier__now" data-now>${esc(p.discounted || t.discountedPrice)}</div>
        </div>
      </div>`;
  }

  function renderPricing(c) {
    const p = c.pricing;
    el('pricing').innerHTML = `
      <div class="container">
        <div class="rv" style="text-align:center">
          <span class="eyebrow">${esc(p.eyebrow)}</span>
          <h2 class="h2" id="pricing-title">${esc(p.headline)}</h2>
        </div>
        <div id="plan-slot"></div>
        <p class="pricing__anchor rv">${esc(p.anchor)}</p>
        <div class="pricing__goals rv">
          ${p.goals.map((g) => `<div class="pricing__goal">${ic('check')}<span>${esc(g)}</span></div>`).join('')}
        </div>
        <p class="pricing__reason rv">${esc(p.reasonWhy)}</p>
        <div class="tiers rv">${p.tiers.map(tierCard).join('')}</div>
        <div class="pricing__act rv">
          <button class="btn btn--cta btn--block btn--lg" data-action="checkout">${esc(p.cta)}</button>
        </div>
        <div class="pricing__guarantee rv">${ic('shield')}<span>${esc(p.guaranteeLine)}</span></div>
        <p class="pricing__legal" id="pricing-legal">${esc(p.legalDisclaimer)}</p>
      </div>`;
    renderPlanSlot();
  }

  // Quiz variant only: locked prompt before the quiz, personalized card after.
  function renderPlanSlot() {
    const slot = el('plan-slot');
    if (!slot || CFG.flow !== 'quiz') return;
    const q = CONTENT.quiz;
    if (!quizResult) {
      slot.innerHTML = `
        <div class="plan rv" style="text-align:center">
          <span class="plan__eyebrow">${ic('sparkle')}${esc(q.subtitle)}</span>
          <h3 class="plan__title">${esc(q.title)}</h3>
          <button class="btn btn--brand btn--block" data-quiz="open">${esc(q.openCta)}</button>
        </div>`;
      return;
    }
    slot.innerHTML = `
      <div class="plan">
        <span class="plan__eyebrow">${ic('check')}${esc(q.resultEyebrow)}</span>
        <h3 class="plan__title">${esc(fill(q.resultHeadline, quizResult))}</h3>
        <p class="plan__body">${esc(fill(q.resultBody, quizResult))}</p>
        <div class="plan__tags">
          ${q.resultTags.map((t) => `<span class="plan__tag">${esc(fill(t, quizResult))}</span>`).join('')}
        </div>
      </div>`;
    const title = el('pricing-title');
    if (title) title.textContent = fill(q.resultHeadline, quizResult) + ' is ready';
  }

  function renderTrust(c) {
    const t = c.trust;
    el('trust').innerHTML = `
      <div class="container">
        <div class="trust__grid">
          <div class="rv">
            <h3 class="trust__h">${esc(t.privacy.headline)}</h3>
            <ul class="trust__list">
              ${t.privacy.points.map((x) => `<li>${ic('lock')}<span>${esc(x)}</span></li>`).join('')}
            </ul>
          </div>
          <div class="rv">
            <h3 class="trust__h">${esc(t.payment.headline)}</h3>
            <div class="paysec">${t.payment.icons.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
          </div>
          <div class="trust__sci rv sci" id="sci">
            <h3 class="trust__h">${esc(t.science.headline)}</h3>
            <p class="sci__summary">${esc(t.science.summary)}</p>
            <button class="sci__toggle" id="sci-toggle" aria-expanded="false">
              ${esc(t.science.toggleLabel)}${ic('chevron')}
            </button>
            <div class="sci__body" id="sci-body">
              ${t.science.points.map((p) => `
                <div class="sci__point">
                  <div class="sci__claim">${esc(p.claim)}</div>
                  <p class="sci__detail">${esc(p.detail)}</p>
                  <span class="sci__source">${esc(p.source)}</span>
                </div>`).join('')}
              <p class="sci__disclaimer">${esc(t.science.disclaimer)}</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderFaq(c) {
    const f = c.faq;
    el('faq').innerHTML = `
      <div class="container container--narrow">
        <div class="rv">
          <span class="eyebrow">${esc(f.eyebrow)}</span>
          <h2 class="h2">${esc(f.headline)}</h2>
        </div>
        <div class="faq__list">
          ${f.questions.map((q) => `
            <div class="faq__item">
              <button class="faq__q" aria-expanded="false">${esc(q.question)}</button>
              <div class="faq__a"><p>${esc(q.answer)}</p></div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderFinal(c) {
    const f = c.finalCta;
    el('final').innerHTML = `
      <div class="container">
        <h2 class="final__title rv">${esc(f.headline)}</h2>
        <p class="final__sub rv">${esc(f.subheadline)}</p>
        <button class="btn btn--cta btn--lg rv" data-cta="final">${esc(primaryCtaLabel())}${ic('arrow')}</button>
      </div>`;
  }

  function renderFooter(c) {
    const f = c.footer;
    el('ftr').innerHTML = `
      <div class="container ftr__inner">
        <div>
          <div class="ftr__brand">${ic('compass')}${esc(f.company)}</div>
          <div>© ${new Date().getFullYear()} ${esc(f.company)}. All rights reserved.<br>
          Support: <a href="mailto:${esc(f.supportEmail)}">${esc(f.supportEmail)}</a></div>
        </div>
        <div class="ftr__links">
          ${f.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}
        </div>
      </div>`;
  }

  // ==========================================================================
  // Pricing interactions
  // ==========================================================================
  function updatePrices() {
    document.querySelectorAll('.tier').forEach((node) => {
      const p = Currency.live(node.getAttribute('data-tier'));
      if (!p) return;
      const set = (sel, v) => { const n = node.querySelector(sel); if (n && v) n.textContent = v; };
      set('[data-was]', p.original);
      set('[data-now]', p.discounted);
      set('[data-perday]', p.perDay);
    });
    updateLegal();
    updateSticky();
    Checkout.refreshSummary();
  }

  function updateLegal() {
    const n = el('pricing-legal');
    if (n) n.textContent = Currency.disclaimer(selectedTier);
  }

  function updateSticky() {
    const p = Currency.live(selectedTier);
    const tier = CONTENT.pricing.tiers.find((t) => t.id === selectedTier) || {};
    const n = el('sticky-price');
    if (n) n.innerHTML = `<strong>${esc(p?.discounted || tier.discountedPrice || '')}</strong>${esc(p?.perDay || tier.pricePerDay || '')}`;
  }

  function selectTier(id) {
    selectedTier = id;
    document.querySelectorAll('.tier').forEach((t) => {
      const on = t.getAttribute('data-tier') === id;
      t.classList.toggle('tier--on', on);
      t.setAttribute('aria-pressed', on);
    });
    updateLegal();
    updateSticky();
    Checkout.refreshSummary();
  }

  // ==========================================================================
  // Quiz (quiz variant only)
  // ==========================================================================
  const Quiz = {
    step: 0,
    answers: {},

    open() {
      if (CFG.flow !== 'quiz') { scrollToOffer(); return; }
      if (quizResult) { scrollToOffer(); return; }
      this.step = 0;
      this.answers = {};
      const node = el('quiz');
      node.classList.add('quiz--open');
      node.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      this.paint();
    },

    close() {
      const node = el('quiz');
      node.classList.remove('quiz--open');
      node.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    paint() {
      const q = CONTENT.quiz;
      const total = q.questions.length;
      const cur = q.questions[this.step];
      const body = el('quiz-body');
      el('quiz-bar').style.width = `${(this.step / total) * 100}%`;
      body.innerHTML = `
        <div class="quiz__step">Question ${this.step + 1} of ${total}</div>
        <h2 class="quiz__prompt">${esc(cur.prompt)}</h2>
        <div class="quiz__opts">
          ${cur.options.map((o, i) => `
            <button class="quiz__opt" data-opt="${i}">${esc(o.label)}</button>`).join('')}
        </div>
        ${this.step > 0 ? '<button class="quiz__back" data-quiz="back">← Back</button>' : ''}`;
    },

    pick(idx) {
      const q = CONTENT.quiz;
      const cur = q.questions[this.step];
      this.answers[cur.id] = cur.options[idx];
      if (this.step < q.questions.length - 1) {
        this.step += 1;
        this.paint();
      } else {
        this.build();
      }
    },

    back() {
      if (this.step === 0) return;
      this.step -= 1;
      this.paint();
    },

    build() {
      const q = CONTENT.quiz;
      el('quiz-bar').style.width = '100%';
      el('quiz-body').innerHTML = `
        <h2 class="build__title">${esc(q.buildingLabel)}…</h2>
        <ul class="build__list">
          ${q.buildingSteps.map((s, i) => `
            <li class="build__row" data-build="${i}">
              <span class="build__spin">${ic('loader')}</span><span>${esc(s)}</span>
            </li>`).join('')}
        </ul>`;

      const rows = Array.from(document.querySelectorAll('[data-build]'));
      rows.forEach((row, i) => {
        setTimeout(() => {
          row.classList.add('build__row--done');
          row.querySelector('span').outerHTML = ic('check');
        }, 420 + i * 430);
      });

      setTimeout(() => this.finish(), 420 + rows.length * 430 + 320);
    },

    finish() {
      const a = this.answers;
      quizResult = {
        challenge: a.trigger?.challenge || 'Worrier',
        stage: a.duration?.stage || 'Established',
        goal: a.want?.goal || 'Focus levels',
        answers: {
          trigger: a.trigger?.label || null,
          duration: a.duration?.label || null,
          want: a.want?.label || null,
        },
      };
      saveQuiz(quizResult);
      Pixel.lead();
      this.close();
      renderPlanSlot();
      refreshCtaLabels();
      wireReveal();
      // Deliberately the top of #pricing, not scrollToOffer(): this is the one
      // moment the personalized plan card has to be seen — it is the payoff for
      // answering. Every later CTA click skips straight to the tiers.
      scrollToPricing();
    },
  };

  // ==========================================================================
  // Checkout — embedded Stripe (mirrors engine initStripe)
  // ==========================================================================
  const Checkout = {
    stripe: null,
    elements: null,
    mountedKey: null,
    data: null,
    building: false,
    initiated: false,

    open() {
      if (!CONTENT.pricing.tiers.find((t) => t.id === selectedTier)) return;
      this.refreshSummary();
      el('pay-legal').textContent = Currency.disclaimer(selectedTier);
      el('pay-error').textContent = '';
      el('email-error').textContent = '';

      const m = el('checkout');
      m.classList.add('modal--open');
      m.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      Pixel.viewContent();
      if (!this.initiated) { Pixel.initiateCheckout(selectedTier, Currency.detect()); this.initiated = true; }

      const email = el('email').value.trim();
      if (EMAIL_RE.test(email)) this.build(email);
      setTimeout(() => el('email').focus(), 120);
    },

    close() {
      const m = el('checkout');
      m.classList.remove('modal--open');
      m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    refreshSummary() {
      const tier = CONTENT?.pricing?.tiers.find((t) => t.id === selectedTier);
      if (!tier) return;
      const p = Currency.live(selectedTier);
      const sum = el('pay-summary');
      if (sum) {
        sum.innerHTML = `
          <div>
            <div class="modal__summary-name">${esc(tier.name)}</div>
            <div class="modal__summary-perday">${esc(p?.perDay || tier.pricePerDay)}</div>
          </div>
          <div class="modal__summary-price">${esc(p?.discounted || tier.discountedPrice)}</div>`;
      }
      const legal = el('pay-legal');
      if (legal) legal.textContent = Currency.disclaimer(selectedTier);
    },

    onEmailInput() {
      const email = el('email').value.trim();
      el('email-error').textContent = '';
      if (!EMAIL_RE.test(email)) return;
      const key = `${selectedTier}|${email}`;
      if (key !== this.mountedKey && !this.building) this.build(email);
    },

    setBtn(disabled, text) {
      const b = el('pay-btn');
      if (!b) return;
      b.disabled = disabled;
      b.classList.toggle('btn--off', disabled);
      if (text) b.textContent = text;
    },

    err(msg) { el('pay-error').textContent = msg || ''; },

    async build(email) {
      this.building = true;
      const tierId = selectedTier;
      const currency = Currency.detect();
      const mount = el('pay-mount');
      this.err('');
      this.setBtn(true, 'Preparing secure checkout…');
      mount.innerHTML = '<p class="pay__loading">Loading secure payment form…</p>';

      if (isDev()) {
        mount.innerHTML = '<p class="pay__loading">⚡ Dev mode — payment mocked (localhost)</p>';
        this.mountedKey = `${tierId}|${email}`;
        this.building = false;
        this.setBtn(false, 'Complete Payment (Mock)');
        return;
      }

      try {
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId, email, currency }),
        });
        const raw = await res.text();
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch (_) {}
        if (!res.ok || !data.clientSecret) {
          this.err(data.error || 'Payment setup failed. Please try again.');
          this.setBtn(true, 'Enter your email to continue');
          this.building = false;
          return;
        }
        this.data = data;

        if (typeof window.Stripe === 'undefined') {
          this.err('Payment provider failed to load. Please refresh.');
          this.building = false;
          return;
        }

        this.stripe = window.Stripe(CFG.stripePk);
        this.elements = this.stripe.elements({ clientSecret: data.clientSecret });
        const pe = this.elements.create('payment');
        mount.innerHTML = '';
        pe.mount('#pay-mount');
        pe.on('ready', () => this.setBtn(false, 'Complete Payment'));
        this.mountedKey = `${tierId}|${email}`;
      } catch (_) {
        this.err('An unexpected error occurred. Please refresh and try again.');
      } finally {
        this.building = false;
      }
    },

    async pay() {
      const email = el('email').value.trim();
      if (!EMAIL_RE.test(email)) {
        el('email-error').textContent = 'Please enter a valid email address.';
        el('email').focus();
        return;
      }
      const currency = Currency.detect();

      if (isDev()) {
        Pixel.purchase(selectedTier, currency, null);
        location.href = CFG.webappUrl;
        return;
      }

      if (this.building) return;
      if (!this.stripe || !this.elements) { this.build(email); return; }

      this.setBtn(true, 'Processing…');
      this.err('');

      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: { return_url: location.href },
        redirect: 'if_required',
      });

      if (error) {
        this.err(error.message || 'Payment failed. Please try again.');
        this.setBtn(false, 'Complete Payment');
        return;
      }

      Pixel.purchase(selectedTier, currency, this.data?.subscriptionId);

      // Forward the micro-quiz answers so the webapp personalizes on day one
      // using the same vocabulary the full funnel produces.
      let tokens = null;
      try {
        const payload = {
          email,
          selectedPlan: selectedTier,
          funnelVersion: CFG.funnelVersion,
        };
        if (quizResult) {
          payload.mainChallenge = quizResult.challenge;
          payload.goal = quizResult.goal;
          payload.quizAnswers = quizResult.answers;
        }
        const res = await fetch('/api/provision-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.provisioned) tokens = { access_token: d.access_token, refresh_token: d.refresh_token };
      } catch (_) { /* non-fatal — the account exists, the buyer can log in */ }

      const hash = tokens
        ? '#access_token=' + encodeURIComponent(tokens.access_token) +
          '&refresh_token=' + encodeURIComponent(tokens.refresh_token)
        : '';
      location.href = CFG.webappUrl + hash;
    },
  };

  // ==========================================================================
  // Wiring
  // ==========================================================================
  function scrollToPricing() {
    el('pricing').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Where a "Start today" click lands. Once the quiz has produced a plan the
  // buyer has already read the plan card and the value copy above the tiers, so
  // aiming at the top of #pricing makes them scroll past all of it a second
  // time to reach the prices. Aim at the tier list instead — html has
  // scroll-padding-top for the sticky header, so nothing hides under it.
  function scrollToOffer() {
    const tiers = CFG.flow === 'quiz' && quizResult && document.querySelector('.tiers');
    (tiers || el('pricing')).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function refreshCtaLabels() {
    const label = primaryCtaLabel();
    document.querySelectorAll('[data-cta]').forEach((b) => {
      const arrow = b.querySelector('svg');
      b.textContent = label;
      if (arrow) b.appendChild(arrow);
    });
  }

  function onPrimaryCta() {
    if (CFG.flow === 'quiz' && !quizResult) Quiz.open();
    else scrollToOffer();
  }

  function wireInteractions() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cta]')) { onPrimaryCta(); return; }
      if (e.target.closest('[data-quiz="open"]')) { Quiz.open(); return; }
      if (e.target.closest('[data-quiz="back"]')) { Quiz.back(); return; }
      if (e.target.closest('[data-quiz="close"]')) { Quiz.close(); return; }

      const opt = e.target.closest('[data-opt]');
      if (opt) {
        opt.classList.add('quiz__opt--on');
        setTimeout(() => Quiz.pick(Number(opt.getAttribute('data-opt'))), 130);
        return;
      }

      if (e.target.closest('[data-action="checkout"]')) { Checkout.open(); return; }
      if (e.target.closest('[data-close-modal]')) { Checkout.close(); return; }

      const tier = e.target.closest('.tier');
      if (tier) { selectTier(tier.getAttribute('data-tier')); return; }

      const sciBtn = e.target.closest('#sci-toggle');
      if (sciBtn) {
        const box = el('sci');
        const body = el('sci-body');
        const open = box.classList.toggle('sci--open');
        sciBtn.setAttribute('aria-expanded', String(open));
        body.style.maxHeight = open ? `${body.scrollHeight}px` : '0';
        return;
      }

      const q = e.target.closest('.faq__q');
      if (q) {
        const item = q.closest('.faq__item');
        const a = item.querySelector('.faq__a');
        const open = item.classList.toggle('faq__item--open');
        q.setAttribute('aria-expanded', String(open));
        a.style.maxHeight = open ? `${a.scrollHeight}px` : '0';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { Checkout.close(); Quiz.close(); }
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.classList.contains('tier')) {
        e.preventDefault();
        selectTier(document.activeElement.getAttribute('data-tier'));
      }
    });

    el('email').addEventListener('input', () => Checkout.onEmailInput());
    el('pay-form').addEventListener('submit', (e) => { e.preventDefault(); Checkout.pay(); });
  }

  function wireSticky() {
    const bar = el('sticky');
    const hero = el('hero');
    const ftr = el('ftr');
    const onScroll = () => {
      const past = window.scrollY > (hero?.offsetHeight || 400);
      const near = ftr.getBoundingClientRect().top < window.innerHeight + 80;
      const modal = el('checkout').classList.contains('modal--open') || el('quiz').classList.contains('quiz--open');
      bar.classList.toggle('sticky--on', past && !near && !modal);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function wireReveal() {
    const nodes = document.querySelectorAll('.rv:not(.rv--in)');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('rv--in'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('rv--in');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    nodes.forEach((n) => obs.observe(n));
  }

  // Live theme comparison. Off unless ?themepicker=1 so real traffic never
  // sees it, but the whole point of shipping three themes is being able to
  // flip between them on the real page instead of guessing from a mockup.
  function wireThemePicker() {
    const params = new URLSearchParams(location.search);
    if (params.get('themepicker') !== '1') return;
    const box = el('themepicker');
    const active = document.documentElement.getAttribute('data-theme');
    box.classList.add('themepicker--on');
    box.innerHTML = ['warm', 'dark', 'clean'].map((t) =>
      `<button data-theme-set="${t}" aria-current="${t === active}">${t}</button>`).join('');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-theme-set]');
      if (!b) return;
      params.set('theme', b.getAttribute('data-theme-set'));
      location.search = params.toString();
    });
  }

  // ==========================================================================
  // Boot
  // ==========================================================================
  async function init() {
    try {
      CONTENT = await (await fetch(CFG.contentUrl)).json();
    } catch (err) {
      console.error('[landing] content.json failed to load', err);
      return;
    }

    document.title = CONTENT.meta?.title || document.title;
    if (CFG.flow === 'quiz') quizResult = loadQuiz();

    // Each section renders in isolation: a stale cached script paired with a
    // newer content.json must never blank the whole page (it did, twice, on v1).
    const guard = (label, fn) => { try { fn(); } catch (err) { console.error('[landing]', label, err); } };

    guard('header', () => renderHeader(CONTENT));
    guard('hero', () => renderHero(CONTENT));
    guard('proof', () => renderProof(CONTENT));
    guard('problem', () => renderProblem(CONTENT));
    guard('personas', () => renderPersonas(CONTENT));
    guard('how', () => renderHow(CONTENT));
    guard('testimonials', () => renderTestimonials(CONTENT));
    guard('pricing', () => renderPricing(CONTENT));
    guard('trust', () => renderTrust(CONTENT));
    guard('faq', () => renderFaq(CONTENT));
    guard('final', () => renderFinal(CONTENT));
    guard('footer', () => renderFooter(CONTENT));

    // The sticky bar's label lives in the HTML, so it needs the same pass the
    // JS-rendered CTAs get — otherwise it says "Start today" while opening a quiz.
    guard('ctaLabels', refreshCtaLabels);
    guard('interactions', wireInteractions);
    guard('sticky', wireSticky);
    guard('reveal', wireReveal);
    guard('themepicker', wireThemePicker);
    guard('stickyPrice', updateSticky);

    Currency.fetch().then(updatePrices);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
