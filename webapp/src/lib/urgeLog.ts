// localStorage helpers for the redesigned Help tab (Issue #34).
//
// Persistence rationale: see issue #34 exploration comment. We chose
// localStorage-first so the feature can ship and iterate without a Supabase
// schema migration. Keys are versioned (`.v1`) so a future migration to the
// backend can read and clear old data cleanly.

import type { UrgeLogEntry } from '../../types';
import { logger } from './logger';

const LOG_KEY = 'mc.urge_log.v1';
const LETTER_KEY = 'mc.future_self_letter.v1';
const JOURNAL_KEY = 'mc.urge_journal.v1';

// ─── Urge log ──────────────────────────────────────────────────────────────

/** Read the full urge log. Returns [] if storage is unavailable or corrupt. */
export function readLog(): UrgeLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UrgeLogEntry[]) : [];
  } catch (err) {
    // Corrupt JSON or storage disabled — fall back to empty so callers
    // never have to defensively try/catch around reads. Surface the error
    // to the logger so dev environments don't silently mask bugs.
    logger.warn('urgeLog read failed', { error: err });
    return [];
  }
}

/** Append a single completed entry. Best-effort write; errors are logged
 *  (not thrown) because the urge log is non-critical and we never want a
 *  write failure to interfere with the user's just-finished surf. */
export function appendEntry(entry: UrgeLogEntry): void {
  try {
    const existing = readLog();
    existing.push(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(existing));
  } catch (err) {
    logger.warn('urgeLog write failed', { error: err });
  }
}

/** Convenience for the Dashboard tile. */
export function count(): number {
  return readLog().length;
}

// ─── Urge Journal (separate from urge log) ────────────────────────────────

/** Structured note captured by the Urge Journal action. Kept in its own
 *  store rather than embedded in `UrgeLogEntry` so the urge log stays a
 *  uniform per-session row, and the journal can grow its own analytics
 *  surface later (e.g. "your most common trigger this week"). */
export interface UrgeJournalEntry {
  /** Unix ms timestamp; doubles as id. */
  id: number;
  /** ISO timestamp the user tapped Done in the journal screen. */
  savedAt: string;
  /** One of UrgeJournalScreen's TRIGGER_CHIPS, or null if user skipped. */
  trigger: string | null;
  /** 1–10 self-rated intensity at the moment of writing. */
  intensity: number;
  /** Free-form note; trimmed but otherwise verbatim. */
  note: string;
}

export function readJournal(): UrgeJournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UrgeJournalEntry[]) : [];
  } catch (err) {
    logger.warn('urgeJournal read failed', { error: err });
    return [];
  }
}

export function appendJournal(entry: UrgeJournalEntry): void {
  try {
    const existing = readJournal();
    existing.push(entry);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(existing));
  } catch (err) {
    logger.warn('urgeJournal write failed', { error: err });
  }
}

// ─── Future-Self Letter ────────────────────────────────────────────────────

/** Letter shape: kept structured so the editor can render fields, but the
 *  Future-Self Letter mini-screen renders the combined message in flowing
 *  prose. `null` (vs a record with empty strings) signals "never written
 *  yet" so the action can show its first-time guided write flow. */
export interface FutureSelfLetter {
  /** "Three things that matter most to me" — comma-joined or freeform. */
  values: string;
  /** "Who I am becoming" — short identity statement. */
  identity: string;
  /** Free-form note from past-self to future-self. */
  message: string;
  /** ISO timestamp of last save. */
  updatedAt: string;
}

export function readLetter(): FutureSelfLetter | null {
  try {
    const raw = localStorage.getItem(LETTER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate the minimum shape so a partial/legacy record doesn't crash
    // the consumer.
    if (
      parsed &&
      typeof parsed.values === 'string' &&
      typeof parsed.identity === 'string' &&
      typeof parsed.message === 'string'
    ) {
      return parsed as FutureSelfLetter;
    }
    return null;
  } catch (err) {
    logger.warn('letter read failed', { error: err });
    return null;
  }
}

export function writeLetter(letter: Omit<FutureSelfLetter, 'updatedAt'>): void {
  try {
    const toStore: FutureSelfLetter = {
      ...letter,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LETTER_KEY, JSON.stringify(toStore));
  } catch (err) {
    logger.warn('letter write failed', { error: err });
  }
}
