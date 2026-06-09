// Static data driving the redesigned Help tab (Issue #34): the list of
// feelings the user picks from on the Locate stage, and the registry of the
// 10 evidence-based actions surfaced on the Act stage.
//
// Kept here (rather than inlined in components) so copy edits and the
// recommended-action mapping stay easy to audit and update without touching
// any rendering logic.

import type { Feeling, UrgeAction, UrgeActionId } from '../types';

/**
 * The 7 feelings available on the Locate stage.
 *
 * Context lines mix a behavioral framing ("why this triggers") with a
 * directional hint ("what tends to help") — short enough to fit two lines
 * on mobile, long enough to make the picker informative on its own.
 */
export const FEELINGS: Feeling[] = [
  {
    id: 'boredom',
    label: 'Boredom',
    context: 'A craving for stimulation. Move your body or change context.',
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    context: 'Nervous system on alert. Slow breathing or cold water resets it.',
  },
  {
    id: 'loneliness',
    label: 'Loneliness',
    context: 'Reach out to someone real, even briefly. Connection is the fix.',
  },
  {
    id: 'stress',
    label: 'Stress',
    context: 'Your body holds tension. Burn it off or write it down.',
  },
  {
    id: 'frustration',
    label: 'Frustration',
    context: 'Anger looking for an outlet. Move first, decide later.',
  },
  {
    id: 'tiredness',
    label: 'Tiredness',
    context: 'Low energy lowers self-control. Rest beats willpower.',
  },
  {
    id: 'sexual_tension',
    label: 'Sexual tension',
    context: 'A wave, not an emergency. Delay 3 minutes and it weakens.',
  },
];

/**
 * The 10 urge-response actions, in display order grouped by category.
 *
 * Within each category the strongest / most physiological action comes first
 * so the recommended-badge logic can default to the first match.
 */
export const URGE_ACTIONS: UrgeAction[] = [
  // ── Reset (physiology) ──────────────────────────────────────────────────
  {
    id: 'box_breathing',
    title: 'Box Breathing',
    category: 'reset',
    whyItWorks: 'Slows your nervous system in 4 cycles.',
    recommendedFor: ['anxiety', 'stress', 'sexual_tension'],
  },
  {
    id: 'cold_water',
    title: 'Cold Water',
    category: 'reset',
    whyItWorks: "Triggers the diving reflex — the body's fastest reset.",
    recommendedFor: ['anxiety', 'sexual_tension', 'frustration'],
  },
  {
    id: 'physical_burst',
    title: 'Physical Burst',
    category: 'reset',
    whyItWorks: 'Burns the adrenaline so the urge has nowhere to go.',
    recommendedFor: ['frustration', 'boredom', 'sexual_tension'],
  },

  // ── Ground (presence) ───────────────────────────────────────────────────
  {
    id: 'grounding_54321',
    title: '5-4-3-2-1 Grounding',
    category: 'ground',
    whyItWorks: 'Pulls your attention out of the loop and back into the room.',
    recommendedFor: ['anxiety', 'stress'],
  },
  {
    id: 'halt_check',
    title: 'HALT Check',
    category: 'ground',
    whyItWorks: 'Names the real need under the urge.',
    recommendedFor: ['boredom', 'tiredness', 'loneliness', 'frustration'],
  },

  // ── Protect (environment) ───────────────────────────────────────────────
  {
    id: 'leave_room',
    title: 'Leave the Room',
    category: 'protect',
    whyItWorks: 'A new space breaks the pattern your brain just built.',
    recommendedFor: ['boredom', 'stress'],
  },
  {
    id: 'phone_away',
    title: 'Phone Away',
    category: 'protect',
    whyItWorks: 'Distance from the trigger device drops urge intensity fast.',
    recommendedFor: ['boredom', 'tiredness', 'sexual_tension'],
  },

  // ── Reframe (cognition) ─────────────────────────────────────────────────
  {
    id: 'urge_journal',
    title: 'Urge Journal',
    category: 'reframe',
    whyItWorks: 'Naming the urge weakens it. The data helps future-you.',
    recommendedFor: ['stress', 'frustration', 'loneliness'],
  },
  {
    id: 'future_self_letter',
    title: 'Future-Self Letter',
    category: 'reframe',
    whyItWorks: 'Hear from the version of you that already won this fight.',
    recommendedFor: ['loneliness', 'tiredness'],
  },
  {
    id: 'play_the_tape',
    title: 'Play the Tape',
    category: 'reframe',
    whyItWorks: 'Visualizing the aftermath shifts the decision off autopilot.',
    recommendedFor: ['sexual_tension', 'boredom'],
  },
];

/** Quick lookup by id — used by the orchestrator and Coach context seed.
 *  Typed as `Record<UrgeActionId, UrgeAction>` so callers get strong
 *  inference without a `string` indirection. The cast is safe because
 *  URGE_ACTIONS is exhaustive over UrgeActionId by construction. */
export const URGE_ACTION_BY_ID: Record<UrgeActionId, UrgeAction> = Object.fromEntries(
  URGE_ACTIONS.map((a) => [a.id, a]),
) as Record<UrgeActionId, UrgeAction>;

/** Category metadata for headers and subtle tints in the Act grid. */
export const URGE_CATEGORY_META: Record<
  UrgeAction['category'],
  { label: string; subtitle: string; tint: string; accent: string }
> = {
  reset: {
    label: 'Reset',
    subtitle: 'Calm the body',
    tint: 'bg-emerald-100/60 border-emerald-200',
    accent: 'text-emerald-700',
  },
  ground: {
    label: 'Ground',
    subtitle: 'Come back to now',
    tint: 'bg-teal-100/60 border-teal-200',
    accent: 'text-teal-700',
  },
  protect: {
    label: 'Protect',
    subtitle: 'Change your environment',
    tint: 'bg-sky-100/60 border-sky-200',
    accent: 'text-sky-700',
  },
  reframe: {
    label: 'Reframe',
    subtitle: 'Shift the story',
    tint: 'bg-indigo-100/60 border-indigo-200',
    accent: 'text-indigo-700',
  },
};
