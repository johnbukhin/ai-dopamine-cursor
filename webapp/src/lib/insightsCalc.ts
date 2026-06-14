// Pure aggregation functions for the Insights page (Issue #73).
//
// Everything here takes plain UrgeLogEntry[] / CheckIn[] inputs and returns
// plain data structures — no React, no side effects, no logging. That makes
// each function trivially unit-testable and keeps the visualisation layer
// (`Insights.tsx`) focused on rendering.
//
// Why "lifetime" not "rolling window": the user explicitly asked for
// all-time aggregations rather than last-N-days, so the patterns shown here
// reflect the long-horizon picture (#73 acceptance criteria).

import type { CheckIn, UrgeLogEntry, FeelingId, UrgeActionId } from '../../types';
import { CheckInStatus } from '../../types';
import { FEELINGS, URGE_ACTION_BY_ID } from '../../data/urgeData';

const FEELING_LABEL_BY_ID: Record<FeelingId, string> = Object.fromEntries(
  FEELINGS.map((f) => [f.id, f.label]),
) as Record<FeelingId, string>;

// ─── Action effectiveness ──────────────────────────────────────────────────

export interface ActionEffectiveness {
  id: UrgeActionId;
  title: string;
  /** Successful sessions where this action was tried, over total sessions
   *  where it was tried. 0–1 range. */
  successRate: number;
  /** Total sessions in which the user opened this action — drives the
   *  `minTries` cutoff for statistical significance. */
  tries: number;
  /** Absolute count of `passed` outcomes among those tries — surfaced in
   *  the UI as "12 of 18 worked" rather than just a percentage. */
  successes: number;
}

/** Walk the urge log once and return per-action effectiveness, ranked by
 *  success rate desc. Actions tried fewer than `minTries` times are excluded
 *  so a single 100%-success record can't dominate the top of the list. */
export function actionEffectivenessAll(
  log: UrgeLogEntry[],
  minTries = 3,
): ActionEffectiveness[] {
  // Walk the log once accumulating per-action (tries, successes).
  const stats = new Map<UrgeActionId, { tries: number; successes: number }>();
  for (const entry of log) {
    const isSuccess = entry.outcome === 'passed';
    for (const actionId of entry.actionsTried) {
      const prev = stats.get(actionId) ?? { tries: 0, successes: 0 };
      prev.tries += 1;
      if (isSuccess) prev.successes += 1;
      stats.set(actionId, prev);
    }
  }
  // Materialise into the ranked array, filtered by sample-size floor.
  const ranked: ActionEffectiveness[] = [];
  for (const [id, { tries, successes }] of stats) {
    if (tries < minTries) continue;
    const title = URGE_ACTION_BY_ID[id]?.title ?? id;
    ranked.push({ id, title, successRate: successes / tries, tries, successes });
  }
  // Highest success-rate first; ties broken by larger sample (more confident).
  ranked.sort((a, b) => b.successRate - a.successRate || b.tries - a.tries);
  return ranked;
}

/** Convenience: top N from the full ranking. Same `minTries` semantics. */
export function topEffectiveActions(
  log: UrgeLogEntry[],
  minTries = 3,
  limit = 3,
): ActionEffectiveness[] {
  return actionEffectivenessAll(log, minTries).slice(0, limit);
}

// ─── Time-of-day buckets ──────────────────────────────────────────────────

export interface TimeOfDayBuckets {
  morning: number;     // 05:00–11:59
  afternoon: number;   // 12:00–16:59
  evening: number;     // 17:00–21:59
  lateNight: number;   // 22:00–04:59
}

/** Counts urges per 4 daypart bucket. Boundaries mirror the existing
 *  `TIME_OF_DAY` constant in `constants.ts` so the language stays consistent
 *  with the check-in form. */
export function timeOfDayBuckets(log: UrgeLogEntry[]): TimeOfDayBuckets {
  const buckets: TimeOfDayBuckets = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    lateNight: 0,
  };
  for (const entry of log) {
    const ts = new Date(entry.endedAt);
    if (Number.isNaN(ts.getTime())) continue;
    const h = ts.getHours();
    if (h >= 5 && h < 12) buckets.morning += 1;
    else if (h >= 12 && h < 17) buckets.afternoon += 1;
    else if (h >= 17 && h < 22) buckets.evening += 1;
    else buckets.lateNight += 1;
  }
  return buckets;
}

// ─── Outcome breakdown ─────────────────────────────────────────────────────

export interface OutcomeBreakdown {
  passed: number;
  stillHere: number;
  escalated: number;
  total: number;
}

/** Sum of outcomes across the log. `total` is the array length — exposed so
 *  callers don't have to recompute it for the "total surfs" card. */
export function outcomeBreakdown(log: UrgeLogEntry[]): OutcomeBreakdown {
  const out: OutcomeBreakdown = { passed: 0, stillHere: 0, escalated: 0, total: log.length };
  for (const entry of log) {
    if (entry.outcome === 'passed') out.passed += 1;
    else if (entry.outcome === 'still_here') out.stillHere += 1;
    else if (entry.outcome === 'escalated') out.escalated += 1;
  }
  return out;
}

// ─── Best streak ───────────────────────────────────────────────────────────

/** Longest consecutive run of CLEAN days. A day with NO check-in breaks the
 *  streak (matches the rule used by `App.streak` so the two numbers tell a
 *  consistent story). SLIP also breaks. SKIPPED is treated as "no check-in"
 *  and breaks the streak as well — feature, not bug. */
export function bestStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;
  // Reduce to one status per local-date so multi-check-in days don't
  // over-count — and so a SLIP entry on the same day as CLEAN still kills
  // the streak.
  const dayStatus = new Map<string, CheckInStatus>();
  for (const c of checkIns) {
    const key = new Date(c.date).toDateString();
    const prev = dayStatus.get(key);
    if (prev === CheckInStatus.SLIP) continue;             // SLIP wins
    if (c.status === CheckInStatus.SLIP) {
      dayStatus.set(key, CheckInStatus.SLIP);
    } else if (c.status === CheckInStatus.CLEAN) {
      if (!prev) dayStatus.set(key, CheckInStatus.CLEAN);
    } else {
      if (!prev) dayStatus.set(key, c.status);
    }
  }
  // Iterate chronologically, counting consecutive CLEAN days. We walk by
  // calendar day (not by entry) so a gap in check-ins also breaks the run.
  const sortedKeys = Array.from(dayStatus.keys())
    .map((k) => new Date(k))
    .sort((a, b) => a.getTime() - b.getTime());
  if (sortedKeys.length === 0) return 0;

  let best = 0;
  let current = 0;
  let prev: Date | null = null;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  for (const date of sortedKeys) {
    const key = date.toDateString();
    const status = dayStatus.get(key);
    const isContinuous =
      prev !== null && Math.round((date.getTime() - prev.getTime()) / MS_PER_DAY) === 1;
    if (status === CheckInStatus.CLEAN) {
      current = isContinuous ? current + 1 : 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
    prev = date;
  }
  return best;
}

// ─── Most-common trigger feelings ──────────────────────────────────────────

export interface FeelingFrequency {
  id: FeelingId;
  label: string;
  count: number;
  /** Share of urges with a named feeling that fall in this bucket (0–1).
   *  Sessions with `feeling === null` are excluded from both numerator
   *  and denominator so the percentages add up to 100% across the bars. */
  pct: number;
}

export function topFeelings(log: UrgeLogEntry[], limit = 3): FeelingFrequency[] {
  const counts = new Map<FeelingId, number>();
  let totalWithFeeling = 0;
  for (const entry of log) {
    if (!entry.feeling) continue;
    counts.set(entry.feeling, (counts.get(entry.feeling) ?? 0) + 1);
    totalWithFeeling += 1;
  }
  if (totalWithFeeling === 0) return [];
  const arr: FeelingFrequency[] = [];
  for (const [id, count] of counts) {
    arr.push({
      id,
      label: FEELING_LABEL_BY_ID[id] ?? id,
      count,
      pct: count / totalWithFeeling,
    });
  }
  arr.sort((a, b) => b.count - a.count);
  return arr.slice(0, limit);
}

// ─── Monthly intensity trend ──────────────────────────────────────────────

export interface MonthlyIntensity {
  /** YYYY-MM in local time — used as a stable map key + chart x-axis label. */
  month: string;
  avgIntensity: number;
  sampleSize: number;
}

/** Group urges by local-time month and average their intensity. Months with
 *  zero samples are omitted so the chart doesn't render misleading zero-points
 *  in the gap (a missing month means "no data", not "intensity dropped to 0"). */
export function monthlyIntensityTrend(log: UrgeLogEntry[]): MonthlyIntensity[] {
  const totals = new Map<string, { sum: number; n: number }>();
  for (const entry of log) {
    if (entry.intensity == null) continue;
    const ts = new Date(entry.endedAt);
    if (Number.isNaN(ts.getTime())) continue;
    const month = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`;
    const prev = totals.get(month) ?? { sum: 0, n: 0 };
    prev.sum += entry.intensity;
    prev.n += 1;
    totals.set(month, prev);
  }
  const out: MonthlyIntensity[] = [];
  for (const [month, { sum, n }] of totals) {
    out.push({ month, avgIntensity: sum / n, sampleSize: n });
  }
  out.sort((a, b) => a.month.localeCompare(b.month));
  return out;
}
