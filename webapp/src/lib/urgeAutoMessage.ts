// Shared formatting for the "I want to talk it through" auto-send flow.
//
// Single source of truth so the visible user-message in chat, the system-
// prompt context block, and the urge-session divider all stay in sync.

import type { ChatMessage, FeelingId, UrgeActionId } from '../../types';
import { FEELINGS, URGE_ACTION_BY_ID } from '../../data/urgeData';

const FEELING_LABEL_BY_ID: Record<FeelingId, string> = Object.fromEntries(
  FEELINGS.map((f) => [f.id, f.label]),
) as Record<FeelingId, string>;

/** Format the auto-message sent to the Coach when the user picks
 *  "I want to talk it through". Adapts to missing pieces so an empty
 *  feeling/intensity/action set still produces a coherent message. */
export function buildUrgeAutoMessage(
  feeling: FeelingId | null,
  intensity: number | null,
  actionsTried: UrgeActionId[],
): string {
  const lines: string[] = ["I'm in the middle of an urge."];

  if (feeling) {
    const label = FEELING_LABEL_BY_ID[feeling].toLowerCase();
    lines.push(
      intensity != null ? `Feeling: ${label} (${intensity}/10).` : `Feeling: ${label}.`,
    );
  }

  if (actionsTried.length > 0) {
    const titles = actionsTried.map((id) => URGE_ACTION_BY_ID[id]?.title).filter(Boolean);
    if (titles.length > 0) {
      lines.push(`Tried: ${titles.join(' → ')}.`);
    }
  }

  lines.push('Still here — I want to talk it through.');
  return lines.join('\n');
}

/** Build the divider message inserted before an auto-send when prior chat
 *  exists. Content holds an ISO timestamp so the renderer can choose how
 *  to format it (relative time, absolute date for older sessions, etc.). */
export function createDividerMessage(now: Date = new Date()): ChatMessage {
  return { role: 'divider', content: now.toISOString() };
}

/** Render the label shown inside the divider rule. Uses `now` for the
 *  "today vs older" decision so callers can pass a fixed reference in tests. */
export function formatDividerLabel(isoTimestamp: string, now: Date = new Date()): string {
  const then = new Date(isoTimestamp);
  if (Number.isNaN(then.getTime())) return 'New urge session';

  const HOUR = 60 * 60 * 1000;
  const ageMs = now.getTime() - then.getTime();

  // <24h: time only. Older: include short date so the user can see when
  // the session happened without doing mental math.
  if (ageMs < 24 * HOUR && now.toDateString() === then.toDateString()) {
    return `New urge session · ${then.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }
  return `New urge session · ${then.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}, ${then.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}
