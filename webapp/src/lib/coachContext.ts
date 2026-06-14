// Build a structured "USER CONTEXT (recent activity)" block injected into
// the Coach system prompt on every call (Issue #69).
//
// Replaces the prior one-line `Date / Status / Emotions` summary that
// AICoach built inline. Pulls from data already loaded on the frontend —
// no server round-trip needed:
//   - check-ins  (last 7 days, from App state)
//   - urge log   (last 7 days, from App state, Issue #64)
//   - journal    (last 10 entries, read directly from localStorage)
//
// Pure functions — no side effects. The wrapping `USER CONTEXT
// (recent activity):` header lives in `prompts/aiCoach.ts`; this helper
// returns just the body.

import { CheckIn, CheckInStatus, UrgeLogEntry } from '../../types';
import type { UrgeJournalEntry } from './urgeLog';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_PER_SECTION = 10;

interface BuildCoachContextInput {
  checkIns: CheckIn[];
  urgeLog: UrgeLogEntry[];
  journalEntries: UrgeJournalEntry[];
}

/** Produce the body of the `USER CONTEXT (recent activity):` block. Returns
 *  a single line `(new user — no activity yet)` when nothing is logged so
 *  the coach receives an explicit signal instead of an ambiguous empty
 *  section. */
export function buildCoachContext({
  checkIns,
  urgeLog,
  journalEntries,
}: BuildCoachContextInput): string {
  const now = Date.now();
  const recentCheckIns = checkIns.filter(
    (c) => now - c.date.getTime() <= SEVEN_DAYS_MS,
  );
  const recentUrges = urgeLog.filter(
    (u) => now - new Date(u.endedAt).getTime() <= SEVEN_DAYS_MS,
  );
  // Journal: take the most recent N entries regardless of age — the
  // journal is the user's own raw voice and even an older entry can carry
  // useful context for the coach (vs. the structural counts above which
  // only make sense as "this week").
  const recentJournal = journalEntries.slice(-MAX_PER_SECTION);

  if (
    recentCheckIns.length === 0 &&
    recentUrges.length === 0 &&
    recentJournal.length === 0
  ) {
    return '(new user — no activity yet)';
  }

  return [
    formatCheckIns(recentCheckIns),
    formatUrges(recentUrges),
    formatJournal(recentJournal),
  ]
    .filter(Boolean)
    .join('\n\n');
}

// ── Section formatters ──────────────────────────────────────────────────────

function formatCheckIns(checkIns: CheckIn[]): string {
  if (checkIns.length === 0) return '';

  const cleanCount = checkIns.filter((c) => c.status === CheckInStatus.CLEAN).length;
  const slipCount = checkIns.filter((c) => c.status === CheckInStatus.SLIP).length;

  const slipLines = checkIns
    .filter((c) => c.status === CheckInStatus.SLIP)
    .slice(-MAX_PER_SECTION)
    .map((c) => {
      const day = c.date.toLocaleDateString('en-US', { weekday: 'short' });
      const time = c.timeOfDay ? ` ${c.timeOfDay.toLowerCase()}` : '';
      const trigger = c.triggers?.[0];
      const triggerPart = trigger ? ` (trigger: ${trigger.toLowerCase()})` : '';
      return `  - ${day}${time}${triggerPart}`;
    });

  const lines = [`Check-ins: ${cleanCount} CLEAN, ${slipCount} SLIP.`];
  if (slipLines.length > 0) lines.push(...slipLines);
  return lines.join('\n');
}

function formatUrges(urgeLog: UrgeLogEntry[]): string {
  if (urgeLog.length === 0) return '';

  const total = urgeLog.length;
  const escalated = urgeLog.filter((u) => u.outcome === 'escalated').length;

  const feelingCounts = new Map<string, number>();
  for (const u of urgeLog) {
    if (u.feeling) feelingCounts.set(u.feeling, (feelingCounts.get(u.feeling) ?? 0) + 1);
  }
  const topFeeling = [...feelingCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const intensities = urgeLog
    .map((u) => u.intensity)
    .filter((i): i is number => i !== null);
  const avgIntensity =
    intensities.length > 0
      ? (intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(1)
      : null;

  const lines = [`Urges surfed: ${total} sessions completed.`];
  if (topFeeling) {
    const feelingLabel = topFeeling[0].replace(/_/g, ' ');
    const intensityPart = avgIntensity ? `, avg intensity ${avgIntensity}/10` : '';
    lines.push(`  - Top feeling: ${feelingLabel} (${topFeeling[1]}/${total} sessions)${intensityPart}`);
  } else if (avgIntensity) {
    lines.push(`  - Avg intensity ${avgIntensity}/10`);
  }
  if (escalated > 0) {
    lines.push(`  - ${escalated} session${escalated === 1 ? '' : 's'} escalated to chat`);
  }
  return lines.join('\n');
}

function formatJournal(entries: UrgeJournalEntry[]): string {
  if (entries.length === 0) return '';

  const lines = ['Recent journal entries:'];
  for (const e of entries) {
    const d = new Date(e.savedAt);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const trigger = e.trigger ?? '(no trigger)';
    // Collapse newlines/whitespace in the note: keeps the structured
    // bullet on one line and defangs trivial prompt-injection attempts
    // (e.g. a note containing fake "SYSTEM:" lines).
    const note = e.note.replace(/\s+/g, ' ').trim();
    const notePart = note ? ` — "${note}"` : '';
    lines.push(
      `  - ${day} ${time} — trigger: ${trigger}, intensity ${e.intensity}/10${notePart}`,
    );
  }
  return lines.join('\n');
}
