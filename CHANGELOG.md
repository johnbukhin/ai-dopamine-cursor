# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Compass Funnel App** (`funnel/`) - Interactive quiz funnel with multi-screen architecture
  - Landing screen with gender selection (Male/Female cards)
  - 3D cartoon-style character images (generated)
  - Purple theme with CSS variables for easy customization
  - JSON-driven content from `liven-funnel-analysis.json`
  - State management with localStorage persistence
  - Multi-screen router with history-based back navigation
  - Mobile-first responsive design
  - Accessibility: keyboard navigation, ARIA labels

- **Question screen types** (Issue #2 / YEV-6)
  - Single choice (`icon_list`, `text_list`) - tap to select and auto-advance
  - Multiple choice (`checkbox_list`, `icon_checkbox_list`) - toggle selections + Continue button
  - Likert scale (1-5 rating) - icon-based with auto-advance
  - Text input field with auto-select for "Type your answer" options

- **Icon library** - 19 Lucide-inspired inline SVGs + 17 emoji mappings
  - Relationship: people, heart, rings, link, handshake, broken_heart
  - Actions: thumbs_up, thumbs_down, smile, lightning, hand_stop, checkmark, question, prohibited, puzzle
  - Likert: thumbs_down_x, thumbs_up_star
  - Emoji sets for wellbeing, improvement areas, and goals

- **Navigation**
  - History stack in State (`pushHistory`/`popHistory`) for accurate back navigation
  - Back button uses history, falls back to landing
  - Progress bar auto-calculates total from `questionNumber` fields

- **Security features**
  - XSS protection via `Security.escapeHtml()` utility
  - Debug logging disabled by default (`CONFIG.debug: false`)

- **Developer tooling**
  - `CONFIG.debug` flag to toggle console logging
  - Centralized `log.info/warn/error` utilities
  - Fallback data if JSON fails to load (landing + question_1)
  - `App.showError()` inline toast for non-blocking error display
  - Multiple JSON path fallback for different server configs

- **Project tooling**
  - `.claude/commands/explore.md` - Exploration slash command
  - `CLAUDE.md` - Dev workflow, test credentials, GitHub integration docs

### Files Added
```
funnel/
├── index.html      # Entry point with favicon
├── styles.css      # Purple theme, mobile-first, 5 question type styles
├── app.js          # Router, state, components, 4 screen renderers
└── assets/
    ├── male.png    # Cartoon male character
    └── female.png  # Cartoon female character
```

## [1.0.0] - 2026-02-02

### Added
- Initial project setup
- Funnel capture automation (Puppeteer)
- PDF generation from screenshots
- Liven funnel analysis JSON
- Project documentation (README, CONTEXT, ARCHITECTURE, CLAUDE.md)
- GitHub repository sync
