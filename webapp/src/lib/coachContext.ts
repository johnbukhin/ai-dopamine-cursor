// Build a structured "USER CONTEXT" block injected into the Coach system
// prompt on every call (Issue #69, expanded by #71, locale added in #71
// follow-up).
//
// Section order (environment → identity → trajectory → patterns → right-now):
//   0. USER LOCATION (browser timezone + UI language)  — drives safety geo
//   1. USER'S OWN WORDS (Future-Self Letter)            — values/identity
//   2. PLAN STATUS                                      — Day N of 28
//   3. LIFETIME STATS                                   — totals + streak + last slip
//   4. Check-ins (last 7 days)                          — CLEAN/SLIP + slip days
//   5. Urges surfed (last 7 days)                       — count, top feeling, etc
//   6. Recent journal entries (most recent 10)          — raw trigger/intensity
//   7. TODAY                                            — today's activity summary
//
// All sections render conditionally — empty input ⇒ section omitted entirely.
// When ALL sections are empty (genuinely new user), helper returns the single
// line `(new user — no activity yet)` so coach gets an explicit signal
// instead of an ambiguous empty block.
//
// Pure functions — no side effects. The wrapping `USER CONTEXT:` header
// lives in `prompts/aiCoach.ts`; this helper returns just the body.

import { differenceInCalendarDays } from 'date-fns';
import { CheckIn, CheckInStatus, UrgeLogEntry } from '../../types';
import type { FutureSelfLetter, UrgeJournalEntry } from './urgeLog';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_PER_SECTION = 10;
const PLAN_LENGTH_DAYS = 28;

interface BuildCoachContextInput {
  checkIns: CheckIn[];
  urgeLog: UrgeLogEntry[];
  journalEntries: UrgeJournalEntry[];
  /** Current consecutive-CLEAN-day count from App state. Used in the
   *  Lifetime block so coach can frame momentum. */
  streak: number;
  /** Active plan cycle start (ISO string) from `user_app_state`. `null`
   *  when the user hasn't started a plan yet — Plan Status section is
   *  omitted in that case. */
  planStartedAt: string | null;
  /** User's Future-Self Letter (Issue #65). Null = no letter written yet;
   *  undefined = still loading. Section is omitted in both cases. */
  letter: FutureSelfLetter | null | undefined;
  /** Best-effort browser locale signals (#71 follow-up). Used by the coach's
   *  `# Safety` section to choose region-appropriate crisis resources.
   *  Timezone is the primary geo signal (`Intl.DateTimeFormat().resolvedOptions().timeZone`);
   *  language is the UI preference (`navigator.language`) and may not match
   *  physical location. Empty strings ⇒ section omitted; the coach's
   *  "if uncertain → generic" guardrail then prevents fabrication. */
  locale: string;
  timezone: string;
}

/** Produce the body of the `USER CONTEXT:` block. */
export function buildCoachContext({
  checkIns,
  urgeLog,
  journalEntries,
  streak,
  planStartedAt,
  letter,
  locale,
  timezone,
}: BuildCoachContextInput): string {
  const now = new Date();
  const nowMs = now.getTime();

  const recentCheckIns = checkIns.filter((c) => nowMs - c.date.getTime() <= SEVEN_DAYS_MS);
  const recentUrges = urgeLog.filter(
    (u) => nowMs - new Date(u.endedAt).getTime() <= SEVEN_DAYS_MS,
  );
  // Journal: take the N most recent regardless of age (the journal is the
  // user's own raw voice and even an older entry can carry useful context).
  const recentJournal = journalEntries.slice(-MAX_PER_SECTION);

  // Location goes FIRST so the # Safety branch in the system prompt can
  // read it without scanning the whole context block.
  const sections = [
    formatLocation(locale, timezone),
    formatLetter(letter),
    formatPlanStatus(planStartedAt, now),
    formatLifetime(checkIns, urgeLog, streak, now),
    formatCheckIns(recentCheckIns),
    formatUrges(recentUrges),
    formatJournal(recentJournal),
    formatToday(checkIns, urgeLog, journalEntries, now),
  ].filter(Boolean);

  if (sections.length === 0) return '(new user — no activity yet)';
  return sections.join('\n\n');
}

// ── Section formatters ──────────────────────────────────────────────────────

/** Render the USER LOCATION line with inline guidance for the coach.
 *  Omitted entirely when both signals are empty (e.g. browser-API lockdown).
 *  Inline guidance — rather than a separate prompt rule — keeps the
 *  interpretation hint co-located with the data it explains.
 *
 *  Defense-in-depth: both values are flattened (whitespace collapsed) and
 *  length-capped before interpolation. Browser APIs normally return well-
 *  formed strings, but `Object.defineProperty(navigator, 'language', ...)`
 *  via DevTools could inject newlines or fake prompt headers. Same defang
 *  pattern as `formatLetter` and `formatJournal` below. */
function formatLocation(locale: string, timezone: string): string {
  const safe = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, 64);
  const safeTz = safe(timezone);
  const safeLocale = safe(locale);
  if (!safeTz && !safeLocale) return '';
  const parts: string[] = [];
  if (safeTz) parts.push(`timezone=${safeTz}`);
  if (safeLocale) parts.push(`language=${safeLocale}`);
  return (
    `USER LOCATION (best-effort browser signal): ${parts.join(', ')}. ` +
    `Use timezone as primary geo signal; language is the UI preference ` +
    `and may not match physical location.`
  );
}

function formatLetter(letter: FutureSelfLetter | null | undefined): string {
  if (!letter) return '';
  // Collapse whitespace in each field (esp. `message`, which is a textarea
  // and can contain newlines/paragraphs). Keeps each field on a single
  // structured bullet line and defangs trivial prompt-injection via fake
  // section headers embedded in the user's own letter. Same pattern as
  // `formatJournal`.
  const flatten = (s: string) => s.replace(/\s+/g, ' ').trim();
  return [
    "USER'S OWN WORDS (Future-Self Letter):",
    `  Values: ${flatten(letter.values)}`,
    `  Identity: ${flatten(letter.identity)}`,
    `  Message: ${flatten(letter.message)}`,
  ].join('\n');
}

function formatPlanStatus(planStartedAt: string | null, now: Date): string {
  if (!planStartedAt) return '';
  const start = new Date(planStartedAt);
  // Calendar-day diff matches the user's mental model (Day 2 = "the next
  // calendar day after Day 1", regardless of clock time within the day).
  // Raw millisecond diff would mis-bucket plans started late in the evening.
  const dayNumber = Math.max(1, differenceInCalendarDays(now, start) + 1);
  const startDate = start.toISOString().slice(0, 10);
  // Honest signal past Day 28: tells coach the user is in maintenance phase
  // rather than active 28-day curriculum.
  const completeNote = dayNumber > PLAN_LENGTH_DAYS ? ' (plan complete)' : '';
  return `PLAN STATUS: Day ${dayNumber} of ${PLAN_LENGTH_DAYS} (started ${startDate})${completeNote}`;
}

function formatLifetime(
  checkIns: CheckIn[],
  urgeLog: UrgeLogEntry[],
  streak: number,
  now: Date,
): string {
  if (checkIns.length === 0) return '';

  const startDate = checkIns[0].date;
  const startIso = startDate.toISOString().slice(0, 10);
  const daysSinceStart = Math.max(1, differenceInCalendarDays(now, startDate) + 1);

  const cleanCount = checkIns.filter((c) => c.status === CheckInStatus.CLEAN).length;
  const slipCount = checkIns.filter((c) => c.status === CheckInStatus.SLIP).length;

  const escalated = urgeLog.filter((u) => u.outcome === 'escalated').length;

  const lines = [
    `LIFETIME (since ${startIso}, ${daysSinceStart} days):`,
    `  - Check-ins: ${checkIns.length} total (${cleanCount} CLEAN, ${slipCount} SLIP)`,
    `  - Urges surfed: ${urgeLog.length} sessions${escalated > 0 ? ` (${escalated} escalated to chat)` : ''}`,
    `  - Current streak: ${streak} day${streak === 1 ? '' : 's'} CLEAN`,
  ];

  // Last slip with behavioral context — gives coach momentum framing.
  // Backward loop avoids copying the (potentially large) check-in array
  // just to find the most recent SLIP. `checkIns` is sorted ascending in
  // `loadUserData`, so the latest SLIP is the last one we'll hit.
  let lastSlip: CheckIn | undefined;
  for (let i = checkIns.length - 1; i >= 0; i--) {
    if (checkIns[i].status === CheckInStatus.SLIP) {
      lastSlip = checkIns[i];
      break;
    }
  }
  if (lastSlip) {
    const daysAgo = Math.max(0, differenceInCalendarDays(now, lastSlip.date));
    const dayLabel = lastSlip.date.toLocaleDateString('en-US', { weekday: 'short' });
    const time = lastSlip.timeOfDay ? ` ${lastSlip.timeOfDay.toLowerCase()}` : '';
    const trigger = lastSlip.triggers?.[0];
    const triggerPart = trigger ? `, trigger: ${trigger.toLowerCase()}` : '';
    const ago = daysAgo === 0 ? 'today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
    lines.push(`  - Last slip: ${ago} (${dayLabel}${time}${triggerPart})`);
  }

  return lines.join('\n');
}

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

  const lines = [`Check-ins (last 7 days): ${cleanCount} CLEAN, ${slipCount} SLIP.`];
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

  const lines = [`Urges surfed (last 7 days): ${total} sessions completed.`];
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

  const lines = ['Recent journal entries (most recent 10):'];
  for (const e of entries) {
    const d = new Date(e.savedAt);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const trigger = e.trigger ?? '(no trigger)';
    // Collapse whitespace: keeps the structured bullet on one line and
    // defangs trivial prompt-injection attempts.
    const note = e.note.replace(/\s+/g, ' ').trim();
    const notePart = note ? ` — "${note}"` : '';
    lines.push(
      `  - ${day} ${time} — trigger: ${trigger}, intensity ${e.intensity}/10${notePart}`,
    );
  }
  return lines.join('\n');
}

function formatToday(
  checkIns: CheckIn[],
  urgeLog: UrgeLogEntry[],
  journalEntries: UrgeJournalEntry[],
  now: Date,
): string {
  const todayKey = now.toDateString();
  const todayCheckIns = checkIns.filter((c) => c.date.toDateString() === todayKey);
  const todayUrges = urgeLog.filter(
    (u) => new Date(u.endedAt).toDateString() === todayKey,
  );
  const todayJournal = journalEntries.filter(
    (j) => new Date(j.savedAt).toDateString() === todayKey,
  );

  if (todayCheckIns.length + todayUrges.length + todayJournal.length === 0) return '';

  const dateLabel = now.toISOString().slice(0, 10);
  const lines = [`TODAY (${dateLabel}):`];

  if (todayCheckIns.length > 0) {
    const clean = todayCheckIns.filter((c) => c.status === CheckInStatus.CLEAN).length;
    const slip = todayCheckIns.filter((c) => c.status === CheckInStatus.SLIP).length;
    const parts: string[] = [];
    if (clean > 0) parts.push(`${clean} CLEAN`);
    if (slip > 0) parts.push(`${slip} SLIP`);
    lines.push(`  - ${todayCheckIns.length} check-in${todayCheckIns.length === 1 ? '' : 's'} (${parts.join(', ')})`);
  }
  if (todayUrges.length > 0) {
    const passed = todayUrges.filter((u) => u.outcome === 'passed').length;
    const escalated = todayUrges.filter((u) => u.outcome === 'escalated').length;
    const parts: string[] = [];
    if (passed > 0) parts.push(`${passed} passed`);
    if (escalated > 0) parts.push(`${escalated} escalated`);
    lines.push(`  - ${todayUrges.length} urge${todayUrges.length === 1 ? '' : 's'} surfed (${parts.join(', ')})`);
  }
  if (todayJournal.length > 0) {
    lines.push(`  - ${todayJournal.length} journal entr${todayJournal.length === 1 ? 'y' : 'ies'}`);
  }
  return lines.join('\n');
}
