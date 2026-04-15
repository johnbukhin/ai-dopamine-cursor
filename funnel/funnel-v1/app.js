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
        'funnel-data.json',
        './funnel-data.json'
    ],
    storageKey: 'compass_funnel_state',
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
        // Payment Icons (Official Brand SVGs — aaronfagan/svg-credit-card-payment-icons flat-rounded)
        // ========================================

        // Visa — official paths, bg changed from blue to white
        visa: `<svg viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 0H740C762.092 0 780 17.909 780 40V460C780 482.092 762.092 500 740 500H40C17.909 500 0 482.092 0 460V40C0 17.909 17.909 0 40 0Z" fill="white" stroke="#E0E0E0" stroke-width="8"/><path d="M489.823 143.111C442.988 143.111 401.134 167.393 401.134 212.256C401.134 263.706 475.364 267.259 475.364 293.106C475.364 303.989 462.895 313.731 441.6 313.731C411.377 313.731 388.789 300.119 388.789 300.119L379.123 345.391C379.123 345.391 405.145 356.889 439.692 356.889C490.898 356.889 531.19 331.415 531.19 285.784C531.19 231.419 456.652 227.971 456.652 203.981C456.652 195.455 466.887 186.114 488.122 186.114C512.081 186.114 531.628 196.014 531.628 196.014L541.087 152.289C541.087 152.289 519.818 143.111 489.823 143.111ZM61.3294 146.411L60.1953 153.011C60.1953 153.011 79.8988 156.618 97.645 163.814C120.495 172.064 122.122 176.868 125.971 191.786L167.905 353.486H224.118L310.719 146.411H254.635L198.989 287.202L176.282 167.861C174.199 154.203 163.651 146.411 150.74 146.411H61.3294ZM333.271 146.411L289.275 353.486H342.756L386.598 146.411H333.271ZM631.554 146.411C618.658 146.411 611.825 153.318 606.811 165.386L528.458 353.486H584.542L595.393 322.136H663.72L670.318 353.486H719.805L676.633 146.411H631.554ZM638.848 202.356L655.473 280.061H610.935L638.848 202.356Z" fill="#1A1F71"/></svg>`,

        // Mastercard — official circles, bg changed from dark to white
        mastercard: `<svg viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 0H740C762.092 0 780 17.909 780 40V460C780 482.092 762.092 500 740 500H40C17.909 500 0 482.092 0 460V40C0 17.909 17.909 0 40 0Z" fill="white" stroke="#E0E0E0" stroke-width="8"/><path d="M465.738 69.1387H313.812V342.088H465.738V69.1387Z" fill="#FF5A00"/><path d="M323.926 205.613C323.926 150.158 349.996 100.94 390 69.1387C360.559 45.9902 323.42 32 282.91 32C186.945 32 109.297 109.648 109.297 205.613C109.297 301.578 186.945 379.227 282.91 379.227C323.42 379.227 360.559 365.237 390 342.088C349.94 310.737 323.926 261.069 323.926 205.613Z" fill="#EB001B"/><path d="M670.711 205.613C670.711 301.578 593.062 379.227 497.098 379.227C456.588 379.227 419.449 365.237 390.008 342.088C430.518 310.231 456.082 261.069 456.082 205.613C456.082 150.158 430.012 100.94 390.008 69.1387C419.393 45.9902 456.532 32 497.041 32C593.062 32 670.711 110.154 670.711 205.613Z" fill="#F79E1B"/></svg>`,

        // American Express — official SVG, keep blue background
        amex: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg"><path d="m40 1e-3h700c22.092 0 40 17.909 40 40v420c0 22.092-17.908 40-40 40h-700c-22.091 0-40-17.908-40-40v-420c0-22.091 17.909-40 40-40z" fill="#2557D6"/><path d="m0.253 235.69h37.441l8.442-19.51h18.9l8.42 19.51h73.668v-14.915l6.576 14.98h38.243l6.576-15.202v15.138h183.08l-0.085-32.026h3.542c2.479 0.083 3.204 0.302 3.204 4.226v27.8h94.689v-7.455c7.639 3.92 19.518 7.455 35.148 7.455h39.836l8.525-19.51h18.9l8.337 19.51h76.765v-18.532l11.626 18.532h61.515v-122.51h-60.88v14.468l-8.522-14.468h-62.471v14.468l-7.828-14.468h-84.38c-14.123 0-26.539 1.889-36.569 7.153v-7.153h-58.229v7.153c-6.383-5.426-15.079-7.153-24.75-7.153h-212.74l-14.274 31.641-14.659-31.641h-67.005v14.468l-7.362-14.468h-57.145l-26.539 58.246v64.261h3e-3zm236.34-17.67h-22.464l-0.083-68.794-31.775 68.793h-19.24l-31.858-68.854v68.854h-44.57l-8.42-19.592h-45.627l-8.505 19.592h-23.801l39.241-87.837h32.559l37.269 83.164v-83.164h35.766l28.678 59.587 26.344-59.587h36.485l1e-3 87.838zm-165.9-37.823l-14.998-35.017-14.915 35.017h29.913zm255.3 37.821h-73.203v-87.837h73.203v18.291h-51.289v15.833h50.06v18.005h-50.061v17.542h51.289l1e-3 18.166zm103.16-64.18c0 14.004-9.755 21.24-15.439 23.412 4.794 1.748 8.891 4.838 10.84 7.397 3.094 4.369 3.628 8.271 3.628 16.116v17.255h-22.104l-0.083-11.077c0-5.285 0.528-12.886-3.458-17.112-3.202-3.09-8.083-3.76-15.973-3.76h-23.523v31.95h-21.914v-87.838h50.401c11.199 0 19.451 0.283 26.535 4.207 6.933 3.924 11.09 9.652 11.09 19.45zm-27.699 13.042c-3.013 1.752-6.573 1.81-10.841 1.81h-26.62v-19.51h26.982c3.818 0 7.804 0.164 10.393 1.584 2.842 1.28 4.601 4.003 4.601 7.765 0 3.84-1.674 6.929-4.515 8.351zm62.844 51.138h-22.358v-87.837h22.358v87.837zm259.56 0h-31.053l-41.535-65.927v65.927h-44.628l-8.527-19.592h-45.521l-8.271 19.592h-25.648c-10.649 0-24.138-2.257-31.773-9.715-7.701-7.458-11.708-17.56-11.708-33.533 0-13.027 2.395-24.936 11.812-34.347 7.085-7.01 18.18-10.242 33.28-10.242h21.215v18.821h-20.771c-7.997 0-12.514 1.14-16.862 5.203-3.735 3.699-6.298 10.69-6.298 19.897 0 9.41 1.951 16.196 6.023 20.628 3.373 3.476 9.506 4.53 15.272 4.53h9.842l30.884-69.076h32.835l37.102 83.081v-83.08h33.366l38.519 61.174v-61.174h22.445v87.833zm-133.2-37.82l-15.165-35.017-15.081 35.017h30.246zm189.04 178.08c-5.322 7.457-15.694 11.238-29.736 11.238h-42.319v-18.84h42.147c4.181 0 7.106-0.527 8.868-2.175 1.665-1.474 2.605-3.554 2.591-5.729 0-2.561-1.064-4.593-2.677-5.811-1.59-1.342-3.904-1.95-7.722-1.95-20.574-0.67-46.244 0.608-46.244-27.194 0-12.742 8.443-26.156 31.439-26.156h43.649v-17.479h-40.557c-12.237 0-21.129 2.81-27.425 7.174v-7.175h-59.985c-9.595 0-20.854 2.279-26.179 7.175v-7.175h-107.12v7.175c-8.524-5.892-22.908-7.175-29.549-7.175h-70.656v7.175c-6.745-6.258-21.742-7.175-30.886-7.175h-79.077l-18.094 18.764-16.949-18.764h-118.13v122.59h115.9l18.646-19.062 17.565 19.062 71.442 0.061v-28.838h7.021c9.479 0.14 20.66-0.228 30.523-4.312v33.085h58.928v-31.952h2.842c3.628 0 3.985 0.144 3.985 3.615v28.333h179.01c11.364 0 23.244-2.786 29.824-7.845v7.845h56.78c11.815 0 23.354-1.587 32.134-5.649l2e-3 -22.84zm-354.94-47.155c0 24.406-19.005 29.445-38.159 29.445h-27.343v29.469h-42.591l-26.984-29.086-28.042 29.086h-86.802v-87.859h88.135l26.961 28.799 27.875-28.799h70.021c17.389 0 36.929 4.613 36.929 28.945zm-174.22 40.434h-53.878v-17.48h48.11v-17.926h-48.11v-15.974h54.939l23.969 25.604-25.03 25.776zm86.81 10.06l-33.644-35.789 33.644-34.65v70.439zm49.757-39.066h-28.318v-22.374h28.572c7.912 0 13.404 3.09 13.404 10.772 0 7.599-5.238 11.602-13.658 11.602zm148.36-40.373h73.138v18.17h-51.315v15.973h50.062v17.926h-50.062v17.48l51.314 0.08v18.23h-73.139l2e-3 -87.859zm-28.119 47.029c4.878 1.725 8.865 4.816 10.734 7.375 3.095 4.291 3.542 8.294 3.631 16.037v17.418h-22.002v-10.992c0-5.286 0.531-13.112-3.542-17.198-3.201-3.147-8.083-3.899-16.076-3.899h-23.42v32.09h-22.02v-87.859h50.594c11.093 0 19.173 0.47 26.366 4.146 6.915 4.004 11.266 9.487 11.266 19.511-1e-3 14.022-9.764 21.178-15.531 23.371zm-12.385-11.107c-2.932 1.667-6.556 1.811-10.818 1.811h-26.622v-19.732h26.982c3.902 0 7.807 0.08 10.458 1.587 2.84 1.423 4.538 4.146 4.538 7.903 0 3.758-1.699 6.786-4.538 8.431zm197.82 5.597c4.27 4.229 6.554 9.571 6.554 18.613 0 18.9-12.322 27.723-34.425 27.723h-42.68v-18.84h42.51c4.157 0 7.104-0.525 8.95-2.175 1.508-1.358 2.589-3.333 2.589-5.729 0-2.561-1.17-4.592-2.675-5.811-1.675-1.34-3.986-1.949-7.803-1.949-20.493-0.67-46.157 0.609-46.157-27.192 0-12.744 8.355-26.158 31.33-26.158h43.932v18.7h-40.198c-3.984 0-6.575 0.145-8.779 1.587-2.4 1.422-3.29 3.534-3.29 6.319 0 3.314 2.037 5.57 4.795 6.546 2.311 0.77 4.795 0.995 8.526 0.995l11.797 0.306c11.895 0.276 20.061 2.248 25.024 7.065zm86.955-23.52h-39.938c-3.986 0-6.638 0.144-8.867 1.587-2.312 1.423-3.202 3.534-3.202 6.322 0 3.314 1.951 5.568 4.791 6.544 2.312 0.771 4.795 0.996 8.444 0.996l11.878 0.304c11.983 0.284 19.982 2.258 24.86 7.072 0.891 0.67 1.422 1.422 2.033 2.175v-25h1e-3z" fill="#fff"/></svg>`,

        // Apple Pay — custom SVG, black background with proper Apple logo + Pay text
        applepay: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg"><rect width="780" height="500" rx="40" fill="black"/><g transform="translate(50 142) scale(9)" fill="white"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.76 19.67 18.11 18.71 19.5Z"/><path d="M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></g><text x="265" y="305" fill="white" font-size="165" font-family="-apple-system, BlinkMacSystemFont, Helvetica, sans-serif" font-weight="400" letter-spacing="-4">Pay</text></svg>`,

        // Maestro — white bg, red + blue circles with purple lens overlap
        maestro: `<svg viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 0H740C762 0 780 18 780 40V460C780 482 762 500 740 500H40C18 500 0 482 0 460V40C0 18 18 0 40 0Z" fill="white" stroke="#E0E0E0" stroke-width="8"/><circle cx="310" cy="250" r="155" fill="#EB001B"/><circle cx="470" cy="250" r="155" fill="#00A1DF"/><path d="M390 117A155 155 0 0 1 390 383A155 155 0 0 0 390 117Z" fill="#7673C0"/></svg>`,

        // Discover — white bg, DISCOVER text with orange O
        discover: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg"><rect width="780" height="500" rx="40" fill="white" stroke="#E0E0E0" stroke-width="8"/><text x="390" y="310" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="145" font-weight="700" fill="#231F20"><tspan>DISC</tspan><tspan fill="#F47216">O</tspan><tspan>VER</tspan></text></svg>`,

        // PayPal — official SVG (white bg)
        paypal: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg"><path d="M725,0H55C24.673,0,0,24.673,0,55v391c0,30.327,24.673,55,55,55h670c30.325,0,55-24.673,55-55V55C780,24.673,755.325,0,725,0z" fill="#FFF" stroke="#E0E0E0" stroke-width="8"/><path d="m168.38 169.85c-8.399-5.774-19.359-8.668-32.88-8.668h-52.346c-4.145 0-6.435 2.073-6.87 6.214l-21.265 133.48c-0.221 1.311 0.107 2.51 0.981 3.6 0.869 1.093 1.962 1.636 3.271 1.636h24.864c4.361 0 6.758-2.068 7.198-6.216l5.888-35.985c0.215-1.744 0.982-3.162 2.291-4.254 1.308-1.09 2.944-1.804 4.907-2.13 1.963-0.324 3.814-0.487 5.562-0.487 1.743 0 3.814 0.11 6.217 0.327 2.397 0.218 3.925 0.324 4.58 0.324 18.756 0 33.478-5.285 44.167-15.866 10.684-10.577 16.032-25.244 16.032-44.004 0-12.868-4.202-22.192-12.597-27.975zm-26.99 40.08c-1.094 7.635-3.926 12.649-8.506 15.049-4.581 2.403-11.124 3.597-19.629 3.597l-10.797 0.328 5.563-35.007c0.434-2.397 1.851-3.597 4.252-3.597h6.218c8.72 0 15.049 1.257 18.975 3.761 3.924 2.51 5.233 7.802 3.924 15.869z" fill="#003087"/><path d="m720.79 161.18h-24.208c-2.405 0-3.821 1.2-4.253 3.599l-21.267 136.1-0.328 0.654c0 1.096 0.437 2.127 1.311 3.109 0.868 0.979 1.963 1.471 3.271 1.471h21.595c4.138 0 6.429-2.068 6.871-6.215l21.265-133.81v-0.325c-2e-3 -3.053-1.424-4.58-4.257-4.58z" fill="#009CDE"/><path d="m428.31 213.86c0-1.088-0.438-2.126-1.306-3.106-0.875-0.981-1.857-1.474-2.945-1.474h-25.191c-2.404 0-4.366 1.096-5.89 3.271l-34.679 51.04-14.394-49.075c-1.096-3.488-3.493-5.236-7.198-5.236h-24.54c-1.093 0-2.075 0.492-2.942 1.474-0.875 0.98-1.309 2.019-1.309 3.106 0 0.44 2.127 6.871 6.379 19.303 4.252 12.434 8.833 25.848 13.741 40.244 4.908 14.394 7.468 22.031 7.688 22.898-17.886 24.43-26.826 37.518-26.826 39.26 0 2.838 1.417 4.254 4.253 4.254h25.191c2.399 0 4.361-1.088 5.89-3.271l83.427-120.4c0.433-0.433 0.651-1.193 0.651-2.289z" fill="#003087"/><path d="m662.89 209.28h-24.865c-3.056 0-4.904 3.599-5.559 10.797-5.677-8.72-16.031-13.088-31.083-13.088-15.704 0-29.065 5.89-40.077 17.668-11.016 11.779-16.521 25.631-16.521 41.551 0 12.871 3.761 23.121 11.285 30.752 7.524 7.639 17.611 11.451 30.266 11.451 6.323 0 12.757-1.311 19.3-3.926 6.544-2.617 11.665-6.105 15.379-10.469 0 0.219-0.222 1.198-0.654 2.942-0.44 1.748-0.655 3.06-0.655 3.926 0 3.494 1.414 5.234 4.254 5.234h22.576c4.138 0 6.541-2.068 7.193-6.216l13.415-85.389c0.215-1.309-0.111-2.507-0.981-3.599-0.876-1.087-1.964-1.634-3.273-1.634zm-42.694 64.452c-5.562 5.453-12.269 8.179-20.12 8.179-6.328 0-11.449-1.742-15.377-5.234-3.928-3.483-5.891-8.282-5.891-14.396 0-8.064 2.727-14.884 8.181-20.446 5.446-5.562 12.214-8.343 20.284-8.343 6.102 0 11.174 1.8 15.212 5.397 4.032 3.599 6.055 8.563 6.055 14.888-1e-3 7.851-2.783 14.505-8.344 19.955z" fill="#009CDE"/><path d="m291.23 209.28h-24.864c-3.058 0-4.908 3.599-5.563 10.797-5.889-8.72-16.25-13.088-31.081-13.088-15.704 0-29.065 5.89-40.078 17.668-11.016 11.779-16.521 25.631-16.521 41.551 0 12.871 3.763 23.121 11.288 30.752 7.525 7.639 17.61 11.451 30.262 11.451 6.104 0 12.433-1.311 18.975-3.926 6.543-2.617 11.778-6.105 15.704-10.469-0.875 2.616-1.309 4.907-1.309 6.868 0 3.494 1.417 5.234 4.253 5.234h22.574c4.141 0 6.543-2.068 7.198-6.216l13.413-85.389c0.215-1.309-0.112-2.507-0.981-3.599-0.873-1.087-1.962-1.634-3.27-1.634zm-42.695 64.614c-5.563 5.351-12.382 8.017-20.447 8.017-6.329 0-11.4-1.742-15.214-5.234-3.819-3.483-5.726-8.282-5.726-14.396 0-8.064 2.725-14.884 8.18-20.446 5.449-5.562 12.211-8.343 20.284-8.343 6.104 0 11.175 1.8 15.214 5.398 4.032 3.599 6.052 8.563 6.052 14.888 0 8.069-2.781 14.778-8.343 20.116z" fill="#003087"/><path d="m540.04 169.85c-8.398-5.774-19.356-8.668-32.879-8.668h-52.02c-4.364 0-6.765 2.073-7.197 6.214l-21.266 133.48c-0.221 1.312 0.106 2.511 0.981 3.601 0.865 1.092 1.962 1.635 3.271 1.635h26.826c2.617 0 4.361-1.416 5.235-4.252l5.89-37.949c0.216-1.744 0.98-3.162 2.29-4.254 1.309-1.09 2.943-1.803 4.908-2.13 1.962-0.324 3.812-0.487 5.562-0.487 1.743 0 3.814 0.11 6.214 0.327 2.399 0.218 3.931 0.324 4.58 0.324 18.76 0 33.479-5.285 44.168-15.866 10.688-10.577 16.031-25.244 16.031-44.004 2e-3 -12.867-4.199-22.191-12.594-27.974zm-33.534 53.82c-4.799 3.271-11.997 4.906-21.592 4.906l-10.47 0.328 5.562-35.007c0.432-2.397 1.849-3.597 4.252-3.597h5.887c4.798 0 8.614 0.218 11.454 0.653 2.831 0.44 5.562 1.799 8.179 4.089 2.618 2.291 3.926 5.618 3.926 9.98 0 9.16-2.402 15.375-7.198 18.648z" fill="#009CDE"/></svg>`
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
     * Render minimal sticky header for the paywall screen.
     * Replaces the standard app header — shows live countdown on the left and
     * a GET MY PLAN CTA pill on the right, matching the reference design.
     * The timer digits are updated by CountdownTimer.updateDisplay() via the
     * shared '.countdown-timer__digits' selector.
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

        // Per-day price badge: parse "€0.66/day" → big number + suffix
        // Renders as: "€ 0 66" with superscript-style layout
        const perDayRaw = (tier.pricePerDay || '').replace('€', '').replace('/day', '').trim();
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
                            <span class="per-day__currency">€</span>
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
                <img src="../assets/award_badge.png" alt="Award medal" class="award-badge__icon">
                <div class="award-badge__content">
                    <p class="award-badge__title">Compass is the <strong>${safeBadge}</strong></p>
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
                <img src="../assets/guarantee_badge.png" alt="30-day money-back guarantee" class="guarantee-medal">
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
     * Two-column layout: "Now" (distressed) vs "Your Goal" (confident).
     * Each column shows a character image and 3 metric rows with progress bars.
     * @param {Object} data - beforeAfter object from JSON
     * @returns {string} HTML string
     */
    beforeAfter(data) {
        // Build a row of 5 segmented blocks; filled count = Math.round(fill * 5)
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
                        <img src="${Security.escapeHtml(data.nowImage)}" alt="Current state" class="ba-image">
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
                             style="background-image: url('${Security.escapeHtml(data.goalImage)}');"
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
     * Render personalized headline for paywall.
     * Injects age group and highlights plan name in primary color.
     * @param {string} ageGroup - e.g. "35-44" (from question_age answer)
     * @returns {string} HTML string
     */
    personalizedHeadline() {
        return `
            <h2 class="paywall-headline">
                Your <span class="paywall-headline__highlight">Porn Addiction Recovery Plan</span> is ready!
            </h2>
        `;
    },

    /**
     * Render ticket-style promo code card with embedded live timer.
     * The '.countdown-timer__digits' span inside is updated by CountdownTimer.
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
     * Values are derived from quiz answers with sensible fallbacks.
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
     * The arc chart shows 3 concentric arcs at different fill lengths (45%, 77%, 83%).
     * Stat descriptions support <strong> tags for bold inline emphasis.
     * @param {Array<Object>} stats - [{percentage, description}, ...]
     * @returns {string} HTML string
     */
    statsWithChart(stats) {
        // Build stat callout blocks — allow <strong> in description for bold inline text
        const statsHtml = stats.map(stat => `
            <div class="stat-callout">
                <span class="stat-callout__pct">${Security.escapeHtml(stat.percentage)}</span>
                <p class="stat-callout__desc">${stat.description}</p>
            </div>
        `).join('');

        // SVG semicircle arc chart — 3 concentric half-circle arcs
        // viewH extended to 168 so the 45% label can sit below the arc baseline (cy=130)
        const cx = 130, cy = 130, viewW = 260, viewH = 168;
        const arcs = [
            // outer 83% — dark primary purple, label top-right outside arc
            { r: 110, pct: 0.83, stroke: '#5B5BD6', label: '83%',
              lx: 234, ly: 38, linex1: 218, liney1: 50, linex2: 231, liney2: 41 },
            // middle 77% — mid purple, label top-left outside arc
            { r:  84, pct: 0.77, stroke: '#8B8BE8', label: '77%',
              lx: 26,  ly: 56, linex1: 50,  liney1: 66, linex2: 36,  liney2: 59 },
            // inner 45% — label placed BELOW the baseline so it is clearly readable
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
     * Two cards side by side (stacked on mobile): X-mark negative list, checkmark positive list.
     * @param {Object} data - contrastLists from JSON
     * @returns {string} HTML string
     */
    contrastLists(data) {
        // Grey circle with × inside — matches reference design
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
     * Render a second CTA block (pricing tiers repeat + button).
     * Reuses pricingTiers() and ctaButton() — no new state or logic.
     * @param {Array}  tiers         - Same pricingTiers array from JSON
     * @param {string} selectedTierId - Currently selected tier
     * @param {string} ctaText        - Button label
     * @param {string} screenId       - data-screen for event delegation
     * @returns {string} HTML string
     */
    /**
     * Second CTA block renders the full purchase flow again:
     * personalized headline → promo ticket → context tags → pricing → CTA.
     * Accepts pre-built HTML strings for headline/ticket/tags so the caller
     * doesn't have to re-compute state.
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
                        ${Components.genderCard('Male', '../assets/male.png')}
                        ${Components.genderCard('Female', '../assets/female.png')}
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
        const tierPrice = selectedTier ? Security.escapeHtml(selectedTier.discountedPrice) : '';

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
        const origPrice   = Security.escapeHtml(tier?.originalPrice || '');
        const introPrice  = Security.escapeHtml(tier?.discountedPrice || '');
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
     * Render paywall screen with all trust elements
     * Full interactive paywall with countdown, pricing tiers, FAQ, etc.
     * @param {Object} screenData - Screen data from JSON
     * @returns {string} HTML string
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

        // ── Personalization: age, challenge, goal ───────────────────────────────
        const ageGroup = State.getAnswer('question_age') || 'your age group';

        // Map question_5 (first trigger) → display label
        const challengeMap = {
            'Stress':     'Stress & anxiety',
            'Boredom':    'Boredom triggers',
            'Loneliness': 'Social withdrawal',
            'Anxiety':    'Anxiety triggers',
            'Curiosity':  'Curiosity triggers',
        };
        const rawChallenge = State.getAnswer('question_5');
        // question_5 is multiple_choice; getAnswer returns the stored value
        const firstChallenge = Array.isArray(rawChallenge) ? rawChallenge[0] : rawChallenge;
        const mainChallenge  = challengeMap[firstChallenge] || 'Dopamine depletion';

        // Map question_31 (first goal selection) → display label
        const goalMap = {
            'Better relationships and intimacy':     'Healthy intimacy',
            'More confidence and self-respect':      'Self-confidence',
            'More motivation for things that matter':'Motivation',
            'More productivity and success':         'Productivity',
        };
        const rawGoal  = State.getAnswer('question_31');
        const firstGoal = Array.isArray(rawGoal) ? rawGoal[0] : rawGoal;
        const goal      = goalMap[firstGoal] || 'Healthy habits';

        return `
            <div class="screen paywall-screen" data-screen="${safeId}">

                <!-- 1. Sticky minimal header (timer + CTA) — replaces standard header -->
                ${Components.paywallHeader(ctaText, safeId, initialMins)}

                <main class="content paywall">

                    <!-- 2. Before / After comparison -->
                    ${screenData.beforeAfter ? Components.beforeAfter(screenData.beforeAfter) : ''}

                    <!-- 3. Personalized headline -->
                    ${Components.personalizedHeadline()}

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

                    <!-- 12. Stats section with arc chart -->
                    ${screenData.trustElements?.statistics ?
                        Components.statsWithChart(screenData.trustElements.statistics) : ''}

                    <!-- 13 & 14. Without / With Compass contrast lists -->
                    ${screenData.contrastLists ? Components.contrastLists(screenData.contrastLists) : ''}

                    <!-- 15. Award badge -->
                    ${screenData.trustElements?.award ?
                        Components.awardBadge(screenData.trustElements.award) : ''}

                    <!-- 16. FAQ accordion -->
                    ${screenData.faq ?
                        Components.faqAccordion(
                            screenData.faq.headline,
                            screenData.faq.questions || [],
                            openFaqIndex
                        ) : ''}

                    <!-- 17. Testimonials -->
                    ${screenData.testimonials ? `
                        <div class="testimonials-section">
                            <h3 class="testimonials-section__headline">Users love our plans</h3>
                            <p class="testimonials-section__sub">Here's what people are saying about Compass</p>
                            <div class="testimonial-cards">
                                ${screenData.testimonials.map(t => Components.testimonialCard(t)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- 18. Second CTA block: full repeat — headline + promo + tags + pricing + CTA + trust -->
                    ${screenData.pricingTiers ?
                        Components.secondCtaBlock(
                            screenData.pricingTiers,
                            selectedTierId,
                            ctaText,
                            safeId,
                            Components.personalizedHeadline(),
                            Components.promoTicket(promoCode, initialMins),
                            Components.contextTags(mainChallenge, goal),
                            screenData.legalDisclaimer ? Components.legalDisclaimer(screenData.legalDisclaimer) : '',
                            screenData.trustElements?.paymentSecurity ?
                                Components.paymentIcons(
                                    screenData.trustElements.paymentSecurity.headline,
                                    screenData.trustElements.paymentSecurity.icons
                                ) : ''
                        ) : ''}

                    <!-- 19. Money-back guarantee card -->
                    ${screenData.trustElements?.moneyBackGuarantee ?
                        Components.moneyBackGuarantee(screenData.trustElements.moneyBackGuarantee) : ''}

                    <!-- 20. Company footer -->
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
     * Update timer display in DOM.
     * Updates ALL elements with class '.countdown-timer__digits' so that the
     * paywall sticky header, the promo ticket, and any legacy timer section
     * all stay in sync with a single interval.
     */
    updateDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');

        // Compact "MM:SS" for sticky header
        document.querySelectorAll('.countdown-timer__digits').forEach(el => {
            el.textContent = `${mm}:${ss}`;
        });

        // Split display "MM : SS" for promo ticket
        document.querySelectorAll('.countdown-mins').forEach(el => { el.textContent = mm; });
        document.querySelectorAll('.countdown-secs').forEach(el => { el.textContent = ss; });
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
                    quizAnswers: State.data.answers
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
     * Bootstrap Stripe Payment Element on the checkout screen.
     *
     * Flow:
     *   1. POST /api/create-checkout → returns clientSecret + plan metadata
     *   2. Mount Stripe Payment Element into #payment-element
     *   3. Enable the "Complete Payment" button
     *   4. Button click → stripe.confirmPayment() → on success navigate to thank_you
     *
     * Called automatically from App.render() when screenType === 'checkout'.
     *
     * @param {Object} screenData - Checkout screen data from JSON
     */
    async initStripe(screenData) {
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

        try {
            // ── Step 1: create Stripe Customer + Subscription Schedule ──────
            const response = await fetch('../api/create-checkout', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ tierId, email }),
            });
            const raw = await response.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {
                // Non-JSON response (commonly local static server returning HTML/501)
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

            // ── Step 2: mount Stripe Payment Element ────────────────────────
            if (typeof window.Stripe === 'undefined') {
                showCheckoutError('Payment provider failed to load. Please refresh.');
                return;
            }

            const stripe    = window.Stripe(CONFIG.stripePk);
            const elements  = stripe.elements({ clientSecret: data.clientSecret });
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
            // Use { once: true } so the listener is removed after first click,
            // preventing duplicate confirmPayment() calls if initStripe() is
            // ever invoked more than once on the same DOM node.
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
                }, { once: true });
            }

        } catch (err) {
            log.error('[Checkout] initStripe error:', err.message);
            showCheckoutError('An unexpected error occurred. Please refresh and try again.');
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

        // Bootstrap Stripe Payment Element after DOM is ready for checkout screen
        if ((screenData.screenType || screenData.type) === 'checkout') {
            this.initStripe(screenData);
        }

        log.info(`[App] Rendered screen: ${currentScreenId}`);
    }
};

// ========================================
// Initialize on DOM ready
// ========================================
document.addEventListener('DOMContentLoaded', () => App.init());
