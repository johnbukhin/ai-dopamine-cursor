# Context for AI Models

This document provides comprehensive context for AI coding assistants working with this codebase.

## Project Purpose

This is a **funnel analysis and automation project** that:
1. Automates the capture of web funnels (quiz flows, onboarding sequences, paywalls)
2. Analyzes funnel structures and conversion tactics
3. Generates documentation and visual representations
4. Provides structured data for analysis and replication

## Key Concepts

### Funnel Types

- **Quiz-to-Paywall**: Multi-question quiz that leads to a subscription paywall
- **Onboarding Flow**: Step-by-step user onboarding sequence
- **Lead Generation**: Form-based funnels collecting user information

### Screen Types

- **Landing**: Initial entry point
- **Question**: Single or multiple choice questions
- **Interstitial**: Trust-building or informational screens between questions
- **Paywall**: Subscription or payment screen
- **Thank You**: Completion/confirmation screen

### UI Components

Common components tracked:
- ProgressBar, StepCounter
- AnswerCard, IconEmoji
- GenderCard, ImageButton
- Trust signals, Social proof
- CTA buttons, Legal disclaimers

## Codebase Structure

### Core Scripts

#### `finestro-funnel-screenshots/capture.js`
Main Puppeteer automation script that:
- Launches headless browser
- Navigates through funnel steps
- Clicks options/interactions
- Captures screenshots at each step
- Handles delays and waiting for elements

**Key Functions**:
- `takeScreenshot()`: Captures and saves screenshots
- `clickOptionByText()`: Finds and clicks elements by text content
- `getPageContent()`: Extracts page text for analysis
- `waitForNavigation()`: Handles page transitions

#### `finestro-funnel-screenshots/create_pdf.py`
Python utility that:
- Collects all PNG screenshots
- Converts to RGB format (PDF requirement)
- Combines into sequential PDF document
- Handles RGBA to RGB conversion

### Data Files

#### `liven-funnel-analysis.json`
Structured JSON analysis containing:
- Funnel metadata (name, URL, type, date)
- Complete screen-by-screen breakdown
- Question types, options, UI components
- Navigation logic and flow
- Conversion tactics and patterns

**Schema Structure**:
```json
{
  "funnelName": string,
  "funnelUrl": string,
  "analyzedAt": date,
  "totalQuestions": number,
  "funnelType": string,
  "screens": [
    {
      "id": string,
      "type": string,
      "screenType": string,
      "headline": string,
      "subheadline": string,
      "options": array,
      "optionStyle": string,
      "nextScreenLogic": string,
      "uiComponents": array,
      "ctaButton": string,
      "content": object
    }
  ]
}
```

### Compass Funnel App (`funnel/`)

Interactive quiz funnel built with vanilla HTML/CSS/JS.

**Architecture:**
```
funnel/
├── index.html      # Entry point, loads app.js
├── styles.css      # Purple theme, CSS variables, mobile-first
├── app.js          # Modular architecture:
│                   #   - CONFIG: App settings, debug flag
│                   #   - log: Debug-gated logging
│                   #   - Security: XSS protection
│                   #   - State: localStorage persistence
│                   #   - Router: Multi-screen navigation
│                   #   - Components: Reusable UI pieces
│                   #   - Screens: Screen renderers
│                   #   - Events: Delegated event handling
│                   #   - App: Main initialization
└── assets/         # Generated cartoon character images
```

**Key Patterns:**
- Content from `liven-funnel-analysis.json` (single source of truth)
- State persists in localStorage under `compass_funnel_state`
- Event delegation on `#app` container
- `Security.escapeHtml()` for all user/JSON content
- `CONFIG.debug = false` to disable console logs in production

**Adding New Screens:**
1. Add screen renderer in `Screens` object
2. Add case in `App.render()` switch statement
3. Add any new components to `Components` object
4. Screen data comes from JSON via `Router.getScreen(id)`

**Running Locally:**
```bash
python3 -m http.server 8080
# Open http://localhost:8080/funnel/
```

## Development Patterns

### Screenshot Naming Convention
- Format: `{index}-{screen_name}.png`
- Example: `01-landing.png`, `02-question_1.png`
- Index is zero-padded (01, 02, etc.)

### Error Handling
- Scripts include try-catch blocks for navigation failures
- Fallback mechanisms for element selection
- Console logging for debugging

### Browser Configuration
- Headless mode for automation
- Viewport size: Typically 1280x720 or 1920x1080
- User agent: Standard browser user agent
- Wait strategies: Network idle, element visibility

## Common Tasks

### Adding a New Funnel Analysis

1. Update `capture.js` with new URL and navigation logic
2. Run capture script to get screenshots
3. Analyze screenshots and create JSON analysis
4. Document in `liven-funnel-analysis.json` format
5. Generate PDF if needed

### Modifying Capture Logic

1. Edit `capture.js` navigation steps
2. Update click patterns/text matching
3. Adjust delays if needed
4. Test with target funnel
5. Update documentation

### Creating PDF Documentation

1. Ensure screenshots are in correct directory
2. Run `python3 create_pdf.py`
3. PDF will be created in same directory
4. Verify page order matches funnel flow

## Testing Credentials

When working with forms or user inputs:
- Email: `test@testtest1.com` (increment number if needed)
- Name: `Test User`
- Phone: `+1234567890`

## File Paths

- Screenshot directory: `/Users/yevhen/cursor-projects/ClaudeCode/{funnel-name}-screenshots/`
- Analysis JSON: Root directory
- PDF outputs: Same as screenshot directory

## Dependencies

### Node.js
- `puppeteer`: ^24.36.1 (browser automation)

### Python
- `PIL` (Pillow): Image processing for PDFs

## Common Issues & Solutions

### Screenshot Not Capturing
- Check if element is visible (may need scroll)
- Verify selector is correct
- Add delay before screenshot

### Navigation Failing
- Check network idle status
- Verify click target is correct
- May need to wait for specific element

### PDF Creation Errors
- Ensure all images are valid PNG files
- Check file permissions
- Verify PIL/Pillow is installed

## AI Model Instructions

When working with this codebase:

1. **Always check existing patterns** before creating new code
2. **Follow naming conventions** for screenshots and files
3. **Update JSON analysis** when adding new funnels
4. **Document changes** in relevant markdown files
5. **Use test credentials** when testing forms
6. **Maintain consistency** with existing code style
7. **Add error handling** for browser automation
8. **Include console logging** for debugging

## Related Documentation

- `README.md`: Project overview and quick start
- `CHANGELOG.md`: Version history and recent changes
- `ARCHITECTURE.md`: Detailed technical architecture
- `CLAUDE.md`: Project-specific instructions
