/**
 * Compass Funnel Application
 * Multi-screen architecture with JSON-driven content and state management
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    brandName: 'Compass',
    // Try multiple paths for JSON loading (relative to funnel/ or project root)
    funnelDataPaths: [
        '../liven-funnel-analysis.json',
        '/liven-funnel-analysis.json',
        'liven-funnel-analysis.json'
    ],
    storageKey: 'compass_funnel_state',
    debug: false, // Set to true for development debugging
    subheadline: 'IMPROVE YOUR WELL-BEING WITH OUR PERSONALIZED PLAN'
};

// ========================================
// Debug Logger (only logs when debug is enabled)
// ========================================
const log = {
    info: (...args) => CONFIG.debug && console.log(...args),
    warn: (...args) => CONFIG.debug && console.warn(...args),
    error: (...args) => console.error(...args) // Always log errors
};

// ========================================
// Security Utilities
// ========================================
const Security = {
    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// ========================================
// Icon Library (Lucide-inspired SVGs)
// ========================================
const Icons = {
    /**
     * SVG icon definitions mapped to JSON icon names
     * All icons use 24x24 viewBox with stroke-based rendering
     */
    icons: {
        // People/Users icon - for "Single"
        people: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>`,

        // Heart icon - for "In a relationship"
        heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>`,

        // Rings icon - for "Engaged" (using circle/ring representation)
        rings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="12" r="5"/>
            <circle cx="15" cy="12" r="5"/>
        </svg>`,

        // Link icon - for "Married"
        link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>`,

        // Handshake icon - for "Civil partnership"
        handshake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
            <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
            <path d="m21 3 1 11h-2"/>
            <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
            <path d="M3 4h8"/>
        </svg>`,

        // Additional icons for other question types
        broken_heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            <path d="m12 13-1-1 2-2-3-3 2-2"/>
        </svg>`,

        puzzle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>
        </svg>`,

        thumbs_up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 10v12"/>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
        </svg>`,

        thumbs_down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 14V2"/>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
        </svg>`,

        smile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" x2="9.01" y1="9" y2="9"/>
            <line x1="15" x2="15.01" y1="9" y2="9"/>
        </svg>`,

        lightning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>`,

        hand_stop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>`,

        checkmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"/>
        </svg>`,

        question: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
        </svg>`,

        prohibited: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m4.9 4.9 14.2 14.2"/>
        </svg>`,

        // ========================================
        // Likert Scale Icons (custom styled)
        // ========================================
        
        // Thumbs down with X - "Strongly disagree" (position 1)
        thumbs_down_x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 14V2"/>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
            <path d="m3 3 4 4" stroke="#ef4444" stroke-width="2.5"/>
            <path d="m7 3-4 4" stroke="#ef4444" stroke-width="2.5"/>
        </svg>`,

        // Thumbs up with stars - "Strongly agree" (position 5)
        thumbs_up_star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 10v12"/>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
            <path d="M19 2l1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2L16 4.5l2-.5 1-2z" fill="#fbbf24" stroke="#fbbf24" stroke-width="1"/>
        </svg>`
    },

    /**
     * Emoji mapping for icon_checkbox_list questions
     * Maps JSON icon names to Unicode emoji characters
     */
    emojis: {
        // Wellbeing emotions (q26)
        stressed_emoji: '😰',
        mood_emoji: '🎭',
        worry_emoji: '😟',
        sad_emoji: '😢',
        battery_emoji: '🔋',
        mirror_emoji: '🪞',
        thumbs_up_emoji: '👍',
        
        // Improvement areas (q28)
        meditation_emoji: '🧘',
        target_emoji: '🎯',
        flame_emoji: '🔥',
        lightning_emoji: '⚡',
        bicep_emoji: '💪',
        
        // Goals (q31)
        couple_emoji: '👫',
        confident_emoji: '😎',
        heart_emoji: '❤️',
        trophy_emoji: '🏆'
    },

    /**
     * Get SVG icon by name
     * @param {string} name - Icon name from JSON
     * @returns {string} SVG markup or fallback circle
     */
    get(name) {
        return this.icons[name] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="8"/>
        </svg>`;
    },

    /**
     * Get emoji character by name
     * @param {string} name - Emoji icon name from JSON (e.g., "stressed_emoji")
     * @returns {string} Emoji character or fallback
     */
    getEmoji(name) {
        return this.emojis[name] || '•';
    }
};

// ========================================
// State Management
// ========================================
const State = {
    /**
     * Current application state
     */
    data: {
        currentScreen: 'landing',
        answers: {},
        history: [],      // Navigation history for back button
        startedAt: null
    },

    /**
     * Initialize state from localStorage or defaults
     */
    init() {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                log.info('[State] Restored from localStorage:', this.data);
            } catch (e) {
                log.warn('[State] Failed to parse saved state, using defaults');
                this.reset();
            }
        } else {
            this.reset();
        }
    },

    /**
     * Reset state to defaults
     */
    reset() {
        this.data = {
            currentScreen: 'landing',
            answers: {},
            history: [],
            startedAt: new Date().toISOString()
        };
        this.save();
        log.info('[State] Reset to defaults');
    },

    /**
     * Save current state to localStorage
     */
    save() {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.data));
    },

    /**
     * Update a specific property and save
     * @param {string} key - Property key
     * @param {any} value - New value
     */
    set(key, value) {
        this.data[key] = value;
        this.save();
        log.info(`[State] Updated ${key}:`, value);
    },

    /**
     * Record an answer for a screen
     * @param {string} screenId - Screen identifier
     * @param {any} answer - User's answer
     */
    recordAnswer(screenId, answer) {
        this.data.answers[screenId] = {
            value: answer,
            timestamp: new Date().toISOString()
        };
        this.save();
        log.info(`[State] Recorded answer for ${screenId}:`, answer);
    },

    /**
     * Get answer for a screen
     * @param {string} screenId - Screen identifier
     * @returns {any} The recorded answer or null
     */
    getAnswer(screenId) {
        return this.data.answers[screenId]?.value || null;
    },

    /**
     * Toggle a value in a multiple choice answer array
     * @param {string} screenId - Screen identifier
     * @param {string} value - Value to toggle
     * @returns {Array} Updated array of selected values
     */
    toggleAnswer(screenId, value) {
        // Get current answers as array, or initialize empty
        let current = this.getAnswer(screenId);
        if (!Array.isArray(current)) {
            current = [];
        }

        // Toggle the value
        const index = current.indexOf(value);
        if (index === -1) {
            current.push(value);
        } else {
            current.splice(index, 1);
        }

        // Save and return
        this.recordAnswer(screenId, current);
        return current;
    },

    /**
     * Check if a screen has any answers selected
     * @param {string} screenId - Screen identifier
     * @returns {boolean} True if at least one answer is selected
     */
    hasAnswers(screenId) {
        const answer = this.getAnswer(screenId);
        if (Array.isArray(answer)) {
            return answer.length > 0;
        }
        return answer !== null && answer !== undefined && answer !== '';
    },

    /**
     * Check if a specific value is selected for a screen
     * @param {string} screenId - Screen identifier
     * @param {string} value - Value to check
     * @returns {boolean} True if value is selected
     */
    isSelected(screenId, value) {
        const answer = this.getAnswer(screenId);
        if (Array.isArray(answer)) {
            return answer.includes(value);
        }
        return answer === value;
    },

    /**
     * Push current screen to navigation history
     * @param {string} screenId - Screen to add to history
     */
    pushHistory(screenId) {
        this.data.history.push(screenId);
        this.save();
        log.info(`[State] Pushed to history: ${screenId}`, this.data.history);
    },

    /**
     * Pop and return the last screen from navigation history
     * @returns {string|null} Previous screen ID or null if empty
     */
    popHistory() {
        const previous = this.data.history.pop() || null;
        this.save();
        log.info(`[State] Popped from history: ${previous}`, this.data.history);
        return previous;
    }
};

// ========================================
// Router - Screen Navigation
// ========================================
const Router = {
    /**
     * Funnel screens data (loaded from JSON)
     */
    screens: [],

    /**
     * Navigate to a specific screen
     * @param {string} screenId - Target screen ID
     */
    navigate(screenId) {
        log.info(`[Router] Navigating to: ${screenId}`);
        State.set('currentScreen', screenId);
        App.render();
    },

    /**
     * Get screen data by ID
     * @param {string} screenId - Screen identifier
     * @returns {Object|null} Screen data or null if not found
     */
    getScreen(screenId) {
        return this.screens.find(s => s.id === screenId) || null;
    },

    /**
     * Get the next screen based on current screen's logic
     * @param {string} currentScreenId - Current screen ID
     * @returns {string|null} Next screen ID or null
     */
    getNextScreen(currentScreenId) {
        const screen = this.getScreen(currentScreenId);
        return screen?.nextScreenLogic || null;
    }
};

// ========================================
// UI Components
// ========================================
const Components = {
    /**
     * Render header with brand logo
     * @returns {string} HTML string
     */
    header() {
        return `
            <header class="header">
                <div class="logo">${CONFIG.brandName}</div>
                <button class="menu-button" aria-label="Menu">
                    <div class="menu-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </header>
        `;
    },

    /**
     * Render progress bar
     * @param {number} current - Current question number
     * @param {number} total - Total questions (defaults to calculating from screens)
     * @returns {string} HTML string
     */
    progressBar(current, total = null) {
        // Calculate total from screens if not provided
        const totalQuestions = total || Router.screens.filter(s => s.questionNumber).length;
        const percentage = (current / totalQuestions) * 100;
        return `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-bar__fill" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-text">${current} / ${totalQuestions}</div>
            </div>
        `;
    },

    /**
     * Render back button
     * @param {string} targetScreen - Screen to navigate back to
     * @returns {string} HTML string
     */
    backButton(targetScreen) {
        return `
            <button class="back-button" data-navigate="${targetScreen}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
            </button>
        `;
    },

    /**
     * Render gender selection card
     * @param {string} gender - 'Male' or 'Female'
     * @param {string} imagePath - Path to character image
     * @returns {string} HTML string
     */
    genderCard(gender, imagePath) {
        const isSelected = State.getAnswer('landing') === gender.toLowerCase();
        const safeGender = Security.escapeHtml(gender);
        return `
            <div class="gender-card ${isSelected ? 'selected' : ''}" 
                 data-gender="${safeGender.toLowerCase()}"
                 role="button"
                 tabindex="0"
                 aria-label="Select ${safeGender}">
                <img class="gender-card__image" 
                     src="${Security.escapeHtml(imagePath)}" 
                     alt="${safeGender} character"
                     loading="lazy">
                <div class="gender-card__label">
                    <span>${safeGender}</span>
                    <div class="gender-card__arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render answer card for single choice questions
     * Supports both icon_list (with icons) and text_list (text only, full width)
     * @param {Object} option - Option object with label and optional icon
     * @param {string} screenId - Current screen ID for data attribute
     * @returns {string} HTML string
     */
    answerCard(option, screenId) {
        const safeLabel = Security.escapeHtml(option.label);
        const hasIcon = !!option.icon;
        const iconSvg = hasIcon ? Icons.get(option.icon) : '';
        const isSelected = State.isSelected(screenId, option.label);
        
        // Add modifier class when no icon (text_list style)
        const modifierClass = hasIcon ? '' : 'answer-card--text-only';

        return `
            <div class="answer-card ${modifierClass} ${isSelected ? 'selected' : ''}"
                 data-screen="${Security.escapeHtml(screenId)}"
                 data-answer="${safeLabel}"
                 role="button"
                 tabindex="0"
                 aria-label="Select ${safeLabel}">
                ${hasIcon ? `<div class="answer-card__icon">${iconSvg}</div>` : ''}
                <span class="answer-card__label">${safeLabel}</span>
                <div class="answer-card__arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </div>
            </div>
        `;
    },

    /**
     * Render checkbox answer for multiple choice questions (checkbox_list style)
     * @param {Object} option - Option object with label
     * @param {string} screenId - Current screen ID
     * @returns {string} HTML string
     */
    checkboxAnswer(option, screenId) {
        const safeLabel = Security.escapeHtml(option.label);
        const isSelected = State.isSelected(screenId, option.label);

        return `
            <label class="checkbox-answer ${isSelected ? 'checkbox-answer--selected' : ''}"
                   data-screen="${Security.escapeHtml(screenId)}"
                   data-answer="${safeLabel}">
                <div class="checkbox-answer__checkbox">
                    ${isSelected ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>` : ''}
                </div>
                <span class="checkbox-answer__label">${safeLabel}</span>
            </label>
        `;
    },

    /**
     * Render checkbox answer with emoji icon (icon_checkbox_list style)
     * @param {Object} option - Option object with label and icon
     * @param {string} screenId - Current screen ID
     * @returns {string} HTML string
     */
    iconCheckboxAnswer(option, screenId) {
        const safeLabel = Security.escapeHtml(option.label);
        const emoji = option.icon ? Icons.getEmoji(option.icon) : '';
        const isSelected = State.isSelected(screenId, option.label);

        return `
            <label class="checkbox-answer checkbox-answer--icon ${isSelected ? 'checkbox-answer--selected' : ''}"
                   data-screen="${Security.escapeHtml(screenId)}"
                   data-answer="${safeLabel}">
                <div class="checkbox-answer__checkbox">
                    ${isSelected ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>` : ''}
                </div>
                ${emoji ? `<span class="checkbox-answer__emoji">${emoji}</span>` : ''}
                <span class="checkbox-answer__label">${safeLabel}</span>
            </label>
        `;
    },

    /**
     * Render text input field for "Type your answer" option
     * Auto-selects as a checkbox when user types
     * @param {string} screenId - Current screen ID
     * @param {string} placeholder - Placeholder text
     * @returns {string} HTML string
     */
    textInputField(screenId, placeholder = 'Type your answer here...') {
        const currentValue = State.getAnswer(screenId);
        const textValue = Array.isArray(currentValue) 
            ? currentValue.find(v => v.startsWith('__custom:'))?.replace('__custom:', '') || ''
            : '';
        const isSelected = textValue.length > 0;

        return `
            <div class="text-input-field ${isSelected ? 'text-input-field--active' : ''}"
                 data-screen="${Security.escapeHtml(screenId)}">
                <div class="text-input-field__checkbox">
                    ${isSelected ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>` : ''}
                </div>
                <input type="text" 
                       class="text-input-field__input"
                       placeholder="${Security.escapeHtml(placeholder)}"
                       value="${Security.escapeHtml(textValue)}"
                       data-screen="${Security.escapeHtml(screenId)}">
            </div>
        `;
    },

    /**
     * Render continue button for multiple choice screens
     * @param {boolean} disabled - Whether button should be disabled
     * @param {string} screenId - Current screen ID for navigation
     * @returns {string} HTML string
     */
    continueButton(disabled, screenId) {
        return `
            <button class="continue-button ${disabled ? 'continue-button--disabled' : ''}"
                    data-screen="${Security.escapeHtml(screenId)}"
                    ${disabled ? 'disabled' : ''}>
                Continue
            </button>
        `;
    },

    /**
     * Render single likert scale option
     * @param {Object} option - Option object with value, label, and icon
     * @param {string} screenId - Current screen ID
     * @param {boolean} isFirst - True if first option (show label below)
     * @param {boolean} isLast - True if last option (show label below)
     * @returns {string} HTML string
     */
    likertOption(option, screenId, isFirst = false, isLast = false) {
        const isSelected = State.isSelected(screenId, option.value);
        const iconSvg = option.icon ? Icons.get(option.icon) : '';
        const showLabel = (isFirst || isLast) && option.label;

        return `
            <div class="likert-option ${isSelected ? 'likert-option--selected' : ''}"
                 data-screen="${Security.escapeHtml(screenId)}"
                 data-value="${option.value}"
                 role="button"
                 tabindex="0"
                 aria-label="${Security.escapeHtml(option.label || `Rating ${option.value}`)}">
                <div class="likert-option__icon">
                    ${iconSvg}
                </div>
                ${showLabel ? `<span class="likert-option__label">${Security.escapeHtml(option.label)}</span>` : ''}
            </div>
        `;
    },

    /**
     * Render horizontal likert scale with 5 options
     * @param {Array} options - Array of option objects
     * @param {string} screenId - Current screen ID
     * @returns {string} HTML string
     */
    likertScale(options, screenId) {
        const optionsHtml = options.map((option, index) => {
            const isFirst = index === 0;
            const isLast = index === options.length - 1;
            return this.likertOption(option, screenId, isFirst, isLast);
        }).join('');

        return `
            <div class="likert-scale" data-screen="${Security.escapeHtml(screenId)}">
                ${optionsHtml}
            </div>
        `;
    },

    /**
     * Render legal disclaimer
     * @param {string} text - Legal text from JSON
     * @returns {string} HTML string
     */
    legalDisclaimer(text) {
        // Sanitize the input text first
        let safeText = Security.escapeHtml(text);
        
        // TODO: Replace placeholder URLs with actual policy page URLs when available
        const policyLinks = {
            'Terms of Use and Service': '#terms',
            'Privacy Policy': '#privacy',
            'Subscription Policy': '#subscription',
            'Cookie Policy': '#cookies'
        };
        
        // Replace policy names with links using regex for robustness
        Object.entries(policyLinks).forEach(([name, url]) => {
            const regex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            safeText = safeText.replace(regex, `<a href="${url}">${name}</a>`);
        });
        
        return `
            <footer class="legal">
                ${safeText}
            </footer>
        `;
    }
};

// ========================================
// Screen Renderers
// ========================================
const Screens = {
    /**
     * Render landing screen (gender selection)
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    landing(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline);
        const safeSubheadline = Security.escapeHtml(screenData.subheadline);
        
        return `
            <div class="screen" data-screen="landing">
                ${Components.header()}
                
                <main class="content">
                    <h1 class="headline">${safeHeadline}</h1>
                    <p class="subheadline">${CONFIG.subheadline}</p>
                    <span class="badge">${safeSubheadline}</span>
                    
                    <div class="gender-cards">
                        ${Components.genderCard('Male', 'assets/male.png')}
                        ${Components.genderCard('Female', 'assets/female.png')}
                    </div>
                </main>
                
                ${Components.legalDisclaimer(screenData.legalText)}
            </div>
        `;
    },

    /**
     * Render single choice question screen
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    singleChoice(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline);
        const questionNumber = screenData.questionNumber || 1;

        // Determine previous screen for back button
        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Render answer cards from options
        const answerCardsHtml = screenData.options
            .map(option => Components.answerCard(option, screenData.id))
            .join('');

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                ${Components.progressBar(questionNumber)}

                <main class="content content--left">
                    <h1 class="headline headline--question">${safeHeadline}</h1>

                    <div class="answer-cards">
                        ${answerCardsHtml}
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render multiple choice question screen
     * Supports checkbox_list and icon_checkbox_list styles
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    multipleChoice(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline);
        const safeSubheadline = screenData.subheadline ? Security.escapeHtml(screenData.subheadline) : '';
        const questionNumber = screenData.questionNumber || 1;
        const isIconStyle = screenData.optionStyle === 'icon_checkbox_list';

        // Determine previous screen for back button
        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Filter out text_input options and render checkboxes
        const regularOptions = screenData.options.filter(opt => opt.type !== 'text_input');
        const hasTextInput = screenData.options.some(opt => opt.type === 'text_input');

        // Render checkbox answers based on style
        const checkboxesHtml = regularOptions.map(option => {
            return isIconStyle
                ? Components.iconCheckboxAnswer(option, screenData.id)
                : Components.checkboxAnswer(option, screenData.id);
        }).join('');

        // Check if continue should be disabled
        const hasSelection = State.hasAnswers(screenData.id);

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                ${Components.progressBar(questionNumber)}

                <main class="content content--left">
                    <h1 class="headline headline--question">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline subheadline--question">${safeSubheadline}</p>` : ''}

                    <div class="checkbox-answers ${isIconStyle ? 'checkbox-answers--icon' : ''}">
                        ${checkboxesHtml}
                    </div>

                    ${hasTextInput ? Components.textInputField(screenData.id) : ''}

                    <div class="continue-container">
                        ${Components.continueButton(!hasSelection, screenData.id)}
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render likert scale question screen
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    likertScaleScreen(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline);
        const safeSubheadline = screenData.subheadline ? Security.escapeHtml(screenData.subheadline) : '';
        const questionNumber = screenData.questionNumber || 1;

        // Determine previous screen for back button
        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                ${Components.progressBar(questionNumber)}

                <main class="content content--left">
                    <h1 class="headline headline--question headline--likert">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline subheadline--question">${safeSubheadline}</p>` : ''}

                    ${Components.likertScale(screenData.options, screenData.id)}
                </main>
            </div>
        `;
    },

    /**
     * Render placeholder for screens not yet implemented
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    placeholder(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || `Screen: ${screenData.id}`);
        
        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}
                ${screenData.questionNumber ? Components.progressBar(screenData.questionNumber) : ''}
                
                <main class="content">
                    <h1 class="headline">${safeHeadline}</h1>
                    <p class="subheadline">This screen is not yet implemented</p>
                    
                    <button class="back-button" data-navigate="landing">
                        ← Back to Start
                    </button>
                </main>
            </div>
        `;
    }
};

// ========================================
// Event Handlers
// ========================================
const Events = {
    /**
     * Initialize event listeners
     */
    init() {
        // Use event delegation on the app container
        const appEl = document.getElementById('app');
        appEl.addEventListener('click', this.handleClick.bind(this));
        appEl.addEventListener('keydown', this.handleKeydown.bind(this));
        appEl.addEventListener('input', this.handleInput.bind(this));
    },

    /**
     * Handle click events
     * @param {Event} e - Click event
     */
    handleClick(e) {
        // Back button click (check FIRST - highest priority)
        const backButton = e.target.closest('.back-button');
        if (backButton) {
            log.info('[Events] Back button handler triggered');
            e.preventDefault();
            e.stopPropagation();
            this.handleBackNavigation();
            return;
        }

        // Gender card click
        const genderCard = e.target.closest('.gender-card');
        if (genderCard) {
            this.handleGenderSelect(genderCard);
            return;
        }

        // Answer card click (single choice questions)
        const answerCard = e.target.closest('.answer-card');
        if (answerCard) {
            this.handleAnswerSelect(answerCard);
            return;
        }

        // Checkbox answer click (multiple choice questions)
        const checkboxAnswer = e.target.closest('.checkbox-answer');
        if (checkboxAnswer) {
            this.handleCheckboxSelect(checkboxAnswer);
            return;
        }

        // Likert option click
        const likertOption = e.target.closest('.likert-option');
        if (likertOption) {
            this.handleLikertSelect(likertOption);
            return;
        }

        // Continue button click
        const continueButton = e.target.closest('.continue-button:not(.continue-button--disabled)');
        if (continueButton) {
            this.handleContinueClick(continueButton);
            return;
        }

        // Other navigation button click (NOT back button)
        const navButton = e.target.closest('[data-navigate]:not(.back-button)');
        if (navButton) {
            const targetScreen = navButton.dataset.navigate;
            Router.navigate(targetScreen);
            return;
        }
    },

    /**
     * Handle input events (for text input auto-select)
     * @param {Event} e - Input event
     */
    handleInput(e) {
        const textInput = e.target.closest('.text-input-field__input');
        if (textInput) {
            this.handleTextInput(textInput);
        }
    },

    /**
     * Handle keyboard events (for accessibility)
     * @param {Event} e - Keydown event
     */
    handleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            // Gender card keyboard activation
            const genderCard = e.target.closest('.gender-card');
            if (genderCard) {
                e.preventDefault();
                this.handleGenderSelect(genderCard);
                return;
            }

            // Answer card keyboard activation
            const answerCard = e.target.closest('.answer-card');
            if (answerCard) {
                e.preventDefault();
                this.handleAnswerSelect(answerCard);
                return;
            }

            // Checkbox answer keyboard activation
            const checkboxAnswer = e.target.closest('.checkbox-answer');
            if (checkboxAnswer) {
                e.preventDefault();
                this.handleCheckboxSelect(checkboxAnswer);
                return;
            }

            // Likert option keyboard activation
            const likertOption = e.target.closest('.likert-option');
            if (likertOption) {
                e.preventDefault();
                this.handleLikertSelect(likertOption);
                return;
            }
        }
    },

    /**
     * Handle gender card selection
     * @param {HTMLElement} card - The clicked gender card element
     */
    handleGenderSelect(card) {
        const gender = card.dataset.gender;

        // 1. Log user action
        log.info(`[User Action] Selected gender: ${gender}`);
        log.info('[Debug] Router.screens count:', Router.screens.length);

        // 2. Store in state (localStorage)
        State.recordAnswer('landing', gender);

        // 3. Push current screen to history before navigating
        State.pushHistory('landing');

        // 4. Navigate to next screen
        const nextScreen = Router.getNextScreen('landing');
        log.info('[Debug] Next screen ID:', nextScreen);

        if (nextScreen) {
            const nextScreenData = Router.getScreen(nextScreen);
            if (nextScreenData) {
                Router.navigate(nextScreen);
            } else {
                log.error(`[Router] Screen '${nextScreen}' not found in Router.screens`);
                App.showError(`Screen '${nextScreen}' not found. Please refresh and try again.`);
            }
        } else {
            log.warn('[Router] No next screen defined for landing');
        }
    },

    /**
     * Handle answer card selection (single choice questions)
     * @param {HTMLElement} card - The clicked answer card element
     */
    handleAnswerSelect(card) {
        const screenId = card.dataset.screen;
        const answer = card.dataset.answer;

        // 1. Log user action
        log.info(`[User Action] Selected answer on ${screenId}: ${answer}`);

        // 2. Record answer in state
        State.recordAnswer(screenId, answer);

        // 3. Push current screen to history
        State.pushHistory(screenId);

        // 4. Navigate to next screen
        const nextScreen = Router.getNextScreen(screenId);
        if (nextScreen) {
            Router.navigate(nextScreen);
        } else {
            log.warn(`[Router] No next screen defined for ${screenId}`);
        }
    },

    /**
     * Handle back button navigation using history
     */
    handleBackNavigation() {
        log.info('[Events] Back button clicked, history:', [...State.data.history]);

        // Pop from history to get previous screen
        const previousScreen = State.popHistory();

        if (previousScreen) {
            log.info(`[User Action] Back navigation to: ${previousScreen}`);
            Router.navigate(previousScreen);
        } else {
            // Fallback to landing if history is empty
            log.info('[User Action] Back navigation (fallback) to: landing');
            Router.navigate('landing');
        }
    },

    /**
     * Handle checkbox selection (multiple choice questions)
     * Toggles selection and re-renders to update UI
     * @param {HTMLElement} checkbox - The clicked checkbox element
     */
    handleCheckboxSelect(checkbox) {
        const screenId = checkbox.dataset.screen;
        const answer = checkbox.dataset.answer;

        log.info(`[User Action] Toggled checkbox on ${screenId}: ${answer}`);

        // Toggle the answer in state
        State.toggleAnswer(screenId, answer);

        // Re-render to update UI (checkbox state and continue button)
        App.render();
    },

    /**
     * Handle likert scale selection
     * Selects value and auto-advances to next screen
     * @param {HTMLElement} option - The clicked likert option element
     */
    handleLikertSelect(option) {
        const screenId = option.dataset.screen;
        const value = parseInt(option.dataset.value, 10);

        log.info(`[User Action] Selected likert value on ${screenId}: ${value}`);

        // Record the answer
        State.recordAnswer(screenId, value);

        // Push current screen to history
        State.pushHistory(screenId);

        // Auto-advance to next screen
        const nextScreen = Router.getNextScreen(screenId);
        if (nextScreen) {
            Router.navigate(nextScreen);
        } else {
            log.warn(`[Router] No next screen defined for ${screenId}`);
        }
    },

    /**
     * Handle text input for "Type your answer" field
     * Auto-selects as a checkbox option when user types
     * @param {HTMLElement} input - The text input element
     */
    handleTextInput(input) {
        const screenId = input.dataset.screen;
        const value = input.value.trim();
        const customKey = '__custom:' + value;

        log.info(`[User Action] Text input on ${screenId}: "${value}"`);

        // Get current answers
        let current = State.getAnswer(screenId);
        if (!Array.isArray(current)) {
            current = [];
        }

        // Remove any existing custom answer
        current = current.filter(v => !v.startsWith('__custom:'));

        // Add new custom answer if not empty
        if (value.length > 0) {
            current.push(customKey);
        }

        // Save to state
        State.recordAnswer(screenId, current);

        // Update continue button state without full re-render
        const continueBtn = document.querySelector('.continue-button');
        if (continueBtn) {
            const hasSelection = State.hasAnswers(screenId);
            continueBtn.disabled = !hasSelection;
            continueBtn.classList.toggle('continue-button--disabled', !hasSelection);
        }

        // Update text input checkbox visual
        const textField = input.closest('.text-input-field');
        if (textField) {
            textField.classList.toggle('text-input-field--active', value.length > 0);
            const checkboxDiv = textField.querySelector('.text-input-field__checkbox');
            if (checkboxDiv) {
                checkboxDiv.innerHTML = value.length > 0 
                    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>`
                    : '';
            }
        }
    },

    /**
     * Handle continue button click
     * Validates selection and navigates to next screen
     * @param {HTMLElement} button - The continue button element
     */
    handleContinueClick(button) {
        const screenId = button.dataset.screen;

        // Verify we have at least one selection
        if (!State.hasAnswers(screenId)) {
            log.warn(`[Events] Continue clicked but no answers selected for ${screenId}`);
            return;
        }

        log.info(`[User Action] Continue clicked on ${screenId}`);

        // Push current screen to history
        State.pushHistory(screenId);

        // Navigate to next screen
        const nextScreen = Router.getNextScreen(screenId);
        if (nextScreen) {
            Router.navigate(nextScreen);
        } else {
            log.warn(`[Router] No next screen defined for ${screenId}`);
        }
    }
};

// ========================================
// Main Application
// ========================================
const App = {
    /**
     * Show inline error message to user (non-blocking alternative to alert)
     * @param {string} message - Error message to display
     */
    showError(message) {
        const appEl = document.getElementById('app');
        const errorHtml = `
            <div class="error-toast" role="alert">
                <span>${Security.escapeHtml(message)}</span>
                <button class="error-toast__close" onclick="this.parentElement.remove()" aria-label="Dismiss">×</button>
            </div>
        `;
        appEl.insertAdjacentHTML('beforeend', errorHtml);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const toast = appEl.querySelector('.error-toast');
            if (toast) toast.remove();
        }, 5000);
    },

    /**
     * Initialize the application
     */
    async init() {
        log.info(`[App] Initializing ${CONFIG.brandName} Funnel...`);
        
        // Initialize state
        State.init();
        
        // Load funnel data
        await this.loadFunnelData();
        
        // Initialize event handlers
        Events.init();
        
        // Render current screen
        this.render();
        
        log.info('[App] Initialization complete');
    },

    /**
     * Load funnel data from JSON file
     * Tries multiple paths to handle different server configurations
     */
    async loadFunnelData() {
        // Try each path until one works
        for (const path of CONFIG.funnelDataPaths) {
            try {
                log.info(`[App] Trying to load JSON from: ${path}`);
                const response = await fetch(path);
                if (!response.ok) {
                    log.warn(`[App] Path ${path} returned ${response.status}`);
                    continue;
                }

                const data = await response.json();
                Router.screens = data.screens || [];

                log.info(`[App] Successfully loaded ${Router.screens.length} screens from ${path}`);
                return; // Success - exit the function
            } catch (error) {
                log.warn(`[App] Failed to load from ${path}:`, error.message);
            }
        }

        // All paths failed - use fallback
        log.error('[App] All JSON paths failed, using fallback data');
        Router.screens = this.getFallbackData();
    },

    /**
     * Get fallback screen data if JSON fails to load
     * @returns {Array} Fallback screens array
     */
    getFallbackData() {
        log.warn('[App] Using fallback data - JSON failed to load');
        return [
            {
                id: 'landing',
                type: 'gender_selection',
                screenType: 'landing',
                headline: 'A PERSONALIZED WELL-BEING MANAGEMENT PLAN',
                subheadline: '3-MINUTE QUIZ',
                options: ['Male', 'Female'],
                nextScreenLogic: 'question_1',
                legalText: "By clicking 'Male' or 'Female' you agree with the Terms of Use and Service, Privacy Policy, Subscription Policy and Cookie Policy"
            },
            {
                id: 'question_1',
                type: 'single_choice',
                questionNumber: 1,
                headline: 'What is your current relationship status?',
                options: [
                    { label: 'Single', icon: 'people' },
                    { label: 'In a relationship', icon: 'heart' },
                    { label: 'Engaged', icon: 'rings' },
                    { label: 'Married', icon: 'link' },
                    { label: 'Civil partnership', icon: 'handshake' }
                ],
                nextScreenLogic: 'question_2'
            }
        ];
    },

    /**
     * Render the current screen
     */
    render() {
        const currentScreenId = State.data.currentScreen;
        const screenData = Router.getScreen(currentScreenId);
        
        if (!screenData) {
            log.error(`[App] Screen not found: ${currentScreenId}`);
            return;
        }

        let html = '';
        
        // Select appropriate renderer based on screen type
        switch (screenData.screenType || screenData.type) {
            case 'landing':
            case 'gender_selection':
                html = Screens.landing(screenData);
                break;
            case 'single_choice':
                html = Screens.singleChoice(screenData);
                break;
            case 'multiple_choice':
                html = Screens.multipleChoice(screenData);
                break;
            case 'likert_scale':
                html = Screens.likertScaleScreen(screenData);
                break;
            default:
                html = Screens.placeholder(screenData);
        }

        // Update DOM
        document.getElementById('app').innerHTML = html;
        
        log.info(`[App] Rendered screen: ${currentScreenId}`);
    }
};

// ========================================
// Initialize on DOM ready
// ========================================
document.addEventListener('DOMContentLoaded', () => App.init());
