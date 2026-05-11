import React from 'react';
import {
  Wind,
  Droplets,
  Dumbbell,
  Eye,
  Activity,
  Footprints,
  PhoneOff,
  PenTool,
  Mail,
  Film,
  Sparkles,
} from 'lucide-react';
import type { FeelingId, UrgeAction, UrgeActionId } from '../../types';
import { URGE_ACTIONS, URGE_CATEGORY_META } from '../../data/urgeData';

interface ActStageProps {
  feeling: FeelingId | null;
  /** Action IDs the user already opened this session — shown with a quiet
   *  "tried" mark so they know what they've explored without losing access. */
  triedActionIds: UrgeActionId[];
  onPickAction: (id: UrgeActionId) => void;
}

/** Visual mapping action-id → icon. Kept here (not in urgeData.ts) so the
 *  data file stays free of React/JSX imports — pure data is easier to test
 *  and serialize. */
const ACTION_ICONS: Record<UrgeActionId, React.ComponentType<{ size?: number; className?: string }>> = {
  box_breathing: Wind,
  cold_water: Droplets,
  physical_burst: Dumbbell,
  grounding_54321: Eye,
  halt_check: Activity,
  leave_room: Footprints,
  phone_away: PhoneOff,
  urge_journal: PenTool,
  future_self_letter: Mail,
  play_the_tape: Film,
};

/**
 * Stage 3 — Act.
 *
 * Surfaces all 10 evidence-based actions, grouped by category (Reset,
 * Ground, Protect, Reframe). The grid is intentionally NOT a flat list:
 * categories give the user a mental model of the kinds of help available,
 * so picking feels like choosing a tool from a labelled toolbox rather
 * than scrolling through tips.
 *
 * Two UX-friendly touches make the grid scannable in a moment of crisis:
 *   1. **Recommended badges** — 1–2 cards per session get a "best fit"
 *      sparkle accent based on the feeling picked in Stage 2 (driven by
 *      `URGE_ACTIONS[i].recommendedFor`). This handles the analysis paralysis
 *      that a 10-card grid would otherwise cause.
 *   2. **Stagger-fade entrance** — cards fade in 50ms apart, capped, so the
 *      grid feels alive instead of slamming in all at once.
 */
export const ActStage: React.FC<ActStageProps> = ({ feeling, triedActionIds, onPickAction }) => {
  // Compute the recommended set once. We always show at most 2 highlights so
  // the badge stays meaningful — recommending half the grid is recommending
  // nothing. Falls back to an empty set when the user skipped feeling
  // selection (shouldn't happen via normal flow, but is safe).
  const recommendedIds = React.useMemo<Set<UrgeActionId>>(() => {
    if (!feeling) return new Set();
    const matches = URGE_ACTIONS.filter((a) => a.recommendedFor.includes(feeling));
    return new Set(matches.slice(0, 2).map((a) => a.id));
  }, [feeling]);

  // Bucket actions by category so each section can render its own header.
  // Order matches the order in URGE_ACTIONS so the user sees the strongest
  // physiological resets first.
  const grouped = React.useMemo(() => {
    const buckets: Record<string, UrgeAction[]> = { reset: [], ground: [], protect: [], reframe: [] };
    for (const a of URGE_ACTIONS) buckets[a.category].push(a);
    return buckets;
  }, []);

  // Index used to drive the stagger-fade animation across category boundaries.
  let cardIndex = 0;

  return (
    <div className="flex-1 overflow-y-auto pb-28 md:pb-8 animate-in fade-in duration-300">
      <div className="px-4 md:px-6 max-w-3xl mx-auto">
        <header className="text-center mt-6 md:mt-8 mb-6 md:mb-8">
          <p className="text-[10px] font-semibold text-rose-700/60 uppercase tracking-widest mb-2">
            Stage 3 of 4
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-rose-900 mb-2">
            Pick one action.
          </h2>
          <p className="text-sm md:text-base text-rose-700/80 max-w-md mx-auto">
            Don't fight the urge. Replace the next 5 minutes.
          </p>
        </header>

        <div className="space-y-6">
          {(['reset', 'ground', 'protect', 'reframe'] as const).map((cat) => {
            const meta = URGE_CATEGORY_META[cat];
            const items = grouped[cat];
            return (
              <section key={cat} aria-label={meta.label}>
                {/* Quiet category header — informational, not loud. The
                    subtitle is the one-liner that tells the user what this
                    bucket does for them. */}
                <div className="mb-3 px-1">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${meta.accent}`}>
                    {meta.label}
                  </h3>
                  <p className="text-xs text-rose-700/60">{meta.subtitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {items.map((action) => {
                    const Icon = ACTION_ICONS[action.id];
                    const isRecommended = recommendedIds.has(action.id);
                    const isTried = triedActionIds.includes(action.id);
                    const i = cardIndex++;

                    return (
                      <button
                        key={action.id}
                        onClick={() => onPickAction(action.id)}
                        className={`relative text-left p-4 rounded-2xl border bg-white transition-all
                                    hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]
                                    animate-in fade-in slide-in-from-bottom-2 duration-300
                                    ${
                                      isRecommended
                                        ? 'border-rose-500 ring-2 ring-rose-200 shadow-md'
                                        : 'border-rose-100 hover:border-rose-300'
                                    }`}
                        // Cap the stagger at 400ms so even the last card
                        // appears within ~half a second — the grid should
                        // feel alive, not slow.
                        style={{
                          animationDelay: `${Math.min(i * 50, 400)}ms`,
                          animationFillMode: 'backwards',
                        }}
                      >
                        {/* Recommended badge — top-right corner, soft */}
                        {isRecommended && (
                          <span
                            aria-label="Recommended for what you're feeling"
                            className="absolute top-2 right-2 inline-flex items-center gap-1
                                       px-1.5 py-0.5 rounded-full bg-rose-700 text-white
                                       text-[9px] font-bold uppercase tracking-wider"
                          >
                            <Sparkles size={9} />
                            <span>Best fit</span>
                          </span>
                        )}

                        {/* Already tried indicator — quiet checkmark dot,
                            doesn't disable the card so users can re-open. */}
                        {isTried && !isRecommended && (
                          <span
                            aria-label="You opened this earlier"
                            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-400"
                          />
                        )}

                        <div
                          className={`mb-2 inline-flex items-center justify-center w-10 h-10 rounded-xl
                                       ${meta.tint} ${meta.accent}`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="font-semibold text-rose-900 text-sm leading-tight mb-1">
                          {action.title}
                        </div>
                        <p className="text-[11px] md:text-xs text-rose-700/70 leading-snug">
                          {action.whyItWorks}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
