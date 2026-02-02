# ClaudeCode - Funnel Analysis & Automation Project

A comprehensive project for analyzing, capturing, and documenting web funnels (quiz flows, onboarding sequences, paywalls) using automated browser automation and structured data analysis.

## 🎯 Project Overview

This project provides tools and workflows for:
- **Automated funnel capture**: Using Puppeteer to navigate through web funnels and capture screenshots
- **Funnel analysis**: Structured JSON analysis of funnel flows, questions, and conversion tactics
- **Documentation generation**: Creating visual PDFs and HTML flows from captured screenshots
- **AI-assisted development**: Context-rich documentation for AI models to work with the codebase

## 📁 Project Structure

```
ClaudeCode/
├── README.md                    # This file - project overview
├── CONTEXT.md                   # Context for AI models working with this codebase
├── ARCHITECTURE.md              # Detailed architecture and structure documentation
├── CLAUDE.md                    # Project-specific instructions for Claude AI
├── .gitignore                   # Git ignore rules
│
├── liven-funnel-analysis.json   # Structured analysis of Liven quiz funnel
├── liven-funnel-flow.html       # Visual HTML representation of funnel flow
│
├── finestro-funnel-screenshots/ # Funnel capture automation tools
│   ├── capture.js              # Main Puppeteer script for capturing funnels
│   ├── capture-funnel.js       # Alternative capture script
│   ├── create_pdf.py           # Python script to create PDF from screenshots
│   ├── save_screenshot.py      # Screenshot utility
│   ├── package.json            # Node.js dependencies
│   └── node_modules/           # Dependencies (gitignored)
│
└── liven-funnel-screenshots/   # Captured screenshots from Liven funnel
    └── 01-landing.png          # Example screenshot
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- Python 3.7+
- npm or yarn

### Installation

1. **Install Node.js dependencies**:
   ```bash
   cd finestro-funnel-screenshots
   npm install
   ```

2. **Install Python dependencies** (if needed):
   ```bash
   pip install pillow  # For PDF creation
   ```

### Usage

#### Capturing a Funnel

```bash
cd finestro-funnel-screenshots
node capture.js
```

The script will:
- Launch a headless browser
- Navigate through the funnel
- Capture screenshots at each step
- Save screenshots with sequential naming

#### Creating PDF from Screenshots

```bash
cd finestro-funnel-screenshots
python3 create_pdf.py
```

## 📊 Funnel Analysis Format

Funnel analyses are stored as structured JSON files with the following schema:

```json
{
  "funnelName": "Funnel Name",
  "funnelUrl": "https://example.com/funnel",
  "analyzedAt": "YYYY-MM-DD",
  "totalQuestions": 33,
  "funnelType": "quiz-to-paywall",
  "screens": [
    {
      "id": "screen_id",
      "type": "question_type",
      "headline": "Screen headline",
      "options": [...],
      "nextScreenLogic": "next_screen_id",
      "uiComponents": [...]
    }
  ]
}
```

## 🤖 AI Model Context

This repository is designed to work seamlessly with AI coding assistants. See:
- **CONTEXT.md** - Complete context for AI models
- **ARCHITECTURE.md** - Detailed technical architecture
- **CLAUDE.md** - Project-specific instructions

## 📝 Development Guidelines

### Test Credentials

When testing funnels, use:
- **Email**: `test@testtest1.com` (increment number if needed)
- **Name**: `Test User`
- **Phone**: `+1234567890`

### Funnel Analysis Best Practices

1. Always use test credentials for form fields
2. Capture screenshots with `encoded: true` for file saving
3. Document all screen types, question formats, and conversion tactics
4. Pay attention to:
   - Progress indicators
   - CTA button text
   - Trust signals and social proof
   - Urgency/scarcity elements
   - Pricing structures on paywalls

## 🔧 Technologies Used

- **Puppeteer**: Browser automation
- **Node.js**: JavaScript runtime
- **Python**: PDF generation and utilities
- **Pillow (PIL)**: Image processing for PDFs

## 📄 License

[Add your license here]

## 👤 Author

[Add your name/info here]
