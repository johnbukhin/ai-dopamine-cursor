/* ============================================================================
   Mind Compass — Landing page controller
   ----------------------------------------------------------------------------
   A bespoke marketing page that reuses the funnel's serverless backend:
     • /api/prices            — live multi-currency pricing
     • /api/create-checkout   — Stripe PaymentIntent for the embedded checkout
     • /api/provision-account — Supabase account + session on success
   plus the same Stripe publishable key and Meta Pixel as the funnel, so the
   landing page can sell end-to-end and hand the buyer off to the webapp.

   Currency + MetaPixel logic mirrors funnel/engine/app.js — keep in sync.
   ============================================================================ */
(function () {
  'use strict';

  // ---- Config (mirrors funnel/engine/app.js CONFIG) -----------------------
  const CONFIG = {
    webappUrl: 'https://mind-compass-webapp.vercel.app',
    stripePk:  'pk_live_51RGn19EIAGyjtjbOlAiSpPQ3NnuzFCSg7ReDs1bE1zYzCuNkmZC1HvdT5tsbLu1vzMOLMwYluxHJy6TBbP38rWML00rdVcYbRg',
    funnelVersion: 'landing-page',
  };

  // Localhost bypasses real Stripe charges (static server can't run the APIs).
  const isDev = () => ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const $  = (sel, root = document) => root.querySelector(sel);
  const el = (id) => document.getElementById(id);

  // Minimal HTML escaper (content.json is trusted, but escape defensively).
  const esc = (str) => {
    if (str == null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // =========================================================================
  // Currency — compact port of engine/app.js Currency
  // =========================================================================
  const Currency = {
    _META: {
      usd: { symbol: '$' },   eur: { symbol: '€' }, gbp: { symbol: '£' },
      cad: { symbol: 'CA$' }, aud: { symbol: 'A$' },
    },
    PRICES: {},
    _pricesFetched: false,
    _detected: null,

    _fmt(cents, currency) {
      const sym = this._META[currency]?.symbol || currency.toUpperCase();
      return `${sym}${(cents / 100).toFixed(2)}`;
    },
    _perDayStr(cents, days, currency) {
      const sym = this._META[currency]?.symbol || '';
      return `${sym}${(cents / days / 100).toFixed(2)}/day`;
    },

    // Build PRICES from the raw /api/prices response (same shape as the funnel).
    populateLivePrices(rawPrices) {
      const SUPPORTED = ['usd', 'eur', 'gbp', 'cad', 'aud'];
      const TIERS = [
        { id: '7_day',   introKey: 'intro_7day',   regularKey: 'regular_monthly',   days: 7,  quarterly: false },
        { id: '1_month', introKey: 'intro_1month', regularKey: 'regular_monthly',   days: 30, quarterly: false },
        { id: '3_month', introKey: 'intro_3month', regularKey: 'regular_quarterly', days: 90, quarterly: true  },
      ];
      const getAmt = (key, currency) => {
        const p = rawPrices[key];
        if (!p) return 0;
        return p.currency_amounts?.[currency] ?? p.currency_amounts?.[p.base_currency] ?? 0;
      };
      for (const currency of SUPPORTED) {
        const tierPrices = {};
        for (const t of TIERS) {
          tierPrices[t.id] = {
            original:   this._fmt(getAmt(t.regularKey, currency), currency),
            discounted: this._fmt(getAmt(t.introKey, currency), currency),
            perDay:     this._perDayStr(getAmt(t.introKey, currency), t.days, currency),
          };
        }
        this.PRICES[currency] = tierPrices;
      }
      this._pricesFetched = true;
    },

    // Fetch live prices; sessionStorage cache with 1h TTL (shared key w/ funnel).
    fetchPrices() {
      if (this._pricesFetched) return Promise.resolve();
      try {
        const raw = sessionStorage.getItem('_mc_prices_v1');
        if (raw) {
          const { data, ts } = JSON.parse(raw);
          if (Date.now() - ts < 3_600_000) { this.populateLivePrices(data); return Promise.resolve(); }
        }
      } catch (_) {}
      return fetch('/api/prices')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then(({ prices }) => {
          this.populateLivePrices(prices);
          try { sessionStorage.setItem('_mc_prices_v1', JSON.stringify({ data: prices, ts: Date.now() })); } catch (_) {}
        })
        .catch(() => { /* fall back to content.json static EUR prices */ });
    },

    // Timezone-first detection (matches the funnel), with ?currency= override.
    detect() {
      if (this._detected) return this._detected;
      const override = new URLSearchParams(window.location.search).get('currency');
      if (override && this._META[override.toLowerCase()]) return (this._detected = override.toLowerCase());
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
          if (/^Europe\//.test(tz))      return (this._detected = tz === 'Europe/London' ? 'gbp' : 'eur');
          if (/^Australia\//.test(tz) || tz === 'Pacific/Auckland') return (this._detected = 'aud');
          if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Regina|Halifax|St_Johns|Moncton|Whitehorse|Yellowknife|Dawson)/.test(tz))
            return (this._detected = 'cad');
          return (this._detected = 'usd');
        }
      } catch (_) {}
      return (this._detected = 'eur');
    },

    // Live price for a tier, or null if prices haven't loaded (→ use fallback).
    live(tierId, code) {
      const c = code || this.detect();
      return this.PRICES[c]?.[tierId] || null;
    },

    // Tier-aware legal disclaimer (mirrors engine tierDisclaimer).
    tierDisclaimer(tierId, code) {
      const c = code || this.detect();
      const t = this.PRICES[c]?.[tierId];
      const suffix = 'Cancel anytime via aicompass.tech@gmail.com. See our Subscription Policy for details.';
      if (!t) return CONTENT?.pricing?.legalDisclaimer || suffix;
      const vat = ['eur', 'gbp'].includes(c) ? ' (prices incl. VAT)' : '';
      if (tierId === '7_day')
        return `By clicking "Get my plan", you agree to automatic subscription renewal. First week is ${t.discounted}, then ${t.original}/month${vat}. ${suffix}`;
      if (tierId === '3_month')
        return `By clicking "Get my plan", you agree to automatic subscription renewal. First 3 months are ${t.discounted}, then ${t.original} every 3 months${vat}. ${suffix}`;
      return `By clicking "Get my plan", you agree to automatic subscription renewal. First month is ${t.discounted}, then ${t.original}/month${vat}. ${suffix}`;
    },
  };

  // =========================================================================
  // MetaPixel — compact port of engine/app.js MetaPixel
  // =========================================================================
  const MetaPixel = {
    _getValue(tierId, currency) {
      const c = (currency || 'usd').toLowerCase();
      const raw = Currency.PRICES[c]?.[tierId]?.discounted
        || Currency.PRICES.usd?.[tierId]?.discounted || '';
      return parseFloat(raw.replace(/[^0-9.]/g, '')) || 19.99;
    },
    track(event, params, eventId) {
      if (typeof fbq !== 'function') return;
      if (eventId) fbq('track', event, params, { eventID: eventId });
      else fbq('track', event, params);
    },
    viewContent() { this.track('ViewContent', { content_name: 'Landing', content_type: 'product' }); },
    initiateCheckout(tierId, currency) {
      this.track('InitiateCheckout', {
        value: this._getValue(tierId, currency),
        currency: (currency || 'USD').toUpperCase(),
        content_ids: [tierId], num_items: 1,
      });
    },
    purchase(tierId, currency, subscriptionId) {
      const eventId = subscriptionId ? `purchase_${subscriptionId}` : undefined;
      this.track('Purchase', {
        value: this._getValue(tierId, currency),
        currency: (currency || 'USD').toUpperCase(),
        content_ids: [tierId], content_type: 'product',
      }, eventId);
    },
  };

  // =========================================================================
  // Content + render
  // =========================================================================
  let CONTENT = null;
  let selectedTier = '1_month'; // recommended default

  const starRow = (n) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);

  function renderHero(c) {
    el('hero').innerHTML = `
      <div class="container">
        <div class="hero__grid">
          <div class="hero__copy reveal">
            <span class="hero__eyebrow">${esc(c.eyebrow)}</span>
            <h1 class="hero__title">${esc(c.headline)}</h1>
            <p class="hero__subtitle">${esc(c.subheadline)}</p>
            <div class="hero__cta">
              <button class="btn btn--primary btn--lg" data-cta="hero">${esc(c.primaryCta)}</button>
              <a class="btn btn--ghost btn--lg" href="#how-it-works">${esc(c.secondaryCta)}</a>
            </div>
            <p class="hero__reassurance">${esc(c.reassurance)}</p>
          </div>
          <div class="hero__media reveal">
            <img src="${esc(c.image)}" alt="A calmer, more focused you" width="900" height="900" fetchpriority="high">
          </div>
        </div>
      </div>`;
  }

  function renderProof(c) {
    el('social-proof').innerHTML = `
      <div class="container">
        <div class="proof__stats reveal">
          ${c.stats.map((s) => `
            <div class="proof__stat">
              <div class="proof__stat-value">${esc(s.value)}</div>
              <div class="proof__stat-label">${esc(s.label)}</div>
            </div>`).join('')}
        </div>
        <div class="proof__badges reveal">
          ${c.featuredIn.map((b) => `<span class="proof__badge">${esc(b)}</span>`).join('')}
        </div>
      </div>`;
  }

  function renderProblem(c) {
    el('problem').innerHTML = `
      <div class="container reveal">
        <div class="section__head">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
        </div>
        <p class="problem__body">${esc(c.body)}</p>
        <ul class="problem__list">
          ${c.painPoints.map((p) => `<li class="problem__item">${esc(p)}</li>`).join('')}
        </ul>
      </div>`;
  }

  function renderHow(c) {
    el('how-it-works').innerHTML = `
      <div class="container">
        <div class="section__head section__head--center reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
        </div>
        <div class="how__steps">
          ${c.steps.map((s) => `
            <div class="how__step reveal">
              <div class="how__num">${esc(s.number)}</div>
              <h3 class="how__step-title">${esc(s.title)}</h3>
              <p class="how__step-body">${esc(s.body)}</p>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderFeatures(c) {
    el('features').innerHTML = `
      <div class="container">
        <div class="section__head section__head--center reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
        </div>
        <div class="features__grid">
          ${c.items.map((f) => `
            <div class="feature reveal">
              <div class="feature__icon">${esc(f.icon)}</div>
              <h3 class="feature__title">${esc(f.title)}</h3>
              <p class="feature__body">${esc(f.body)}</p>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderLoop(c) {
    // Schematic of the addiction loop — arrows point down on mobile, right on
    // desktop (CSS-rotated). Rendered between stages so the cycle reads clearly.
    const stages = c.stages.map((s, i) => `
      ${i > 0 ? '<div class="loop__arrow" aria-hidden="true">→</div>' : ''}
      <div class="loop__stage">
        <div class="loop__icon" aria-hidden="true">${esc(s.icon)}</div>
        <h3 class="loop__stage-title">${esc(s.title)}</h3>
        <p class="loop__stage-body">${esc(s.body)}</p>
      </div>`).join('');
    el('the-loop').innerHTML = `
      <div class="container">
        <div class="section__head section__head--center reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
          ${c.intro ? `<p class="loop__intro">${esc(c.intro)}</p>` : ''}
        </div>
        <div class="loop__cycle reveal">${stages}</div>
        ${c.loopNote ? `<div class="loop__return reveal"><span class="loop__return-icon" aria-hidden="true">↻</span> ${esc(c.loopNote)}</div>` : ''}
        <div class="loop__break reveal">
          <span class="loop__break-label">${esc(c.breakout.label)}</span>
          <p class="loop__break-body">${esc(c.breakout.body)}</p>
        </div>
      </div>`;
  }

  function renderPersonas(c) {
    el('who-it-helps').innerHTML = `
      <div class="container">
        <div class="section__head section__head--center reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
        </div>
        <div class="personas__grid">
          ${c.personas.map((p) => `
            <div class="persona reveal">
              <h3 class="persona__title">${esc(p.title)}</h3>
              <p class="persona__body">${esc(p.body)}</p>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderExpectations(c) {
    el('expectations').innerHTML = `
      <div class="container">
        <div class="section__head reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
          <p class="expect__intro">${esc(c.body)}</p>
        </div>
        <div class="timeline">
          ${c.timeline.map((t) => `
            <div class="timeline__item reveal">
              <span class="timeline__dot"></span>
              <div class="timeline__when">${esc(t.when)}</div>
              <p class="timeline__what">${esc(t.what)}</p>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderTestimonials(c) {
    // Build one card; the track renders the full set twice so the CSS marquee
    // can loop seamlessly (translate by -50% lands the copy exactly on the original).
    const card = (t, dup) => `
      <div class="testimonial"${dup ? ' aria-hidden="true"' : ''}>
        <div class="testimonial__stars" aria-label="${t.rating} out of 5">${starRow(t.rating)}</div>
        <h3 class="testimonial__title">${esc(t.title)}</h3>
        <p class="testimonial__content">${esc(t.content)}</p>
        <div class="testimonial__author">
          <span class="testimonial__avatar">${esc((t.author || '?').charAt(0).toUpperCase())}</span>
          <span class="testimonial__name">${esc(t.author)}</span>
          <span class="testimonial__handle">${esc(t.handle)}</span>
        </div>
      </div>`;
    // Three identical sets: the carousel lives in the middle one, so a hard
    // swipe in either direction still lands on real cards before we wrap.
    const set = (dup) => c.items.map((t) => card(t, dup)).join('');
    el('testimonials').innerHTML = `
      <div class="container">
        <div class="section__head section__head--center reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
        </div>
      </div>
      <div class="testimonials__marquee">
        <div class="testimonials__track">${set(false)}${set(true)}${set(true)}</div>
      </div>`;
  }

  function renderScience(c) {
    el('science').innerHTML = `
      <div class="container">
        <div class="section__head reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
          <p class="science__intro">${esc(c.body)}</p>
        </div>
        <div class="science__grid">
          ${c.points.map((p) => `
            <div class="science__point reveal">
              <div class="science__claim">${esc(p.claim)}</div>
              <p class="science__detail">${esc(p.detail)}</p>
              <span class="science__source">${esc(p.source)}</span>
            </div>`).join('')}
        </div>
        <p class="science__disclaimer">${esc(c.disclaimer)}</p>
      </div>`;
  }

  // Build one pricing tier card. Uses live prices if loaded, else content.json.
  function tierCardHtml(t) {
    const p = Currency.live(t.id) || {};
    const original   = p.original   || t.originalPrice;
    const discounted = p.discounted || t.discountedPrice;
    const perDay     = p.perDay     || t.pricePerDay;
    return `
      <div class="tier ${t.id === selectedTier ? 'tier--selected' : ''} ${t.recommended ? 'tier--recommended' : ''}"
           data-tier="${esc(t.id)}" role="button" tabindex="0" aria-pressed="${t.id === selectedTier}">
        ${t.badge ? `<span class="tier__badge">${esc(t.badge)}</span>` : ''}
        <span class="tier__radio"></span>
        <div class="tier__info">
          <div class="tier__name">${esc(t.name)}</div>
          <div class="tier__perday" data-perday>${esc(perDay)}</div>
          ${t.savings ? `<span class="tier__savings">${esc(t.savings)}</span>` : ''}
        </div>
        <div class="tier__prices">
          <div class="tier__original" data-original>${esc(original)}</div>
          <div class="tier__discounted" data-discounted>${esc(discounted)}</div>
        </div>
      </div>`;
  }

  function renderPricing(c) {
    el('pricing').innerHTML = `
      <div class="container">
        <div class="section__head section__head--center pricing__head reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
          <p class="section__intro">${esc(c.subheadline)}</p>
        </div>
        <div class="pricing__goals reveal">
          ${c.goalsList.map((g) => `<div class="pricing__goal">${esc(g)}</div>`).join('')}
        </div>
        <div class="pricing__tiers reveal">
          ${c.tiers.map(tierCardHtml).join('')}
        </div>
        <div class="pricing__cta reveal">
          <button class="btn btn--success btn--block btn--lg" data-action="checkout">${esc(c.cta)}</button>
        </div>
        <p class="pricing__legal" id="pricing-legal">${esc(c.legalDisclaimer)}</p>
      </div>`;
  }

  function renderGuarantee(g, privacy, paySec) {
    el('guarantee').innerHTML = `
      <div class="container">
        <div class="guarantee__grid">
          <div class="guarantee__card reveal">
            <div class="guarantee__badge">🛡️</div>
            <h3 class="guarantee__title">${esc(g.headline)}</h3>
            <p class="guarantee__desc">${esc(g.description)}</p>
          </div>
          <div class="reveal">
            <h3 class="guarantee__title" style="margin-bottom:16px">${esc(privacy.headline)}</h3>
            <ul class="privacy__list">
              ${privacy.points.map((p) => `<li class="privacy__item">${esc(p)}</li>`).join('')}
            </ul>
            <div class="paysec">
              <div class="paysec__title">${esc(paySec.headline)}</div>
              <div class="paysec__icons">
                ${paySec.icons.map((i) => `<span class="paysec__icon">${esc(i)}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderFaq(c) {
    el('faq').innerHTML = `
      <div class="container">
        <div class="section__head section__head--center reveal">
          <span class="section__eyebrow">${esc(c.eyebrow)}</span>
          <h2 class="section__title">${esc(c.headline)}</h2>
        </div>
        <div class="faq__list" style="margin:0 auto">
          ${c.questions.map((q) => `
            <div class="faq__item reveal">
              <button class="faq__q" aria-expanded="false">${esc(q.question)}</button>
              <div class="faq__a"><div class="faq__a-inner">${esc(q.answer)}</div></div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderFinalCta(c) {
    el('final-cta').innerHTML = `
      <div class="container">
        <div class="finalcta__card reveal">
          <h2 class="finalcta__title">${esc(c.headline)}</h2>
          <p class="finalcta__subtitle">${esc(c.subheadline)}</p>
          <button class="btn btn--success btn--lg" data-cta="final">${esc(c.cta)}</button>
        </div>
      </div>`;
  }

  function renderFooter(c) {
    const year = new Date().getFullYear();
    el('site-footer').innerHTML = `
      <div class="container site-footer__inner">
        <div>
          <div class="site-footer__brand">🧭 ${esc(c.company)}</div>
          <p class="site-footer__legal">© ${year} ${esc(c.company)}. All rights reserved.<br>
          Support: <a href="mailto:${esc(c.supportEmail)}">${esc(c.supportEmail)}</a></p>
        </div>
        <div class="site-footer__links">
          ${c.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}
        </div>
      </div>`;
  }

  // Overwrite price text in the DOM once live prices are loaded.
  function updatePrices() {
    document.querySelectorAll('.tier').forEach((tierEl) => {
      const id = tierEl.getAttribute('data-tier');
      const p = Currency.live(id);
      if (!p) return;
      const set = (sel, val) => { const n = tierEl.querySelector(sel); if (n && val) n.textContent = val; };
      set('[data-original]', p.original);
      set('[data-discounted]', p.discounted);
      set('[data-perday]', p.perDay);
    });
    updateLegalDisclaimer();
    updateStickyPrice();
    Checkout.refreshSummary();
  }

  function updateLegalDisclaimer() {
    const n = el('pricing-legal');
    if (n) n.textContent = Currency.tierDisclaimer(selectedTier);
  }

  function updateStickyPrice() {
    const p = Currency.live(selectedTier);
    const tier = CONTENT.pricing.tiers.find((t) => t.id === selectedTier) || {};
    const discounted = p?.discounted || tier.discountedPrice || '';
    const perDay = p?.perDay || tier.pricePerDay || '';
    const n = el('sticky-cta__price');
    if (n) n.innerHTML = `<strong>${esc(discounted)}</strong>${esc(perDay)}`;
  }

  function selectTier(id) {
    selectedTier = id;
    document.querySelectorAll('.tier').forEach((t) => {
      const on = t.getAttribute('data-tier') === id;
      t.classList.toggle('tier--selected', on);
      t.setAttribute('aria-pressed', on);
    });
    updateLegalDisclaimer();
    updateStickyPrice();
    Checkout.refreshSummary();
  }

  // =========================================================================
  // Checkout — embedded Stripe flow (mirrors engine initStripe)
  // =========================================================================
  const Checkout = {
    stripe: null,
    elements: null,
    mountedKey: null,      // `${tierId}|${email}` the PaymentElement was built for
    checkoutData: null,    // last create-checkout response
    building: false,
    initiated: false,

    open() {
      const tier = CONTENT.pricing.tiers.find((t) => t.id === selectedTier);
      if (!tier) return;
      this.refreshSummary();
      el('checkout-legal').textContent = Currency.tierDisclaimer(selectedTier);
      el('checkout-error').textContent = '';
      el('checkout-email-error').textContent = '';

      const modal = el('checkout-modal');
      modal.classList.add('modal--open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      MetaPixel.viewContent();
      if (!this.initiated) { MetaPixel.initiateCheckout(selectedTier, Currency.detect()); this.initiated = true; }

      // If a valid email is already present, start building the payment form.
      const email = el('checkout-email').value.trim();
      if (EMAIL_RE.test(email)) this.build(email);
      setTimeout(() => el('checkout-email').focus(), 120);
    },

    close() {
      const modal = el('checkout-modal');
      modal.classList.remove('modal--open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    refreshSummary() {
      const tier = CONTENT.pricing.tiers.find((t) => t.id === selectedTier);
      if (!tier) return;
      const p = Currency.live(selectedTier);
      const discounted = p?.discounted || tier.discountedPrice;
      const perDay = p?.perDay || tier.pricePerDay;
      const summary = el('checkout-summary');
      if (summary) {
        summary.innerHTML = `
          <div>
            <div class="modal__summary-name">${esc(tier.name)}</div>
            <div class="modal__summary-perday">${esc(perDay)}</div>
          </div>
          <div class="modal__summary-price">${esc(discounted)}</div>`;
      }
      const legal = el('checkout-legal');
      if (legal) legal.textContent = Currency.tierDisclaimer(selectedTier);
    },

    onEmailInput() {
      const email = el('checkout-email').value.trim();
      const errEl = el('checkout-email-error');
      const key = `${selectedTier}|${email}`;
      if (!EMAIL_RE.test(email)) { errEl.textContent = ''; return; }
      errEl.textContent = '';
      if (key !== this.mountedKey && !this.building) this.build(email);
    },

    setPayBtn(disabled, text) {
      const btn = el('checkout-pay-btn');
      if (!btn) return;
      btn.disabled = disabled;
      btn.classList.toggle('btn--disabled', disabled);
      if (text) btn.textContent = text;
    },

    showError(msg) { el('checkout-error').textContent = msg || ''; },

    // Build the Stripe Payment Element for the current tier + email.
    async build(email) {
      this.building = true;
      const tierId = selectedTier;
      const currency = Currency.detect();
      const mountEl = el('payment-element');
      this.showError('');
      this.setPayBtn(true, 'Preparing secure checkout…');
      mountEl.innerHTML = '<p class="checkout__payment-loading">Loading secure payment form…</p>';

      // ── Dev mock: bypass Stripe on localhost ──────────────────────────────
      if (isDev()) {
        mountEl.innerHTML = '<p class="checkout__payment-loading">⚡ Dev mode — payment mocked (localhost)</p>';
        this.mountedKey = `${tierId}|${email}`;
        this.building = false;
        this.setPayBtn(false, 'Complete Payment (Mock)');
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
          this.showError(data.error || 'Payment setup failed. Please try again.');
          this.setPayBtn(true, 'Enter your email to continue');
          this.building = false;
          return;
        }
        this.checkoutData = data;

        if (typeof window.Stripe === 'undefined') {
          this.showError('Payment provider failed to load. Please refresh.');
          this.building = false;
          return;
        }

        this.stripe = window.Stripe(CONFIG.stripePk);
        this.elements = this.stripe.elements({ clientSecret: data.clientSecret });
        const paymentEl = this.elements.create('payment');
        mountEl.innerHTML = '';
        paymentEl.mount('#payment-element');
        paymentEl.on('ready', () => this.setPayBtn(false, 'Complete Payment'));
        this.mountedKey = `${tierId}|${email}`;
      } catch (err) {
        this.showError('An unexpected error occurred. Please refresh and try again.');
      } finally {
        this.building = false;
      }
    },

    async pay() {
      const email = el('checkout-email').value.trim();
      if (!EMAIL_RE.test(email)) {
        el('checkout-email-error').textContent = 'Please enter a valid email address.';
        el('checkout-email').focus();
        return;
      }
      const currency = Currency.detect();

      // ── Dev mock success path ─────────────────────────────────────────────
      if (isDev()) {
        MetaPixel.purchase(selectedTier, currency, null);
        window.location.href = CONFIG.webappUrl;
        return;
      }

      // Payment form still building (e.g. Enter pressed early) — let it finish;
      // avoids a redundant concurrent create-checkout call.
      if (this.building) return;
      if (!this.stripe || !this.elements) { this.build(email); return; }

      this.setPayBtn(true, 'Processing…');
      this.showError('');

      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });

      if (error) {
        this.showError(error.message || 'Payment failed. Please try again.');
        this.setPayBtn(false, 'Complete Payment');
        return;
      }

      // Payment succeeded — track, provision the account, hand off to the webapp.
      MetaPixel.purchase(selectedTier, currency, this.checkoutData?.subscriptionId);

      let tokens = null;
      try {
        const provRes = await fetch('/api/provision-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            selectedPlan: selectedTier,
            funnelVersion: CONFIG.funnelVersion,
          }),
        });
        const provData = await provRes.json();
        if (provData.provisioned) {
          tokens = { access_token: provData.access_token, refresh_token: provData.refresh_token };
        }
      } catch (_) { /* non-fatal — user can still log in with the account we created */ }

      // Cross-origin session handoff via URL hash (same mechanism as the funnel).
      const hash = tokens
        ? '#access_token=' + encodeURIComponent(tokens.access_token) +
          '&refresh_token=' + encodeURIComponent(tokens.refresh_token)
        : '';
      window.location.href = CONFIG.webappUrl + hash;
    },
  };

  // =========================================================================
  // Interactions
  // =========================================================================
  function scrollToPricing() {
    el('pricing').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function wireInteractions() {
    // CTA buttons → scroll to pricing (except the pricing button itself).
    document.addEventListener('click', (e) => {
      const cta = e.target.closest('[data-cta]');
      if (cta) { scrollToPricing(); return; }

      const checkoutBtn = e.target.closest('[data-action="checkout"]');
      if (checkoutBtn) { Checkout.open(); return; }

      const tierEl = e.target.closest('.tier');
      if (tierEl) { selectTier(tierEl.getAttribute('data-tier')); return; }

      if (e.target.closest('[data-close-modal]')) { Checkout.close(); return; }

      const faqQ = e.target.closest('.faq__q');
      if (faqQ) {
        const item = faqQ.closest('.faq__item');
        const a = item.querySelector('.faq__a');
        const open = item.classList.toggle('faq__item--open');
        faqQ.setAttribute('aria-expanded', open);
        a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
        return;
      }
    });

    // Keyboard: Enter/Space selects a tier; Esc closes the modal.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Checkout.close();
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.classList.contains('tier')) {
        e.preventDefault();
        selectTier(document.activeElement.getAttribute('data-tier'));
      }
    });

    // Checkout form
    el('checkout-email').addEventListener('input', () => Checkout.onEmailInput());
    el('checkout-form').addEventListener('submit', (e) => { e.preventDefault(); Checkout.pay(); });

    // Header + sticky CTA buttons already carry data-cta; nothing else needed.
  }

  // Sticky mobile CTA: show once the user scrolls past the hero, hide near footer.
  function wireStickyCta() {
    const bar = el('sticky-cta');
    const hero = el('hero');
    const footer = el('site-footer');
    const onScroll = () => {
      const pastHero = window.scrollY > (hero?.offsetHeight || 400);
      const nearFooter = footer.getBoundingClientRect().top < window.innerHeight + 80;
      const modalOpen = el('checkout-modal').classList.contains('modal--open');
      bar.classList.toggle('sticky-cta--visible', pastHero && !nearFooter && !modalOpen);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveal.
  function wireReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((n) => n.classList.add('reveal--in'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal--in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((n) => obs.observe(n));
  }

  // Never-ending testimonials carousel.
  // The track is a native horizontal scroll container (so the user can flick it
  // faster/slower at will), which we also auto-advance a fraction of a pixel per
  // frame. Content is rendered in 3 identical sets, so we can always wrap by one
  // set-width — a shift the eye can't see because the cards line up exactly.
  function initTestimonialsCarousel() {
    const marquee = document.querySelector('.testimonials__marquee');
    const track = marquee && marquee.querySelector('.testimonials__track');
    if (!marquee || !track) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SPEED = 0.5;      // px per frame — gentle, gradual left → right drift
    const RESUME_MS = 1000; // let the user's flick fully settle before resuming

    let setW = track.scrollWidth / 3; // width of one of the three sets
    let pos = setW;                   // start in the middle set
    let hovering = false;
    let lastInteract = -Infinity;

    // Keep the position inside the middle set; ± one set-width is seamless.
    const wrap = (x) => {
      if (setW <= 0) return x;
      if (x < setW) return x + setW;
      if (x >= setW * 2) return x - setW;
      return x;
    };

    marquee.scrollLeft = pos;

    const remeasure = () => { setW = track.scrollWidth / 3; };
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);

    // Desktop: pause auto-advance while the pointer is over the strip.
    marquee.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
    marquee.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hovering = false; });

    // Any real input (touch drag, mouse drag, wheel) takes over the pace.
    const mark = () => { lastInteract = performance.now(); };
    marquee.addEventListener('pointerdown', mark);
    marquee.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse' || e.buttons) mark(); });
    marquee.addEventListener('touchstart', mark, { passive: true });
    marquee.addEventListener('touchmove', mark, { passive: true });
    marquee.addEventListener('wheel', mark, { passive: true });

    function frame() {
      if (!reduce && !hovering && performance.now() - lastInteract >= RESUME_MS) {
        pos = wrap(pos - SPEED);
        marquee.scrollLeft = pos;
      } else {
        pos = marquee.scrollLeft; // follow wherever the user left it
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // =========================================================================
  // Boot
  // =========================================================================
  async function init() {
    try {
      const res = await fetch('content.json?v=20260730');
      CONTENT = await res.json();
    } catch (err) {
      console.error('[landing] Failed to load content.json', err);
      return;
    }

    if (CONTENT.brand?.name) { document.title = CONTENT.meta?.title || document.title; el('brand-name').textContent = CONTENT.brand.name; }

    // Render each section in isolation. If a data key is missing (e.g. a browser
    // holding a stale script paired with newer content.json after a deploy), that
    // one section stays empty instead of an uncaught throw blanking the whole page.
    const guard = (label, fn) => { try { fn(); } catch (err) { console.error('[landing] section failed:', label, err); } };

    guard('hero', () => renderHero(CONTENT.hero));
    guard('proof', () => renderProof(CONTENT.socialProof));
    guard('problem', () => renderProblem(CONTENT.problem));
    guard('how', () => renderHow(CONTENT.howItWorks));
    guard('features', () => renderFeatures(CONTENT.features));
    guard('loop', () => renderLoop(CONTENT.loop));
    guard('personas', () => renderPersonas(CONTENT.whoItHelps));
    guard('expectations', () => renderExpectations(CONTENT.expectations));
    guard('testimonials', () => renderTestimonials(CONTENT.testimonials));
    guard('science', () => renderScience(CONTENT.science));
    guard('pricing', () => renderPricing(CONTENT.pricing));
    guard('guarantee', () => renderGuarantee(CONTENT.guarantee, CONTENT.privacy, CONTENT.paymentSecurity));
    guard('faq', () => renderFaq(CONTENT.faq));
    guard('finalCta', () => renderFinalCta(CONTENT.finalCta));
    guard('footer', () => renderFooter(CONTENT.footer));

    guard('interactions', wireInteractions);
    guard('stickyCta', wireStickyCta);
    guard('reveal', wireReveal);
    guard('carousel', initTestimonialsCarousel);
    guard('stickyPrice', updateStickyPrice);

    // Live pricing — overwrite the static EUR fallback once loaded.
    Currency.fetchPrices().then(updatePrices);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
