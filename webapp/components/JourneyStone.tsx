import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { PlanDay } from '../data/planData';

/** Visual state of a lesson stone, derived from progress in the parent. */
export type LessonState = 'completed' | 'current' | 'future';

/** Side of the stone where the lesson label is anchored.
 *  'left'  = label sits to the LEFT of the stone (used when stone is right-of-center).
 *  'right' = label sits to the RIGHT of the stone (used when stone is left-of-center). */
export type LabelSide = 'left' | 'right';

/** Pixel gap between the stone edge and the start of its label. */
const LABEL_GAP = 12;
/** Maximum label width (px). Sized to fit the longest lesson title in the
 *  data ("Natural Reward Rebuild", ~22 chars × ~7px at text-xs ≈ 155px),
 *  with headroom for the bold "Day N" line and a few extra characters.
 *  At a 360px viewport the available space between the stone edge and the
 *  column edge is ~225px, so 180px stays well clear of clipping. */
const LABEL_MAX_WIDTH = 180;

/* Stone gradients per state — match the hero illustration palette
   (purple ground, white stones with purple-tinted shadow). */
const DECORATIVE_BG = 'linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%)';
const DECORATIVE_SHADOW =
  '0 4px 8px -2px rgba(76, 29, 149, 0.25), inset 0 -2px 0 rgba(196, 181, 253, 0.4)';

const COMPLETED_BG = 'linear-gradient(180deg, #34D399 0%, #059669 100%)';
const COMPLETED_SHADOW =
  '0 4px 10px -2px rgba(5, 150, 105, 0.45), inset 0 -2px 0 rgba(6, 95, 70, 0.5)';

const CURRENT_BG = 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)';
// CURRENT box-shadow comes from the .animate-stone-glow keyframe in index.css.

const FUTURE_BG = 'linear-gradient(180deg, #6D28D9 0%, #4C1D95 100%)';
const FUTURE_SHADOW =
  '0 4px 10px -2px rgba(76, 29, 149, 0.55), inset 0 -2px 0 rgba(46, 16, 101, 0.6)';

/**
 * Decorative white stone — visual filler between lessons.
 * Non-interactive (`pointer-events-none`) so it never swallows taps meant
 * for nearby lesson stones.
 */
interface DecorativeStoneProps {
  cx: number;       // center x in container px
  cy: number;       // center y in container px
  size: number;     // width in px (height = size / aspect)
}

export const DecorativeStone: React.FC<DecorativeStoneProps> = ({ cx, cy, size }) => {
  const height = size / 1.6; // ellipse aspect ratio
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        left: cx - size / 2,
        top: cy - height / 2,
        width: size,
        height,
        borderRadius: '50%',
        background: DECORATIVE_BG,
        boxShadow: DECORATIVE_SHADOW,
      }}
    />
  );
};

interface LessonStoneProps {
  day: PlanDay;
  state: LessonState;
  cx: number;
  cy: number;
  size: number;
  labelSide: LabelSide;
  onClick: () => void;
}

/**
 * Lesson stone (every Nth stone in the path). Rendered as a `<button>` so it
 * carries semantic meaning. Includes:
 *   - colored ellipse styled per state
 *   - 8px invisible padding to reach the iOS HIG 44px tap target minimum
 *   - check icon for completed state
 *   - "Day N / title" label pinned right next to the stone (12px gap),
 *     on the opposite side from where the stone has drifted, so the label
 *     always reads clearly without crossing the stone.
 *
 * `ref` is forwarded so the parent can scrollIntoView the current stone on mount.
 */
export const LessonStone = forwardRef<HTMLButtonElement, LessonStoneProps>(
  ({ day, state, cx, cy, size, labelSide, onClick }, ref) => {
    const height = size / 1.6;
    const halfW = size / 2;
    const halfH = height / 2;

    // Background per state. CURRENT uses a CSS class for the persistent glow;
    // others apply a static box-shadow inline.
    const bg = state === 'completed' ? COMPLETED_BG : state === 'current' ? CURRENT_BG : FUTURE_BG;
    const shadow = state === 'completed' ? COMPLETED_SHADOW : state === 'future' ? FUTURE_SHADOW : undefined;
    const opacity = state === 'future' ? 0.92 : 1;
    const glowClass = state === 'current' ? 'animate-stone-glow' : '';

    const checkSize = Math.round(size * 0.45);

    // Label sits next to the stone (12px gap). Vertical center aligns with
    // the stone center via top = cy - half_label_height (~20).
    // For 'left'  side: label's RIGHT edge is at (cx - halfW - LABEL_GAP).
    // For 'right' side: label's LEFT  edge is at (cx + halfW + LABEL_GAP).
    const labelStyle: React.CSSProperties =
      labelSide === 'right'
        ? {
            position: 'absolute',
            left: cx + halfW + LABEL_GAP,
            top: cy - 20,
            maxWidth: LABEL_MAX_WIDTH,
            textAlign: 'left',
          }
        : {
            position: 'absolute',
            // Translate-based right-anchor: place left edge at the desired
            // right boundary minus the label's natural width. Using right via
            // CSS would require knowing the parent width; this works without it.
            left: cx - halfW - LABEL_GAP,
            top: cy - 20,
            maxWidth: LABEL_MAX_WIDTH,
            textAlign: 'right',
            transform: 'translateX(-100%)',
          };

    return (
      <>
        {/* Tap-target wrapper: invisible 8px padding around the visible ellipse. */}
        <button
          ref={ref}
          onClick={onClick}
          aria-label={`Day ${day.day}: ${day.title}`}
          className="absolute group"
          style={{
            left: cx - halfW - 8,
            top: cy - halfH - 8,
            width: size + 16,
            height: height + 16,
            background: 'transparent',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
          }}
        >
          {/* Visible ellipse */}
          <div
            className={glowClass}
            style={{
              width: size,
              height,
              borderRadius: '50%',
              background: bg,
              boxShadow: shadow,
              opacity,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 150ms ease-out',
            }}
          >
            {state === 'completed' && <Check size={checkSize} className="text-white" strokeWidth={3} />}
          </div>
        </button>

        {/* Label card pinned right next to the stone — also a tap target so
            users can open the lesson by tapping either the stone or its
            label. Bigger hit area = higher engagement.
            No line-clamp on the title — full lesson name must always show. */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Day ${day.day}: ${day.title}`}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
          className="cursor-pointer hover:opacity-70 transition-opacity"
          style={labelStyle}
        >
          <div className="text-sm font-bold text-purple-900 leading-tight">Day {day.day}</div>
          <div className="text-xs text-purple-700 leading-tight">{day.title}</div>
        </div>
      </>
    );
  },
);
LessonStone.displayName = 'LessonStone';
