export enum View {
  LOGIN = 'LOGIN',
  CHECK_IN = 'CHECK_IN',
  DASHBOARD = 'DASHBOARD',
  PLAN_21 = 'PLAN_21',
  AI_COACH = 'AI_COACH',
  URGE_HELP = 'URGE_HELP',
  FUTURE = 'FUTURE',
  SETTINGS = 'SETTINGS',
}

export enum CheckInStatus {
  CLEAN = 'CLEAN',
  SLIP = 'SLIP',
  SKIPPED = 'SKIPPED',
}

export interface CheckIn {
  id: string;
  date: Date;
  status: CheckInStatus;
  triggers: string[];
  emotions: string[];
  reaction?: string;
  copingStrategies?: string[];
  notes?: string;
  aiInsight?: string;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Late night';
  tasksCompleted?: boolean;
}

export interface User {
  username: string;
  streak: number;
}

export interface ChatMessage {
  /** 'divider' is a UI-only marker that breaks the chat into distinct urge
   *  sessions. Content holds an ISO timestamp so the renderer can format
   *  "── New urge session · 2:34 PM ──" (or include the date if >24h ago).
   *  Filtered out of Anthropic API payloads and coach-reset summarization. */
  role: 'user' | 'assistant' | 'divider';
  content: string;
}

// ─── Urge Help (Issue #34) ─────────────────────────────────────────────────

/** All 10 evidence-based urge-response actions. Stable string IDs so they
 *  can be persisted into the urge log without breaking when ordering changes. */
export type UrgeActionId =
  | 'box_breathing'
  | 'cold_water'
  | 'physical_burst'
  | 'grounding_54321'
  | 'halt_check'
  | 'leave_room'
  | 'phone_away'
  | 'urge_journal'
  | 'future_self_letter'
  | 'play_the_tape';

/** The four therapeutic categories the 10 actions are grouped into. */
export type UrgeActionCategory = 'reset' | 'ground' | 'protect' | 'reframe';

/** Stable IDs for the feelings shown on the Locate stage. */
export type FeelingId =
  | 'boredom'
  | 'anxiety'
  | 'loneliness'
  | 'stress'
  | 'frustration'
  | 'tiredness'
  | 'sexual_tension';

/** A single feeling option on the Locate stage. */
export interface Feeling {
  id: FeelingId;
  label: string;
  /** One-line context shown beneath the label — explains why this triggers
   *  and how it tends to resolve. Keeps the picker informative without modal. */
  context: string;
}

/** Action registry entry consumed by the Act stage and individual mini-screens.
 *  `recommendedFor` drives the 1–2 highlighted "best fit" cards based on the
 *  feeling the user picked in Stage 2. */
export interface UrgeAction {
  id: UrgeActionId;
  title: string;
  category: UrgeActionCategory;
  /** One-line evidence anchor shown on the action card AND mini-screen header. */
  whyItWorks: string;
  /** Feelings this action is most useful for; drives recommended-badge logic. */
  recommendedFor: FeelingId[];
}

/** Outcome of a completed Reflect-stage feedback. Mirrors the existing
 *  `handleFeedback` discriminator so we can grow the analytics later. */
export type UrgeOutcome = 'passed' | 'still_here' | 'escalated';

/** A single completed urge-surf session. Written to localStorage on Reflect
 *  feedback click; also powers the Dashboard "Urges Surfed" tile. */
export interface UrgeLogEntry {
  /** Unix ms timestamp; doubles as a unique-enough id. */
  id: number;
  /** ISO timestamp the user entered the Reflect stage. */
  endedAt: string;
  feeling: FeelingId | null;
  /** 1–10, null when the user skipped the slider. */
  intensity: number | null;
  /** Action IDs the user opened during this session (deduped, in click order). */
  actionsTried: UrgeActionId[];
  outcome: UrgeOutcome;
}

/** Context handed to the AI Coach when it's invoked mid-flow as a modal.
 *  Lets the system prompt seed Claude with what the user is working through
 *  right now, so the very first response is targeted instead of generic. */
export interface UrgeContextSeed {
  stage: 'pause' | 'locate' | 'act' | 'reflect';
  feeling: FeelingId | null;
  intensity: number | null;
  /** Every action the user opened during this session, in click order (deduped).
   *  Drives both the system-prompt context block and the auto-message template
   *  so Claude sees the full coping chain instead of just the last try. */
  actionsTried: UrgeActionId[];
  /** Seconds since the user landed on the Help tab. */
  elapsedSec: number;
}
