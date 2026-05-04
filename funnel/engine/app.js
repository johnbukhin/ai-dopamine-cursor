/**
 * Compass Funnel Application
 * Multi-screen architecture with JSON-driven content and state management
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    brandName: 'Mind Compass',
    storageKey: 'compass_funnel_v2_state',
    debug: false, // Set to true for development debugging
    subheadline: 'IMPROVE YOUR WELL-BEING WITH OUR PERSONALIZED PLAN',
    // Webapp URL for post-account-creation redirect.
    // Empty string = local dev (falls back to app_dashboard screen).
    // Set to Vercel webapp URL in production, e.g. 'https://compass-app.vercel.app'
    webappUrl: 'https://mind-compass-webapp.vercel.app',
    // Stripe publishable key (safe to expose in frontend code).
    // Production key should be set here before going live.
    stripePk: 'pk_test_51RGn1FE85qJsu4O7B4vPpGAgvzwq63X3C9vk0IN4oLDBaDpccbctO9gy5I3gjVoNr3ENvISwfVjRbuLUu74Fx8HB00C2nolMtd'
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
// Scoring Engine — real scoring from likert answers
// ========================================
const Scoring = {
    /**
     * Calculate all scores from user's likert answers (Q1-Q27)
     * @returns {Object} { overall, dopamine_sensitivity, emotional_regulation, pattern_stage, physical_impact }
     */
    calculate() {
        const categories = {
            dopamine_sensitivity: { questions: [1, 2, 3, 4], maxPerQ: 5 },
            emotional_regulation: { questions: [5, 6, 7], maxPerQ: 5 },
            pattern_stage:        { questions: [8, 9, 10], maxPerQ: 5 },
            physical_impact:      { questions: [11, 12, 13, 14], maxPerQ: 5 }
        };

        const results = {};
        let totalScore = 0;
        let totalMax = 0;

        for (const [key, cat] of Object.entries(categories)) {
            let sum = 0;
            for (const qNum of cat.questions) {
                const answer = State.getAnswer(`question_${qNum}`);
                sum += parseInt(answer) || 3; // default to middle if unanswered
            }
            const max = cat.questions.length * cat.maxPerQ;
            const pct = sum / max; // 0.0 – 1.0
            results[key] = { sum, max, pct };
            totalScore += sum;
            totalMax += max;
        }

        // Add general questions (Q15-Q27) to overall score only
        for (let q = 15; q <= 27; q++) {
            const answer = State.getAnswer(`question_${q}`);
            totalScore += parseInt(answer) || 3;
            totalMax += 5;
        }

        results.overall = { sum: totalScore, max: totalMax, pct: totalScore / totalMax };
        return results;
    },

    /**
     * Map a percentage score (0-1) to a level index (0-3)
     */
    toLevelIndex(pct) {
        if (pct < 0.35) return 0;
        if (pct < 0.55) return 1;
        if (pct < 0.75) return 2;
        return 3;
    },

    /**
     * Get the overall level label
     */
    getOverallLevel(pct) {
        return ['Low', 'Normal', 'Medium', 'High'][this.toLevelIndex(pct)];
    },

    /**
     * Get category sublabel
     */
    getCategoryLevel(key, pct) {
        const labels = {
            dopamine_sensitivity: ['Low', 'Moderate', 'Elevated', 'High'],
            emotional_regulation: ['Stable', 'Mild Distress', 'Emotional Overload', 'Severe Dysregulation'],
            pattern_stage:        ['Emerging', 'Recent', 'Established', 'Deeply Rooted'],
            physical_impact:      ['Minimal', 'Noticeable', 'Circadian Disruption', 'Severe Impact']
        };
        return (labels[key] || ['Low', 'Medium', 'High', 'Critical'])[this.toLevelIndex(pct)];
    },

    /**
     * Get the main challenge label based on user's answers to Q30-Q33
     */
    getMainChallenge() {
        const mentalSymptoms = State.getAnswer('question_31') || [];
        if (Array.isArray(mentalSymptoms) && mentalSymptoms.length > 0) {
            const first = mentalSymptoms[0];
            if (first === 'Anxiety' || first === 'Shame spirals') return 'Worrier';
            if (first === 'Brain fog' || first === 'Difficulty concentrating') return 'Foggy Thinker';
            if (first === 'Low motivation') return 'Low Drive';
            if (first === 'Self-criticism') return 'Inner Critic';
        }
        return 'Worrier';
    },

    /**
     * Get the goal label based on user's answers to Q33
     */
    getGoal() {
        const areas = State.getAnswer('question_33') || [];
        if (Array.isArray(areas) && areas.length > 0) {
            const first = areas[0];
            if (first.includes('Focus')) return 'Focus levels';
            if (first.includes('Confidence')) return 'Self-confidence';
            if (first.includes('Self-control')) return 'Self-control';
            if (first.includes('Relationships')) return 'Relationships';
            if (first.includes('wellbeing')) return 'General wellbeing';
        }
        return 'Focus levels';
    },

    /**
     * Generate a detailed, personalized description based on all quiz answers
     */
    getDetailedDescription(scores, overallLevel, gender) {
        const parts = [];

        // Opening — overall assessment
        const openings = {
            Low: 'Your responses suggest that your dopamine regulation is largely within a healthy range. While you may notice occasional patterns, your reward system appears to be functioning well overall.',
            Normal: 'Your responses suggest some early signs of dopamine pattern shifts. Your brain\'s reward system is beginning to adapt to higher-intensity stimulation, which is worth paying attention to.',
            Medium: 'Your brain\'s reward system may be caught in a compulsive loop, forcing you to seek stimulation just to feel normal. This pattern is often driven by years of escalating use that has gradually reshaped your dopamine pathways.',
            High: 'Your responses indicate significant dopamine dysregulation. Your brain\'s reward system has been substantially rewired by high-intensity stimulation, creating a powerful cycle that feels impossible to break through willpower alone.'
        };
        parts.push(openings[overallLevel] || openings.Medium);

        // Toll — general impact
        const tolls = {
            Low: 'Staying mindful of your habits now can help you avoid the gradual shifts that many people don\'t notice until they become patterns.',
            Normal: 'Over time, this can take a measurable toll — reduced motivation, difficulty concentrating, and subtle emotional shifts that build up gradually.',
            Medium: 'Over time, this can take a measurable toll in various forms — chronic fatigue, emotional numbness, and a steady decline in motivation and focus.',
            High: 'The toll is often visible across multiple areas — chronic fatigue, emotional numbness, difficulty forming connections, and a steady erosion of motivation and self-trust.'
        };
        parts.push(tolls[overallLevel] || tolls.Medium);

        // Closing — hope and direction
        const closings = {
            Low: 'Building awareness now puts you in a strong position to maintain healthy patterns.',
            Normal: 'The good news is that early intervention is highly effective — your brain\'s neuroplasticity works in your favor at this stage.',
            Medium: 'This can lock you into a cycle of craving and shame that is extremely difficult to break free from through willpower alone, as your neurology prioritizes the familiar reward over long-term wellbeing.',
            High: 'However, neuroplasticity means your brain can be rewired. With the right structured approach, recovery is not only possible — it\'s predictable.'
        };
        parts.push(closings[overallLevel] || closings.Medium);

        return parts.join(' ');
    }
};

// ========================================
// Personalized Text Helper
// ========================================
const PersonalizedText = {
    /**
     * Replace template placeholders with user data
     * Supports: {name}, {gender}, {ageGroup}
     */
    replace(text) {
        if (!text) return '';
        const name = State.getAnswer('name_capture') || 'there';
        const genderRaw = State.getAnswer('landing') || 'male';
        const gender = genderRaw.toLowerCase() === 'male' ? 'men' : 'women';
        const ageGroup = State.getAnswer('age_selection') || '25-34';
        return text
            .replace(/\{name\}/g, Security.escapeHtml(name))
            .replace(/\{gender\}/g, gender)
            .replace(/\{ageGroup\}/g, ageGroup);
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

        // Arrows icon - for "Sometimes" (bidirectional)
        arrows: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12c2-3 4-4 6-2s4 1 6-2 4-4 6-2"/>
            <path d="M3 17c2-3 4-4 6-2s4 1 6-2 4-4 6-2"/>
        </svg>`,

        // ========================================
        // Likert Scale Icons (custom styled)
        // ========================================
        
        // Thumbs down with X - "Strongly disagree" (position 1)
        thumbs_down_x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 14V2"/>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
            <path d="m3 17 2 2" stroke="#ef4444" stroke-width="1.8"/>
            <path d="m5 17-2 2" stroke="#ef4444" stroke-width="1.8"/>
        </svg>`,

        // Thumbs up with sparkles - "Strongly agree" (position 5)
        thumbs_up_star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 10v12"/>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
            <path d="M19 3v3" stroke="#22c55e" stroke-width="1.8"/>
            <path d="M17.5 4.5h3" stroke="#22c55e" stroke-width="1.8"/>
            <path d="M22 7v2" stroke="#22c55e" stroke-width="1.5"/>
            <path d="M21 8h2" stroke="#22c55e" stroke-width="1.5"/>
        </svg>`,

        // ========================================
        // Checkbox list SVG icons (replacing emojis)
        // ========================================

        // Relationships — two people
        couple_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="7" r="3"/>
            <circle cx="17" cy="7" r="3"/>
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
            <path d="M17 11a4 4 0 0 1 4 4v6"/>
        </svg>`,

        // Confidence — shield with checkmark
        confident_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
        </svg>`,

        // Self-control — hand/fist
        bicep_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/>
            <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/>
            <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/>
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>`,

        // Focus and productivity — target/crosshair
        target_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
        </svg>`,

        // General wellbeing — heart
        heart_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>`,

        // Trophy
        trophy_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>`,

        // Energized — lightning bolt
        lightning_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>`,

        // Calm — lotus/meditation
        meditation_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22c-4 0-8-2-8-6 0-3 2-5 4-6"/>
            <path d="M12 22c4 0 8-2 8-6 0-3-2-5-4-6"/>
            <path d="M12 2a5 5 0 0 1 3 9"/>
            <path d="M12 2a5 5 0 0 0-3 9"/>
            <path d="M12 11v11"/>
        </svg>`,

        // Motivated — flame/fire
        flame_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 2-6.5 0 3.5 2.56 5.06 4.5 8.5C17.43 12.97 17 16 14.5 18c-1.23.97-2.79 1.5-4.5 1.5A6.5 6.5 0 0 1 3.5 13c0-1.85.8-3.45 2-4.5 0 2.5 1 4 3 6z"/>
        </svg>`,

        // Free — bird
        bird_emoji: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 7h.01"/>
            <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/>
            <path d="m20 7 2 .5-2 .5"/>
            <path d="M10 18v3"/>
            <path d="M14 17.75V21"/>
        </svg>`,

        // ========================================
        // Payment Icons (Phase 3c - Paywall)
        // ========================================
        
        // Visa — official paths, white card bg
        visa: `<svg viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 0H740C762.092 0 780 17.909 780 40V460C780 482.092 762.092 500 740 500H40C17.909 500 0 482.092 0 460V40C0 17.909 17.909 0 40 0Z" fill="white" stroke="#E0E0E0" stroke-width="8"/><path d="M489.823 143.111C442.988 143.111 401.134 167.393 401.134 212.256C401.134 263.706 475.364 267.259 475.364 293.106C475.364 303.989 462.895 313.731 441.6 313.731C411.377 313.731 388.789 300.119 388.789 300.119L379.123 345.391C379.123 345.391 405.145 356.889 439.692 356.889C490.898 356.889 531.19 331.415 531.19 285.784C531.19 231.419 456.652 227.971 456.652 203.981C456.652 195.455 466.887 186.114 488.122 186.114C512.081 186.114 531.628 196.014 531.628 196.014L541.087 152.289C541.087 152.289 519.818 143.111 489.823 143.111ZM61.3294 146.411L60.1953 153.011C60.1953 153.011 79.8988 156.618 97.645 163.814C120.495 172.064 122.122 176.868 125.971 191.786L167.905 353.486H224.118L310.719 146.411H254.635L198.989 287.202L176.282 167.861C174.199 154.203 163.651 146.411 150.74 146.411H61.3294ZM333.271 146.411L289.275 353.486H342.756L386.598 146.411H333.271ZM631.554 146.411C618.658 146.411 611.825 153.318 606.811 165.386L528.458 353.486H584.542L595.393 322.136H663.72L670.318 353.486H719.805L676.633 146.411H631.554ZM638.848 202.356L655.473 280.061H610.935L638.848 202.356Z" fill="#1A1F71"/></svg>`,

        // Mastercard — official circles, white card bg
        mastercard: `<svg viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 0H740C762.092 0 780 17.909 780 40V460C780 482.092 762.092 500 740 500H40C17.909 500 0 482.092 0 460V40C0 17.909 17.909 0 40 0Z" fill="white" stroke="#E0E0E0" stroke-width="8"/><path d="M465.738 69.1387H313.812V342.088H465.738V69.1387Z" fill="#FF5A00"/><path d="M323.926 205.613C323.926 150.158 349.996 100.94 390 69.1387C360.559 45.9902 323.42 32 282.91 32C186.945 32 109.297 109.648 109.297 205.613C109.297 301.578 186.945 379.227 282.91 379.227C323.42 379.227 360.559 365.237 390 342.088C349.94 310.737 323.926 261.069 323.926 205.613Z" fill="#EB001B"/><path d="M670.711 205.613C670.711 301.578 593.062 379.227 497.098 379.227C456.588 379.227 419.449 365.237 390.008 342.088C430.518 310.231 456.082 261.069 456.082 205.613C456.082 150.158 430.012 100.94 390.008 69.1387C419.393 45.9902 456.532 32 497.041 32C593.062 32 670.711 110.154 670.711 205.613Z" fill="#F79E1B"/></svg>`,

        // American Express — blue card, bold AMEX text (legible at all sizes)
        amex: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg"><rect width="780" height="500" rx="40" fill="#2557D6"/><text x="390" y="260" text-anchor="middle" dominant-baseline="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="220" font-weight="900" fill="white" letter-spacing="-6">AMEX</text></svg>`,

        // Apple Pay — black bg with Apple logo + Pay text
        applepay: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg"><rect width="780" height="500" rx="40" fill="black"/><g transform="translate(50 142) scale(9)" fill="white"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.76 19.67 18.11 18.71 19.5Z"/><path d="M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></g><text x="265" y="305" fill="white" font-size="165" font-family="-apple-system, BlinkMacSystemFont, Helvetica, sans-serif" font-weight="400" letter-spacing="-4">Pay</text></svg>`,

        // Google Pay icon
        googlepay: `<svg viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="white" stroke="#DADCE0"/>
            <path d="M23 16V19.5H27.7C27.5 20.6 26.5 22.6 23 22.6C19.9 22.6 17.4 20.1 17.4 16.9C17.4 13.7 19.9 11.2 23 11.2C24.8 11.2 26 12 26.9 12.8L29.6 10.2C28 8.7 25.9 7.7 23 7.7C17.5 7.7 13 12.1 13 17.6C13 23.1 17.5 27.5 23 27.5C28.8 27.5 32.3 23.6 32.3 17.8C32.3 17.1 32.2 16.6 32.1 16.1H23V16Z" fill="#4285F4"/>
            <path d="M23 16V19.5H27.7C27.5 20.6 26.5 22.6 23 22.6V27.5C28.8 27.5 32.3 23.6 32.3 17.8C32.3 17.1 32.2 16.6 32.1 16.1H23V16Z" fill="#34A853"/>
            <path d="M17.4 16.9C17.4 15.9 17.7 14.9 18.2 14L15.3 11.7C14.2 13.2 13.5 15 13.5 17C13.5 19 14.2 20.8 15.3 22.3L18.2 20C17.7 19.1 17.4 18.1 17.4 16.9Z" fill="#FBBC05"/>
            <path d="M23 11.2C24.8 11.2 26 12 26.9 12.8L29.6 10.2C28 8.7 25.9 7.7 23 7.7C19.1 7.7 15.7 9.9 14.3 13.1L17.2 15.4C17.9 13.3 20.2 11.2 23 11.2Z" fill="#EA4335"/>
        </svg>`,

        // Maestro — white bg, red + blue circles with purple lens overlap
        maestro: `<svg viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 0H740C762 0 780 18 780 40V460C780 482 762 500 740 500H40C18 500 0 482 0 460V40C0 18 18 0 40 0Z" fill="white" stroke="#E0E0E0" stroke-width="8"/><circle cx="310" cy="250" r="155" fill="#EB001B"/><circle cx="470" cy="250" r="155" fill="#00A1DF"/><path d="M390 117A155 155 0 0 1 390 383A155 155 0 0 0 390 117Z" fill="#7673C0"/></svg>`,

        // Discover — white bg, DISCOVER text with orange O
        discover: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg"><rect width="780" height="500" rx="40" fill="white" stroke="#E0E0E0" stroke-width="8"/><text x="390" y="310" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="145" font-weight="700" fill="#231F20"><tspan>DISC</tspan><tspan fill="#F47216">O</tspan><tspan>VER</tspan></text></svg>`,

        // PayPal — white card bg with full PayPal paths
        paypal: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg"><path d="M725,0H55C24.673,0,0,24.673,0,55v391c0,30.327,24.673,55,55,55h670c30.325,0,55-24.673,55-55V55C780,24.673,755.325,0,725,0z" fill="#FFF" stroke="#E0E0E0" stroke-width="8"/><path d="m168.38 169.85c-8.399-5.774-19.359-8.668-32.88-8.668h-52.346c-4.145 0-6.435 2.073-6.87 6.214l-21.265 133.48c-0.221 1.311 0.107 2.51 0.981 3.6 0.869 1.093 1.962 1.636 3.271 1.636h24.864c4.361 0 6.758-2.068 7.198-6.216l5.888-35.985c0.215-1.744 0.982-3.162 2.291-4.254 1.308-1.09 2.944-1.804 4.907-2.13 1.963-0.324 3.814-0.487 5.562-0.487 1.743 0 3.814 0.11 6.217 0.327 2.397 0.218 3.925 0.324 4.58 0.324 18.756 0 33.478-5.285 44.167-15.866 10.684-10.577 16.032-25.244 16.032-44.004 0-12.868-4.202-22.192-12.597-27.975zm-26.99 40.08c-1.094 7.635-3.926 12.649-8.506 15.049-4.581 2.403-11.124 3.597-19.629 3.597l-10.797 0.328 5.563-35.007c0.434-2.397 1.851-3.597 4.252-3.597h6.218c8.72 0 15.049 1.257 18.975 3.761 3.924 2.51 5.233 7.802 3.924 15.869z" fill="#003087"/><path d="m720.79 161.18h-24.208c-2.405 0-3.821 1.2-4.253 3.599l-21.267 136.1-0.328 0.654c0 1.096 0.437 2.127 1.311 3.109 0.868 0.979 1.963 1.471 3.271 1.471h21.595c4.138 0 6.429-2.068 6.871-6.215l21.265-133.81v-0.325c-2e-3 -3.053-1.424-4.58-4.257-4.58z" fill="#009CDE"/><path d="m291.23 209.28h-24.864c-3.058 0-4.908 3.599-5.563 10.797-5.889-8.72-16.25-13.088-31.081-13.088-15.704 0-29.065 5.89-40.078 17.668-11.016 11.779-16.521 25.631-16.521 41.551 0 12.871 3.763 23.121 11.288 30.752 7.525 7.639 17.61 11.451 30.262 11.451 6.104 0 12.433-1.311 18.975-3.926 6.543-2.617 11.778-6.105 15.704-10.469-0.875 2.616-1.309 4.907-1.309 6.868 0 3.494 1.417 5.234 4.253 5.234h22.574c4.141 0 6.543-2.068 7.198-6.216l13.413-85.389c0.215-1.309-0.112-2.507-0.981-3.599-0.873-1.087-1.962-1.634-3.27-1.634zm-42.695 64.614c-5.563 5.351-12.382 8.017-20.447 8.017-6.329 0-11.4-1.742-15.214-5.234-3.819-3.483-5.726-8.282-5.726-14.396 0-8.064 2.725-14.884 8.18-20.446 5.449-5.562 12.211-8.343 20.284-8.343 6.104 0 11.175 1.8 15.214 5.398 4.032 3.599 6.052 8.563 6.052 14.888 0 8.069-2.781 14.778-8.343 20.116z" fill="#003087"/><path d="m428.31 213.86c0-1.088-0.438-2.126-1.306-3.106-0.875-0.981-1.857-1.474-2.945-1.474h-25.191c-2.404 0-4.366 1.096-5.89 3.271l-34.679 51.04-14.394-49.075c-1.096-3.488-3.493-5.236-7.198-5.236h-24.54c-1.093 0-2.075 0.492-2.942 1.474-0.875 0.98-1.309 2.019-1.309 3.106 0 0.44 2.127 6.871 6.379 19.303 4.252 12.434 8.833 25.848 13.741 40.244 4.908 14.394 7.468 22.031 7.688 22.898-17.886 24.43-26.826 37.518-26.826 39.26 0 2.838 1.417 4.254 4.253 4.254h25.191c2.399 0 4.361-1.088 5.89-3.271l83.427-120.4c0.433-0.433 0.651-1.193 0.651-2.289z" fill="#003087"/><path d="m662.89 209.28h-24.865c-3.056 0-4.904 3.599-5.559 10.797-5.677-8.72-16.031-13.088-31.083-13.088-15.704 0-29.065 5.89-40.077 17.668-11.016 11.779-16.521 25.631-16.521 41.551 0 12.871 3.761 23.121 11.285 30.752 7.524 7.639 17.611 11.451 30.266 11.451 6.323 0 12.757-1.311 19.3-3.926 6.544-2.617 11.665-6.105 15.379-10.469 0 0.219-0.222 1.198-0.654 2.942-0.44 1.748-0.655 3.06-0.655 3.926 0 3.494 1.414 5.234 4.254 5.234h22.576c4.138 0 6.541-2.068 7.193-6.216l13.415-85.389c0.215-1.309-0.111-2.507-0.981-3.599-0.876-1.087-1.964-1.634-3.273-1.634zm-42.694 64.452c-5.562 5.453-12.269 8.179-20.12 8.179-6.328 0-11.449-1.742-15.377-5.234-3.928-3.483-5.891-8.282-5.891-14.396 0-8.064 2.727-14.884 8.181-20.446 5.446-5.562 12.214-8.343 20.284-8.343 6.102 0 11.174 1.8 15.212 5.397 4.032 3.599 6.055 8.563 6.055 14.888-1e-3 7.851-2.783 14.505-8.344 19.955z" fill="#009CDE"/><path d="m540.04 169.85c-8.398-5.774-19.356-8.668-32.879-8.668h-52.02c-4.364 0-6.765 2.073-7.197 6.214l-21.266 133.48c-0.221 1.312 0.106 2.511 0.981 3.601 0.865 1.092 1.962 1.635 3.271 1.635h26.826c2.617 0 4.361-1.416 5.235-4.252l5.89-37.949c0.216-1.744 0.98-3.162 2.29-4.254 1.309-1.09 2.943-1.803 4.908-2.13 1.962-0.324 3.812-0.487 5.562-0.487 1.743 0 3.814 0.11 6.214 0.327 2.399 0.218 3.931 0.324 4.58 0.324 18.76 0 33.479-5.285 44.168-15.866 10.688-10.577 16.031-25.244 16.031-44.004 2e-3 -12.867-4.199-22.191-12.594-27.974zm-33.534 53.82c-4.799 3.271-11.997 4.906-21.592 4.906l-10.47 0.328 5.562-35.007c0.432-2.397 1.849-3.597 4.252-3.597h5.887c4.798 0 8.614 0.218 11.454 0.653 2.831 0.44 5.562 1.799 8.179 4.089 2.618 2.291 3.926 5.618 3.926 9.98 0 9.16-2.402 15.375-7.198 18.648z" fill="#009CDE"/></svg>`
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
        openFaqIndex: null,       // Phase 3c: Currently open FAQ (null = all closed)
        accountCreated: false     // Whether user account has been created
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
            openFaqIndex: null,
            accountCreated: false
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
        return this.data.answers[screenId]?.value ?? null;
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
     * Funnel screens data (all screens from registry + local, flat array)
     */
    screens: [],

    /**
     * Ordered sequence of screen IDs for this funnel (from config.json)
     */
    sequence: [],

    /**
     * Navigate to a specific screen
     * @param {string} screenId - Target screen ID
     */
    _pendingNavTimer: null,
    navigate(screenId, opts = {}) {
        log.info(`[Router] Navigating to: ${screenId}`);
        // Cancel any in-flight delayed navigation to prevent double-renders on rapid clicks
        if (this._pendingNavTimer) {
            clearTimeout(this._pendingNavTimer);
            this._pendingNavTimer = null;
        }
        const doNav = () => {
            this._pendingNavTimer = null;
            State.set('currentScreen', screenId);
            App.render();
        };
        // Small artificial delay on forward navigation to suggest data is being processed.
        // Back navigation passes { instant: true } for snappy UX.
        if (opts.instant) {
            doNav();
        } else {
            this._pendingNavTimer = setTimeout(doNav, 280);
        }
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
        // Sequence-driven navigation (primary)
        if (this.sequence.length > 0) {
            const idx = this.sequence.indexOf(currentScreenId);
            if (idx >= 0 && idx < this.sequence.length - 1) {
                return this.sequence[idx + 1];
            }
        }
        // Fallback: nextScreenLogic in screen data
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
    header(ctaText) {
        return `
            <header class="header">
                <div class="logo">${CONFIG.brandName}</div>
                ${ctaText
                    ? `<button class="header-cta">${Security.escapeHtml(ctaText)}</button>`
                    : `<button class="menu-button" aria-label="Menu">
                        <div class="menu-icon">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>`
                }
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
                <span class="checkbox-answer__label">${safeLabel}</span>
                <div class="checkbox-answer__checkbox">
                    ${isSelected ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>` : ''}
                </div>
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
        const iconSvg = option.icon ? (Icons.get(option.icon) || '') : '';
        const isSelected = State.isSelected(screenId, option.label);

        return `
            <label class="checkbox-answer checkbox-answer--icon ${isSelected ? 'checkbox-answer--selected' : ''}"
                   data-screen="${Security.escapeHtml(screenId)}"
                   data-answer="${safeLabel}">
                ${iconSvg ? `<div class="checkbox-answer__icon">${iconSvg}</div>` : ''}
                <span class="checkbox-answer__label">${safeLabel}</span>
                <div class="checkbox-answer__checkbox">
                    ${isSelected ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>` : ''}
                </div>
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
                <input type="text"
                       class="text-input-field__input"
                       placeholder="${Security.escapeHtml(placeholder)}"
                       value="${Security.escapeHtml(textValue)}"
                       data-screen="${Security.escapeHtml(screenId)}">
                <div class="text-input-field__checkbox">
                    ${isSelected ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>` : ''}
                </div>
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
                <div class="info-card__illustration">\u{1F64F}</div>
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
            const name = logo.name;
            // Split into prefix ("University of") and main name
            const parts = name.match(/^(University of )?(.+)$/i);
            const prefix = parts[1] ? parts[1].toUpperCase().trim() : '';
            const mainName = parts[2].toUpperCase().trim();
            // For "Harvard University" → prefix = "", main = "HARVARD UNIVERSITY"
            // For "University of Oxford" → prefix = "UNIVERSITY OF", main = "OXFORD"
            let topLine, bottomLine, topIsMain;
            if (name.match(/^University of /i)) {
                // "University of Oxford" → UNIVERSITY OF (gray) + OXFORD (black)
                topLine = 'UNIVERSITY OF';
                bottomLine = name.replace(/^University of /i, '').toUpperCase();
                topIsMain = false;
            } else if (name.match(/ University$/i)) {
                // "Harvard University" → HARVARD (black) + UNIVERSITY (gray)
                topLine = name.replace(/ University$/i, '').toUpperCase();
                bottomLine = 'UNIVERSITY';
                topIsMain = true;
            } else {
                topLine = name.toUpperCase();
                bottomLine = '';
                topIsMain = true;
            }

            return `
                <div class="university-card">
                    <span class="university-card__${topIsMain ? 'name' : 'prefix'}">${Security.escapeHtml(topLine)}</span>
                    <span class="university-card__${topIsMain ? 'prefix' : 'name'}">${Security.escapeHtml(bottomLine)}</span>
                </div>
            `;
        }).join('');

        return `<div class="university-cards">${logosHtml}</div>`;
    },

    /**
     * Render profile illustration — same character with 4 emotional states
     * @param {string} gender - 'male' or 'female'
     * @param {string} level - 'Low', 'Normal', 'Medium', 'High'
     * @returns {string} SVG HTML string
     */
    profileIllustration(gender, level) {
        const file = gender === 'male' ? 'bad_mood_man.png' : 'bad_mood_woman.png';
        return `
            <div class="profile-summary__illustration">
                <img src="../../assets/${file}" alt="Profile illustration" class="profile-summary__illustration-img">
            </div>
        `;
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
                <div class="cbt-diagram__wrapper">
                    <img src="../../assets/cbt_head_brain.png"
                         class="cbt-diagram__image"
                         alt="CBT Model"
                         onload="this.classList.add('cbt-diagram__image--loaded')">
                    <div class="cbt-diagram__orbit">
                        <div class="cbt-diagram__anchor cbt-diagram__anchor--enter" style="--angle: 300deg; animation-delay: 0.55s">
                            <span class="cbt-diagram__label">${Security.escapeHtml(elements[0])}</span>
                        </div>
                        <div class="cbt-diagram__anchor cbt-diagram__anchor--enter" style="--angle: 60deg; animation-delay: 0.75s">
                            <span class="cbt-diagram__label">${Security.escapeHtml(elements[1])}</span>
                        </div>
                        <div class="cbt-diagram__anchor cbt-diagram__anchor--enter" style="--angle: 180deg; animation-delay: 0.95s">
                            <span class="cbt-diagram__label">${Security.escapeHtml(elements[2])}</span>
                        </div>
                    </div>
                </div>
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
        // Pin positions as % of map (real cities)
        const pins = [
            { left: 15, top: 35 },
            { left: 29, top: 41 },
            { left: 48, top: 38 },
            { left: 56, top: 42 },
            { left: 85, top: 48 },
            { left: 88, top: 80 },
            { left: 34, top: 72 },
            { left: 63, top: 55 },
            { left: 55, top: 84 }
        ];
        const pinColor = 'var(--color-primary)';

        // Shuffle pin order for random appearance
        const shuffled = pins.map((p, i) => ({ ...p, i })).sort(() => Math.random() - 0.5);
        const pinsHtml = shuffled.map((p, idx) => `
            <div class="map-pin" style="left:${p.left}%;top:${p.top}%;animation-delay:${0.2 + idx * 0.3}s">
                <svg width="18" height="24" viewBox="0 0 24 32">
                    <path d="M12,0 C5.4,0 0,5.4 0,12 C0,21 12,32 12,32 C12,32 24,21 24,12 C24,5.4 18.6,0 12,0 Z" fill="${pinColor}" opacity="0.7"/>
                    <circle cx="12" cy="11" r="5.5" fill="white" opacity="0.85"/>
                    <circle cx="12" cy="11" r="3.5" fill="${pinColor}" opacity="0.2"/>
                </svg>
            </div>
        `).join('');

        return `
            <div class="world-map">
                <div class="world-map__container">
                    <img src="../../assets/world-map-dots.svg" class="world-map__img" alt="World map">
                    ${pinsHtml}
                </div>
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
    likertOption(option, screenId) {
        const isSelected = State.isSelected(screenId, option.value);
        const iconSvg = option.icon ? Icons.get(option.icon) : '';

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
            </div>
        `;
    },

    /**
     * Render horizontal likert scale with 5 options
     * Labels for first/last options render outside the buttons
     * @param {Array} options - Array of option objects
     * @param {string} screenId - Current screen ID
     * @returns {string} HTML string
     */
    likertScale(options, screenId) {
        const optionsHtml = options.map(option => {
            return this.likertOption(option, screenId);
        }).join('');

        const firstLabel = options[0]?.label || '';
        const lastLabel = options[options.length - 1]?.label || '';

        return `
            <div class="likert-scale-wrapper">
                <div class="likert-scale" data-screen="${Security.escapeHtml(screenId)}">
                    ${optionsHtml}
                </div>
                <div class="likert-labels">
                    <span class="likert-labels__start">${Security.escapeHtml(firstLabel)}</span>
                    <span class="likert-labels__end">${Security.escapeHtml(lastLabel)}</span>
                </div>
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
        // Orange stars matching the reference design
        const stars = Array.from({ length: Math.min(testimonial.rating || 5, 5) }, () =>
            `<span class="testimonial-card__star">★</span>`
        ).join('');

        return `
            <div class="testimonial-card">
                <div class="testimonial-card__header">
                    <div class="testimonial-card__stars">${stars}</div>
                    ${testimonial.handle ? `<span class="testimonial-card__handle">${Security.escapeHtml(testimonial.handle)}</span>` : ''}
                </div>
                <h4 class="testimonial-card__title">${Security.escapeHtml(testimonial.title || '')}</h4>
                <p class="testimonial-card__content">${Security.escapeHtml(testimonial.content || '')}</p>
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
        
        const policyLinks = {
            'Terms of Use and Service': 'terms-of-use.html',
            'Privacy Policy': 'privacy-policy.html',
            'Subscription Policy': 'subscription-policy.html',
            'Cookie Policy': 'cookie-policy.html'
        };
        
        // Replace policy names with links using regex for robustness
        Object.entries(policyLinks).forEach(([name, url]) => {
            const regex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            safeText = safeText.replace(regex, `<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`);
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
     * Format: {Name}_{Mon}{Year}
     * Example: "John_Apr2026"
     * @param {string} name - User's name (from state)
     * @returns {string} Promo code string
     */
    generatePromoCode(name) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const currentMonth = months[now.getMonth()];
        const currentYear  = now.getFullYear();

        // Title-case first name (letters only); fallback to email username or 'User'
        let raw = (name || '').replace(/[^a-zA-Z]/g, '');
        if (!raw) {
            const email = State.getAnswer('email_capture');
            raw = email ? email.split('@')[0].replace(/[^a-zA-Z]/g, '') : 'User';
        }
        const userName = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

        return `${userName}_${currentMonth}${currentYear}`;
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
        const safeName            = Security.escapeHtml(tier.name);
        const safeOriginalPrice   = Security.escapeHtml(tier.originalPrice);
        const safeDiscountedPrice = Security.escapeHtml(tier.discountedPrice);
        const safeId              = Security.escapeHtml(tier.id);
        const selectedClass       = isSelected ? 'pricing-card--selected' : '';

        // Per-day price badge: parse "$5.71/day" → currency symbol + integer + decimal
        const currencyMatch = (tier.pricePerDay || '').match(/[€$£¥]/);
        const currency = currencyMatch ? currencyMatch[0] : '$';
        const perDayRaw = (tier.pricePerDay || '').replace(/[€$£¥]/g, '').replace('/day', '').trim();
        const [perDayInt, perDayDec] = perDayRaw.split('.');

        return `
            <div class="pricing-card-group">
                ${tier.badge ? `<div class="pricing-card__popular-bar">★ ${Security.escapeHtml(tier.badge)}</div>` : ''}
                <div class="pricing-card ${selectedClass}${tier.badge ? ' pricing-card--has-bar' : ''}"
                     data-tier-id="${safeId}"
                     role="button"
                     tabindex="0"
                     aria-label="Select ${safeName}">
                    <!-- Radio indicator -->
                    <div class="pricing-card__radio ${isSelected ? 'pricing-card__radio--selected' : ''}"></div>

                    <!-- Plan name + prices -->
                    <div class="pricing-card__info">
                        <p class="pricing-card__name">${safeName}</p>
                        <p class="pricing-card__prices">
                            <del class="pricing-card__original">${safeOriginalPrice}</del>
                            <span class="pricing-card__discounted">${safeDiscountedPrice}</span>
                        </p>
                    </div>

                    <!-- Per-day price badge (grey pill right side) -->
                    <div class="pricing-card__per-day-badge">
                        <div class="per-day__top">
                            <span class="per-day__currency">${Security.escapeHtml(currency)}</span>
                            <span class="per-day__integer">${Security.escapeHtml(perDayInt || '0')}</span>
                            <span class="per-day__decimal">${Security.escapeHtml(perDayDec || '00')}</span>
                        </div>
                        <span class="per-day__label">per day</span>
                    </div>
                </div>
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
        const iconKeyMap = { 'americanexpress': 'amex', 'applepay': 'applepay', 'maestro': 'maestro', 'discover': 'discover' };
        const iconsHtml = icons.map(iconName => {
            const raw = iconName.toLowerCase().replace(/\s+/g, '');
            const iconKey = iconKeyMap[raw] || raw;
            return `<div class="payment-icon">${Icons.get(iconKey)}</div>`;
        }).join('');

        return `
            <div class="payment-icons-section">
                <div class="payment-icons__secure-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <polyline points="9 12 11 14 15 10"/>
                    </svg>
                    ${safeHeadline}
                </div>
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
        const safeHeadline    = Security.escapeHtml(guarantee.headline || '30-Day Money-Back Guarantee');
        const safeDescription = Security.escapeHtml(guarantee.description || '');
        const safeLinkText    = Security.escapeHtml(guarantee.linkText || 'Learn more');

        return `
            <div class="money-back-card">
                <img src="../../assets/guarantee_badge.png" alt="30-day money-back guarantee" class="guarantee-medal">
                <h3 class="money-back-card__headline">${safeHeadline}</h3>
                <p class="money-back-card__description">${safeDescription}</p>
                <a href="#money-back-policy" class="money-back-card__link">${safeLinkText}</a>
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
        const safeHeadline = Security.escapeHtml(headline || 'People often ask');

        // Question-mark circle icon badge used by the reference design
        const qIcon = `<span class="faq-q-icon">?</span>`;

        const questionsHtml = questions.map((item, index) => {
            const isOpen = index === openIndex;
            const safeQuestion = Security.escapeHtml(item.question);
            const safeAnswer   = Security.escapeHtml(item.answer);

            return `
                <div class="faq-item ${isOpen ? 'faq-item--open' : ''}" data-faq-index="${index}">
                    <button class="faq-question" aria-expanded="${isOpen}">
                        ${qIcon}
                        <span class="faq-question__text">${safeQuestion}</span>
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
     * Render before/after comparison section.
     * @param {Object} data - beforeAfter object from JSON
     * @returns {string} HTML string
     */
    beforeAfter(data) {
        // Pick gender-specific images
        const gender = (State.getAnswer('landing') || 'male').toLowerCase();
        const nowImage  = data.nowImage.replace('before_state', `before_state_${gender}`);
        const goalImage = data.goalImage.replace('after_state', `after_state_${gender}`);

        const makeSegments = (fill, variant) => {
            const total = 5;
            const filled = Math.max(1, Math.round(fill * total));
            return Array.from({ length: total }, (_, i) =>
                `<span class="ba-seg ba-seg--${variant}${i < filled ? ' ba-seg--on' : ''}"></span>`
            ).join('');
        };

        const metricsHtml = data.metrics.map(m => `
            <div class="ba-metric">
                <div class="ba-metric__row">
                    <div class="ba-metric__col">
                        <p class="ba-metric__label">${Security.escapeHtml(m.label)}</p>
                        <p class="ba-metric__state ba-metric__state--now">${Security.escapeHtml(m.nowState)}</p>
                        <div class="ba-segs">${makeSegments(m.nowFill, 'now')}</div>
                    </div>
                    <div class="ba-metric__col">
                        <p class="ba-metric__label">${Security.escapeHtml(m.label)}</p>
                        <p class="ba-metric__state ba-metric__state--goal">${Security.escapeHtml(m.goalState)}</p>
                        <div class="ba-segs">${makeSegments(m.goalFill, 'goal')}</div>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="before-after">
                <div class="ba-images">
                    <div class="ba-image-col">
                        <img src="${Security.escapeHtml(nowImage)}" alt="Current state" class="ba-image">
                        <span class="ba-label">${Security.escapeHtml(data.nowLabel || 'Now')}</span>
                    </div>
                    <div class="ba-arrow" aria-hidden="true">
                        <svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg" fill="none">
                            <polyline points="8,20 28,50 8,80" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="20,20 40,50 20,80" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="ba-image-col">
                        <div class="ba-image ba-image--after"
                             style="background-image: url('${Security.escapeHtml(goalImage)}');"
                             role="img" aria-label="Goal state"></div>
                        <span class="ba-label ba-label--goal">${Security.escapeHtml(data.goalLabel || 'Your Goal')}</span>
                    </div>
                </div>
                <div class="ba-metrics">
                    ${metricsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Render minimal sticky header for the paywall screen.
     * @param {string} ctaText   - CTA button label
     * @param {string} screenId  - data-screen attribute for CTA delegation
     * @param {number} initialMinutes - Starting MM:SS value to display
     * @returns {string} HTML string
     */
    paywallHeader(ctaText, screenId, initialMinutes = 10) {
        const mins = String(Math.floor(initialMinutes)).padStart(2, '0');
        const secs = '00';
        const safeCta = Security.escapeHtml(ctaText || 'GET MY PLAN');
        const safeId  = Security.escapeHtml(screenId);

        return `
            <header class="paywall-header">
                <span class="countdown-timer__digits paywall-header__timer">${mins}:${secs}</span>
                <button class="cta-button paywall-header__cta" data-screen="${safeId}">${safeCta}</button>
            </header>
        `;
    },

    /**
     * Render ticket-style promo code card with embedded live timer.
     * @param {string} promoCode - Generated promo code (e.g. "John_Apr2026")
     * @param {number} initialMinutes - Countdown start value for initial render
     * @returns {string} HTML string
     */
    promoTicket(promoCode, initialMinutes = 10) {
        const safeCode = Security.escapeHtml(promoCode);
        const mins = String(Math.floor(initialMinutes)).padStart(2, '0');

        return `
            <div class="promo-ticket">
                <div class="promo-ticket__top">
                    <svg class="promo-ticket__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    <span class="promo-ticket__applied">Your promo code applied!</span>
                </div>
                <div class="promo-ticket__bottom">
                    <div class="promo-ticket__code-pill">
                        <svg class="promo-ticket__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span class="promo-ticket__code">${safeCode}</span>
                    </div>
                    <div class="promo-ticket__timer-col">
                        <div class="promo-ticket__timer-display">
                            <div class="promo-ticket__digit-col">
                                <span class="countdown-mins">${mins}</span>
                                <span class="promo-ticket__digit-label">min</span>
                            </div>
                            <span class="pt-sep"> : </span>
                            <div class="promo-ticket__digit-col">
                                <span class="countdown-secs">00</span>
                                <span class="promo-ticket__digit-label">sec</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render context tags row: Main challenge + Goal chips.
     * @param {string} mainChallenge - e.g. "Stress & anxiety"
     * @param {string} goal         - e.g. "Healthy intimacy"
     * @returns {string} HTML string
     */
    contextTags(mainChallenge, goal) {
        const safeChallenge = Security.escapeHtml(mainChallenge || 'Dopamine depletion');
        const safeGoal      = Security.escapeHtml(goal || 'Healthy habits');

        return `
            <div class="context-tags">
                <div class="context-tag">
                    <span class="context-tag__emoji" style="font-size: 20px; flex-shrink: 0;">🧠</span>
                    <div>
                        <p class="context-tag__label">Main challenge</p>
                        <p class="context-tag__value">${safeChallenge}</p>
                    </div>
                </div>
                <div class="context-tag">
                    <span class="context-tag__emoji" style="font-size: 20px; flex-shrink: 0;">🎯</span>
                    <div>
                        <p class="context-tag__label">Goal</p>
                        <p class="context-tag__value">${safeGoal}</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render personalized headline for paywall.
     * @returns {string} HTML string
     */
    personalizedHeadline(rawHeadline) {
        const text = PersonalizedText.replace(
            rawHeadline || 'Your Porn Addiction Recovery Plan is ready!'
        );
        // Wrap "Porn Addiction Recovery Plan" in highlight span
        const highlighted = text.replace(
            'Porn Addiction Recovery Plan',
            '<span class="paywall-headline__highlight">Porn Addiction Recovery Plan</span>'
        );
        return `<h2 class="paywall-headline">${highlighted}</h2>`;
    },

    /**
     * Render "Our goals" checklist section.
     * @param {Array<string>} items - List of goal strings from JSON
     * @returns {string} HTML string
     */
    goalsList(items) {
        const itemsHtml = items.map(item => `
            <li class="goals-list__item">
                <span class="goals-list__check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </span>
                <span>${Security.escapeHtml(item)}</span>
            </li>
        `).join('');

        return `
            <div class="goals-list-section">
                <h3 class="goals-list__headline">Our goals</h3>
                <ul class="goals-list">
                    ${itemsHtml}
                </ul>
            </div>
        `;
    },

    /**
     * Render stats section with SVG semicircle arc chart + 3 stat callouts.
     * @param {Array<Object>} stats - [{percentage, description}, ...]
     * @returns {string} HTML string
     */
    statsWithChart(stats) {
        const statsHtml = stats.map(stat => `
            <div class="stat-callout">
                <span class="stat-callout__pct">${Security.escapeHtml(stat.percentage)}</span>
                <p class="stat-callout__desc">${stat.description}</p>
            </div>
        `).join('');

        const cx = 130, cy = 130, viewW = 260, viewH = 168;
        const arcs = [
            { r: 110, pct: 0.83, stroke: '#5B5BD6', label: '83%',
              lx: 234, ly: 38, linex1: 218, liney1: 50, linex2: 231, liney2: 41 },
            { r:  84, pct: 0.77, stroke: '#8B8BE8', label: '77%',
              lx: 26,  ly: 56, linex1: 50,  liney1: 66, linex2: 36,  liney2: 59 },
            { r:  58, pct: 0.45, stroke: '#A5B4FC', label: '45%',
              lx: 72,  ly: 155, linex1: 72,  liney1: 149, linex2: 72,  liney2: 133 },
        ];
        const arcPaths = arcs.map(a => {
            const halfCirc = Math.PI * a.r;
            const filled = halfCirc * a.pct;
            return `
                <circle cx="${cx}" cy="${cy}" r="${a.r}"
                    fill="none" stroke="#e5e7eb" stroke-width="13"
                    stroke-dasharray="${halfCirc} ${halfCirc}"
                    transform="rotate(180 ${cx} ${cy})"/>
                <circle cx="${cx}" cy="${cy}" r="${a.r}"
                    fill="none" stroke="${a.stroke}" stroke-width="13" stroke-linecap="round"
                    stroke-dasharray="${filled} ${2 * Math.PI * a.r}"
                    transform="rotate(180 ${cx} ${cy})"/>
                <line x1="${a.linex1}" y1="${a.liney1}" x2="${a.linex2}" y2="${a.liney2}"
                    stroke="#9ca3af" stroke-width="1" stroke-dasharray="2,2"/>
                <text x="${a.lx}" y="${a.ly}" font-size="12" font-weight="800"
                    fill="#1A1A2E" text-anchor="middle">${a.label}</text>
            `;
        }).join('');

        return `
            <div class="stats-section">
                <h3 class="stats-section__headline">People just like you achieved great results using our <span class="stats-section__brand">Porn Addiction Recovery Plan!</span></h3>
                <div class="stats-chart" aria-hidden="true">
                    <svg viewBox="0 0 ${viewW} ${viewH}" xmlns="http://www.w3.org/2000/svg">
                        ${arcPaths}
                    </svg>
                </div>
                <div class="stat-callouts">
                    ${statsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Render "without/with Compass" contrast lists.
     * @param {Object} data - contrastLists from JSON
     * @returns {string} HTML string
     */
    contrastLists(data) {
        const xIcon = `<svg class="contrast-list__svg contrast-list__svg--x" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" stroke="#9ca3af" stroke-width="1.5"/>
            <line x1="7" y1="7" x2="13" y2="13" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="13" y1="7" x2="7" y2="13" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;

        const withoutItems = (data.withoutItems || []).map(item => `
            <li class="contrast-list__item contrast-list__item--x">
                <span class="contrast-list__icon contrast-list__icon--x">${xIcon}</span>
                <span>${Security.escapeHtml(item)}</span>
            </li>
        `).join('');

        const withItems = (data.withItems || []).map(item => `
            <li class="contrast-list__item contrast-list__item--check">
                <span class="contrast-list__icon contrast-list__icon--check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </span>
                <span>${Security.escapeHtml(item)}</span>
            </li>
        `).join('');

        return `
            <div class="contrast-lists">
                <div class="contrast-card contrast-card--without">
                    <h4 class="contrast-card__title">${Security.escapeHtml(data.withoutHeadline || 'How life might be without Compass')}</h4>
                    <ul class="contrast-list">${withoutItems}</ul>
                </div>
                <div class="contrast-card contrast-card--with">
                    <h4 class="contrast-card__title">${Security.escapeHtml(data.withHeadline || 'How life might be with Compass')}</h4>
                    <ul class="contrast-list">${withItems}</ul>
                </div>
            </div>
        `;
    },

    /**
     * Second CTA block renders the full purchase flow again.
     */
    secondCtaBlock(tiers, selectedTierId, ctaText, screenId, headlineHtml, promoTicketHtml, contextTagsHtml, legalHtml, paymentHtml) {
        return `
            <div class="second-cta-block">
                ${headlineHtml || ''}
                ${promoTicketHtml || ''}
                ${contextTagsHtml || ''}
                ${this.pricingTiers(tiers, selectedTierId)}
                <div class="paywall__cta">
                    ${this.ctaButton(ctaText, screenId)}
                </div>
                ${legalHtml || ''}
                ${paymentHtml || ''}
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
                        ${Components.genderCard('Male', '../../assets/male.png')}
                        ${Components.genderCard('Female', '../../assets/female.png')}
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
        const safeSubheadline = screenData.subheadline ? Security.escapeHtml(screenData.subheadline) : '';
        const questionNumber = screenData.questionNumber;
        const showProgress = screenData.hasProgressIndicator !== false && questionNumber;
        const isAgeScreen = screenData.type === 'age_selection';
        const isQuestionScreen = !!questionNumber;
        const contentClass = (isAgeScreen || isQuestionScreen) ? 'content' : 'content content--left';

        // Determine previous screen for back button
        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Render answer cards from options
        const answerCardsHtml = screenData.options
            .map(option => Components.answerCard(option, screenData.id))
            .join('');

        // Build progress bar (inline counter for question screens)
        let progressHtml = '';
        if (showProgress) {
            const totalQuestions = Router.screens.filter(s => s.questionNumber).length;
            const percentage = (questionNumber / totalQuestions) * 100;
            progressHtml = `
                <div class="progress-container progress-container--compact">
                    <div class="progress-bar">
                        <div class="progress-bar__fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav ${showProgress ? 'question-nav--spread' : ''}">
                    ${Components.backButton(previousScreen)}
                    ${showProgress ? `<span class="progress-text--inline">${questionNumber} / ${Router.screens.filter(s => s.questionNumber).length}</span>` : ''}
                </nav>

                ${progressHtml}

                <main class="${contentClass}">
                    <h1 class="headline headline--question">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline subheadline--question subheadline--age">${safeSubheadline}</p>` : ''}

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
        const totalQuestions = Router.screens.filter(s => s.questionNumber).length;
        const percentage = (questionNumber / totalQuestions) * 100;

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

                <nav class="question-nav question-nav--spread">
                    ${Components.backButton(previousScreen)}
                    <span class="progress-text--inline">${questionNumber} / ${totalQuestions}</span>
                </nav>

                <div class="progress-container progress-container--compact">
                    <div class="progress-bar">
                        <div class="progress-bar__fill" style="width: ${percentage}%"></div>
                    </div>
                </div>

                <main class="content">
                    <h1 class="headline headline--question">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline subheadline--question">${safeSubheadline}</p>` : ''}

                    <div class="checkbox-answers ${isIconStyle ? 'checkbox-answers--icon' : ''}">
                        ${checkboxesHtml}
                        ${hasTextInput ? Components.textInputField(screenData.id) : ''}
                    </div>

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
        const totalQuestions = Router.screens.filter(s => s.questionNumber).length;
        const percentage = (questionNumber / totalQuestions) * 100;

        // Determine previous screen for back button
        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        return `
            <div class="screen screen--likert" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav question-nav--spread">
                    ${Components.backButton(previousScreen)}
                    <span class="progress-text--inline">${questionNumber} / ${totalQuestions}</span>
                </nav>

                <div class="progress-container progress-container--compact">
                    <div class="progress-bar">
                        <div class="progress-bar__fill" style="width: ${percentage}%"></div>
                    </div>
                </div>

                <main class="content content--likert">
                    <div class="likert-question-area">
                        <h1 class="headline headline--question headline--likert">${safeHeadline}</h1>
                        ${safeSubheadline ? `<p class="subheadline subheadline--question">${safeSubheadline}</p>` : ''}
                    </div>

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
        const isWelcome = screenData.variant === 'welcome';

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
                <p class="interstitial__description interstitial__description--small">${Security.escapeHtml(screenData.content.description || '')}</p>
            `;
        } else if (screenData.content) {
            // Variant: interstitial_1 — info card + checkmark bullets
            bodyHtml = `
                ${Components.infoCard(screenData.content)}
                ${screenData.content.bulletPoints ? Components.checkmarkBullets(screenData.content.bulletPoints) : ''}
            `;
            // Disclaimer goes right above Continue button
            if (screenData.content.disclaimer) {
                bodyHtml += `<p class="interstitial__disclaimer">${Security.escapeHtml(screenData.content.disclaimer)}</p>`;
            }
        }

        const isCbt = !!screenData.content?.cbtModel;
        const contentClass = isWelcome || isCbt
            ? 'content interstitial interstitial--welcome'
            : 'content content--left interstitial';

        return `
            <div class="screen" data-screen="${Security.escapeHtml(screenData.id)}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="${contentClass}">
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
        const dynamicSub = screenData.dynamicSubheadline
            ? PersonalizedText.replace(screenData.dynamicSubheadline)
            : '';
        const safeSubheadline = (dynamicSub || Security.escapeHtml(screenData.subheadline || '')).replace(/\n/g, '<br>');

        // Render progress checklist
        const checklistHtml = screenData.progressSteps
            ? Components.progressChecklist(screenData.progressSteps)
            : '';

        // Render testimonial cards (profile_creation only)
        const testimonialsHtml = screenData.testimonials
            ? `<div class="testimonial-cards">
                <div class="testimonial-cards__track">
                    ${screenData.testimonials.map(t => Components.testimonialCard(t)).join('')}
                </div>
                <div class="testimonial-cards__dots">
                    ${screenData.testimonials.map((_, i) => `<div class="testimonial-cards__dot${i === 0 ? ' testimonial-cards__dot--active' : ''}" data-index="${i}"></div>`).join('')}
                </div>
               </div>`
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

                <main class="content content--centered">
                    <h1 class="headline headline--capture">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline subheadline--capture">${safeSubheadline}</p>` : ''}

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

                <main class="content content--centered">
                    <h1 class="headline headline--capture headline--capture-tail">What's your <span class="highlight-primary">first name</span>?</h1>

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
     * Render profile summary with REAL scoring from quiz answers
     * Shows dopamine dysregulation level gradient bar + 4 sub-metrics
     */
    profileSummary(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || '');

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Calculate real scores from likert answers
        const scores = Scoring.calculate();
        const overallLevel = Scoring.getOverallLevel(scores.overall.pct);
        const overallPct = Math.round(scores.overall.pct * 100);
        const levelIndex = Scoring.toLevelIndex(scores.overall.pct);

        // Gender for photo selection
        const gender = (State.getAnswer('landing') || 'male').toLowerCase();

        // Level emoji and color
        const levelEmojis = ['🟢', '🟡', '🟠', '🔴'];
        const levelEmoji = levelEmojis[levelIndex];

        // Illustration based on gender and level
        const illustrationHtml = Components.profileIllustration(gender, overallLevel);

        // Generate personalized description
        const levelDesc = Scoring.getDetailedDescription(scores, overallLevel, gender);

        // Sub-category metrics with icons
        const categoryIcons = {
            // Brain with signal waves — dopamine sensitivity
            dopamine_sensitivity: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.8 2 8 3.8 8 6c0 1 .4 2 1 2.7V10H9c-1.7 0-3 1.3-3 3v1c0 .6.4 1 1 1h1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1v-2h1c.6 0 1-.4 1-1v-1c0-1.7-1.3-3-3-3h0V8.7c.6-.7 1-1.7 1-2.7 0-2.2-1.8-4-4-4zm-1 8V7.5c0-.3.2-.5.5-.5h1c.3 0 .5.2.5.5V10h-2z"/><path d="M3 7h2M19 7h2M4.2 4.2l1.4 1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
            // Face with wavy mood line — emotional regulation
            emotional_regulation: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="1.2" fill="white"/><circle cx="15" cy="10" r="1.2" fill="white"/><path d="M8 15 Q10 13 12 15 Q14 17 16 15" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
            // Clock with circular arrow — pattern stage
            pattern_stage: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/><path d="M12.5 7H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg>',
            // Body with pulse line — physical impact
            physical_impact: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="4" r="2.5"/><path d="M15 8H9c-1.1 0-2 .9-2 2v4h2v8h6v-8h2v-4c0-1.1-.9-2-2-2z"/><path d="M1 14h4l1.5-3 2 6 2-4.5L12 14h4" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/></svg>'
        };
        const categories = screenData.scoring?.categories || {};
        const metricsHtml = Object.entries(categories).map(([key, cat]) => {
            const catScore = scores[key];
            const level = catScore ? Scoring.getCategoryLevel(key, catScore.pct) : 'Unknown';
            const icon = categoryIcons[key] || '';
            return `
                <div class="profile-metric">
                    <div class="profile-metric__icon">${icon}</div>
                    <div class="profile-metric__text">
                        <div class="profile-metric__label">${Security.escapeHtml(cat.label)}</div>
                        <div class="profile-metric__value">${Security.escapeHtml(level)}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content content--centered">
                    <div class="profile-summary">
                        <h1 class="headline headline--capture">${safeHeadline}</h1>

                        <!-- Overall dysregulation level -->
                        <div class="dysregulation-bar">
                            <div class="dysregulation-bar__header">
                                <div class="dysregulation-bar__label">Estimated level of dopamine dysregulation</div>
                                <span class="dysregulation-bar__badge dysregulation-bar__badge--${overallLevel.toLowerCase()}">${Security.escapeHtml(overallLevel)}</span>
                            </div>

                            <!-- Profile illustration -->
                            ${illustrationHtml}

                            <div class="dysregulation-bar__track">
                                <div class="dysregulation-bar__gradient"></div>
                                <div class="dysregulation-bar__marker" data-target-left="${overallPct}">
                                    <div class="dysregulation-bar__marker-label">Your level</div>
                                    <div class="dysregulation-bar__marker-dot"></div>
                                </div>
                            </div>
                            <div class="dysregulation-bar__scale">
                                <span>Low</span>
                                <span>Normal</span>
                                <span>Medium</span>
                                <span>High</span>
                            </div>
                        </div>

                        <!-- Level explanation -->
                        <div class="profile-summary__level-card">
                            <h3 class="profile-summary__level-title">${levelEmoji} ${Security.escapeHtml(overallLevel)} level</h3>
                            <p class="profile-summary__level-desc">${Security.escapeHtml(levelDesc)}</p>
                        </div>

                        <!-- 4 sub-metrics grid -->
                        <div class="profile-metrics-grid">
                            ${metricsHtml}
                        </div>
                    </div>

                    <div class="continue-container">
                        ${Components.continueButton(false, safeId)}
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render goal timeline with decreasing bar chart
     * Shows personalized headline + 3-month bar chart
     */
    goalTimeline(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const headline = PersonalizedText.replace(screenData.headline || '');

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Generate dynamic month labels from current date
        const now = new Date();
        const numBars = 6;
        const months = [];
        for (let i = 0; i < numBars; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            months.push(d.toLocaleString('en', { month: 'long' }));
        }

        // Target month = current + 2 months
        const targetDate = new Date(now.getFullYear(), now.getMonth() + 2, 1);
        const targetMonth = targetDate.toLocaleString('en', { month: 'long' });
        const targetYear = targetDate.getFullYear();

        // Decreasing bar heights & colors matching screenshot
        const barHeights = [88, 70, 72, 55, 38, 22];
        const barColors = ['#E8A0A0', '#E0BFA0', '#E8CCA0', '#E8DDA0', '#A8D8A0', '#A0BDE8'];

        const firstMonth = months[0];
        const barsHtml = months.map((month, i) => {
            const isFirst = i === 0;
            const isGoal = i === numBars - 2;
            const isLast = i === numBars - 1;
            let label = '';
            if (isFirst) label = firstMonth;
            if (isLast) label = targetMonth;
            return `
                <div class="bar-chart__bar-wrapper">
                    <div class="bar-chart__bar-track">
                        <div class="bar-chart__bar" data-target-height="${barHeights[i]}" style="height: 0%; background: ${barColors[i]}; transition-delay: ${i * 100}ms;"></div>
                        ${isGoal ? '<div class="bar-chart__goal-wrapper bar-chart__goal-wrapper--enter" style="bottom: ' + barHeights[i] + '%;"><div class="bar-chart__goal-badge">Goal</div><div class="bar-chart__goal-dot"></div></div>' : ''}
                    </div>
                    <div class="bar-chart__label">${label ? Security.escapeHtml(label) : ''}</div>
                </div>
            `;
        }).join('');

        const disclaimer = Security.escapeHtml(screenData.disclaimer || '');

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content content--centered">
                    <h1 class="headline headline--timeline">${headline}</h1>

                    <p class="timeline__subtitle">Based on your answers, we expect you to decrease your dopamine dysregulation level by</p>
                    <p class="timeline__target-month">${Security.escapeHtml(targetMonth)} ${targetYear}</p>

                    <div class="bar-chart">
                        <div class="bar-chart__bars">
                            ${barsHtml}
                        </div>
                    </div>

                    ${disclaimer ? `<p class="chart-disclaimer">${disclaimer}</p>` : ''}

                    <div class="continue-container">
                        ${Components.continueButton(false, safeId)}
                    </div>
                </main>
            </div>
        `;
    },

    // ========================================
    // Phase 3c: Value Proposition & Paywall Screens
    // ========================================

    /**
     * Render plan ready screen with recovery curve SVG chart
     */
    planReady(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const rawHeadline = PersonalizedText.replace(screenData.headline || '');
        // Wrap "{name}," and "Porn Addiction Recovery Plan for {gender} {ageGroup}" in purple
        const headline = rawHeadline.replace(
            /^(.+?,\s)(Your\s)(.+?\s)(is ready!?)$/i,
            '<span class="highlight-primary">$1</span>$2<span class="highlight-primary">$3</span>$4'
        );
        const chartTitle = Security.escapeHtml(screenData.chartTitle || '');
        const ctaText = screenData.ctaButton || 'Continue';
        const disclaimer = Security.escapeHtml(screenData.disclaimer || '');

        const previousScreen = State.data.history.length > 0
            ? State.data.history[State.data.history.length - 1]
            : 'landing';

        // Build SVG recovery curve
        const points = screenData.chartPoints || [];
        const labels = screenData.chartLabels || [];

        // SVG dimensions
        const svgW = 340, svgH = 220, padX = 40, padY = 40, padBottom = 30;
        const plotW = svgW - 2 * padX, plotH = svgH - padY - padBottom;

        // Define start/end from first and last chart points
        const startX = padX, startY = padY + plotH - (points[0].value / 100) * plotH;
        const endX = padX + plotW, endY = padY + plotH - (points[points.length - 1].value / 100) * plotH;

        // Control points for single smooth S-curve
        const cp1x = startX + plotW * 0.28;
        const cp1y = startY;
        const cp2x = endX - plotW * 0.28;
        const cp2y = endY;

        // Cubic bezier helper: B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
        const bezierAt = (t) => {
            const mt = 1 - t;
            return {
                x: mt*mt*mt*startX + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*endX,
                y: mt*mt*mt*startY + 3*mt*mt*t*cp1y + 3*mt*t*t*cp2y + t*t*t*endY
            };
        };

        // Place dots along the curve at evenly spaced t values
        const coords = points.map((p, i) => {
            const t = i / (points.length - 1);
            const pos = bezierAt(t);
            return { x: pos.x, y: pos.y, ...p };
        });

        const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

        // Arrow tip just before the last dot — small, slim, pointing right into the dot
        const arrowTipX = endX - 8;
        const arrowBaseX = arrowTipX - 8.75;
        const arrowHalfH = 6.25;
        const arrowD = `M ${arrowBaseX} ${endY - arrowHalfH} L ${arrowTipX} ${endY} L ${arrowBaseX} ${endY + arrowHalfH} Z`;

        // Build gradient area path (fill below curve)
        const areaD = pathD + ` L ${coords[coords.length - 1].x} ${padY + plotH} L ${coords[0].x} ${padY + plotH} Z`;

        // Dotted horizontal grid lines
        const gridCount = 4;
        const gridLinesHtml = Array.from({ length: gridCount + 1 }, (_, i) => {
            const y = padY + (i / gridCount) * plotH;
            return `<line x1="${padX}" y1="${y}" x2="${padX + plotW}" y2="${y}" stroke="#D5D0C8" stroke-width="0.5" stroke-dasharray="4,3"/>`;
        }).join('');

        // Vertical axis line
        const axisHtml = `<line x1="${padX}" y1="${padY}" x2="${padX}" y2="${padY + plotH}" stroke="#D5D0C8" stroke-width="1"/>
            <line x1="${padX}" y1="${padY + plotH}" x2="${padX + plotW}" y2="${padY + plotH}" stroke="#D5D0C8" stroke-width="1"/>`;

        // Dots with white center + colored ring (animated in sequence with line draw)
        const lineDuration = 1800; // ms — must match CSS keyframe duration
        const dotsHtml = coords.map((c, i) => {
            const isFirst = i === 0;
            const isLast = i === coords.length - 1;
            const dotDelay = (i / (coords.length - 1)) * lineDuration;
            let labelHtml = '';

            if (isFirst && c.label) {
                labelHtml = `
                    <g class="recovery-chart__badge recovery-chart__badge--today" style="animation-delay: ${dotDelay}ms;">
                        <rect x="${c.x - 2}" y="${c.y - 30}" width="46" height="20" rx="10" fill="#E57373"/>
                        <text x="${c.x + 21}" y="${c.y - 17}" text-anchor="middle" fill="white" font-size="11" font-weight="600">${Security.escapeHtml(c.label)}</text>
                    </g>
                `;
            } else if (isLast && c.label) {
                const badgeW = 110, badgeH = 40, badgeX = c.x - badgeW + 12, badgeY = c.y - 57;
                labelHtml = `
                    <g class="recovery-chart__badge recovery-chart__badge--end" style="animation-delay: ${lineDuration + 100}ms;">
                        <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="8" ry="8" fill="#4CAF50"/>
                        <text x="${badgeX + badgeW / 2}" y="${badgeY + 16}" text-anchor="middle" fill="white" font-size="11" font-weight="600">After using</text>
                        <text x="${badgeX + badgeW / 2}" y="${badgeY + 31}" text-anchor="middle" fill="white" font-size="11" font-weight="600">Mind Compass</text>
                    </g>
                `;
            }

            return `
                <circle class="recovery-chart__dot" style="animation-delay: ${dotDelay}ms;" cx="${c.x}" cy="${c.y}" r="7" fill="white" stroke="${c.color}" stroke-width="3"/>
                ${labelHtml}
            `;
        }).join('');

        // Vertical dotted grid lines + gray dots on x-axis
        const xAxisDotsHtml = labels.map((_, i) => {
            const x = padX + (i / (labels.length - 1)) * plotW;
            return `<line x1="${x}" y1="${padY}" x2="${x}" y2="${padY + plotH}" stroke="#D5D0C8" stroke-width="0.5" stroke-dasharray="4,3"/>
                    <circle cx="${x}" cy="${padY + plotH}" r="3" fill="#C8C3BA"/>`;
        }).join('');

        const xLabelsHtml = labels.map((l, i) => {
            const x = padX + (i / (labels.length - 1)) * plotW;
            return `<text x="${x}" y="${svgH - 5}" text-anchor="middle" class="recovery-chart__x-label recovery-chart__x-label--enter" data-x-label-index="${i}">${Security.escapeHtml(l)}</text>`;
        }).join('');

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <nav class="question-nav">
                    ${Components.backButton(previousScreen)}
                </nav>

                <main class="content">
                    <h1 class="headline headline--plan-ready">${headline}</h1>

                    <h3 class="recovery-chart__title">${chartTitle}</h3>

                    <div class="recovery-chart">
                        <svg viewBox="0 0 ${svgW} ${svgH}" class="recovery-chart__svg">
                            <defs>
                                <linearGradient id="curveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" stop-color="#FFFDE7" stop-opacity="0.1"/>
                                    <stop offset="40%" stop-color="#FFF9C4" stop-opacity="0.4"/>
                                    <stop offset="100%" stop-color="#C8E6C9" stop-opacity="0.6"/>
                                </linearGradient>
                                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#E57373"/>
                                    <stop offset="35%" stop-color="#FFB74D"/>
                                    <stop offset="65%" stop-color="#FFD54F"/>
                                    <stop offset="100%" stop-color="#8BC34A"/>
                                </linearGradient>
                            </defs>
                            <!-- Grid lines (dotted) -->
                            ${gridLinesHtml}
                            <!-- Axes -->
                            ${axisHtml}
                            <!-- Gradient fill -->
                            <path class="recovery-chart__area" d="${areaD}" fill="url(#curveGrad)"/>
                            <!-- Curve line -->
                            <path class="recovery-chart__line" d="${pathD}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round"/>
                            <!-- X-axis dots -->
                            ${xAxisDotsHtml}
                            <!-- Data points -->
                            ${dotsHtml}
                            <!-- Arrow tip at end of curve -->
                            <path class="recovery-chart__arrow" d="${arrowD}" fill="#8BC34A"/>
                            <!-- X-axis labels -->
                            ${xLabelsHtml}
                        </svg>
                    </div>

                    ${disclaimer ? `<p class="chart-disclaimer">${disclaimer}</p>` : ''}

                    <div class="continue-container">
                        ${Components.continueButton(false, safeId)}
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render scratch card gamification screen
     */
    scratchCard(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const headline = PersonalizedText.replace(screenData.headline || '');
        const badge = screenData.badge || '';
        const subheadline = Security.escapeHtml(screenData.subheadline || '');
        const description = screenData.description || '';
        const discount = screenData.scratchCard?.revealedDiscount || '50%';
        const revealedText = Security.escapeHtml(screenData.scratchCard?.revealedText || '');
        const modalData = screenData.discountModal || {};

        return `
            <div class="screen" data-screen="${safeId}">
                ${Components.header()}

                <main class="content scratch-screen">
                    ${badge ? `<div class="scratch-badge">\u{1F381} ${Security.escapeHtml(badge)}</div>` : ''}

                    <h1 class="headline headline--personalized">
                        <span class="headline--accent">${PersonalizedText.replace('{name}')},</span><br/>
                        ${headline.replace(PersonalizedText.replace('{name}') + ',', '').trim()}
                    </h1>
                    <p class="scratch-subheadline accent-text">${subheadline}</p>
                    <p class="scratch-description">${Security.escapeHtml(description)}\u{2602}\u{FE0F}</p>

                    <!-- Scratch card -->
                    <div class="scratch-card" id="scratch-card">
                        <div class="scratch-card__revealed">
                            <div class="scratch-card__discount-text">Your discount is</div>
                            <div class="scratch-card__discount-value">${Security.escapeHtml(discount)}</div>
                            <div class="scratch-card__discount-sub">${revealedText}</div>
                        </div>
                        <canvas class="scratch-card__overlay" id="scratch-canvas" width="340" height="200"></canvas>
                        <div class="scratch-card__instruction">
                            <svg class="scratch-card__instruction-icon" viewBox="0 0 48 48" fill="none">
                                <path d="M24 4C23 4 22 5 22 6.5V22L18.5 18.5C17.5 17.5 15.5 17.5 14.5 18.5C13.5 19.5 13.5 21 14.5 22L23 33C23.5 33.5 24.5 33.5 25 33L33.5 22C34.5 21 34.5 19.5 33.5 18.5C32.5 17.5 30.5 17.5 29.5 18.5L26 22V6.5C26 5 25 4 24 4Z" fill="white" opacity="0.9"/>
                                <path d="M14 38H34" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 4" opacity="0.7"/>
                                <path d="M16 42H32" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 4" opacity="0.5"/>
                            </svg>
                            <span class="scratch-card__instruction-text">Scratch your discount</span>
                        </div>
                    </div>
                </main>

                <!-- Discount reveal modal (hidden until scratched enough) -->
                <div class="discount-modal" id="discount-modal" style="display:none;">
                    <div class="discount-modal__overlay"></div>
                    <div class="discount-modal__card">
                        <div class="discount-modal__confetti"></div>
                        <div class="discount-modal__emoji">&#129395;</div>
                        <h2 class="discount-modal__title">${Security.escapeHtml(modalData.headline || 'Woo hoo!')}</h2>
                        <p class="discount-modal__text">${Security.escapeHtml(modalData.text || 'Your discount is')}</p>
                        <p class="discount-modal__discount">${Security.escapeHtml(modalData.discount || '50% off')}</p>
                        <button class="cta-button discount-modal__cta" data-screen="${safeId}" data-action="cta">Continue</button>
                        <p class="discount-modal__note">${Security.escapeHtml(modalData.note || '')}</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render thank-you confirmation screen after purchase
     * Shows animated checkmark, plan summary, and continue button
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    thankYou(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || 'Thank You for Your Purchase!');
        const safeSubheadline = Security.escapeHtml(screenData.subheadline || '');

        const selectedTierId = State.data.selectedTier || '1_month';
        const paywall = Router.getScreen('paywall');
        const selectedTier = paywall?.pricingTiers?.find(t => t.id === selectedTierId);

        const tierName = selectedTier ? Security.escapeHtml(selectedTier.name) : 'Selected Plan';
        const tierPrice = selectedTier ? Security.escapeHtml(selectedTier.discountedPrice || selectedTier.price) : '';

        const userName = State.getAnswer('name_capture');
        const promoCode = Components.generatePromoCode(userName, 50);

        const ctaText = screenData.ctaButton?.text || 'Create Your Account';

        return `
            <div class="screen thank-you-screen" data-screen="${safeId}">
                ${Components.header()}

                <main class="content thank-you">
                    <div class="thank-you__checkmark">
                        <svg class="thank-you__checkmark-svg" viewBox="0 0 52 52">
                            <circle class="thank-you__checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                            <path class="thank-you__checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                    </div>

                    <h1 class="headline">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline">${safeSubheadline}</p>` : ''}

                    <div class="thank-you__summary">
                        <div class="thank-you__summary-row">
                            <span class="thank-you__summary-label">Plan</span>
                            <span class="thank-you__summary-value">${tierName}</span>
                        </div>
                        ${tierPrice ? `
                        <div class="thank-you__summary-row">
                            <span class="thank-you__summary-label">Price</span>
                            <span class="thank-you__summary-value">${tierPrice}</span>
                        </div>
                        ` : ''}
                        ${promoCode ? `
                        <div class="thank-you__summary-row">
                            <span class="thank-you__summary-label">Promo Code</span>
                            <span class="thank-you__summary-value thank-you__promo">${Security.escapeHtml(promoCode)}</span>
                        </div>
                        ` : ''}
                    </div>

                    <div class="cta-container">
                        ${Components.ctaButton(ctaText, safeId)}
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Render account creation screen with email (pre-filled) and password fields
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    createAccount(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || 'Create Your Account');
        const safeSubheadline = Security.escapeHtml(screenData.subheadline || '');

        const email = State.getAnswer('email_capture') || '';
        const safeEmail = Security.escapeHtml(email);

        const requirements = screenData.fields?.password?.requirements || [
            'At least 8 characters',
            'At least 1 number',
            'At least 1 uppercase letter'
        ];

        const ctaText = screenData.ctaButton?.text || 'Create Account';

        return `
            <div class="screen create-account-screen" data-screen="${safeId}">
                ${Components.header()}

                <main class="content create-account">
                    <div class="create-account__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/>
                            <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                    </div>

                    <h1 class="headline">${safeHeadline}</h1>
                    ${safeSubheadline ? `<p class="subheadline">${safeSubheadline}</p>` : ''}

                    <form class="create-account__form" data-screen="${safeId}">
                        <div class="create-account__field">
                            <label class="create-account__label" for="account-email">Email</label>
                            <input
                                type="email"
                                id="account-email"
                                class="create-account__input"
                                value="${safeEmail}"
                                data-field="email"
                                data-screen="${safeId}"
                                autocomplete="email"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div class="create-account__field">
                            <label class="create-account__label" for="account-password">Password</label>
                            <input
                                type="password"
                                id="account-password"
                                class="create-account__input"
                                placeholder="${Security.escapeHtml(screenData.fields?.password?.placeholder || 'Enter your password')}"
                                data-field="password"
                                data-screen="${safeId}"
                                minlength="8"
                                autocomplete="new-password"
                            />
                        </div>

                        <div class="create-account__field">
                            <label class="create-account__label" for="account-confirm-password">Confirm Password</label>
                            <input
                                type="password"
                                id="account-confirm-password"
                                class="create-account__input"
                                placeholder="${Security.escapeHtml(screenData.fields?.confirmPassword?.placeholder || 'Re-enter your password')}"
                                data-field="confirmPassword"
                                data-screen="${safeId}"
                                minlength="8"
                                autocomplete="new-password"
                            />
                        </div>

                        <div class="create-account__requirements">
                            ${requirements.map(req => `
                                <div class="create-account__req" data-requirement="${Security.escapeHtml(req)}">
                                    <span class="create-account__req-icon">&#9675;</span>
                                    <span class="create-account__req-text">${Security.escapeHtml(req)}</span>
                                </div>
                            `).join('')}
                        </div>

                        <div class="create-account__error" style="display: none;"></div>

                        <button type="submit"
                                class="cta-button cta-button--disabled create-account__submit"
                                data-screen="${safeId}"
                                disabled>
                            ${Security.escapeHtml(ctaText)}
                        </button>
                    </form>

                    <p class="create-account__secure">
                        ${Icons.get('lock')} Your data is encrypted and secure
                    </p>
                </main>
            </div>
        `;
    },

    /**
     * Render app dashboard placeholder screen (post-account-creation)
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    appDashboard(screenData) {
        const safeId = Security.escapeHtml(screenData.id);
        const safeHeadline = Security.escapeHtml(screenData.headline || 'Welcome to Compass!');
        const safeSubheadline = Security.escapeHtml(screenData.subheadline || '');
        const safeMessage = Security.escapeHtml(screenData.message || '');

        const userName = State.getAnswer('name_capture');
        const greeting = userName ? `Welcome, ${Security.escapeHtml(userName)}!` : safeHeadline;

        return `
            <div class="screen app-dashboard-screen" data-screen="${safeId}">
                <header class="app-header">
                    <span class="app-header__brand">${Security.escapeHtml(CONFIG.brandName)}</span>
                </header>

                <main class="content app-dashboard">
                    <div class="app-dashboard__welcome-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="64" height="64">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                    </div>

                    <h1 class="headline">${greeting}</h1>
                    ${safeSubheadline ? `<p class="subheadline">${safeSubheadline}</p>` : ''}

                    <div class="app-dashboard__card">
                        <h2 class="app-dashboard__card-title">Your Personalized Plan</h2>
                        <p class="app-dashboard__card-text">${safeMessage}</p>
                    </div>

                    <div class="app-dashboard__features">
                        <div class="app-dashboard__feature">
                            <div class="app-dashboard__feature-icon">&#128218;</div>
                            <span>Daily Exercises</span>
                        </div>
                        <div class="app-dashboard__feature">
                            <div class="app-dashboard__feature-icon">&#128200;</div>
                            <span>Progress Tracking</span>
                        </div>
                        <div class="app-dashboard__feature">
                            <div class="app-dashboard__feature-icon">&#128101;</div>
                            <span>Community</span>
                        </div>
                    </div>

                    <p class="app-dashboard__coming-soon">
                        Full app experience coming soon. This is a placeholder for the main product.
                    </p>
                </main>
            </div>
        `;
    },

    /**
     * Render checkout screen — order summary + Stripe Payment Element mount point.
     *
     * The actual Stripe initialisation (API call → Payment Element mount) is
     * triggered *after* the DOM is ready via App.initStripe(), which is called
     * from App.render() when screenType === 'checkout'.
     *
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
     */
    checkout(screenData) {
        const safeId = Security.escapeHtml(screenData.id);

        // Resolve selected tier to display the order summary
        const tierId = State.data.selectedTier || '1_month';
        const paywall = Router.getScreen('paywall');
        const tier = paywall?.pricingTiers?.find(t => t.id === tierId);

        // Display labels — fall back to generic strings if paywall data missing
        const tierName    = Security.escapeHtml(tier?.name || 'Personalized Plan');
        const origPrice   = Security.escapeHtml(tier?.originalPrice || tier?.price || '');
        const introPrice  = Security.escapeHtml(tier?.discountedPrice || tier?.price || '');
        const savingsText = Security.escapeHtml(tier?.savings || '');

        // Promo code (cosmetic display only — discount is applied server-side)
        const userName  = State.getAnswer('name_capture');
        const promoCode = Components.generatePromoCode(userName, 50);

        return `
            <div class="screen checkout-screen" data-screen="${safeId}">
                ${Components.header()}

                <main class="content checkout">

                    <!-- Order Summary card -->
                    <div class="checkout__summary">
                        <h2 class="checkout__summary-title">Order Summary</h2>

                        <div class="checkout__summary-row">
                            <span class="checkout__summary-label">${tierName}</span>
                            ${origPrice ? `<span class="checkout__summary-orig">${origPrice}</span>` : ''}
                        </div>

                        ${savingsText ? `
                        <div class="checkout__summary-row checkout__summary-row--discount">
                            <span class="checkout__summary-label">Discount (${savingsText})</span>
                            <span class="checkout__summary-discount">Applied</span>
                        </div>
                        ` : ''}

                        ${promoCode ? `
                        <div class="checkout__summary-row">
                            <span class="checkout__summary-label">Promo code</span>
                            <span class="checkout__promo-badge">${Security.escapeHtml(promoCode)}</span>
                        </div>
                        ` : ''}

                        <div class="checkout__summary-row checkout__summary-row--total">
                            <span class="checkout__summary-label checkout__summary-label--total">Total today</span>
                            <span class="checkout__summary-total">${introPrice || '—'}</span>
                        </div>
                    </div>

                    <!-- Payment Element mount point (Stripe injects UI here) -->
                    <div class="checkout__payment-section">
                        <div id="payment-element" class="checkout__payment-element">
                            <!-- Stripe Payment Element mounts here after initStripe() -->
                            <div class="checkout__payment-loading">
                                <span>Loading payment form…</span>
                            </div>
                        </div>

                        <!-- Inline error message area (shown by App.initStripe on failure) -->
                        <div id="checkout-error" class="checkout__error" role="alert" style="display:none;"></div>

                        <button
                            id="checkout-pay-btn"
                            class="cta-button checkout__pay-btn cta-button--disabled"
                            data-screen="${safeId}"
                            disabled
                        >
                            Complete Payment
                        </button>
                    </div>

                    <!-- Trust footer -->
                    <div class="checkout__secure-footer">
                        <svg class="checkout__lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span>Pay Safe &amp; Secure · 256-bit SSL</span>
                    </div>

                </main>
            </div>
        `;
    },

    /**
     * Render paywall screen with before/after, pricing, goals, FAQ, testimonials
     */
    paywall(screenData) {
        const safeId         = Security.escapeHtml(screenData.id);
        const selectedTierId = State.data.selectedTier || '1_month';
        const openFaqIndex   = State.data.openFaqIndex;
        const initialMins    = screenData.urgencyElements?.countdownTimer?.initialMinutes || 10;
        const ctaText        = screenData.ctaButton?.text || 'GET MY PLAN';

        // ── Promo code ─────────────────────────────────────────────────────────
        const userName = State.getAnswer('name_capture');
        const promoCode = Components.generatePromoCode(userName);

        // ── Personalization: challenge + goal from v2 scoring engine ───────────
        const mainChallenge = Scoring.getMainChallenge();
        const goal = Scoring.getGoal();

        return `
            <div class="screen paywall-screen" data-screen="${safeId}">

                <!-- 1. Sticky minimal header (timer + CTA) -->
                ${Components.paywallHeader(ctaText, safeId, initialMins)}

                <main class="content paywall">

                    <!-- 2. Before / After comparison -->
                    ${screenData.beforeAfter ? Components.beforeAfter(screenData.beforeAfter) : ''}

                    <!-- 3. Personalized headline -->
                    ${Components.personalizedHeadline(screenData.headline)}

                    <!-- 4. Promo ticket (with embedded live timer) -->
                    ${Components.promoTicket(promoCode, initialMins)}

                    <!-- 5. Context tags: main challenge + goal -->
                    ${Components.contextTags(mainChallenge, goal)}

                    <!-- 6. Pricing tiers -->
                    ${screenData.pricingTiers ?
                        Components.pricingTiers(screenData.pricingTiers, selectedTierId) : ''}

                    <!-- 7. Primary CTA -->
                    <div class="paywall__cta">
                        ${Components.ctaButton(ctaText, safeId)}
                    </div>

                    <!-- 8. Legal disclaimer -->
                    ${screenData.legalDisclaimer ? Components.legalDisclaimer(screenData.legalDisclaimer) : ''}

                    <!-- 9. Payment security + icons -->
                    ${screenData.trustElements?.paymentSecurity ?
                        Components.paymentIcons(
                            screenData.trustElements.paymentSecurity.headline,
                            screenData.trustElements.paymentSecurity.icons
                        ) : ''}

                    <!-- 10. Our goals checklist -->
                    ${screenData.goalsList ? Components.goalsList(screenData.goalsList) : ''}

                    <!-- 11. Stats section with arc chart -->
                    ${screenData.trustElements?.statistics ?
                        Components.statsWithChart(screenData.trustElements.statistics) : ''}

                    <!-- 12. Without / With contrast lists -->
                    ${screenData.contrastLists ? Components.contrastLists(screenData.contrastLists) : ''}

                    <!-- 13. FAQ accordion -->
                    ${screenData.faq ?
                        Components.faqAccordion(
                            screenData.faq.headline,
                            screenData.faq.questions || [],
                            openFaqIndex
                        ) : ''}

                    <!-- 14. Testimonials -->
                    ${screenData.testimonials ? `
                        <div class="testimonials-section">
                            <h3 class="testimonials-section__headline">Users love our plans</h3>
                            <p class="testimonials-section__sub">Here's what people are saying about ${CONFIG.brandName}</p>
                            <div class="testimonial-cards">
                                ${screenData.testimonials.map(t => Components.testimonialCard(t)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- 15. Second CTA block: full repeat -->
                    ${screenData.pricingTiers ?
                        Components.secondCtaBlock(
                            screenData.pricingTiers,
                            selectedTierId,
                            ctaText,
                            safeId,
                            Components.personalizedHeadline(screenData.headline),
                            Components.promoTicket(promoCode, initialMins),
                            Components.contextTags(mainChallenge, goal),
                            screenData.legalDisclaimer ? Components.legalDisclaimer(screenData.legalDisclaimer) : '',
                            screenData.trustElements?.paymentSecurity ?
                                Components.paymentIcons(
                                    screenData.trustElements.paymentSecurity.headline,
                                    screenData.trustElements.paymentSecurity.icons
                                ) : ''
                        ) : ''}

                    <!-- 16. Money-back guarantee card -->
                    ${screenData.trustElements?.moneyBackGuarantee ?
                        Components.moneyBackGuarantee(screenData.trustElements.moneyBackGuarantee) : ''}

                    <!-- 17. Company footer -->
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
    remainingSeconds: 600,
    /** localStorage key for expiry timestamp */
    STORAGE_KEY: 'mc_discount_expiry',

    /**
     * Start countdown. Resumes across page refreshes using localStorage.
     * When timer expires, discounts are removed and state is persisted.
     * @param {number} initialMinutes - Starting time in minutes (default 10)
     */
    start(initialMinutes = 10) {
        this.cleanup();

        const now = Date.now();
        const stored = localStorage.getItem(this.STORAGE_KEY);

        const expiryMs = stored ? parseInt(stored, 10) : NaN;

        if (!isNaN(expiryMs)) {
            const remainingMs = expiryMs - now;
            if (remainingMs <= 0) {
                // Already expired on a previous visit
                this.remainingSeconds = 0;
                this.updateDisplay();
                this.onExpire();
                return;
            }
            // Resume from saved expiry
            this.remainingSeconds = Math.ceil(remainingMs / 1000);
            log.info(`[Timer] Resumed with ${this.remainingSeconds}s remaining`);
        } else {
            // No stored value or corrupt value — clear and start fresh
            if (stored) localStorage.removeItem(this.STORAGE_KEY);
            // First visit — save expiry timestamp
            const expiryMs = now + initialMinutes * 60 * 1000;
            localStorage.setItem(this.STORAGE_KEY, String(expiryMs));
            this.remainingSeconds = initialMinutes * 60;
            log.info(`[Timer] Started fresh ${initialMinutes}:00 countdown`);
        }

        this.updateDisplay();

        this.timerId = setInterval(() => {
            this.remainingSeconds--;

            if (this.remainingSeconds <= 0) {
                this.remainingSeconds = 0;
                this.updateDisplay();
                this.cleanup();
                this.onExpire();
                return;
            }

            this.updateDisplay();
        }, 1000);
    },

    /**
     * Called when timer reaches zero. Persists expired state and removes
     * all promotional elements from the paywall.
     */
    onExpire() {
        // Persist as expired so future page loads also show no discounts
        localStorage.setItem(this.STORAGE_KEY, '0');

        // Hide promo ticket(s)
        document.querySelectorAll('.promo-ticket').forEach(el => { el.style.display = 'none'; });

        // Mark paywall containers so CSS can revert pricing to full price
        document.querySelectorAll('.paywall').forEach(el => el.classList.add('discount-expired'));

        log.info('[Timer] Expired — discounts removed');
    },

    /**
     * Update timer display in DOM.
     * Updates .countdown-timer__digits (header), .countdown-mins and .countdown-secs (promo ticket).
     */
    updateDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;

        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        const display = `${mm}:${ss}`;

        document.querySelectorAll('.countdown-timer__digits').forEach(el => { el.textContent = display; });
        document.querySelectorAll('.countdown-mins').forEach(el => { el.textContent = mm; });
        document.querySelectorAll('.countdown-secs').forEach(el => { el.textContent = ss; });
    },

    /**
     * Stop the interval. Does NOT clear localStorage (discount state persists).
     * Called when navigating away from the paywall screen.
     */
    cleanup() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        log.info('[Timer] Cleaned up');
    }
};

// ========================================
// Testimonial Carousel Controller
// ========================================
const TestimonialCarousel = {
    timerId: null,
    currentIndex: 0,
    totalSlides: 0,
    _abortCtrl: null,

    start() {
        this.cleanup();
        const container = document.querySelector('.testimonial-cards');
        if (!container) return;

        const track = container.querySelector('.testimonial-cards__track');
        const dots = container.querySelectorAll('.testimonial-cards__dot');
        if (!track || dots.length === 0) return;

        this.totalSlides = dots.length;
        this.currentIndex = 0;
        this._abortCtrl = new AbortController();
        const signal = this._abortCtrl.signal;

        // Auto-scroll every 5 seconds
        this.timerId = setInterval(() => this.next(), 5000);

        // Dot clicks
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                this.goTo(parseInt(dot.dataset.index, 10));
                this.resetTimer();
            }, { signal });
        });

        // Swipe support
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none';
        }, { passive: true, signal });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const diff = e.touches[0].clientX - startX;
            const offset = -(this.currentIndex * 100) + (diff / track.offsetWidth) * 100;
            track.style.transform = `translateX(${offset}%)`;
        }, { passive: true, signal });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.4s ease';
            const diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 50) {
                if (diff < 0 && this.currentIndex < this.totalSlides - 1) {
                    this.currentIndex++;
                } else if (diff > 0 && this.currentIndex > 0) {
                    this.currentIndex--;
                }
            }
            this.updatePosition();
            this.resetTimer();
        }, { signal });

        // Mouse drag support
        track.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            track.style.transition = 'none';
            e.preventDefault();
        }, { signal });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const diff = e.clientX - startX;
            const offset = -(this.currentIndex * 100) + (diff / track.offsetWidth) * 100;
            track.style.transform = `translateX(${offset}%)`;
        }, { signal });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.4s ease';
            const diff = e.clientX - startX;
            if (Math.abs(diff) > 50) {
                if (diff < 0 && this.currentIndex < this.totalSlides - 1) {
                    this.currentIndex++;
                } else if (diff > 0 && this.currentIndex > 0) {
                    this.currentIndex--;
                }
            }
            this.updatePosition();
            this.resetTimer();
        }, { signal });
    },

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updatePosition();
    },

    goTo(index) {
        this.currentIndex = index;
        this.updatePosition();
    },

    updatePosition() {
        const track = document.querySelector('.testimonial-cards__track');
        const dots = document.querySelectorAll('.testimonial-cards__dot');
        if (track) track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('testimonial-cards__dot--active', i === this.currentIndex);
        });
    },

    resetTimer() {
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = setInterval(() => this.next(), 5000);
    },

    cleanup() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        if (this._abortCtrl) {
            this._abortCtrl.abort();
            this._abortCtrl = null;
        }
        this.currentIndex = 0;
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
        appEl.addEventListener('submit', (e) => {
            if (e.target.closest('.create-account__form')) {
                e.preventDefault();
            }
        });
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

        // Account creation form submit button
        const accountSubmit = e.target.closest('.create-account__submit:not(.cta-button--disabled)');
        if (accountSubmit) {
            e.preventDefault();
            this.handleAccountFormSubmit(accountSubmit);
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
            return;
        }

        // Account creation password inputs
        const accountInput = e.target.closest('.create-account__input');
        if (accountInput && !accountInput.readOnly) {
            this.handleAccountFormInput();
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
            Router.navigate(previousScreen, { instant: true });
        } else {
            // Fallback to landing if history is empty
            log.info('[User Action] Back navigation (fallback) to: landing');
            Router.navigate('landing', { instant: true });
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
            screenData.screenType === 'value_proposition' ||
            screenData.screenType === 'timeline_chart' ||
            screenData.screenType === 'recovery_curve'
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

        // Generic CTA: navigate to next screen for known screen types
        const screenData = Router.getScreen(screenId);
        const sType = screenData?.screenType;
        if (['value_proposition', 'recovery_curve', 'gamification', 'scratch_card', 'timeline_chart'].includes(sType)) {
            State.pushHistory(screenId);
            const nextScreen = Router.getNextScreen(screenId);
            if (nextScreen) {
                Router.navigate(nextScreen);
            }
            return;
        }

        // For paywall, navigate to thank_you (payment assumed successful for now)
        if (screenData?.screenType === 'payment') {
            log.info(`[User Action] Selected tier: ${State.data.selectedTier}`);
            State.pushHistory(screenId);
            const nextScreen = Router.getNextScreen(screenId);
            if (nextScreen) {
                Router.navigate(nextScreen);
            }
            return;
        }

        // For confirmation (thank_you), navigate to account creation
        if (screenData?.screenType === 'confirmation') {
            State.pushHistory(screenId);
            const nextScreen = Router.getNextScreen(screenId);
            if (nextScreen) {
                Router.navigate(nextScreen);
            }
            return;
        }
    },

    /**
     * Validate email + password and update requirement indicators in the account creation form.
     * Email is now editable so its format is validated here alongside password requirements.
     */
    handleAccountFormInput() {
        const emailEl = document.getElementById('account-email');
        const passwordEl = document.getElementById('account-password');
        const confirmEl = document.getElementById('account-confirm-password');
        if (!passwordEl || !confirmEl) return;

        const email = emailEl ? emailEl.value.trim() : '';
        const password = passwordEl.value;
        const confirm = confirmEl.value;

        // Basic email format check (same regex used in the email_gate screen)
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        const checks = {
            'At least 8 characters': password.length >= 8,
            'At least 1 number': /\d/.test(password),
            'At least 1 uppercase letter': /[A-Z]/.test(password)
        };

        document.querySelectorAll('.create-account__req').forEach(reqEl => {
            const reqText = reqEl.dataset.requirement;
            const passed = checks[reqText] || false;
            reqEl.classList.toggle('create-account__req--passed', passed);
            reqEl.querySelector('.create-account__req-icon').innerHTML = passed ? '&#9679;' : '&#9675;';
        });

        const allPassed = Object.values(checks).every(Boolean);
        const passwordsMatch = password === confirm && confirm.length > 0;

        const submitBtn = document.querySelector('.create-account__submit');
        if (submitBtn) {
            const canSubmit = emailValid && allPassed && passwordsMatch;
            submitBtn.disabled = !canSubmit;
            submitBtn.classList.toggle('cta-button--disabled', !canSubmit);
        }

        const errorEl = document.querySelector('.create-account__error');
        if (errorEl) {
            if (confirm.length > 0 && !passwordsMatch) {
                errorEl.textContent = 'Passwords do not match';
                errorEl.style.display = 'block';
            } else {
                errorEl.style.display = 'none';
            }
        }
    },

    /**
     * Handle account creation form submission
     * Calls the /api/create-user serverless function
     * @param {HTMLElement} button - The submit button element
     */
    async handleAccountFormSubmit(button) {
        const screenId = button.dataset.screen;
        log.info(`[User Action] Account form submitted on ${screenId}`);

        // Read email from the DOM input — the user may have corrected it on this screen.
        // Update State so downstream usages (promo code name-fallback, etc.) stay consistent.
        const email = document.getElementById('account-email')?.value.trim();
        if (email) {
            State.recordAnswer('email_capture', email);
        }

        const password = document.getElementById('account-password')?.value;
        const confirmPassword = document.getElementById('account-confirm-password')?.value;

        if (!email || !password) {
            App.showError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            App.showError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            App.showError('Password must be at least 8 characters');
            return;
        }

        button.disabled = true;
        button.classList.add('cta-button--disabled');
        button.textContent = 'Creating Account...';

        const userName = State.getAnswer('name_capture');
        const promoCode = Components.generatePromoCode(userName, 50);

        // --- Structured quiz fields for users_profile ---

        // Compute all category scores; returns {overall, dopamine_sensitivity,
        // emotional_regulation, pattern_stage, physical_impact} each with {sum,max,pct}.
        const scoreData = Scoring.calculate();
        const scores = {
            overall:               scoreData.overall?.pct              ?? null,
            dopamine_sensitivity:  scoreData.dopamine_sensitivity?.pct  ?? null,
            emotional_regulation:  scoreData.emotional_regulation?.pct  ?? null,
            pattern_stage:         scoreData.pattern_stage?.pct         ?? null,
            physical_impact:       scoreData.physical_impact?.pct       ?? null,
        };

        // Parse funnel version from URL. Handles both URL shapes:
        //   /funnels/v2/   (localhost direct access)
        //   /funnel-v2/    (Vercel rewrite)
        const funnelVersion =
            window.location.pathname.match(/\/funnels\/([^/]+)\//)?.[1] ||
            window.location.pathname.match(/\/funnel-([^/]+)/)?.[1] ||
            null;

        // V2 uses 'age_selection'; V1 uses 'question_age' — fall back gracefully
        const ageGroup = State.getAnswer('age_selection') || State.getAnswer('question_age') || null;

        // Gender is stored under the 'landing' key (set in handleGenderSelect)
        // for both V1 and V2.
        const gender = State.getAnswer('landing') || null;

        // main challenge from dedicated scoring helper (reads question_31)
        const mainChallenge = Scoring.getMainChallenge() || null;

        // goal only exists in V2 (question_33); send null for V1 to avoid the
        // hardcoded 'Focus levels' fallback inside Scoring.getGoal()
        const goal = State.getAnswer('question_33') ? Scoring.getGoal() : null;

        // ── Dev mock: bypass /api/create-user on localhost ──────────────────
        // Static server has no serverless functions; mock a successful response
        // so the full post-account flow (success message, navigation) can be tested.
        if (isDev()) {
            log.info('[Account] Dev mock — skipping create-user API (localhost)');
            State.set('accountCreated', true);
            App.showSuccess('Account created successfully!');
            button.textContent = 'Account Created';
            setTimeout(() => {
                const nextScreen = Router.getNextScreen(screenId);
                if (nextScreen) {
                    State.pushHistory(screenId);
                    Router.navigate(nextScreen);
                }
            }, 1000);
            return;
        }

        try {
            const response = await fetch('../api/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    name: userName || null,
                    selectedPlan: State.data.selectedTier,
                    promoCode,
                    quizAnswers: State.data.answers,
                    // Structured quiz profile fields
                    gender,
                    ageGroup,
                    mainChallenge,
                    goal,
                    scores,
                    funnelVersion,
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create account');
            }

            log.info('[Account] User created successfully:', result.user?.id);

            // Same-origin local dev fallback only: keep tokens in localStorage
            // when no external webapp URL is configured.
            if (!CONFIG.webappUrl) {
                if (result.access_token) {
                    localStorage.setItem('compass_access_token', result.access_token);
                }
                if (result.refresh_token) {
                    localStorage.setItem('compass_refresh_token', result.refresh_token);
                }
            }

            State.set('accountCreated', true);
            App.showSuccess('Account created successfully!');

            setTimeout(() => {
                if (CONFIG.webappUrl) {
                    // Production: pass tokens via URL hash so the webapp can initialise a
                    // Supabase session cross-origin (localStorage is scoped per origin and
                    // cannot be read by a different domain).
                    // The webapp reads, consumes, and strips the hash on mount.
                    const hash = result.access_token && result.refresh_token
                        ? '#access_token=' + encodeURIComponent(result.access_token) +
                          '&refresh_token=' + encodeURIComponent(result.refresh_token)
                        : '';
                    window.location.href = CONFIG.webappUrl + hash;
                    return;
                }
                // Local dev: CONFIG.webappUrl is empty — navigate to the next funnel screen.
                const nextScreen = Router.getNextScreen(screenId);
                if (nextScreen) {
                    State.pushHistory(screenId);
                    Router.navigate(nextScreen);
                }
            }, 1000);

        } catch (error) {
            log.error('[Account] Creation failed:', error.message);

            // Surface "already registered" inline on the form so the user can correct
            // the email and retry without losing their password input.
            const isAlreadyRegistered = /already registered|already been registered|user already exists/i.test(
                error.message || ''
            );
            if (isAlreadyRegistered) {
                const errorEl = document.querySelector('.create-account__error');
                if (errorEl) {
                    const loginUrl = Security.escapeHtml(CONFIG.webappUrl || 'https://mind-compass-webapp.vercel.app');
                    errorEl.innerHTML = 'This email is already registered. Please use a different email or ' +
                        '<a href="' + loginUrl + '" style="color:#2563eb;text-decoration:underline;">log in directly</a>.';
                    errorEl.style.display = 'block';
                }
            } else {
                App.showError(error.message || 'Failed to create account. Please try again.');
            }

            button.disabled = false;
            button.classList.remove('cta-button--disabled');
            button.textContent = 'Create Account';
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
            const radio = c.querySelector('.pricing-card__radio');
            if (radio) radio.classList.toggle('pricing-card__radio--selected', isSelected);
        });

        // Re-prefetch PI for the newly selected tier so checkout stays instant
        this.prefetchCheckout();
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
// ── Dev utility ─────────────────────────────────────────────────────────────
// Returns true when running on a local static server. Used to gate dev mocks
// (Stripe, create-user) that require serverless APIs unavailable on localhost.
const isDev = () => ['localhost', '127.0.0.1'].includes(window.location.hostname);

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
     * Start create-checkout API call in background while user is still on paywall.
     * Stores the in-flight promise so initStripe() can await it (usually already
     * resolved by the time checkout renders) instead of waiting on checkout screen.
     * Also pre-initialises stripe.elements() as soon as the clientSecret arrives,
     * giving Stripe a head start on loading payment form assets.
     *
     * Called from App.render() on paywall render, and on every tier change.
     */
    prefetchCheckout() {
        const tierId = State.data.selectedTier || '1_month';
        const email  = State.getAnswer('email_capture') || '';
        if (!email || isDev()) return;

        // Cancel any in-flight prefetch for a stale tier
        if (this._prefetchAbort) this._prefetchAbort.abort();
        this._prefetchAbort    = new AbortController();
        this._prefetchElements = null;

        this._checkoutPrefetch = {
            tierId,
            promise: fetch('../api/create-checkout', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ tierId, email }),
                signal:  this._prefetchAbort.signal,
            })
            .then(r => r.json())
            .then(data => {
                // Pre-init elements as soon as PI is ready — starts Stripe background loading
                if (data.clientSecret && typeof window.Stripe !== 'undefined') {
                    const stripe   = window.Stripe(CONFIG.stripePk);
                    const elements = stripe.elements({ clientSecret: data.clientSecret });
                    this._prefetchElements = { stripe, elements, tierId };
                    log.info('[Prefetch] Stripe elements pre-initialised for tier:', tierId);
                } else if (data.clientSecret) {
                    log.warn('[Prefetch] Stripe.js not loaded yet — elements pre-init skipped for tier:', tierId);
                }
                return data;
            })
            .catch(err => {
                if (err.name !== 'AbortError') log.warn('[Prefetch] create-checkout failed:', err.message);
                return null;
            }),
        };
        log.info('[Prefetch] create-checkout started for tier:', tierId);
    },

    /**
     * Bootstrap Stripe Payment Element on the checkout screen.
     *
     * Flow:
     *   1. Use prefetched clientSecret if available (started on paywall), else POST
     *      /api/create-checkout — returns clientSecret + plan metadata
     *   2. Mount Stripe Payment Element into #payment-element
     *   3. Enable the "Complete Payment" button
     *   4. Button click → stripe.confirmPayment() → on success navigate to thank_you
     *
     * Called automatically from App.render() when screenType === 'checkout'.
     *
     * @param {Object} screenData - Checkout screen data from JSON
     */
    async initStripe(screenData) {
        if (this._stripeInitializing) return;
        this._stripeInitializing = true;
        const tierId = State.data.selectedTier || '1_month';
        const email  = State.getAnswer('email_capture') || '';

        const payBtn  = document.getElementById('checkout-pay-btn');
        const errorEl = document.getElementById('checkout-error');
        const mountEl = document.getElementById('payment-element');

        // Helper: surface an inline error below the payment form
        const showCheckoutError = (msg) => {
            if (!errorEl) return;
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.classList.remove('cta-button--disabled');
            }
        };

        if (!email) {
            showCheckoutError('Please complete email capture before checkout.');
            return;
        }

        // ── Dev mock: bypass Stripe entirely on localhost ────────────────────
        // Static server can't run serverless APIs, so we wire the button to
        // jump straight to the next screen. This path is never reachable on
        // Vercel (where hostname is not localhost).
        if (isDev()) {
            if (mountEl) mountEl.innerHTML = '<p style="color:var(--color-text-secondary);font-size:0.85rem;text-align:center;padding:12px 0">⚡ Dev mode — payment mocked (localhost)</p>';
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.classList.remove('cta-button--disabled');
                payBtn.textContent = 'Complete Payment (Mock)';
                payBtn.addEventListener('click', () => {
                    log.info('[Checkout] Dev mock payment — skipping Stripe, navigating to next screen');
                    State.pushHistory(screenData.id);
                    const nextScreen = Router.getNextScreen(screenData.id);
                    if (nextScreen) Router.navigate(nextScreen);
                });
            }
            this._stripeInitializing = false;
            return;
        }

        try {
            // ── Step 1: resolve clientSecret (prefetch or fresh fetch) ───────
            // prefetchCheckout() fires when the user lands on the paywall, so by
            // the time they reach checkout the PI is usually already created and
            // the promise resolves instantly.
            let data = null;
            if (this._checkoutPrefetch?.tierId === tierId) {
                log.info('[Checkout] Awaiting prefetched create-checkout result');
                data = await this._checkoutPrefetch.promise;
            }

            if (!data?.clientSecret) {
                // Fallback: prefetch unavailable, timed out, or returned an error
                log.info('[Checkout] Prefetch miss — fetching create-checkout now');
                const response = await fetch('../api/create-checkout', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ tierId, email }),
                });
                const raw = await response.text();
                try {
                    data = raw ? JSON.parse(raw) : {};
                } catch {
                    showCheckoutError(
                        'Checkout API is unavailable in this local server mode. ' +
                        'Use Vercel deployment or run with serverless APIs enabled.'
                    );
                    return;
                }
                if (!response.ok || !data.clientSecret) {
                    showCheckoutError(data.error || 'Payment setup failed. Please try again.');
                    return;
                }
            }

            // ── Step 2: mount Stripe Payment Element ────────────────────────
            if (typeof window.Stripe === 'undefined') {
                showCheckoutError('Payment provider failed to load. Please refresh.');
                return;
            }

            // Reuse pre-initialised elements instance if available (already has a
            // head start on loading payment form assets from the paywall stage).
            const stripe   = this._prefetchElements?.tierId === tierId
                ? this._prefetchElements.stripe
                : window.Stripe(CONFIG.stripePk);
            const elements = this._prefetchElements?.tierId === tierId
                ? this._prefetchElements.elements
                : stripe.elements({ clientSecret: data.clientSecret });
            const paymentEl = elements.create('payment');

            paymentEl.mount('#payment-element');

            // Enable pay button once Payment Element is ready
            paymentEl.on('ready', () => {
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.classList.remove('cta-button--disabled');
                }
                // Clear the "Loading payment form…" placeholder
                if (mountEl) {
                    const loader = mountEl.querySelector('.checkout__payment-loading');
                    if (loader) loader.remove();
                }
            });

            // ── Step 3: wire up submit button ───────────────────────────────
            // Guard against double-click via payBtn.disabled check.
            if (payBtn) {
                payBtn.addEventListener('click', async () => {
                    if (payBtn.disabled) return;

                    payBtn.disabled = true;
                    payBtn.classList.add('cta-button--disabled');
                    payBtn.textContent = 'Processing…';
                    if (errorEl) errorEl.style.display = 'none';

                    const { error } = await stripe.confirmPayment({
                        elements,
                        confirmParams: {
                            // Required for payment methods that redirect (3DS, iDEAL,
                            // Bancontact, SEPA, etc.) even with redirect: 'if_required'.
                            return_url: window.location.href,
                        },
                        // Stay on-page for standard card payments; only redirect
                        // when the payment method strictly requires it.
                        redirect: 'if_required',
                    });

                    if (error) {
                        // Stripe declined or network error — show inline message
                        showCheckoutError(error.message || 'Payment failed. Please try again.');
                        payBtn.disabled = false;
                        payBtn.classList.remove('cta-button--disabled');
                        payBtn.textContent = 'Complete Payment';
                        return;
                    }

                    // Payment succeeded — proceed to thank_you
                    log.info('[Checkout] Payment confirmed, navigating to thank_you');
                    State.pushHistory(screenData.id);
                    const nextScreen = Router.getNextScreen(screenData.id);
                    if (nextScreen) {
                        Router.navigate(nextScreen);
                    }
                });
            }

        } catch (err) {
            log.error('[Checkout] initStripe error:', err.message);
            showCheckoutError('An unexpected error occurred. Please refresh and try again.');
            this._stripeInitializing = false;
        }
    },

    /**
     * Dev shortcut: if the URL contains a hash matching a known screen ID,
     * jump directly to that screen instead of starting from the beginning.
     *
     * Usage: /funnel/#paywall  /funnel/#checkout  /funnel/#thank_you  etc.
     * No-op in normal use (no hash present) — funnel logic is unaffected.
     */
    applyHashNavigation() {
        const hash = window.location.hash.slice(1); // strip leading '#'
        if (!hash) return;

        const screen = Router.getScreen(hash);
        if (screen) {
            State.set('currentScreen', hash);
            log.info(`[App] Hash nav: jumped to screen "${hash}"`);
        }
    },

    async init() {
        log.info(`[App] Initializing ${CONFIG.brandName} Funnel...`);
        
        // Initialize state
        State.init();
        
        // Load funnel data
        await this.loadFunnelData();

        // Dev shortcut: jump to any screen via URL hash, e.g. /funnel/#paywall
        // Has no effect on normal flow — only activates when a hash is present.
        this.applyHashNavigation();

        // Initialize event handlers
        Events.init();
        
        // Render current screen
        this.render();
        
        log.info('[App] Initialization complete');
    },

    /**
     * Initialize scratch card canvas with gold overlay
     */
    initScratchCard() {
        const canvas = document.getElementById('scratch-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        // Draw gold overlay with ticket notches
        ctx.fillStyle = '#E8BE6A';
        const w = rect.width, h = rect.height;
        const r = 14;
        const notchR = 13;
        const midY = h / 2;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        // Right side with notch
        ctx.lineTo(w, midY - notchR);
        ctx.arc(w, midY, notchR, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        // Left side with notch
        ctx.lineTo(0, midY + notchR);
        ctx.arc(0, midY, notchR, Math.PI / 2, -Math.PI / 2, true);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.fill();

        // Scratch logic
        let isDrawing = false;
        let scratched = 0;
        const totalPixels = w * h;

        let isRevealed = false;
        const scratch = (x, y) => {
            if (isRevealed) return;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            scratched += Math.PI * 20 * 20;

            // Check if enough scratched (>40%)
            if (scratched / totalPixels > 0.4) {
                isRevealed = true;
                canvas.style.opacity = '0';
                setTimeout(() => {
                    canvas.style.display = 'none';
                    const instruction = document.querySelector('.scratch-card__instruction');
                    if (instruction) instruction.style.display = 'none';
                    // Show discount modal
                    const modal = document.getElementById('discount-modal');
                    if (modal) {
                        modal.style.display = 'flex';
                        // Generate confetti
                        const confettiEl = modal.querySelector('.discount-modal__confetti');
                        if (confettiEl) {
                            const colors = ['#E57373','#FF8A65','#FFD54F','#81C784','#4FC3F7','#7986CB','#BA68C8','#F06292','#4DB6AC','#AED581'];
                            const shapes = ['8px', '6px', '10px'];
                            const fragment = document.createDocumentFragment();
                            for (let i = 0; i < 60; i++) {
                                const span = document.createElement('span');
                                const color = colors[i % colors.length];
                                const w = shapes[i % 3];
                                const h = parseInt(w) + Math.random() * 8 + 'px';
                                span.style.left = Math.random() * 100 + '%';
                                span.style.width = w;
                                span.style.height = h;
                                span.style.background = color;
                                span.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                                span.style.animationName = Math.random() > 0.5 ? 'confettiFall' : 'confettiFallAlt';
                                span.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
                                span.style.animationDelay = Math.random() * 1 + 's';
                                fragment.appendChild(span);
                            }
                            confettiEl.appendChild(fragment);
                        }
                    }
                }, 300);
            }
        };

        const getPos = (e) => {
            const touch = e.touches ? e.touches[0] : e;
            const brect = canvas.getBoundingClientRect();
            return { x: touch.clientX - brect.left, y: touch.clientY - brect.top };
        };

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(getPos(e).x, getPos(e).y); });
        canvas.addEventListener('mousemove', (e) => { if (isDrawing) scratch(getPos(e).x, getPos(e).y); });
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; scratch(getPos(e).x, getPos(e).y); }, { passive: false });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isDrawing) scratch(getPos(e).x, getPos(e).y); }, { passive: false });
        canvas.addEventListener('touchend', () => { isDrawing = false; });
    },

    /**
     * Load funnel config (sequence) + screen data from registry and local screens.json
     * config.json   — this funnel's sequence of screen IDs
     * ../../screens/registry.json — globally shared screens (checkout, paywall variants, etc.)
     * screens.json  — screens specific to this funnel
     */
    async loadFunnelData() {
        try {
            // 1. Load funnel sequence config
            const configResp = await fetch('config.json');
            const config = configResp.ok ? await configResp.json() : {};
            Router.sequence = config.sequence || [];
            log.info(`[App] Loaded sequence: ${Router.sequence.length} screens`);

            // 2. Load global shared screen registry (non-fatal if missing)
            let registryScreens = [];
            try {
                const regResp = await fetch('../../screens/registry.json');
                if (regResp.ok) {
                    registryScreens = await regResp.json();
                    log.info(`[App] Loaded ${registryScreens.length} screens from registry`);
                }
            } catch (e) {
                log.warn('[App] Registry not found or failed to load, continuing without it');
            }

            // 3. Load funnel-specific screens (local screens.json)
            let localScreens = [];
            try {
                const localResp = await fetch('screens.json');
                if (localResp.ok) {
                    localScreens = await localResp.json();
                    log.info(`[App] Loaded ${localScreens.length} local screens`);
                }
            } catch (e) {
                log.warn('[App] screens.json failed to load');
            }

            // 4. Merge: local screens override registry screens with the same id
            const screenMap = {};
            [...registryScreens, ...localScreens].forEach(s => { screenMap[s.id] = s; });
            Router.screens = Object.values(screenMap);

            log.info(`[App] Total screens available: ${Router.screens.length}`);

            if (Router.screens.length === 0) {
                log.error('[App] No screen data loaded, using fallback');
                Router.screens = this.getFallbackData();
            }
        } catch (error) {
            log.error('[App] Fatal error loading funnel data:', error.message);
            Router.screens = this.getFallbackData();
        }
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
            case 'age':
            case 'age_selection':
                html = Screens.singleChoice(screenData);
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
            case 'timeline_chart':
                html = Screens.goalTimeline(screenData);
                break;
            case 'recovery_curve':
                html = Screens.planReady(screenData);
                break;
            case 'gamification':
            case 'scratch_card':
                html = Screens.scratchCard(screenData);
                break;
            case 'value_proposition':
                html = Screens.planReady(screenData);
                break;
            case 'checkout':
                html = Screens.checkout(screenData);
                break;
            case 'payment':
                html = Screens.paywall(screenData);
                break;
            case 'confirmation':
                html = Screens.thankYou(screenData);
                break;
            case 'account_creation':
                html = Screens.createAccount(screenData);
                break;
            case 'app_placeholder':
                html = Screens.appDashboard(screenData);
                break;
            default:
                html = Screens.placeholder(screenData);
        }

        // Clean up any running controllers before DOM swap
        LoadingController.cleanup();
        TestimonialCarousel.cleanup();
        CountdownTimer.cleanup(); // Phase 3c
        this._stripeInitializing = false;

        // Clear prefetch state when leaving the paywall→checkout flow.
        // Prefetch is re-triggered automatically when paywall renders next time.
        const newScreenType = screenData.screenType || screenData.type;
        if (newScreenType !== 'payment' && newScreenType !== 'checkout') {
            this._checkoutPrefetch = null;
            this._prefetchElements = null;
            if (this._prefetchAbort) { this._prefetchAbort.abort(); this._prefetchAbort = null; }
        }

        // Update DOM
        document.getElementById('app').innerHTML = html;

        // Start loading animation for transition screens
        if ((screenData.screenType || screenData.type) === 'transition') {
            LoadingController.start(screenData);
            TestimonialCarousel.start();
        }

        // Prefetch Stripe PI when paywall renders so checkout is instant
        if ((screenData.screenType || screenData.type) === 'payment') {
            this.prefetchCheckout();
        }

        // Start countdown timer for paywall screen (Phase 3c)
        if ((screenData.screenType || screenData.type) === 'payment') {
            const initialMinutes = screenData.urgencyElements?.countdownTimer?.initialMinutes || 10;
            CountdownTimer.start(initialMinutes);
        }

        // Initialize scratch card canvas for gamification screen
        if ((screenData.screenType || screenData.type) === 'gamification' ||
            (screenData.screenType || screenData.type) === 'scratch_card') {
            this.initScratchCard();
        }

        // Bootstrap Stripe Payment Element after DOM is ready for checkout screen
        if ((screenData.screenType || screenData.type) === 'checkout') {
            this.initStripe(screenData);
        }

        // Post-render animation hooks — gated by screen type to skip unnecessary DOM queries
        const sType = screenData.screenType || screenData.type;

        // Dysregulation bar marker on profile summary
        if (sType === 'personalized_results') {
            const marker = document.querySelector('.dysregulation-bar__marker[data-target-left]');
            if (marker) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        marker.style.left = marker.dataset.targetLeft + '%';
                    });
                });
            }
        }

        // Goal timeline bars on timeline_chart screen
        if (sType === 'timeline_chart' || sType === 'timeline_selection') {
            const bars = document.querySelectorAll('.bar-chart__bar[data-target-height]');
            if (bars.length) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        bars.forEach(b => { b.style.height = b.dataset.targetHeight + '%'; });
                    });
                });
            }
        }

        // Recovery chart on plan_ready screen
        if (sType === 'recovery_curve' || sType === 'value_proposition') {
        const recoveryLine = document.querySelector('.recovery-chart__line');
        if (recoveryLine) {
            const totalLength = recoveryLine.getTotalLength();
            const lineDuration = 1800;
            recoveryLine.style.strokeDasharray = totalLength;
            recoveryLine.style.strokeDashoffset = totalLength;
            recoveryLine.style.animation = 'none';
            // Force reflow then start animation with correct length
            void recoveryLine.getBoundingClientRect();
            recoveryLine.style.animation = `recoveryLineDraw ${lineDuration}ms linear forwards`;
            recoveryLine.style.setProperty('--line-length', totalLength);

            // For each dot, find its arc-length position and set delay
            const dots = document.querySelectorAll('.recovery-chart__dot');
            const todayBadge = document.querySelector('.recovery-chart__badge--today');
            const xLabels = document.querySelectorAll('.recovery-chart__x-label--enter');
            dots.forEach((dot, i) => {
                const cx = parseFloat(dot.getAttribute('cx'));
                const cy = parseFloat(dot.getAttribute('cy'));
                // Binary search to find arc length closest to this dot
                let lo = 0, hi = totalLength, bestLen = 0, bestDist = Infinity;
                for (let step = 0; step < 30; step++) {
                    const mid = (lo + hi) / 2;
                    const pt = recoveryLine.getPointAtLength(mid);
                    const d = Math.hypot(pt.x - cx, pt.y - cy);
                    if (d < bestDist) { bestDist = d; bestLen = mid; }
                    // Sample neighbors to decide direction
                    const ptLo = recoveryLine.getPointAtLength(Math.max(0, mid - 1));
                    const dLo = Math.hypot(ptLo.x - cx, ptLo.y - cy);
                    if (dLo < d) hi = mid; else lo = mid;
                }
                const delay = (bestLen / totalLength) * lineDuration;
                dot.style.animationDelay = delay + 'ms';
                if (i === 0 && todayBadge) {
                    todayBadge.style.animationDelay = delay + 'ms';
                }
                if (xLabels[i]) {
                    xLabels[i].style.animationDelay = delay + 'ms';
                }
                // Arrow appears exactly when line completes drawing — the tip arrives at the dot
                if (i === dots.length - 1) {
                    const arrow = document.querySelector('.recovery-chart__arrow');
                    if (arrow) arrow.style.animationDelay = delay + 'ms';
                }
            });
        }
        }

        log.info(`[App] Rendered screen: ${currentScreenId}`);
    }
};

// ========================================
// Initialize on DOM ready
// ========================================
document.addEventListener('DOMContentLoaded', () => App.init());
