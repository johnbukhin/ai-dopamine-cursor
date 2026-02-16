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

    // ========================================
    // Interstitial Components
    // ========================================

    /**
     * Render info card with heart icon (interstitial_1)
     * @param {Object} content - Content object with title and description
     * @returns {string} HTML string
     */
    infoCard(content) {
        return `
            <div class="info-card">
                <div class="info-card__icon">${Icons.get('heart')}</div>
                <h2 class="info-card__title">${Security.escapeHtml(content.title || '')}</h2>
                <p class="info-card__description">${Security.escapeHtml(content.description || '')}</p>
            </div>
        `;
    },

    /**
     * Render checkmark bullet list
     * @param {Array<string>} bullets - Array of bullet point texts
     * @returns {string} HTML string
     */
    checkmarkBullets(bullets) {
        const bulletsHtml = bullets.map(text => `
            <li class="checkmark-bullet">
                <div class="checkmark-bullet__icon">${Icons.get('checkmark')}</div>
                <span class="checkmark-bullet__text">${Security.escapeHtml(text)}</span>
            </li>
        `).join('');

        return `<ul class="checkmark-bullets">${bulletsHtml}</ul>`;
    },

    /**
     * Render research citation (interstitial_2)
     * @param {Object} citation - Citation with author, year, title
     * @returns {string} HTML string
     */
    researchCitation(citation) {
        return `
            <div class="research-citation">
                <span class="research-citation__author">${Security.escapeHtml(citation.author)}</span>
                <span class="research-citation__year">(${Security.escapeHtml(String(citation.year))})</span>
                <em class="research-citation__title">${Security.escapeHtml(citation.title)}</em>
            </div>
        `;
    },

    /**
     * Render image placeholder block
     * @param {string} label - Description of the placeholder image
     * @returns {string} HTML string
     */
    imagePlaceholder(label) {
        return `
            <div class="image-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                </svg>
                <span>${Security.escapeHtml(label)}</span>
            </div>
        `;
    },

    /**
     * Render university credibility logos (interstitial_3)
     * @param {Array<Object>} logos - Array of {name, type} objects
     * @returns {string} HTML string
     */
    universityLogos(logos) {
        const logosHtml = logos.map(logo => {
            const initial = logo.name.charAt(0);
            return `
                <div class="university-logo">
                    <div class="university-logo__shield">${Security.escapeHtml(initial)}</div>
                    <span class="university-logo__name">${Security.escapeHtml(logo.name)}</span>
                </div>
            `;
        }).join('');

        return `<div class="university-logos">${logosHtml}</div>`;
    },

    /**
     * Render CBT circular diagram (interstitial_4)
     * Shows Thoughts ↔ Feelings ↔ Behavior in a triangle
     * @param {Object} cbtModel - Model with elements array
     * @returns {string} HTML string
     */
    cbtDiagram(cbtModel) {
        const elements = cbtModel.elements || ['Thoughts', 'Feelings', 'Behavior'];
        return `
            <div class="cbt-diagram">
                <svg viewBox="0 0 200 180" class="cbt-diagram__svg">
                    <!-- Connecting arrows (circular) -->
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
                                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)"/>
                        </marker>
                    </defs>
                    <!-- Top to right -->
                    <line x1="120" y1="35" x2="160" y2="110" stroke="var(--color-primary)" stroke-width="2" marker-end="url(#arrow)"/>
                    <!-- Right to left -->
                    <line x1="145" y1="140" x2="55" y2="140" stroke="var(--color-primary)" stroke-width="2" marker-end="url(#arrow)"/>
                    <!-- Left to top -->
                    <line x1="40" y1="110" x2="80" y2="35" stroke="var(--color-primary)" stroke-width="2" marker-end="url(#arrow)"/>

                    <!-- Node circles -->
                    <circle cx="100" cy="25" r="22" fill="var(--color-primary)" opacity="0.15" stroke="var(--color-primary)" stroke-width="2"/>
                    <circle cx="165" cy="140" r="22" fill="var(--color-primary)" opacity="0.15" stroke="var(--color-primary)" stroke-width="2"/>
                    <circle cx="35" cy="140" r="22" fill="var(--color-primary)" opacity="0.15" stroke="var(--color-primary)" stroke-width="2"/>

                    <!-- Labels -->
                    <text x="100" y="29" text-anchor="middle" fill="var(--color-primary)" font-size="10" font-weight="600">${Security.escapeHtml(elements[0])}</text>
                    <text x="165" y="144" text-anchor="middle" fill="var(--color-primary)" font-size="10" font-weight="600">${Security.escapeHtml(elements[1])}</text>
                    <text x="35" y="144" text-anchor="middle" fill="var(--color-primary)" font-size="10" font-weight="600">${Security.escapeHtml(elements[2])}</text>
                </svg>
            </div>
        `;
    },

    /**
     * Render expert review badge
     * @param {Object} expert - Expert object with badge text
     * @returns {string} HTML string
     */
    expertBadge(expert) {
        return `
            <div class="expert-badge">
                ${Icons.get('checkmark')}
                <span>${Security.escapeHtml(expert.badge || 'Content reviewed by an expert')}</span>
            </div>
        `;
    },

    /**
     * Render therapist card with photo placeholder
     * @param {Object} expert - Expert object with name and title
     * @returns {string} HTML string
     */
    therapistCard(expert) {
        return `
            <div class="therapist-card">
                <div class="therapist-card__photo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M20 21a8 8 0 1 0-16 0"/>
                    </svg>
                </div>
                <div class="therapist-card__info">
                    <span class="therapist-card__name">${Security.escapeHtml(expert.name || '')}</span>
                    <span class="therapist-card__title">${Security.escapeHtml(expert.title || '')}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render stylized world map with avatar markers (interstitial_5)
     * @param {Array<string>} locations - Continent names for marker placement
     * @returns {string} HTML string
     */
    worldMap(locations) {
        // Marker positions mapped to approximate continent centers
        const markerPositions = {
            'North America': { x: 120, y: 100 },
            'South America': { x: 170, y: 220 },
            'Europe': { x: 330, y: 85 },
            'Africa': { x: 330, y: 180 },
            'Asia': { x: 440, y: 110 },
            'Australia': { x: 490, y: 240 }
        };

        const markersHtml = locations.map(loc => {
            const pos = markerPositions[loc] || { x: 300, y: 150 };
            return `
                <circle cx="${pos.x}" cy="${pos.y}" r="6" fill="var(--color-primary)" opacity="0.8" class="avatar-marker"/>
                <circle cx="${pos.x}" cy="${pos.y}" r="12" fill="var(--color-primary)" opacity="0.2" class="avatar-marker__pulse"/>
            `;
        }).join('');

        return `
            <div class="world-map">
                <svg viewBox="0 0 600 320" class="world-map__svg">
                    <!-- Simplified continent outlines -->
                    <!-- North America -->
                    <path d="M80,50 Q100,30 140,40 L160,60 Q170,80 160,100 L140,120 Q120,140 100,130 L80,110 Q60,90 70,70 Z" fill="var(--color-primary)" opacity="0.12" stroke="var(--color-primary)" stroke-width="0.5"/>
                    <!-- South America -->
                    <path d="M150,160 Q165,150 175,165 L185,200 Q190,230 180,250 L165,260 Q150,255 148,240 L145,210 Q140,180 150,160 Z" fill="var(--color-primary)" opacity="0.12" stroke="var(--color-primary)" stroke-width="0.5"/>
                    <!-- Europe -->
                    <path d="M300,50 Q320,40 340,50 L350,70 Q355,85 345,95 L325,100 Q310,95 305,80 L300,65 Z" fill="var(--color-primary)" opacity="0.12" stroke="var(--color-primary)" stroke-width="0.5"/>
                    <!-- Africa -->
                    <path d="M310,120 Q330,110 350,120 L355,150 Q360,180 350,210 L335,230 Q320,235 310,220 L305,190 Q300,160 305,140 Z" fill="var(--color-primary)" opacity="0.12" stroke="var(--color-primary)" stroke-width="0.5"/>
                    <!-- Asia -->
                    <path d="M370,40 Q400,30 440,45 L470,60 Q490,80 485,110 L470,130 Q450,145 420,140 L390,130 Q370,115 365,90 L360,70 Q360,50 370,40 Z" fill="var(--color-primary)" opacity="0.12" stroke="var(--color-primary)" stroke-width="0.5"/>
                    <!-- Australia -->
                    <path d="M470,210 Q490,200 510,210 L515,230 Q510,250 495,255 L480,250 Q465,240 468,225 Z" fill="var(--color-primary)" opacity="0.12" stroke="var(--color-primary)" stroke-width="0.5"/>

                    <!-- Avatar markers -->
                    ${markersHtml}
                </svg>
            </div>
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

    // ========================================
    // Loading/Transition Components
    // ========================================

    /**
     * Render animated circular progress indicator
     * SVG circle with stroke-dasharray animation, percentage text in center
     * @returns {string} HTML string
     */
    circularProgress() {
        const circumference = 2 * Math.PI * 45; // r=45
        return `
            <div class="circular-progress" data-circumference="${circumference}">
                <svg viewBox="0 0 100 100" class="circular-progress__svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" stroke-width="6"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-primary)" stroke-width="6"
                            stroke-linecap="round"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${circumference}"
                            class="circular-progress__circle"
                            transform="rotate(-90 50 50)"/>
                </svg>
                <span class="circular-progress__text">0%</span>
            </div>
        `;
    },

    /**
     * Render progress checklist with sequential step completion
     * Steps start as pending and animate to completed via LoadingController
     * @param {Array<Object>} steps - Array of {label, status} objects
     * @returns {string} HTML string
     */
    progressChecklist(steps) {
        const stepsHtml = steps.map((step, index) => `
            <div class="progress-step" data-step="${index}">
                <div class="progress-step__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>
                </div>
                <span class="progress-step__label">${Security.escapeHtml(step.label)}</span>
            </div>
        `).join('');

        return `<div class="progress-checklist">${stepsHtml}</div>`;
    },

    /**
     * Render engagement modal overlay (commitment/knowledge/interest questions)
     * Fire-and-forget — answers are not stored in state
     * @param {Object} modal - Modal object with question, options, type
     * @param {number} index - Modal index for tracking
     * @returns {string} HTML string
     */
    engagementModal(modal, index) {
        const optionsHtml = modal.options.map(option => `
            <button class="engagement-modal__btn" data-modal-index="${index}">
                ${Security.escapeHtml(option)}
            </button>
        `).join('');

        return `
            <div class="engagement-modal" data-modal-index="${index}">
                <div class="engagement-modal__overlay"></div>
                <div class="engagement-modal__card">
                    <p class="engagement-modal__question">${Security.escapeHtml(modal.question)}</p>
                    <div class="engagement-modal__buttons">
                        ${optionsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render testimonial card with Trustpilot-style star rating
     * @param {Object} testimonial - Object with rating, title, content, author, source
     * @returns {string} HTML string
     */
    testimonialCard(testimonial) {
        // Generate star icons
        const stars = Array.from({ length: Math.min(testimonial.rating || 5, 5) }, () =>
            `<span class="testimonial-card__star">★</span>`
        ).join('');

        return `
            <div class="testimonial-card">
                <div class="testimonial-card__header">
                    <div class="testimonial-card__stars">${stars}</div>
                    ${testimonial.source ? `<span class="testimonial-card__source">${Security.escapeHtml(testimonial.source)}</span>` : ''}
                </div>
                <h4 class="testimonial-card__title">${Security.escapeHtml(testimonial.title || '')}</h4>
                <p class="testimonial-card__content">${Security.escapeHtml(testimonial.content || '')}</p>
                <span class="testimonial-card__author">— ${Security.escapeHtml(testimonial.author || '')}</span>
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

    // ========================================
    // Interstitial Screen Renderers
    // ========================================

    /**
     * Render trust building interstitial screen
     * Handles 3 variants based on data fields:
     *   - interstitial_1: heart icon + checkmark bullets
     *   - interstitial_3: university credibility logos
     *   - interstitial_4: CBT diagram + therapist card
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    trustBuilding(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline);
        const safeSubheadline = screenData.subheadline ? Security.escapeHtml(screenData.subheadline) : '';

        // Determine previous screen for back button
        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Build variant-specific content
        let bodyHtml = '';

        if (screenData.credibilityLogos) {
            // Variant: interstitial_3 — university logos
            bodyHtml = Components.universityLogos(screenData.credibilityLogos);
        } else if (screenData.content?.cbtModel) {
            // Variant: interstitial_4 — CBT diagram + therapist
            bodyHtml = `
                ${Components.cbtDiagram(screenData.content.cbtModel)}
                <p class="interstitial__description">${Security.escapeHtml(screenData.content.description)}</p>
                ${Components.expertBadge(screenData.content.expertReview)}
                ${Components.therapistCard(screenData.content.expertReview)}
            `;
        } else if (screenData.content) {
            // Variant: interstitial_1 — info card + checkmark bullets
            bodyHtml = `
                ${Components.infoCard(screenData.content)}
                ${screenData.content.bulletPoints ? Components.checkmarkBullets(screenData.content.bulletPoints) : ''}
            `;
        }

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content content--left interstitial">
                    <h1 class="headline headline--interstitial">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline subheadline--interstitial">${safeSubheadline}</p>` : ''}

                    ${bodyHtml}

                    <div class="continue-container">
                        ${Components.continueButton(false, screenData.id)}
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render educational interstitial screen (interstitial_2)
     * Shows research citation + image placeholder
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    educational(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline);

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content content--left interstitial">
                    <h1 class="headline headline--interstitial">${safeHeadline}</h1>

                    ${Components.imagePlaceholder(screenData.image || 'illustration')}

                    <div class="educational-card">
                        <p class="educational-card__description">
                            ${Security.escapeHtml(screenData.content?.description || '')}
                        </p>
                        ${screenData.content?.citation ? Components.researchCitation(screenData.content.citation) : ''}
                    </div>

                    <div class="continue-container">
                        ${Components.continueButton(false, screenData.id)}
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render social proof interstitial screen (interstitial_5)
     * Shows world map with avatar markers + user count
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    socialProof(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline);
        const safeSubheadline = screenData.subheadline ? Security.escapeHtml(screenData.subheadline) : '';

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content interstitial interstitial--centered">
                    <h1 class="headline headline--interstitial">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline subheadline--interstitial">${safeSubheadline}</p>` : ''}

                    ${Components.worldMap(screenData.visual?.locations || [])}

                    <div class="continue-container">
                        ${Components.continueButton(false, screenData.id)}
                    </div>
                </main>
            </div>
        `;
    },

    // ========================================
    // Loading/Transition Screen Renderers
    // ========================================

    /**
     * Render loading screen with social proof (loading_1)
     * Shows circular progress animation + social proof text, auto-advances when done
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    loadingSocialProof(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline || '');
        const safeContent = Security.escapeHtml(screenData.content || '');
        const safeSubheadline = Security.escapeHtml(screenData.subheadline || '');
        const safeLoadingText = Security.escapeHtml(screenData.loadingText || '');

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <main class="content loading-screen">
                    <h1 class="headline headline--loading">${safeHeadline}</h1>
                    <p class="loading-screen__content">${safeContent}</p>
                    <p class="loading-screen__subheadline">${safeSubheadline}</p>

                    ${Components.circularProgress()}

                    <p class="loading-screen__status">${safeLoadingText}</p>
                </main>
            </div>
        `;
    },

    /**
     * Render loading screen with engagement modals (profile_creation, plan_creation_v2)
     * Shows progress checklist, engagement modals at intervals, optional testimonials
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    loadingEngagement(screenData) {
        const safeHeadline = Security.escapeHtml(screenData.headline || '');
        const safeSubheadline = Security.escapeHtml(screenData.subheadline || '');

        // Render progress checklist
        const checklistHtml = screenData.progressSteps
            ? Components.progressChecklist(screenData.progressSteps)
            : '';

        // Render testimonial cards (profile_creation only)
        const testimonialsHtml = screenData.testimonials
            ? `<div class="testimonial-cards">${screenData.testimonials.map(t => Components.testimonialCard(t)).join('')}</div>`
            : '';

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <main class="content loading-screen">
                    <h1 class="headline headline--loading">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="loading-screen__subheadline loading-screen__subheadline--highlight">${safeSubheadline}</p>` : ''}

                    ${Components.circularProgress()}
                    ${checklistHtml}
                    ${testimonialsHtml}

                    <div class="continue-container">
                        ${Components.continueButton(true, screenData.id)}
                    </div>
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
// Loading Animation Controller
// ========================================
const LoadingController = {
    /** Active timer ID for cleanup */
    timerId: null,
    /** Current progress percentage (0-100) */
    progress: 0,
    /** Whether animation is paused (e.g., modal open) */
    paused: false,
    /** Index of next modal to show */
    currentModalIndex: 0,
    /** Total modals for current screen */
    totalModals: 0,
    /** Screen data for current loading screen */
    screenData: null,
    /** Whether all modals have been answered */
    allModalsAnswered: false,

    /**
     * Start the loading animation sequence
     * Called after App.render() for transition screens
     * @param {Object} screenData - Screen data from JSON
     */
    start(screenData) {
        this.cleanup();
        this.progress = 0;
        this.paused = false;
        this.currentModalIndex = 0;
        this.screenData = screenData;
        this.totalModals = screenData.engagementModals?.length || 0;
        this.allModalsAnswered = this.totalModals === 0;

        const isAutoAdvance = screenData.type === 'loading_with_social_proof';
        const duration = isAutoAdvance ? 3000 : 5000; // ms
        const interval = 50; // update every 50ms
        const increment = (100 / (duration / interval));

        // Calculate modal trigger points (evenly spaced during animation)
        const modalTriggerPoints = [];
        if (this.totalModals > 0) {
            for (let i = 0; i < this.totalModals; i++) {
                modalTriggerPoints.push(Math.round((i + 1) * (80 / (this.totalModals + 1))));
            }
        }

        this.timerId = setInterval(() => {
            if (this.paused) return;

            this.progress = Math.min(100, this.progress + increment);
            this.updateProgressUI();

            // Check if we should trigger a modal
            if (this.currentModalIndex < this.totalModals) {
                const triggerPoint = modalTriggerPoints[this.currentModalIndex];
                if (this.progress >= triggerPoint) {
                    this.paused = true;
                    this.showModal(this.currentModalIndex);
                }
            }

            // Update checklist steps based on progress
            this.updateChecklist();

            // Animation complete
            if (this.progress >= 100) {
                clearInterval(this.timerId);
                this.timerId = null;

                if (isAutoAdvance) {
                    // Auto-advance to next screen (loading_1)
                    State.pushHistory(screenData.id);
                    const nextScreen = Router.getNextScreen(screenData.id);
                    if (nextScreen) {
                        Router.navigate(nextScreen);
                    }
                } else if (this.allModalsAnswered) {
                    // Enable continue button
                    this.enableContinue();
                }
            }
        }, interval);
    },

    /**
     * Update the circular progress SVG and percentage text
     */
    updateProgressUI() {
        const circle = document.querySelector('.circular-progress__circle');
        const text = document.querySelector('.circular-progress__text');
        if (!circle || !text) return;

        const circumference = parseFloat(circle.closest('.circular-progress').dataset.circumference);
        const offset = circumference - (this.progress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        text.textContent = `${Math.round(this.progress)}%`;
    },

    /**
     * Update checklist steps based on current progress
     * Steps complete sequentially as progress increases
     */
    updateChecklist() {
        const steps = document.querySelectorAll('.progress-step');
        if (!steps.length) return;

        const stepsPerSegment = 100 / steps.length;
        steps.forEach((step, index) => {
            const threshold = (index + 1) * stepsPerSegment;
            if (this.progress >= threshold) {
                step.classList.add('progress-step--completed');
            } else if (this.progress >= threshold - stepsPerSegment) {
                step.classList.add('progress-step--active');
            }
        });
    },

    /**
     * Show an engagement modal overlay
     * @param {number} index - Modal index from engagementModals array
     */
    showModal(index) {
        const modal = this.screenData.engagementModals[index];
        if (!modal) return;

        const modalHtml = Components.engagementModal(modal, index);
        document.getElementById('app').insertAdjacentHTML('beforeend', modalHtml);

        log.info(`[Loading] Showing engagement modal ${index}: "${modal.question}"`);
    },

    /**
     * Dismiss an engagement modal and resume animation
     * @param {number} index - Modal index to dismiss
     */
    dismissModal(index) {
        const modalEl = document.querySelector(`.engagement-modal[data-modal-index="${index}"]`);
        if (modalEl) {
            modalEl.classList.add('engagement-modal--closing');
            setTimeout(() => modalEl.remove(), 200);
        }

        this.currentModalIndex++;
        log.info(`[Loading] Modal ${index} dismissed, next: ${this.currentModalIndex}/${this.totalModals}`);

        // Check if all modals answered
        if (this.currentModalIndex >= this.totalModals) {
            this.allModalsAnswered = true;
        }

        // Resume animation
        this.paused = false;

        // If animation already finished while modal was open, enable continue
        if (this.progress >= 100 && this.allModalsAnswered) {
            this.enableContinue();
        }
    },

    /**
     * Enable the continue button after animation + modals complete
     */
    enableContinue() {
        const btn = document.querySelector('.continue-button');
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('continue-button--disabled');
        }
    },

    /**
     * Clean up timers and state
     */
    cleanup() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.progress = 0;
        this.paused = false;
        this.currentModalIndex = 0;
        this.screenData = null;
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

        // Engagement modal button click (dismiss modal)
        const modalBtn = e.target.closest('.engagement-modal__btn');
        if (modalBtn) {
            const modalIndex = parseInt(modalBtn.dataset.modalIndex, 10);
            LoadingController.dismissModal(modalIndex);
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

        // Skip answer validation for interstitial and transition screens
        const screenData = Router.getScreen(screenId);
        const isNonQuestion = screenData && (
            screenData.screenType === 'interstitial' ||
            screenData.screenType === 'transition'
        );

        if (!isNonQuestion && !State.hasAnswers(screenId)) {
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
            case 'interstitial':
                // Branch to specific renderer based on sub-type
                if (screenData.type === 'educational') {
                    html = Screens.educational(screenData);
                } else if (screenData.type === 'social_proof') {
                    html = Screens.socialProof(screenData);
                } else {
                    // trust_building covers interstitial_1, _3, _4
                    html = Screens.trustBuilding(screenData);
                }
                break;
            case 'transition':
                // Branch loading screens by sub-type
                if (screenData.type === 'loading_with_social_proof') {
                    html = Screens.loadingSocialProof(screenData);
                } else {
                    // loading_with_engagement covers profile_creation, plan_creation_v2
                    html = Screens.loadingEngagement(screenData);
                }
                break;
            default:
                html = Screens.placeholder(screenData);
        }

        // Clean up any running loading animations before DOM swap
        LoadingController.cleanup();

        // Update DOM
        document.getElementById('app').innerHTML = html;

        // Start loading animation for transition screens
        if ((screenData.screenType || screenData.type) === 'transition') {
            LoadingController.start(screenData);
        }

        log.info(`[App] Rendered screen: ${currentScreenId}`);
    }
};

// ========================================
// Initialize on DOM ready
// ========================================
document.addEventListener('DOMContentLoaded', () => App.init());
