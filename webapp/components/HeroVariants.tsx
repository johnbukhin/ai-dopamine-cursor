import React from 'react';

/**
 * Hero illustrations for tab headers — five components, one per tab.
 * All share the same visual language: warm violet sunset sky, sun + halo,
 * faint clouds/stars, 3-layer purple mountains, green hills, tree clusters,
 * and a bottom alpha mask that blends each scene into the page background.
 *
 * Each component adds ONE focal element that reflects the tab's metaphor:
 *   PlanTrail        → trail of stones        (Plan / JourneyPath)
 *   ProgressPeak     → mountain peak with flag (Progress / Dashboard)
 *   CoachLighthouse  → lighthouse with beam   (Coach / AICoach)
 *   HelpTree         → deeply-rooted tree     (Help / PauseStage)
 *   ProfileCampfire  → evening campfire       (Profile / Settings)
 */

// ─── shared SVG fragments (each takes an `id` prefix to avoid <defs> collisions
//      between components rendered on the same page) ─────────────────────────

const baseDefs = (id: string) => (
  <>
    <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stopColor="#FCE7F3" />
      <stop offset="45%" stopColor="#E9D5FF" />
      <stop offset="100%" stopColor="#DDD6FE" />
    </linearGradient>
    <radialGradient id={`${id}-sun-glow`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
      <stop offset="35%"  stopColor="#FEF3C7" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`${id}-mtn-far`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#E9D5FF" />
      <stop offset="100%" stopColor="#C4B5FD" />
    </linearGradient>
    <linearGradient id={`${id}-mtn-mid`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#C4B5FD" />
      <stop offset="100%" stopColor="#A78BFA" />
    </linearGradient>
    <linearGradient id={`${id}-mtn-near`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#A78BFA" />
      <stop offset="100%" stopColor="#7C3AED" />
    </linearGradient>
    <linearGradient id={`${id}-hill-back`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#A7F3D0" />
      <stop offset="100%" stopColor="#6EE7B7" />
    </linearGradient>
    <linearGradient id={`${id}-hill-front`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#86EFAC" />
      <stop offset="100%" stopColor="#4ADE80" />
    </linearGradient>
    <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="1"    />
      <stop offset="60%"  stopColor="#FFFFFF" stopOpacity="1"    />
      <stop offset="74%"  stopColor="#FFFFFF" stopOpacity="0.82" />
      <stop offset="84%"  stopColor="#FFFFFF" stopOpacity="0.55" />
      <stop offset="92%"  stopColor="#FFFFFF" stopOpacity="0.28" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"    />
    </linearGradient>
    <mask id={`${id}-fade-mask`}>
      <rect width="800" height="600" fill={`url(#${id}-fade)`} />
    </mask>
  </>
);

const skyAndAtmosphere = (id: string) => (
  <>
    <rect width="800" height="600" fill={`url(#${id}-sky)`} />
    {/* SUN */}
    <circle cx="600" cy="135" r="85" fill={`url(#${id}-sun-glow)`} />
    <circle cx="600" cy="135" r="38" fill="#FFFBEB" opacity="0.95" />
    <circle cx="600" cy="135" r="28" fill="#FFFFFF" />
    {/* CLOUDS */}
    <g fill="#FFFFFF" opacity="0.75">
      <ellipse cx="140" cy="100" rx="48" ry="13" />
      <ellipse cx="170" cy="92"  rx="28" ry="11" />
      <ellipse cx="370" cy="165" rx="40" ry="10" />
      <ellipse cx="392" cy="158" rx="22" ry="8" />
      <ellipse cx="240" cy="200" rx="34" ry="9" />
    </g>
    {/* STARS */}
    <g fill="#FFFFFF" opacity="0.5">
      <circle cx="100" cy="60"  r="1.6" />
      <circle cx="450" cy="50"  r="1.3" />
      <circle cx="720" cy="220" r="1.4" />
    </g>
  </>
);

const standardMountains = (id: string) => (
  <>
    <path
      d="M -50 350 L 60 230 L 180 290 L 290 200 L 400 250 L 510 195 L 620 270 L 730 225 L 850 290 L 850 600 L -50 600 Z"
      fill={`url(#${id}-mtn-far)`}
      opacity="0.85"
    />
    <path
      d="M -50 405 L 80 305 L 200 365 L 320 280 L 450 350 L 580 290 L 720 350 L 850 320 L 850 600 L -50 600 Z"
      fill={`url(#${id}-mtn-mid)`}
    />
    <path
      d="M -50 450 L 110 365 L 240 415 L 380 340 L 530 405 L 690 355 L 850 395 L 850 600 L -50 600 Z"
      fill={`url(#${id}-mtn-near)`}
    />
  </>
);

const standardHills = (id: string) => (
  <>
    <path
      d="M -50 490 Q 100 460 250 480 Q 400 510 550 470 Q 700 450 850 485 L 850 600 L -50 600 Z"
      fill={`url(#${id}-hill-back)`}
    />
    <path
      d="M -50 530 Q 130 510 280 530 Q 420 555 580 520 Q 720 500 850 530 L 850 600 L -50 600 Z"
      fill={`url(#${id}-hill-front)`}
    />
  </>
);

const leftTrees = () => (
  <g>
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
  </g>
);

const rightTrees = () => (
  <g>
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
);

// ─── SVG wrapper — common viewBox, aspect, mask group ────────────────────────

const HeroSvg: React.FC<{
  id: string;
  extraDefs?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, extraDefs, children }) => (
  <svg
    viewBox="0 0 800 600"
    preserveAspectRatio="xMidYMid meet"
    className="block w-full"
    style={{ aspectRatio: '800 / 600' }}
    aria-hidden="true"
  >
    <defs>
      {baseDefs(id)}
      {extraDefs}
    </defs>
    <g mask={`url(#${id}-fade-mask)`}>{children}</g>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// PLAN — trail of stones winding through hills
// ═══════════════════════════════════════════════════════════════════════════
export const PlanTrail: React.FC = () => {
  const id = 'pt';
  // Stones go from large (foreground, y≈520) to small (distance, y≈428) along
  // a gentle S-curve so the path reads as receding into the mountains.
  // Sized to read as a primary focal element at hero scale.
  const stones = [
    { cx: 410, cy: 520, rx: 46, ry: 16  },
    { cx: 380, cy: 498, rx: 38, ry: 14  },
    { cx: 415, cy: 478, rx: 32, ry: 12  },
    { cx: 388, cy: 462, rx: 26, ry: 10  },
    { cx: 408, cy: 450, rx: 21, ry: 8.5 },
    { cx: 396, cy: 440, rx: 17, ry: 7   },
    { cx: 403, cy: 432, rx: 13, ry: 6   },
    { cx: 399, cy: 426, rx: 10, ry: 5   },
  ];
  return (
    <HeroSvg id={id}>
      {skyAndAtmosphere(id)}
      {standardMountains(id)}
      {standardHills(id)}
      {stones.map((s, i) => (
        <g key={i}>
          {/* Shadow stays on the ground — never wobbles with the stone */}
          <ellipse cx={s.cx} cy={s.cy + 2} rx={s.rx} ry={s.ry} fill="#92400E" opacity="0.5" />
          {/* Main body + highlight wobble together as if seeking balance.
              Larger foreground stones (low i) wobble less; tiny distant
              stones at the top of the trail rock more visibly. */}
          <g
            className="animate-stone-wobble"
            style={{
              ['--wobble-amp' as string]: `${i * 1.4}deg`,
              animationDelay: `${i * 0.18}s`,
              animationDuration: `${3.2 - i * 0.12}s`,
            }}
          >
            <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill="#F59E0B" />
            <ellipse
              cx={s.cx - s.rx * 0.3}
              cy={s.cy - s.ry * 0.3}
              rx={s.rx * 0.5}
              ry={s.ry * 0.4}
              fill="#FBBF24"
              opacity="0.7"
            />
          </g>
        </g>
      ))}
      {leftTrees()}
      {rightTrees()}
    </HeroSvg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS — dominant snow-capped peak with planted flag
// ═══════════════════════════════════════════════════════════════════════════
export const ProgressPeak: React.FC = () => {
  const id = 'pp';
  return (
    <HeroSvg
      id={id}
      extraDefs={
        // Custom far-mountain gradient — slightly darker than the shared
        // baseDefs version so the snow-capped peak reads as a distinct shape
        // against the sky, while still staying clearly lighter than mid.
        <linearGradient id={`${id}-mtn-far-bold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#D8C7F5" />
          <stop offset="100%" stopColor="#BFA8EE" />
        </linearGradient>
      }
    >
      {skyAndAtmosphere(id)}
      {/* Far mountain: prominent central peak so the flag has somewhere to sit */}
      <path
        d="M -50 350 L 60 230 L 180 290 L 290 220 L 380 110 L 470 230 L 580 240 L 680 220 L 850 290 L 850 600 L -50 600 Z"
        fill={`url(#${id}-mtn-far-bold)`}
        opacity="0.75"
      />
      {/* Snow cap on the peak */}
      <path
        d="M 355 145 L 380 110 L 405 145 L 398 152 L 392 138 L 380 125 L 368 138 L 362 152 Z"
        fill="#FFFFFF"
        opacity="0.9"
      />
      {/* Flag pole + pennant — pole stays, pennant flutters in wind */}
      <rect x="378" y="50" width="4" height="62" fill="#1F2937" />
      <g className="animate-flag-wave">
        <path d="M 382 52 L 438 66 L 382 80 Z" fill="#EF4444" />
        <path d="M 382 66 L 438 66 L 410 73 L 382 80 Z" fill="#B91C1C" opacity="0.7" />
      </g>
      {/* Mid + near mountain layers (standard) */}
      <path
        d="M -50 405 L 80 305 L 200 365 L 320 280 L 450 350 L 580 290 L 720 350 L 850 320 L 850 600 L -50 600 Z"
        fill={`url(#${id}-mtn-mid)`}
      />
      <path
        d="M -50 450 L 110 365 L 240 415 L 380 340 L 530 405 L 690 355 L 850 395 L 850 600 L -50 600 Z"
        fill={`url(#${id}-mtn-near)`}
      />
      {standardHills(id)}
      {leftTrees()}
      {rightTrees()}
    </HeroSvg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COACH — lighthouse on a cliff casting a soft beam
// ═══════════════════════════════════════════════════════════════════════════
export const CoachLighthouse: React.FC = () => {
  const id = 'cl';
  return (
    <HeroSvg id={id}>
      {skyAndAtmosphere(id)}
      {standardMountains(id)}
      {standardHills(id)}
      {/* Three beams of varying length and phase fan out from the lantern.
          Out-of-phase pulses simulate a slow rotating beacon — the bright
          "wave" appears to walk between directions instead of all blinking
          together. Drawn before the tower so the tower sits on top. */}
      {/* Long upper beam (sweep toward upper-left mountains) */}
      <path
        d="M 651 372 L 280 295 L 280 330 Z"
        fill="#FEF3C7"
        opacity="0.22"
        className="animate-lighthouse-beam"
      />
      {/* Short mid beam (closer, more horizontal) */}
      <path
        d="M 651 372 L 340 380 L 340 415 Z"
        fill="#FEF3C7"
        opacity="0.18"
        className="animate-lighthouse-beam"
        style={{ animationDelay: '1.2s' }}
      />
      {/* Medium beam, slightly upward */}
      <path
        d="M 651 372 L 410 250 L 410 282 Z"
        fill="#FEF3C7"
        opacity="0.16"
        className="animate-lighthouse-beam"
        style={{ animationDelay: '2.4s' }}
      />
      {/* Cliff outcrop under lighthouse */}
      <path
        d="M 595 540 L 620 470 L 660 458 L 700 478 L 720 540 Z"
        fill="#7C3AED"
        opacity="0.9"
      />
      {/* Tower body — white with red horizontal bands */}
      <rect x="640" y="385" width="22" height="100" fill="#FFFFFF" />
      <rect x="640" y="385" width="22" height="14" fill="#DC2626" />
      <rect x="640" y="420" width="22" height="14" fill="#DC2626" />
      <rect x="640" y="455" width="22" height="14" fill="#DC2626" />
      {/* Lantern room */}
      <rect x="635" y="372" width="32" height="14" fill="#5B21B6" />
      {/* Light source — outer halo pulses with the beam; inner stays bright */}
      <circle
        cx="651"
        cy="370"
        r="22"
        fill="#FEF3C7"
        opacity="0.4"
        className="animate-lighthouse-glow"
      />
      <circle cx="651" cy="370" r="12" fill="#FEF3C7" opacity="0.95" />
      {/* Pointed roof */}
      <path d="M 632 372 L 651 358 L 670 372 Z" fill="#5B21B6" />
      <circle cx="651" cy="356" r="1.5" fill="#5B21B6" />
      {leftTrees()}
    </HeroSvg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HELP — deeply-rooted tree, grounded refuge
// ═══════════════════════════════════════════════════════════════════════════
export const HelpTree: React.FC = () => {
  const id = 'ht';
  // Wind streaks — faint horizontal ellipses that drift left-to-right
  // across the sky. Staggered delays/durations make the wind feel
  // continuous rather than pulsed.
  const windStreaks = [
    { cy: 175, rx: 12, ry: 1.8, delay: 0,    duration: 7.5 },
    { cy: 240, rx: 10, ry: 1.5, delay: 2.4,  duration: 6.8 },
    { cy: 305, rx: 14, ry: 2,   delay: 4.6,  duration: 8.2 },
    { cy: 370, rx: 9,  ry: 1.4, delay: 1.2,  duration: 7   },
    { cy: 415, rx: 11, ry: 1.6, delay: 3.6,  duration: 7.8 },
  ];
  return (
    <HeroSvg id={id}>
      {skyAndAtmosphere(id)}
      {/* Wind streaks drifting across the upper scene */}
      <g fill="#FFFFFF">
        {windStreaks.map((w, i) => (
          <ellipse
            key={i}
            cx="-30"
            cy={w.cy}
            rx={w.rx}
            ry={w.ry}
            opacity="0.5"
            className="animate-wind-drift"
            style={{
              animationDelay: `${w.delay}s`,
              animationDuration: `${w.duration}s`,
            }}
          />
        ))}
      </g>
      {standardMountains(id)}
      {standardHills(id)}
      <g transform="translate(400, 525)">
        {/* Exposed roots radiating from the base — stay anchored */}
        <path d="M -22 0 Q -48 6 -58 18 L -50 22 Q -34 10 -16 5 Z" fill="#5B21B6" />
        <path d="M  22 0 Q  48 6  58 18 L  50 22 Q  34 10  16 5 Z" fill="#5B21B6" />
        <path d="M -10 2 Q -22 12 -24 22 L -16 24 Q -10 14 -6 6 Z" fill="#7C3AED" opacity="0.75" />
        <path d="M  10 2 Q  22 12  24 22 L  16 24 Q  10 14   6 6 Z" fill="#7C3AED" opacity="0.75" />
        {/* Thick trunk — also anchored */}
        <rect x="-19" y="-72" width="38" height="78" fill="#5B21B6" />
        <rect x="-12" y="-72" width="22" height="78" fill="#7C3AED" opacity="0.45" />
        {/* Dense layered canopy — sways slowly in the wind. Pivot is the
            canopy bbox bottom, which sits right where the trunk meets it. */}
        <g className="animate-tree-sway">
          <ellipse cx="0"   cy="-110" rx="88" ry="88" fill="#15803D" />
          <ellipse cx="-20" cy="-130" rx="56" ry="58" fill="#16A34A" opacity="0.85" />
          <ellipse cx="22"  cy="-135" rx="42" ry="48" fill="#22C55E" opacity="0.7" />
          <ellipse cx="-12" cy="-150" rx="28" ry="30" fill="#4ADE80" opacity="0.5" />
        </g>
      </g>
      {leftTrees()}
      {rightTrees()}
    </HeroSvg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE — evening campfire with warm glow
// ═══════════════════════════════════════════════════════════════════════════
export const ProfileCampfire: React.FC = () => {
  const id = 'pc';
  return (
    <HeroSvg id={id}>
      {skyAndAtmosphere(id)}
      {standardMountains(id)}
      {standardHills(id)}
      <g transform="translate(400, 510)">
        {/* Concentric warm glow — breathes slowly, gives the fire presence */}
        <ellipse cx="0" cy="0"  rx="140" ry="70" fill="#FEF3C7" opacity="0.35" className="animate-campfire-glow" />
        <ellipse cx="0" cy="-2" rx="85"  ry="44" fill="#FCD34D" opacity="0.45" className="animate-campfire-glow" />
        {/* Stacked logs — anchored, never move */}
        <ellipse cx="-20" cy="10" rx="30" ry="5"   fill="#7C2D12" />
        <ellipse cx="20"  cy="10" rx="30" ry="5"   fill="#5B21B6" />
        <ellipse cx="0"   cy="15" rx="36" ry="6"   fill="#92400E" />
        <ellipse cx="-12" cy="18" rx="18" ry="4"   fill="#7C2D12" opacity="0.8" />
        {/* Flame layers — flicker independently with staggered delays */}
        <path d="M -27 -4 Q -18 -42 0 -52 Q 18 -42 27 -4 Q 9 5 -9 5 Z"     fill="#F97316" className="animate-flame-flicker" />
        <path d="M -18 -12 Q -12 -36 0 -48 Q 12 -36 18 -12 Q 6 -6 -6 -6 Z" fill="#FBBF24" className="animate-flame-flicker" style={{ animationDelay: '0.3s' }} />
        <path d="M -10 -18 Q -4 -33 0 -40 Q 4 -33 10 -18 Q 3 -12 -3 -12 Z" fill="#FEF3C7" className="animate-flame-flicker" style={{ animationDelay: '0.6s' }} />
        {/* Rising sparks — emerge from flames, drift up, fade out. Each has
            its own delay so the four are always at different stages, giving
            a continuous trickle rather than a synchronized pulse. */}
        <circle
          cx="-20" cy="-50" r="2"   fill="#FBBF24"
          className="animate-spark-rise"
          style={{ ['--spark-peak' as string]: '0.85', animationDelay: '0s',   animationDuration: '2.4s' }}
        />
        <circle
          cx="14"  cy="-58" r="1.7" fill="#FEF3C7"
          className="animate-spark-rise"
          style={{ ['--spark-peak' as string]: '0.85', animationDelay: '0.7s', animationDuration: '2.7s' }}
        />
        <circle
          cx="-6"  cy="-68" r="1.4" fill="#FCD34D"
          className="animate-spark-rise"
          style={{ ['--spark-peak' as string]: '0.75', animationDelay: '1.4s', animationDuration: '2.5s' }}
        />
        <circle
          cx="20"  cy="-74" r="1.2" fill="#FBBF24"
          className="animate-spark-rise"
          style={{ ['--spark-peak' as string]: '0.6',  animationDelay: '2.0s', animationDuration: '2.9s' }}
        />
      </g>
      {leftTrees()}
      {rightTrees()}
    </HeroSvg>
  );
};

