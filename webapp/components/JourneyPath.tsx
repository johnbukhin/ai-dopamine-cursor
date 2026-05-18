import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PlanDay } from '../data/planData';
import { DecorativeStone, LessonStone, LabelSide, LessonState } from './JourneyStone';
import { PlanTrail } from './HeroVariants';

/* Note: a "What to Expect Today" info popover used to live on lesson stones,
   but the data is already inside the lesson sheet itself. The duplicate (i)
   icon was removed for visual minimalism. */

/** 3 decorative white stones precede each lesson stone (winding-path feel). */
const RATIO = 3;

/** Fixed stone sizing — no perspective scaling so decorative and lesson
 *  stones stay visually consistent down the entire path. */
const DECORATIVE_SIZE = 36;
const LESSON_SIZE = 64;
const STEP = 32;                 // base center-to-center distance between stones
const LESSON_EXTRA_STEP = 18;    // breathing room after a lesson stone for label
const ZIGZAG_PERIOD = 9;         // stones per full S-curve
const ZIGZAG_AMPLITUDE_RATIO = 0.32; // fraction of column width
/** Vertical breathing room between the intro stone (Day 0) and the start of
 *  the main path. Makes Day 0 read as a distinct "intro chapter" rather than
 *  part of the Day 1 cluster. */
const INTRO_GAP = 70;

/** A pre-computed stone descriptor (decorative or lesson). */
type Stone =
  | { kind: 'decorative'; index: number; cx: number; cy: number; size: number }
  | {
      kind: 'lesson';
      index: number;
      cx: number;
      cy: number;
      size: number;
      day: PlanDay;
      state: LessonState;
      labelSide: LabelSide;
    };

interface JourneyPathProps {
  planData: PlanDay[];
  /** First day number whose stone should be yellow (active). */
  activePlanDay: number;
  /** Set of day numbers whose stone should be green (completed). */
  completedDays: Set<number>;
  onSelectLesson: (day: PlanDay) => void;
}

/**
 * Vertical stepping-stone path that visually continues the hero illustration.
 *
 * Visual flow (top → bottom):
 *   1. Hand-drawn inline SVG hero (sky / sun / mountains / hills / trees) with
 *      a bottom alpha-mask that melts the painted scene into the path bg.
 *   2. An optional "intro" stone for Day 0, pinned to the upper-left of the
 *      stone area outside the main zigzag (visual onboarding step).
 *   3. The main path: lesson stones interspersed with decorative white stones,
 *      sine-curve zigzag, all stones the same size. Day 1 is its first lesson.
 *
 * Auto-scrolls to the current-day stone on mount.
 */
export const JourneyPath: React.FC<JourneyPathProps> = ({
  planData,
  activePlanDay,
  completedDays,
  onSelectLesson,
}) => {
  // Path column width — fixed at mount. Phone rotation is rare; mid-session
  // resize doesn't justify the layout-thrash of a ResizeObserver.
  const [containerWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 360 : Math.min(window.innerWidth - 32, 480),
  );

  /** Pre-compute every stone's position. All stones share constant sizing.
   *  Day 0 (intro) is pulled out of the main zigzag and placed manually on
   *  the upper-left, so it reads as a separate "start here" marker rather
   *  than just another step on the path. */
  const { introStone, stones, totalHeight } = useMemo(() => {
    // Stone state helper — task-based, not date/streak-based.
    const stoneState = (dayNum: number): LessonState => {
      if (completedDays.has(dayNum)) return 'completed';
      if (dayNum === activePlanDay) return 'current';
      return 'future';
    };
    const out: Stone[] = [];
    const centerX = containerWidth / 2;
    const amplitude = containerWidth * ZIGZAG_AMPLITUDE_RATIO;
    const frequency = (2 * Math.PI) / ZIGZAG_PERIOD;

    // Split: Day 0 is the intro stone (if it exists), Day 1+ flow into the
    // main zigzag. If the data ever changes to start at Day 1 again, the
    // intro stone simply doesn't render.
    const hasIntro = planData.length > 0 && planData[0].day === 0;
    const introDay = hasIntro ? planData[0] : null;
    const sequencedDays = hasIntro ? planData.slice(1) : planData;

    let stoneIndex = 0;
    let lessonIdx = 0;
    // Push the main path down by INTRO_GAP when the intro stone is present,
    // so Day 0 sits clearly above Day 1+ instead of overlapping with the
    // first decorative. Day 0 itself is positioned manually below and is
    // unaffected by this offset.
    let y = hasIntro ? INTRO_GAP : 0;

    while (lessonIdx < sequencedDays.length) {
      // 3 decoratives leading into the lesson stone.
      for (let d = 0; d < RATIO; d++) {
        const xOffset = Math.sin(stoneIndex * frequency) * amplitude;
        const cx = centerX + xOffset;
        y += STEP;
        out.push({
          kind: 'decorative',
          index: stoneIndex,
          cx,
          cy: y,
          size: DECORATIVE_SIZE,
        });
        stoneIndex++;
      }

      // The lesson stone.
      const xOffset = Math.sin(stoneIndex * frequency) * amplitude;
      const cx = centerX + xOffset;
      y += STEP + LESSON_EXTRA_STEP;

      const day = sequencedDays[lessonIdx];
      const state: LessonState = stoneState(day.day);
      // Label on the OPPOSITE side of the column from the stone, so it stays
      // inside the column and never crosses the centerline.
      const labelSide: LabelSide = xOffset >= 0 ? 'left' : 'right';

      out.push({
        kind: 'lesson',
        index: stoneIndex,
        cx,
        cy: y,
        size: LESSON_SIZE,
        day,
        state,
        labelSide,
      });
      stoneIndex++;
      lessonIdx++;
    }

    // Intro stone — manually positioned to the upper-left of the column,
    // slightly below the first decorative stone (which sits at cy = STEP).
    // Stays clear of the sin-curve — first decorative is at centerline,
    // intro stone is well to its left, no visual collision.
    let intro: Stone | null = null;
    if (introDay) {
      const introState: LessonState = stoneState(introDay.day);
      intro = {
        kind: 'lesson',
        index: -1,
        cx: centerX - amplitude * 0.7,
        cy: STEP * 1.6,
        size: LESSON_SIZE,
        day: introDay,
        state: introState,
        labelSide: 'right', // stone sits left → label hugs it on the right
      };
    }

    return { introStone: intro, stones: out, totalHeight: y + 80 };
  }, [planData, activePlanDay, completedDays, containerWidth]);

  /** Ref on the current-day lesson stone — used to scroll into view on mount. */
  const currentStoneRef = useRef<HTMLButtonElement>(null);

  // Re-scroll whenever the active stone changes (covers both initial mount and
  // the moment a day is completed so the new yellow stone centres on screen).
  // Plan28 remounts on every tab-open so this also fires on tab re-entry.
  useEffect(() => {
    currentStoneRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
  }, [activePlanDay]);

  return (
    <div className="relative bg-purple-100 min-h-full">
      {/* HERO — hand-drawn inline SVG. Bottom alpha-mask fades the painted
          scene into the bg, and the SVG's own stone path is styled identically
          to the DOM stones below so the two read as one continuous path. */}
      <div className="relative">
        <PlanTrail />
        {/* Title overlays the upper-left sky region of the illustration. */}
        <div className="absolute top-[41px] md:top-[57px] left-4 md:left-8 pointer-events-none">
          <span className="text-xs md:text-sm font-bold text-purple-700/80 uppercase tracking-wider">
            Day {activePlanDay}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-purple-900 mt-1 drop-shadow-sm">
            Your Journey
          </h2>
        </div>
      </div>

      {/* STONE PATH — pulled up so the first DOM stones land where the SVG
          stone path ends. The SVG's last stone is at cx=400 (viewBox center)
          and the first DOM stone is at cx=containerWidth/2 (column center) —
          both render on the same vertical line at every viewport width.
          Margin in vw so the vertical overlap stays proportional. */}
      <div
        className="relative mx-auto"
        style={{
          width: containerWidth,
          height: totalHeight,
          marginTop: '-12vw',
        }}
      >
        {/* Intro stone (Day 0) — rendered before the main path so it sits
            in the same coordinate space but is positioned by hand. */}
        {introStone && introStone.kind === 'lesson' && (
          <LessonStone
            key="intro"
            ref={introStone.state === 'current' ? currentStoneRef : null}
            day={introStone.day}
            state={introStone.state}
            cx={introStone.cx}
            cy={introStone.cy}
            size={introStone.size}
            labelSide={introStone.labelSide}
            onClick={() => onSelectLesson(introStone.day)}
          />
        )}
        {stones.map((stone) => {
          if (stone.kind === 'decorative') {
            return (
              <DecorativeStone
                key={stone.index}
                cx={stone.cx}
                cy={stone.cy}
                size={stone.size}
              />
            );
          }
          return (
            <LessonStone
              key={stone.index}
              ref={stone.state === 'current' ? currentStoneRef : null}
              day={stone.day}
              state={stone.state}
              cx={stone.cx}
              cy={stone.cy}
              size={stone.size}
              labelSide={stone.labelSide}
              onClick={() => onSelectLesson(stone.day)}
            />
          );
        })}
      </div>
    </div>
  );
};
