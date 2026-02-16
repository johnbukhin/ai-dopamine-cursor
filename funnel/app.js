/**
 * Compass Funnel Application
 * Multi-screen architecture with JSON-driven content and state management
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    brandName: 'Compass',
    // JSON data path (now in same directory for Vercel deployment)
    funnelDataPaths: [
        'liven-funnel-analysis.json',
        './liven-funnel-analysis.json'
    ],
    storageKey: 'compass_funnel_state',
    debug: true, // Set to true for development debugging
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

        // Lock icon - for privacy/security indicators
        lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>`,

        checkmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"/>
        </svg>`,

        // Chevron down - for FAQ accordion
        chevron_down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"/>
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
        </svg>`,

        // ========================================
        // Payment Icons (Phase 3c - Paywall)
        // ========================================
        
        // Visa card icon
        visa: `<svg viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1A1F71"/>
            <path d="M18.5 22L21.8 10H25L21.7 22H18.5ZM32.7 10.3C32 10.1 30.9 9.8 29.5 9.8C26.2 9.8 23.9 11.5 23.9 14C23.9 15.8 25.6 16.8 26.9 17.4C28.2 18 28.7 18.4 28.7 19C28.7 19.9 27.6 20.3 26.6 20.3C25.2 20.3 24.4 20.1 23.3 19.6L22.9 19.4L22.5 21.9C23.3 22.3 24.8 22.6 26.4 22.6C30 22.6 32.2 20.9 32.3 18.2C32.3 16.8 31.4 15.7 29.4 14.8C28.2 14.2 27.5 13.8 27.5 13.2C27.5 12.7 28.1 12.1 29.4 12.1C30.5 12.1 31.4 12.3 32.1 12.6L32.5 12.8L32.7 10.3ZM38.5 10H36C35.2 10 34.6 10.2 34.2 11L29 22H32.6L33.3 20.2H37.7L38.2 22H41.5L38.5 10ZM34.2 17.7L35.8 13L36.8 17.7H34.2ZM15.5 10L12 19.5L11.6 17.4L10.4 11.8C10.2 10.8 9.5 10.1 8.6 10H8.6L8.6 10H3V10.3C4.2 10.6 5.3 11 6.2 11.5L9.3 22H13L19 10H15.5Z" fill="white"/>
        </svg>`,

        // Mastercard icon
        mastercard: `<svg viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#000000"/>
            <circle cx="18" cy="16" r="9" fill="#EB001B"/>
            <circle cx="30" cy="16" r="9" fill="#F79E1B"/>
            <path d="M24 9C25.9 10.5 27 12.9 27 15.5C27 18.1 25.9 20.5 24 22C22.1 20.5 21 18.1 21 15.5C21 12.9 22.1 10.5 24 9Z" fill="#FF5F00"/>
        </svg>`,

        // American Express icon
        amex: `<svg viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#016FD0"/>
            <path d="M10.5 12L8 20H10.8L11.3 18.5H13.1L13.6 20H16.8V18.8L17.2 20H19.2L19.6 18.8V20H29V18.5H29.3C29.6 18.5 29.6 18.5 29.6 18.8V20H36.5L37.5 18.9L38.4 20H42L38.6 16L42 12H38.5L37.5 13.1L36.6 12H29.3V13.4C29.1 13.4 28.9 13.4 28.7 13.4H27.2V12H23.5L22.7 14L21.8 12H17.5V13.1L17.1 12H13.7L10.5 12Z" fill="white"/>
        </svg>`,

        // Apple Pay icon
        applepay: `<svg viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="black"/>
            <path d="M12.5 10.5C12.9 10 13.4 9.5 14 9.5C14 10.1 13.8 10.7 13.4 11.2C13 11.7 12.4 12 11.8 12C11.7 11.5 12 10.9 12.5 10.5ZM14 12.1C13.1 12 12.3 12.6 11.9 12.6C11.5 12.6 10.8 12.1 10.1 12.1C9.2 12.2 8.4 12.7 7.9 13.5C7 15.1 7.6 17.5 8.5 18.9C8.9 19.6 9.4 20.3 10.1 20.3C10.8 20.3 11 19.9 11.8 19.9C12.6 19.9 12.8 20.3 13.5 20.3C14.3 20.3 14.7 19.6 15.1 18.9C15.5 18.1 15.7 17.4 15.7 17.4C15.7 17.4 14.5 16.9 14.5 15.5C14.5 14.3 15.4 13.7 15.5 13.7C14.9 12.9 14 12.1 14 12.1Z" fill="white"/>
            <path d="M19.5 9.5H22.1L24.6 17.5L27.2 9.5H29.7L25.9 20.2H23.4L19.5 9.5Z" fill="white"/>
            <path d="M30.5 20.2V9.5H35.5C37.4 9.5 38.7 10.8 38.7 12.5C38.7 14.2 37.3 15.5 35.4 15.5H32.8V20.2H30.5ZM32.8 11.2V13.8H35C36.1 13.8 36.7 13.2 36.7 12.5C36.7 11.8 36.1 11.2 35 11.2H32.8Z" fill="white"/>
        </svg>`,

        // Google Pay icon
        googlepay: `<svg viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="white" stroke="#DADCE0"/>
            <path d="M23 16V19.5H27.7C27.5 20.6 26.5 22.6 23 22.6C19.9 22.6 17.4 20.1 17.4 16.9C17.4 13.7 19.9 11.2 23 11.2C24.8 11.2 26 12 26.9 12.8L29.6 10.2C28 8.7 25.9 7.7 23 7.7C17.5 7.7 13 12.1 13 17.6C13 23.1 17.5 27.5 23 27.5C28.8 27.5 32.3 23.6 32.3 17.8C32.3 17.1 32.2 16.6 32.1 16.1H23V16Z" fill="#4285F4"/>
            <path d="M23 16V19.5H27.7C27.5 20.6 26.5 22.6 23 22.6V27.5C28.8 27.5 32.3 23.6 32.3 17.8C32.3 17.1 32.2 16.6 32.1 16.1H23V16Z" fill="#34A853"/>
            <path d="M17.4 16.9C17.4 15.9 17.7 14.9 18.2 14L15.3 11.7C14.2 13.2 13.5 15 13.5 17C13.5 19 14.2 20.8 15.3 22.3L18.2 20C17.7 19.1 17.4 18.1 17.4 16.9Z" fill="#FBBC05"/>
            <path d="M23 11.2C24.8 11.2 26 12 26.9 12.8L29.6 10.2C28 8.7 25.9 7.7 23 7.7C19.1 7.7 15.7 9.9 14.3 13.1L17.2 15.4C17.9 13.3 20.2 11.2 23 11.2Z" fill="#EA4335"/>
        </svg>`,

        // PayPal icon
        paypal: `<svg viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#003087"/>
            <path d="M18.5 9.5H23.8C26.5 9.5 28.3 11 28.3 13.3C28.3 16.2 26.1 18 23 18H20.8L19.8 22.5H17.5L18.5 9.5ZM23.3 11.7H21.2L20.5 15.8H22.6C24.3 15.8 25.5 15 25.5 13.6C25.5 12.3 24.5 11.7 23.3 11.7Z" fill="white"/>
            <path d="M27.5 17.8C27.5 15.3 29.4 13.3 32 13.3C34.6 13.3 36.5 15.3 36.5 17.8C36.5 20.3 34.6 22.3 32 22.3C29.4 22.3 27.5 20.3 27.5 17.8ZM34.2 17.8C34.2 16.5 33.3 15.5 32 15.5C30.7 15.5 29.8 16.5 29.8 17.8C29.8 19.1 30.7 20.1 32 20.1C33.3 20.1 34.2 19.1 34.2 17.8Z" fill="#009CDE"/>
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
        startedAt: null,
        selectedTier: '1_month',  // Phase 3c: Default pricing tier
        openFaqIndex: null        // Phase 3c: Currently open FAQ (null = all closed)
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
            startedAt: new Date().toISOString(),
            selectedTier: '1_month',
            openFaqIndex: null
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
    },

    // ========================================
    // Phase 3c: Value Proposition & Paywall Components
    // ========================================

    /**
     * Render feature list with checkmark bullets (plan_ready)
     * @param {Array<string>} features - Array of feature text strings
     * @returns {string} HTML string
     */
    featureList(features) {
        const featuresHtml = features.map(feature => `
            <li class="feature-list__item">
                <div class="feature-list__icon">${Icons.get('checkmark')}</div>
                <span class="feature-list__text">${Security.escapeHtml(feature)}</span>
            </li>
        `).join('');

        return `<ul class="feature-list">${featuresHtml}</ul>`;
    },

    /**
     * Render primary CTA button (reusable)
     * @param {string} text - Button text
     * @param {string} screenId - Screen ID for navigation
     * @param {boolean} disabled - Whether button is disabled
     * @returns {string} HTML string
     */
    ctaButton(text, screenId, disabled = false) {
        const safeText = Security.escapeHtml(text);
        return `
            <button class="cta-button ${disabled ? 'cta-button--disabled' : ''}"
                    data-screen="${Security.escapeHtml(screenId)}"
                    ${disabled ? 'disabled' : ''}>
                ${safeText}
            </button>
        `;
    },

    /**
     * Render countdown timer (paywall)
     * Real-time countdown with MM:SS format, infinite loop
     * @param {string} headline - Timer headline text
     * @param {number} initialMinutes - Starting time in minutes
     * @returns {string} HTML string
     */
    countdownTimer(headline, initialMinutes = 10) {
        const safeHeadline = Security.escapeHtml(headline || 'Discount is reserved for:');
        
        // Calculate initial display
        const minutes = Math.floor(initialMinutes);
        const seconds = Math.floor((initialMinutes % 1) * 60);
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return `
            <div class="countdown-timer">
                <p class="countdown-timer__headline">${safeHeadline}</p>
                <div class="countdown-timer__display">
                    <span class="countdown-timer__digits">${display}</span>
                </div>
            </div>
        `;
    },

    /**
     * Generate personalized promo code
     * Format: {NAME}_{MONTH}_{DISCOUNT}
     * Example: "JOHN_FEB_50"
     * @param {string} name - User's name (from state)
     * @param {number} discount - Discount percentage
     * @returns {string} Promo code string
     */
    generatePromoCode(name, discount) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const currentMonth = months[new Date().getMonth()];
        
        // Sanitize name: uppercase, remove non-letters, use fallback if empty
        let userName = (name || '').toUpperCase().replace(/[^A-Z]/g, '');
        if (!userName) {
            // Fallback: try email username
            const email = State.getAnswer('email_capture');
            userName = email ? email.split('@')[0].toUpperCase().replace(/[^A-Z]/g, '') : 'USER';
        }

        return `${userName}_${currentMonth}_${discount}`;
    },

    /**
     * Render promo code badge (paywall)
     * @param {string} label - Badge label text
     * @param {string} promoCode - Generated promo code
     * @param {string} status - Status text (e.g., "Activated")
     * @returns {string} HTML string
     */
    promoCodeBadge(label, promoCode, status) {
        const safeLabel = Security.escapeHtml(label || 'Your personal promo code');
        const safeCode = Security.escapeHtml(promoCode);
        const safeStatus = Security.escapeHtml(status || 'Activated');

        return `
            <div class="promo-badge">
                <p class="promo-badge__label">${safeLabel}</p>
                <div class="promo-badge__code-wrapper">
                    <span class="promo-badge__code">${safeCode}</span>
                    <span class="promo-badge__status">${safeStatus}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render "MOST POPULAR" badge ribbon
     * @returns {string} HTML string
     */
    mostPopularBadge() {
        return `<div class="most-popular-badge">MOST POPULAR</div>`;
    },

    /**
     * Render pricing tier card (paywall)
     * @param {Object} tier - Tier object from JSON
     * @param {boolean} isSelected - Whether this tier is currently selected
     * @returns {string} HTML string
     */
    pricingCard(tier, isSelected) {
        const safeName = Security.escapeHtml(tier.name);
        const safeOriginalPrice = Security.escapeHtml(tier.originalPrice);
        const safeDiscountedPrice = Security.escapeHtml(tier.discountedPrice);
        const safePricePerDay = Security.escapeHtml(tier.pricePerDay);
        const safeSavings = Security.escapeHtml(tier.savings);
        const safeId = Security.escapeHtml(tier.id);
        
        const selectedClass = isSelected ? 'pricing-card--selected' : '';
        const recommendedClass = tier.recommended ? 'pricing-card--recommended' : '';
        const hasBadge = tier.badge;

        return `
            <div class="pricing-card ${selectedClass} ${recommendedClass}"
                 data-tier-id="${safeId}"
                 role="button"
                 tabindex="0"
                 aria-label="Select ${safeName}">
                ${hasBadge ? this.mostPopularBadge() : ''}
                <h3 class="pricing-card__name">${safeName}</h3>
                <div class="pricing-card__prices">
                    <span class="pricing-card__original-price">${safeOriginalPrice}</span>
                    <span class="pricing-card__discounted-price">${safeDiscountedPrice}</span>
                </div>
                <p class="pricing-card__per-day">${safePricePerDay}</p>
                <span class="pricing-card__savings">${safeSavings}</span>
            </div>
        `;
    },

    /**
     * Render pricing tiers container (paywall)
     * @param {Array<Object>} tiers - Array of pricing tier objects
     * @param {string} selectedTierId - Currently selected tier ID
     * @returns {string} HTML string
     */
    pricingTiers(tiers, selectedTierId) {
        const cardsHtml = tiers.map(tier => 
            this.pricingCard(tier, tier.id === selectedTierId)
        ).join('');

        return `
            <div class="pricing-tiers">
                ${cardsHtml}
            </div>
        `;
    },

    /**
     * Render payment security icons (paywall)
     * @param {string} headline - Section headline
     * @param {Array<string>} icons - Array of payment icon names
     * @returns {string} HTML string
     */
    paymentIcons(headline, icons) {
        const safeHeadline = Security.escapeHtml(headline || 'Pay Safe & Secure');
        const iconsHtml = icons.map(iconName => {
            const iconKey = iconName.toLowerCase().replace(/\s+/g, '');
            return `<div class="payment-icon">${Icons.get(iconKey)}</div>`;
        }).join('');

        return `
            <div class="payment-icons-section">
                <h3 class="payment-icons__headline">${safeHeadline}</h3>
                <div class="payment-icons">
                    ${iconsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Render media logos as text labels (paywall)
     * @param {string} headline - Section headline
     * @param {Array<string>} logos - Array of media brand names
     * @returns {string} HTML string
     */
    mediaLogos(headline, logos) {
        const safeHeadline = Security.escapeHtml(headline || 'As featured in');
        const logosHtml = logos.map(logo => 
            `<span class="media-logo">${Security.escapeHtml(logo)}</span>`
        ).join('');

        return `
            <div class="media-logos-section">
                <h3 class="media-logos__headline">${safeHeadline}</h3>
                <div class="media-logos">
                    ${logosHtml}
                </div>
            </div>
        `;
    },

    /**
     * Render statistics block (paywall)
     * Three percentage stats with descriptions
     * @param {Array<Object>} stats - Array of {percentage, description} objects
     * @returns {string} HTML string
     */
    statisticsBlock(stats) {
        const statsHtml = stats.map(stat => `
            <div class="stat-item">
                <span class="stat-percentage">${Security.escapeHtml(stat.percentage)}</span>
                <p class="stat-description">${Security.escapeHtml(stat.description)}</p>
            </div>
        `).join('');

        return `
            <div class="statistics-block">
                ${statsHtml}
            </div>
        `;
    },

    /**
     * Render award badge (paywall)
     * @param {Object} award - Award object with badge and source
     * @returns {string} HTML string
     */
    awardBadge(award) {
        const safeBadge = Security.escapeHtml(award.badge || '2025 Best Mobile App Award winner');
        const safeSource = Security.escapeHtml(award.source || 'App Excellence Awards');

        return `
            <div class="award-badge">
                <div class="award-badge__icon">🏆</div>
                <div class="award-badge__content">
                    <p class="award-badge__title">${safeBadge}</p>
                    <p class="award-badge__source">${safeSource}</p>
                </div>
            </div>
        `;
    },

    /**
     * Render money-back guarantee card (paywall)
     * @param {Object} guarantee - Guarantee object with duration, headline, description
     * @returns {string} HTML string
     */
    moneyBackGuarantee(guarantee) {
        const safeHeadline = Security.escapeHtml(guarantee.headline || '30-Day Money-Back Guarantee');
        const safeDescription = Security.escapeHtml(guarantee.description || '');
        
        return `
            <div class="money-back-guarantee">
                <div class="guarantee-icon">✓</div>
                <div class="guarantee-content">
                    <h3 class="guarantee-headline">${safeHeadline}</h3>
                    <p class="guarantee-description">${safeDescription}</p>
                </div>
            </div>
        `;
    },

    /**
     * Render FAQ accordion (paywall)
     * Only one question can be open at a time
     * @param {string} headline - Section headline
     * @param {Array<Object>} questions - Array of {question, answer} objects
     * @param {number|null} openIndex - Currently open question index (null = all closed)
     * @returns {string} HTML string
     */
    faqAccordion(headline, questions, openIndex) {
        const safeHeadline = Security.escapeHtml(headline || 'Frequently Asked Questions');
        
        const questionsHtml = questions.map((item, index) => {
            const isOpen = index === openIndex;
            const safeQuestion = Security.escapeHtml(item.question);
            const safeAnswer = Security.escapeHtml(item.answer);

            return `
                <div class="faq-item ${isOpen ? 'faq-item--open' : ''}" data-faq-index="${index}">
                    <button class="faq-question" aria-expanded="${isOpen}">
                        <span>${safeQuestion}</span>
                        <span class="faq-chevron">${Icons.get('chevron_down')}</span>
                    </button>
                    <div class="faq-answer">
                        <p>${safeAnswer}</p>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="faq-accordion-section">
                <h3 class="faq-accordion__headline">${safeHeadline}</h3>
                <div class="faq-accordion">
                    ${questionsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Render company footer with policy links (paywall)
     * @param {Object} companyInfo - Company object with name, address, links
     * @returns {string} HTML string
     */
    companyFooter(companyInfo) {
        const safeName = Security.escapeHtml(companyInfo.name || '');
        const safeAddress = Security.escapeHtml(companyInfo.address || '');
        
        const linksHtml = (companyInfo.links || []).map(link => 
            `<a href="#${link.toLowerCase().replace(/\s+/g, '-')}" class="footer-link">${Security.escapeHtml(link)}</a>`
        ).join('');

        return `
            <div class="company-footer">
                <p class="company-footer__name">${safeName}</p>
                <p class="company-footer__address">${safeAddress}</p>
                <div class="footer-links">
                    ${linksHtml}
                </div>
            </div>
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

    // ========================================
    // Phase 3b: Form Capture & Results Screens
    // ========================================

    /**
     * Render email capture gate screen
     * Input field with email validation, lock icon, privacy note
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    emailCapture(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || '');
        const safeSubheadline = Security.escapeHtml(screenData.subheadline || '');
        const safePlaceholder = Security.escapeHtml(
            screenData.inputField?.placeholder || 'Enter your email'
        );
        const safePrivacy = Security.escapeHtml(screenData.privacyNote || '');
        const safeCta = Security.escapeHtml(screenData.ctaButton || 'Continue');

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content">
                    <h1 class="headline">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline subheadline--accent">${safeSubheadline}</p>` : ''}

                    <div class="form-capture">
                        <input type="email"
                               class="form-capture__input"
                               data-screen="${safeId}"
                               data-field-type="email"
                               placeholder="${safePlaceholder}"
                               autocomplete="email"
                               inputmode="email" />

                        <div class="form-capture__privacy">
                            <span class="form-capture__lock-icon">${Icons.get('lock')}</span>
                            <p class="form-capture__privacy-text">${safePrivacy}</p>
                        </div>

                        <button class="continue-button continue-button--disabled"
                                data-screen="${safeId}"
                                disabled>
                            ${safeCta}
                        </button>
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render name capture gate screen
     * Text input field, continues after non-empty input
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    nameCapture(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || '');
        const safePlaceholder = Security.escapeHtml(
            screenData.inputField?.placeholder || 'Enter your name'
        );
        const safeCta = Security.escapeHtml(screenData.ctaButton || 'Continue');

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content">
                    <h1 class="headline">${safeHeadline}</h1>

                    <div class="form-capture">
                        <input type="text"
                               class="form-capture__input"
                               data-screen="${safeId}"
                               data-field-type="name"
                               placeholder="${safePlaceholder}"
                               autocomplete="name"
                               inputmode="text" />

                        <button class="continue-button continue-button--disabled"
                                data-screen="${safeId}"
                                disabled>
                            ${safeCta}
                        </button>
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render personalized profile summary screen
     * Dynamically pulls user's quiz answers to build profile
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    profileSummary(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || '');

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Pull user's name from name_capture answer, fallback to email username or 'there'
        let userName = State.getAnswer('name_capture');
        if (!userName) {
            const email = State.getAnswer('email_capture');
            userName = email ? email.split('@')[0] : 'there';
        }
        const safeName = Security.escapeHtml(userName);

        // Build sections from JSON data + dynamic content
        const sectionsHtml = (screenData.sections || []).map(section => {
            const safeTitle = Security.escapeHtml(section.title || '');

            if (section.items) {
                // List-based section (e.g., "Recommended Focus Areas")
                const itemsHtml = section.items
                    .map(item => `
                        <li class="profile-summary__focus-item">
                            <span class="profile-summary__focus-icon">${Icons.get('checkmark')}</span>
                            ${Security.escapeHtml(item)}
                        </li>
                    `).join('');
                return `
                    <div class="profile-summary__section">
                        <h3 class="profile-summary__section-title">${safeTitle}</h3>
                        <ul class="profile-summary__focus-list">${itemsHtml}</ul>
                    </div>
                `;
            }

            // Description-based section (e.g., "Your Patterns")
            const safeDesc = Security.escapeHtml(section.description || '');
            return `
                <div class="profile-summary__section">
                    <h3 class="profile-summary__section-title">${safeTitle}</h3>
                    <p class="profile-summary__description">${safeDesc}</p>
                </div>
            `;
        }).join('');

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content">
                    <div class="profile-summary">
                        <div class="profile-summary__greeting">
                            <span class="profile-summary__avatar">${Icons.get('smile')}</span>
                            <span class="profile-summary__name">${safeName}</span>
                        </div>

                        <h1 class="headline">${safeHeadline}</h1>

                        ${sectionsHtml}
                    </div>

                    ${Components.continueButton(false, safeId)}
                </main>
            </div>
        `;
    },

    /**
     * Render goal timeline selection screen
     * Single-choice text_list with "Recommended" badge, auto-advance on tap
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    goalTimeline(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || '');

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Render options as answer cards (reuse existing single-choice pattern)
        const optionsHtml = (screenData.options || []).map(option => {
            const safeLabel = Security.escapeHtml(option.label);
            const recommendedBadge = option.recommended
                ? '<span class="recommended-badge">Recommended</span>'
                : '';
            return `
                <div class="answer-card"
                     data-screen="${safeId}"
                     data-answer="${safeLabel}"
                     tabindex="0"
                     role="button"
                     aria-label="${safeLabel}">
                    <span class="answer-card__label">${safeLabel}</span>
                    ${recommendedBadge}
                </div>
            `;
        }).join('');

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content content--left">
                    <h1 class="headline headline--question">${safeHeadline}</h1>

                    <div class="answer-cards">
                        ${optionsHtml}
                    </div>
                </main>
            </div>
        `;
    },

    // ========================================
    // Phase 3c: Value Proposition & Paywall Screens
    // ========================================

    /**
     * Render value proposition screen (plan_ready)
     * Shows personalized plan features before paywall
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    valueProp(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || '');
        const safeSubheadline = screenData.subheadline ? Security.escapeHtml(screenData.subheadline) : '';
        const ctaText = screenData.ctaButton || 'Get my plan';

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content value-prop">
                    <h1 class="headline">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline">${safeSubheadline}</p>` : ''}

                    ${screenData.planFeatures ? Components.featureList(screenData.planFeatures) : ''}

                    <div class="cta-container">
                        ${Components.ctaButton(ctaText, safeId)}
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render paywall screen with all trust elements
     * Full interactive paywall with countdown, pricing tiers, FAQ, etc.
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    paywall(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || 'Choose Your Plan');

        // Generate personalized promo code
        const userName = State.getAnswer('name_capture');
        const promoCode = Components.generatePromoCode(userName, 50);

        // Get currently selected tier from state
        const selectedTierId = State.data.selectedTier || '1_month';

        // Get current FAQ open index from state
        const openFaqIndex = State.data.openFaqIndex;

        // Build paywall sections in order (as per JSON structure)
        return `
            <div class="screen paywall-screen" data-screen="${safeId}">
                ${Components.header()}

                <main class="content paywall">
                    <h1 class="headline">${safeHeadline}</h1>

                    <!-- 1. Countdown Timer -->
                    ${screenData.urgencyElements?.countdownTimer ? 
                        Components.countdownTimer(
                            screenData.urgencyElements.countdownTimer.headline,
                            screenData.urgencyElements.countdownTimer.initialMinutes
                        ) : ''}

                    <!-- 2. Promo Code Badge -->
                    ${screenData.urgencyElements?.promoCode ? 
                        Components.promoCodeBadge(
                            screenData.urgencyElements.promoCode.label,
                            promoCode,
                            screenData.urgencyElements.promoCode.discount
                        ) : ''}

                    <!-- 3. Pricing Tiers -->
                    ${screenData.pricingTiers ? 
                        Components.pricingTiers(screenData.pricingTiers, selectedTierId) : ''}

                    <!-- 4. CTA Button -->
                    <div class="paywall__cta">
                        ${Components.ctaButton(
                            screenData.ctaButton?.text || 'Get my plan',
                            safeId
                        )}
                    </div>

                    <!-- 5. Payment Security -->
                    ${screenData.trustElements?.paymentSecurity ? 
                        Components.paymentIcons(
                            screenData.trustElements.paymentSecurity.headline,
                            screenData.trustElements.paymentSecurity.icons
                        ) : ''}

                    <!-- 6. Media Features -->
                    ${screenData.trustElements?.mediaFeatures ? 
                        Components.mediaLogos(
                            screenData.trustElements.mediaFeatures.headline,
                            screenData.trustElements.mediaFeatures.logos
                        ) : ''}

                    <!-- 7. Statistics Block -->
                    ${screenData.trustElements?.statistics ? 
                        Components.statisticsBlock(screenData.trustElements.statistics) : ''}

                    <!-- 8. Award Badge -->
                    ${screenData.trustElements?.award ? 
                        Components.awardBadge(screenData.trustElements.award) : ''}

                    <!-- 9. Money-Back Guarantee -->
                    ${screenData.trustElements?.moneyBackGuarantee ? 
                        Components.moneyBackGuarantee(screenData.trustElements.moneyBackGuarantee) : ''}

                    <!-- 10. FAQ Accordion -->
                    ${screenData.faq ? 
                        Components.faqAccordion(
                            screenData.faq.headline,
                            screenData.faq.questions || [],
                            openFaqIndex
                        ) : ''}

                    <!-- 11. Testimonials -->
                    ${screenData.testimonials ? `
                        <div class="testimonial-cards">
                            ${screenData.testimonials.map(t => Components.testimonialCard(t)).join('')}
                        </div>
                    ` : ''}

                    <!-- 12. Company Footer -->
                    ${screenData.companyInfo ? Components.companyFooter(screenData.companyInfo) : ''}
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
// Countdown Timer Controller (Phase 3c)
// ========================================
const CountdownTimer = {
    /** Active timer interval ID */
    timerId: null,
    /** Remaining seconds */
    remainingSeconds: 600, // 10 minutes = 600 seconds

    /**
     * Start countdown timer with infinite loop
     * @param {number} initialMinutes - Starting time in minutes (default 10)
     */
    start(initialMinutes = 10) {
        this.cleanup();
        this.remainingSeconds = initialMinutes * 60;
        
        // Update display immediately
        this.updateDisplay();

        // Update every second
        this.timerId = setInterval(() => {
            this.remainingSeconds--;

            // Loop back to start when reaching 0
            if (this.remainingSeconds < 0) {
                this.remainingSeconds = initialMinutes * 60;
            }

            this.updateDisplay();
        }, 1000);

        log.info(`[Timer] Started ${initialMinutes}:00 countdown with infinite loop`);
    },

    /**
     * Update timer display in DOM
     */
    updateDisplay() {
        const timerEl = document.querySelector('.countdown-timer__digits');
        if (!timerEl) return;

        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        
        // Format as MM:SS with leading zeros
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerEl.textContent = display;
    },

    /**
     * Clean up timer interval
     */
    cleanup() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.remainingSeconds = 600;
        log.info('[Timer] Cleaned up');
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
        // Toast close button (delegated — replaces inline onclick)
        const toastClose = e.target.closest('.toast__close');
        if (toastClose) {
            toastClose.closest('.toast').remove();
            return;
        }

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

        // CTA button click (Phase 3c - plan_ready, paywall)
        const ctaButton = e.target.closest('.cta-button:not(.cta-button--disabled)');
        if (ctaButton) {
            this.handleCtaClick(ctaButton);
            return;
        }

        // Pricing card click (Phase 3c)
        const pricingCard = e.target.closest('.pricing-card');
        if (pricingCard) {
            this.handlePricingCardClick(pricingCard);
            return;
        }

        // FAQ question click (Phase 3c)
        const faqQuestion = e.target.closest('.faq-question');
        if (faqQuestion) {
            this.handleFaqClick(faqQuestion);
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
            return;
        }

        // Form capture input (email/name gates)
        const formInput = e.target.closest('.form-capture__input');
        if (formInput) {
            this.handleFormInput(formInput);
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

            // Pricing card keyboard activation (Phase 3c)
            const pricingCard = e.target.closest('.pricing-card');
            if (pricingCard) {
                e.preventDefault();
                this.handlePricingCardClick(pricingCard);
                return;
            }

            // FAQ question keyboard activation (Phase 3c)
            const faqQuestion = e.target.closest('.faq-question');
            if (faqQuestion) {
                e.preventDefault();
                this.handleFaqClick(faqQuestion);
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
     * Handle form capture input (email/name gates)
     * Validates input and enables/disables Continue button
     * Note: Input value is NOT stored until Continue is clicked (by handleContinueClick).
     * This prevents incomplete/unvalidated data from being saved to state.
     * @param {HTMLElement} input - The form input element
     */
    handleFormInput(input) {
        const screenId = input.dataset.screen;
        const fieldType = input.dataset.fieldType;
        const value = input.value.trim();

        log.info(`[User Action] Form input (${fieldType}) on ${screenId}: "${value}"`);

        // Validate based on field type
        let isValid = false;
        if (fieldType === 'email') {
            // Basic email format validation
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        } else {
            // Name: non-empty
            isValid = value.length > 0;
        }

        // Toggle input valid state for styling
        input.classList.toggle('form-capture__input--valid', isValid);

        // Enable/disable Continue button
        const continueBtn = document.querySelector('.continue-button');
        if (continueBtn) {
            continueBtn.disabled = !isValid;
            continueBtn.classList.toggle('continue-button--disabled', !isValid);
        }
    },

    /**
     * Handle continue button click
     * Validates selection and navigates to next screen
     * @param {HTMLElement} button - The continue button element
     */
    handleContinueClick(button) {
        const screenId = button.dataset.screen;

        // Skip answer validation for interstitial, transition, and results screens
        const screenData = Router.getScreen(screenId);
        const isNonQuestion = screenData && (
            screenData.screenType === 'interstitial' ||
            screenData.screenType === 'transition' ||
            screenData.screenType === 'personalized_results' ||
            screenData.screenType === 'value_proposition'
        );

        // For form capture screens, store input value before navigating
        const isFormCapture = screenData && (
            screenData.screenType === 'email_gate' ||
            screenData.screenType === 'name_gate'
        );

        if (isFormCapture) {
            const formInput = document.querySelector('.form-capture__input');
            if (formInput && formInput.value.trim()) {
                State.recordAnswer(screenId, formInput.value.trim());
            } else {
                log.warn(`[Events] Continue clicked but form input empty for ${screenId}`);
                return;
            }
        }

        if (!isNonQuestion && !isFormCapture && !State.hasAnswers(screenId)) {
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
    },

    // ========================================
    // Phase 3c Event Handlers
    // ========================================

    /**
     * Handle CTA button click (plan_ready, paywall)
     * @param {HTMLElement} button - The CTA button element
     */
    handleCtaClick(button) {
        const screenId = button.dataset.screen;
        log.info(`[User Action] CTA clicked on ${screenId}`);

        // For value_proposition, navigate to paywall
        const screenData = Router.getScreen(screenId);
        if (screenData?.screenType === 'value_proposition') {
            State.pushHistory(screenId);
            const nextScreen = Router.getNextScreen(screenId);
            if (nextScreen) {
                Router.navigate(nextScreen);
            }
            return;
        }

        // For paywall, store selected tier and show success toast
        if (screenData?.screenType === 'payment') {
            log.info(`[User Action] Selected tier: ${State.data.selectedTier}`);
            App.showSuccess(`Plan selected: ${State.data.selectedTier}. Stripe integration coming soon!`);
            // TODO: Integrate with Stripe checkout in next phase
        }
    },

    /**
     * Handle pricing card selection (paywall)
     * Uses targeted DOM updates to avoid full re-render (which would reset the timer)
     * @param {HTMLElement} card - The pricing card element
     */
    handlePricingCardClick(card) {
        const tierId = card.dataset.tierId;
        log.info(`[User Action] Selected pricing tier: ${tierId}`);

        // Update state without re-render
        State.set('selectedTier', tierId);

        // Targeted DOM update: toggle selection classes on all pricing cards
        document.querySelectorAll('.pricing-card').forEach(c => {
            const isSelected = c.dataset.tierId === tierId;
            c.classList.toggle('pricing-card--selected', isSelected);
        });
    },

    /**
     * Handle FAQ question click (paywall)
     * Toggles accordion using targeted DOM updates (no full re-render)
     * Only one question can be open at a time
     * @param {HTMLElement} questionBtn - The FAQ question button element
     */
    handleFaqClick(questionBtn) {
        const faqItem = questionBtn.closest('.faq-item');
        const clickedIndex = parseInt(faqItem.dataset.faqIndex, 10);
        const currentOpenIndex = State.data.openFaqIndex;

        log.info(`[User Action] FAQ clicked: ${clickedIndex}, currently open: ${currentOpenIndex}`);

        // Toggle: if clicking the open question, close it; otherwise open the clicked one
        const newOpenIndex = clickedIndex === currentOpenIndex ? null : clickedIndex;

        // Update state without re-render
        State.set('openFaqIndex', newOpenIndex);

        // Targeted DOM update: toggle open class on all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            const itemIndex = parseInt(item.dataset.faqIndex, 10);
            const isOpen = itemIndex === newOpenIndex;
            item.classList.toggle('faq-item--open', isOpen);
            // Update aria-expanded for accessibility
            const btn = item.querySelector('.faq-question');
            if (btn) btn.setAttribute('aria-expanded', String(isOpen));
        });
    }
};

// ========================================
// Main Application
// ========================================
const App = {
    /**
     * Show a toast notification (non-blocking)
     * @param {'error'|'success'} type - Toast type for styling
     * @param {string} message - Message to display
     */
    showToast(type, message) {
        const appEl = document.getElementById('app');
        const toastHtml = `
            <div class="toast toast--${type}" role="alert">
                <span>${Security.escapeHtml(message)}</span>
                <button class="toast__close" aria-label="Dismiss">×</button>
            </div>
        `;
        appEl.insertAdjacentHTML('beforeend', toastHtml);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const toast = appEl.querySelector('.toast');
            if (toast) toast.remove();
        }, 5000);
    },

    /**
     * Convenience: show error toast
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.showToast('error', message);
    },

    /**
     * Convenience: show success toast
     * @param {string} message - Success message to display
     */
    showSuccess(message) {
        this.showToast('success', message);
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
            case 'email_gate':
                html = Screens.emailCapture(screenData);
                break;
            case 'name_gate':
                html = Screens.nameCapture(screenData);
                break;
            case 'personalized_results':
                html = Screens.profileSummary(screenData);
                break;
            case 'timeline_selection':
                html = Screens.goalTimeline(screenData);
                break;
            case 'value_proposition':
                html = Screens.valueProp(screenData);
                break;
            case 'payment':
                html = Screens.paywall(screenData);
                break;
            default:
                html = Screens.placeholder(screenData);
        }

        // Clean up any running controllers before DOM swap
        LoadingController.cleanup();
        CountdownTimer.cleanup(); // Phase 3c

        // Update DOM
        document.getElementById('app').innerHTML = html;

        // Start loading animation for transition screens
        if ((screenData.screenType || screenData.type) === 'transition') {
            LoadingController.start(screenData);
        }

        // Start countdown timer for paywall screen (Phase 3c)
        if ((screenData.screenType || screenData.type) === 'payment') {
            const initialMinutes = screenData.urgencyElements?.countdownTimer?.initialMinutes || 10;
            CountdownTimer.start(initialMinutes);
        }

        log.info(`[App] Rendered screen: ${currentScreenId}`);
    }
};

// ========================================
// Initialize on DOM ready
// ========================================
document.addEventListener('DOMContentLoaded', () => App.init());
