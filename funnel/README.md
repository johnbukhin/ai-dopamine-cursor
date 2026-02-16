# Compass Funnel

Interactive quiz funnel with value proposition and payment flow.

## Tech Stack
- Vanilla JavaScript (ES6+)
- HTML5 + CSS3
- JSON-driven content
- localStorage for state persistence

## Local Development

```bash
# Start server from funnel directory
cd funnel
python3 -m http.server 8080

# Visit http://localhost:8080
```

## Deployment

### Vercel (Recommended)

```bash
# From project root
vercel --cwd funnel

# Production deployment
vercel --prod --cwd funnel
```

Or via Vercel dashboard:
1. Import from GitHub
2. Set **Root Directory** to `funnel`
3. Deploy

## Project Structure

```
funnel/
├── index.html                    # Entry point
├── app.js                        # Application logic (3166 lines)
├── styles.css                    # Styles (2128 lines)
├── liven-funnel-analysis.json   # Funnel data
├── vercel.json                   # Vercel config
└── assets/
    ├── male.png                  # Gender selection
    └── female.png                # Gender selection
```

## Features

### Screens
- Landing (gender selection)
- 31 quiz questions (single/multiple choice, Likert scale)
- 5 interstitial screens (trust building, education, social proof)
- 3 loading screens (social proof, engagement modals)
- Email & name capture
- Personalized profile summary
- Goal timeline selection
- Value proposition (plan preview)
- Paywall (pricing tiers, countdown, FAQ)

### Interactive Elements
- Real-time countdown timer (10:00 loop)
- Personalized promo code generation
- 3 pricing tiers with selection
- FAQ accordion (one open at a time)
- Trust elements (payment icons, media logos, statistics, award badge)
- 30-day money-back guarantee
- Testimonials
- Company footer

### Technical
- State management with localStorage
- History-based back navigation
- Event delegation pattern
- XSS protection (Security.escapeHtml)
- Mobile-responsive
- Keyboard accessible
- Debug-gated logging

## Configuration

Edit `CONFIG` in `app.js`:

```javascript
const CONFIG = {
    brandName: 'Compass',
    funnelDataPaths: ['liven-funnel-analysis.json'],
    storageKey: 'compass_funnel_state',
    debug: false
};
```

## Future Backend Integration

When ready to add database/backend:
1. Add Vercel serverless functions in `api/` folder
2. Or migrate to Next.js for SSR + API routes
3. Connect to Vercel Postgres, Supabase, or PlanetScale

## Development

- `CONFIG.debug: true` to enable console logging
- All user inputs sanitized via `Security.escapeHtml()`
- Timer cleanup on screen navigation (no memory leaks)
