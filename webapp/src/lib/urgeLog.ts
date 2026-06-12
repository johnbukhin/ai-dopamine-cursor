// Storage helpers for the redesigned Help tab (Issue #34).
//
// The urge LOG migrated to Supabase in Issue #64 — see `urge_log` table and
// the `fetchLog` / `insertEntry` helpers below. The Letter and Journal
// sections remain on localStorage for now; #65 and #66 will migrate them.

import type { UrgeLogEntry, UrgeOutcome } from '../../types';
import { supabase } from './supabase';
import { logger } from './logger';

const LOG_KEY = 'mc.urge_log.v1';
const LETTER_KEY = 'mc.future_self_letter.v1';
const JOURNAL_KEY = 'mc.urge_journal.v1';

// ─── Urge log (Supabase-backed) ─────────────────────────────────────────────

/** DB-row shape for `urge_log`. snake_case to match the Supabase column names. */
interface UrgeLogRow {
  id: number;
  ended_at: string;
  feeling: string | null;
  intensity: number | null;
  actions_tried: string[] | null;
  outcome: UrgeOutcome;
}

function rowToEntry(row: UrgeLogRow): UrgeLogEntry {
  return {
    id: row.id,
    endedAt: row.ended_at,
    feeling: (row.feeling ?? null) as UrgeLogEntry['feeling'],
    intensity: row.intensity,
    actionsTried: (row.actions_tried ?? []) as UrgeLogEntry['actionsTried'],
    outcome: row.outcome,
  };
}

function entryToRow(userId: string, entry: UrgeLogEntry) {
  return {
    id: entry.id,
    user_id: userId,
    ended_at: entry.endedAt,
    feeling: entry.feeling,
    intensity: entry.intensity,
    actions_tried: entry.actionsTried,
    outcome: entry.outcome,
  };
}

/** Fetch the full log for a user, oldest first. Returns [] on any failure
 *  so callers don't have to defensively try/catch around the read. */
export async function fetchLog(userId: string): Promise<UrgeLogEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('urge_log')
    .select('id, ended_at, feeling, intensity, actions_tried, outcome')
    .eq('user_id', userId)
    .order('ended_at', { ascending: true });
  if (error) {
    logger.warn('urge_log fetch failed', { error });
    return [];
  }
  return (data ?? []).map((row) => rowToEntry(row as UrgeLogRow));
}

/** Insert a single entry. Best-effort — errors are logged, not thrown,
 *  because the urge UX must never block on a network write. */
export async function insertEntry(userId: string, entry: UrgeLogEntry): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('urge_log').insert(entryToRow(userId, entry));
  if (error) logger.warn('urge_log insert failed', { error });
}

// ─── One-shot localStorage → Supabase migration helpers ─────────────────────

/** Read any pending entries written by the pre-#64 localStorage path.
 *  Returns [] if nothing migratable or the JSON is corrupt. */
export function readLocalLog(): UrgeLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UrgeLogEntry[]) : [];
  } catch (err) {
    logger.warn('urgeLog local read failed', { error: err });
    return [];
  }
}

/** Drop the pre-#64 localStorage key. Safe to call when the key is absent. */
export function clearLocalLog(): void {
  try {
    localStorage.removeItem(LOG_KEY);
  } catch (err) {
    logger.warn('urgeLog local clear failed', { error: err });
  }
}

/** Bulk-upsert local entries into Supabase. Idempotent: the (user_id, id)
 *  composite PK makes re-running this safe. Returns true only when the
 *  upsert succeeded, so the caller knows it's safe to clear the local key. */
export async function uploadLocalLog(
  userId: string,
  entries: UrgeLogEntry[],
): Promise<boolean> {
  if (!supabase || entries.length === 0) return false;
  const { error } = await supabase
    .from('urge_log')
    .upsert(entries.map((e) => entryToRow(userId, e)), { onConflict: 'user_id,id' });
  if (error) {
    logger.warn('urge_log bulk upload failed', { error });
    return false;
  }
  return true;
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
