import React from 'react';

/**
 * Hand-drawn SVG hero illustration for the Plan tab.
 *
 * Style references the Progress (Dashboard) tab's flat-vector landscape:
 * gradient-shaded mountains, layered hills, soft sunset palette, stylized
 * tree clusters, all without strokes. Composed entirely from inline
 * primitives so the painted scene shares its vector language with the
 * DOM stone path that follows it.
 *
 * Composition (top → bottom):
 *   1. Warm sunset sky gradient (pink → violet)
 *   2. Sun with soft radial glow
 *   3. Faint clouds
 *   4. Three layers of receding mountains, each with its own light→dark
 *      vertical gradient for a sense of volume
 *   5. Two layers of green foreground hills (bridging mountains and ground)
 *   6. Tree clusters on each side, multi-toned for depth
 *   7. Stone path winding down the centerline with strong perspective
 *      growth — the last stone sits at cx=400 (viewBox center) and roughly
 *      matches the size of the first DOM decorative stone below
 *   8. Bottom 30% fades through an alpha mask so DOM stones below the SVG
 *      pick up the path without a visible seam
 */
export const JourneyHero: React.FC = () => (
  <svg
    viewBox="0 0 800 600"
    preserveAspectRatio="xMidYMid meet"
    className="block w-full"
    style={{ aspectRatio: '800 / 600' }}
    aria-hidden="true"
  >
    <defs>
      {/* SKY — warm violet sunset */}
      <linearGradient id="jh-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#FCE7F3" />
        <stop offset="45%" stopColor="#E9D5FF" />
        <stop offset="100%" stopColor="#DDD6FE" />
      </linearGradient>

      {/* SUN — bright core + warm glow halo */}
      <radialGradient id="jh-sun-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="35%"  stopColor="#FEF3C7" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
      </radialGradient>

      {/* MOUNTAINS — light top to dark bottom for 3D feel */}
      <linearGradient id="jh-mtn-far"  x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E9D5FF" />
        <stop offset="100%" stopColor="#C4B5FD" />
      </linearGradient>
      <linearGradient id="jh-mtn-mid"  x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="100%" stopColor="#A78BFA" />
      </linearGradient>
      <linearGradient id="jh-mtn-near" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>

      {/* HILLS — green tones, lighter to richer */}
      <linearGradient id="jh-hill-back" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#6EE7B7" />
      </linearGradient>
      <linearGradient id="jh-hill-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="100%" stopColor="#4ADE80" />
      </linearGradient>

      {/* BOTTOM-FADE alpha mask. Long, gentle gradient — fade starts at 70%
          and reaches 0 only at 100%, so the seam reads as an atmospheric
          haze rather than a hard cut-off. */}
      <linearGradient id="jh-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="1" />
        <stop offset="70%"  stopColor="#FFFFFF" stopOpacity="1" />
        <stop offset="88%"  stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <mask id="jh-fade-mask">
        <rect width="800" height="600" fill="url(#jh-fade)" />
      </mask>
    </defs>

    <g mask="url(#jh-fade-mask)">
      {/* SKY */}
      <rect width="800" height="600" fill="url(#jh-sky)" />

      {/* SUN — outer glow + bright disc */}
      <circle cx="600" cy="135" r="85" fill="url(#jh-sun-glow)" />
      <circle cx="600" cy="135" r="38" fill="#FFFBEB" opacity="0.95" />
      <circle cx="600" cy="135" r="28" fill="#FFFFFF" />

      {/* CLOUDS — layered ellipses (large + small for cumulus shape) */}
      <g fill="#FFFFFF" opacity="0.75">
        <ellipse cx="140" cy="100" rx="48" ry="13" />
        <ellipse cx="170" cy="92"  rx="28" ry="11" />
        <ellipse cx="370" cy="165" rx="40" ry="10" />
        <ellipse cx="392" cy="158" rx="22" ry="8" />
        <ellipse cx="240" cy="200" rx="34" ry="9" />
      </g>

      {/* FAINT STARS — barely visible */}
      <g fill="#FFFFFF" opacity="0.5">
        <circle cx="100" cy="60"  r="1.6" />
        <circle cx="450" cy="50"  r="1.3" />
        <circle cx="720" cy="220" r="1.4" />
      </g>

      {/* MOUNTAINS — three layers, each with its own gradient. Coordinates
          extend slightly past viewBox edges (-50, 850) so silhouette never
          shows a seam at horizontal viewport edges. */}
      <path
        d="M -50 350 L 60 230 L 180 290 L 290 200 L 400 250 L 510 195 L 620 270 L 730 225 L 850 290 L 850 600 L -50 600 Z"
        fill="url(#jh-mtn-far)"
        opacity="0.85"
      />
      <path
        d="M -50 405 L 80 305 L 200 365 L 320 280 L 450 350 L 580 290 L 720 350 L 850 320 L 850 600 L -50 600 Z"
        fill="url(#jh-mtn-mid)"
      />
      <path
        d="M -50 450 L 110 365 L 240 415 L 380 340 L 530 405 L 690 355 L 850 395 L 850 600 L -50 600 Z"
        fill="url(#jh-mtn-near)"
      />

      {/* HILLS — back layer (lighter green), gentle wave */}
      <path
        d="M -50 490 Q 100 460 250 480 Q 400 510 550 470 Q 700 450 850 485 L 850 600 L -50 600 Z"
        fill="url(#jh-hill-back)"
      />
      {/* HILLS — front layer (richer green) */}
      <path
        d="M -50 530 Q 130 510 280 530 Q 420 555 580 520 Q 720 500 850 530 L 850 600 L -50 600 Z"
        fill="url(#jh-hill-front)"
      />

      {/* TREE CLUSTERS — broadleaf silhouettes with highlight + trunk.
          Three trees per side at varying heights for depth. */}
      <g>
        {/* Left cluster */}
        <g transform="translate(120, 490)">
          <ellipse cx="0" cy="-26" rx="15" ry="22" fill="#15803D" />
          <ellipse cx="-3" cy="-33" rx="9" ry="11" fill="#22C55E" opacity="0.7" />
          <rect x="-2" y="-10" width="4" height="14" fill="#5B21B6" />
        </g>
        <g transform="translate(155, 500)">
          <ellipse cx="0" cy="-19" rx="11" ry="15" fill="#16A34A" />
          <rect x="-2" y="-7" width="3" height="11" fill="#5B21B6" />
        </g>
        <g transform="translate(85, 506)">
          <ellipse cx="0" cy="-15" rx="9" ry="12" fill="#15803D" />
          <rect x="-2" y="-6" width="3" height="9" fill="#5B21B6" />
        </g>

        {/* Right cluster */}
        <g transform="translate(685, 478)">
          <ellipse cx="0" cy="-30" rx="17" ry="25" fill="#15803D" />
          <ellipse cx="-3" cy="-38" rx="10" ry="13" fill="#22C55E" opacity="0.7" />
          <rect x="-2" y="-12" width="4" height="16" fill="#5B21B6" />
        </g>
        <g transform="translate(728, 492)">
          <ellipse cx="0" cy="-22" rx="12" ry="17" fill="#16A34A" />
          <rect x="-2" y="-9" width="3" height="13" fill="#5B21B6" />
        </g>
        <g transform="translate(648, 500)">
          <ellipse cx="0" cy="-17" rx="10" ry="13" fill="#15803D" />
          <rect x="-2" y="-7" width="3" height="10" fill="#5B21B6" />
        </g>
      </g>

    </g>
  </svg>
);
