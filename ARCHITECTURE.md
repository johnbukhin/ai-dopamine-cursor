# Architecture Documentation

## System Overview

This project is a **funnel analysis and automation system** built with Node.js and Python. It automates the capture and analysis of web funnels, particularly quiz-based flows that lead to paywalls.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Funnel Analysis System                   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Capture     │   │   Analysis    │   │ Documentation │
│   Layer       │   │   Layer       │   │   Layer       │
└───────────────┘   └───────────────┘   └───────────────┘
        │                     │                     │
        │                     │                     │
   Puppeteer            JSON Analysis         PDF/HTML Gen
   Browser Auto         Structured Data       Visual Output
```

## Component Architecture

### 1. Capture Layer (`finestro-funnel-screenshots/`)

**Purpose**: Automate browser interactions to capture funnel screenshots

**Components**:
- `capture.js`: Main automation script
- `capture-funnel.js`: Alternative implementation
- `save_screenshot.py`: Python screenshot utility

**Technology Stack**:
- **Puppeteer**: Headless Chrome automation
- **Node.js**: Runtime environment

**Key Responsibilities**:
- Browser initialization and configuration
- Page navigation and interaction
- Element selection and clicking
- Screenshot capture and storage
- Error handling and retry logic

**Data Flow**:
```
URL Input → Browser Launch → Navigation → Interaction → Screenshot → File System
```

### 2. Analysis Layer

**Purpose**: Structure and analyze captured funnel data

**Components**:
- `liven-funnel-analysis.json`: Structured funnel analysis
- Manual analysis process (documented in CONTEXT.md)

**Data Structure**:
```json
{
  "metadata": {
    "funnelName": string,
    "funnelUrl": string,
    "analyzedAt": date,
    "totalQuestions": number,
    "funnelType": string
  },
  "screens": [
    {
      "id": string,
      "type": string,
      "content": object,
      "navigation": object,
      "ui": array
    }
  ]
}
```

**Analysis Dimensions**:
- Screen types and sequences
- Question formats and options
- UI components and patterns
- Conversion tactics
- Navigation logic
- Trust signals and social proof

### 3. Documentation Layer

**Purpose**: Generate visual and textual documentation

**Components**:
- `create_pdf.py`: PDF generation from screenshots
- `liven-funnel-flow.html`: HTML visualization
- Markdown documentation files

**Output Formats**:
- **PDF**: Sequential screenshot compilation
- **HTML**: Interactive flow visualization
- **JSON**: Structured analysis data
- **Markdown**: Textual documentation

## File Structure Details

### Root Directory

```
ClaudeCode/
├── README.md                    # Project overview
├── CONTEXT.md                   # AI model context
├── ARCHITECTURE.md              # This file
├── CLAUDE.md                    # Project instructions
├── .gitignore                   # Git ignore rules
│
├── liven-funnel-analysis.json   # Analysis data
├── liven-funnel-flow.html       # HTML visualization
│
└── [funnel-name]-screenshots/   # Screenshot directories
```

### Screenshot Directory Structure

```
[funnel-name]-screenshots/
├── capture.js                   # Main capture script
├── capture-funnel.js            # Alternative script
├── create_pdf.py                # PDF generator
├── save_screenshot.py           # Screenshot utility
├── package.json                 # Dependencies
├── package-lock.json            # Lock file
├── node_modules/                # Dependencies (gitignored)
│
└── screenshots/                 # Captured images
    ├── 01-landing.png
    ├── 02-question_1.png
    └── ...
```

## Data Models

### Screen Model

```typescript
interface Screen {
  id: string;                    // Unique identifier
  type: string;                  // question, interstitial, paywall, etc.
  screenType: string;            // landing, question, etc.
  questionNumber?: number;       // For question screens
  progressFormat?: string;       // "1 / 33"
  headline: string;              // Main text
  subheadline?: string;          // Secondary text
  options?: Option[];            // Answer options
  optionStyle?: string;          // icon_list, image_cards, etc.
  nextScreenLogic: string;       // Next screen ID
  uiComponents: string[];        // Component list
  ctaButton?: string;            // Call-to-action text
  content?: ContentObject;      // Additional content
  legalText?: string;            // Legal disclaimers
}
```

### Option Model

```typescript
interface Option {
  label: string;                 // Option text
  icon?: string;                 // Icon identifier
  value?: string;                // Option value
}
```

### Funnel Analysis Model

```typescript
interface FunnelAnalysis {
  funnelName: string;
  funnelUrl: string;
  analyzedAt: string;           // ISO date
  totalQuestions: number;
  funnelType: string;            // quiz-to-paywall, etc.
  estimatedCompletionTime?: string;
  screens: Screen[];
}
```

## Workflow Patterns

### Capture Workflow

```
1. Initialize Browser
   ↓
2. Navigate to Funnel URL
   ↓
3. Wait for Page Load
   ↓
4. Capture Screenshot
   ↓
5. Identify Next Action
   ↓
6. Execute Action (click, fill form, etc.)
   ↓
7. Wait for Navigation
   ↓
8. Repeat from Step 4
   ↓
9. Close Browser
```

### Analysis Workflow

```
1. Review Screenshots
   ↓
2. Identify Screen Types
   ↓
3. Extract Content (headlines, options, etc.)
   ↓
4. Map Navigation Flow
   ↓
5. Document UI Components
   ↓
6. Identify Conversion Tactics
   ↓
7. Structure as JSON
   ↓
8. Validate Schema
```

### Documentation Workflow

```
1. Collect Screenshots
   ↓
2. Sort by Filename
   ↓
3. Convert to RGB (if needed)
   ↓
4. Combine into PDF
   ↓
5. Generate HTML Flow (optional)
   ↓
6. Update Markdown Docs
```

## Technology Choices

### Why Puppeteer?

- **Headless automation**: No GUI needed
- **Chrome DevTools Protocol**: Reliable and feature-rich
- **JavaScript**: Same language as analysis scripts
- **Screenshot API**: Built-in high-quality capture
- **Element selection**: CSS selectors and XPath support

### Why Python for PDF?

- **PIL/Pillow**: Mature image processing library
- **PDF generation**: Simple API for combining images
- **Cross-platform**: Works on all OS
- **Lightweight**: Minimal dependencies

### Why JSON for Analysis?

- **Structured**: Easy to parse and validate
- **Human-readable**: Can be edited manually
- **AI-friendly**: Easy for models to understand
- **Extensible**: Can add new fields easily
- **Version control**: Git-friendly format

## Error Handling Strategy

### Browser Automation Errors

- **Navigation timeouts**: Retry with exponential backoff
- **Element not found**: Fallback selectors
- **Network errors**: Log and continue
- **Screenshot failures**: Skip and log

### Data Processing Errors

- **Invalid JSON**: Schema validation
- **Missing fields**: Default values
- **Image errors**: Skip corrupted files
- **PDF errors**: Validate images first

## Performance Considerations

### Screenshot Capture

- **Delay between actions**: 1-2 seconds
- **Page load wait**: Network idle or timeout
- **Screenshot quality**: Full page or viewport
- **File size**: PNG format, optimize if needed

### PDF Generation

- **Image loading**: Lazy load for large sets
- **Memory management**: Process in batches
- **File size**: Consider compression
- **Page count**: Monitor for very long funnels

## Security Considerations

### Browser Automation

- **Headless mode**: No GUI exposure
- **User agent**: Standard browser UA
- **Cookies**: Handle authentication if needed
- **Network**: Monitor for sensitive data

### Data Storage

- **Screenshots**: May contain user data
- **JSON files**: No sensitive credentials
- **Git**: Use .gitignore for sensitive files
- **Paths**: Use relative paths where possible

## Extension Points

### Adding New Funnel Types

1. Create new capture script
2. Define navigation patterns
3. Create analysis template
4. Update documentation

### Adding New Analysis Dimensions

1. Extend JSON schema
2. Update analysis scripts
3. Document in CONTEXT.md
4. Update examples

### Adding New Output Formats

1. Create generator script
2. Define output structure
3. Integrate with workflow
4. Update documentation

## Dependencies

### Node.js Dependencies

```json
{
  "puppeteer": "^24.36.1"
}
```

### Python Dependencies

```txt
Pillow>=8.0.0
```

## Future Enhancements

- [ ] Automated analysis from screenshots (OCR + AI)
- [ ] Multi-funnel comparison tools
- [ ] Conversion rate tracking
- [ ] A/B test detection
- [ ] Funnel replication tools
- [ ] Interactive flow diagram generator
- [ ] Database storage for analyses
- [ ] API for accessing funnel data
