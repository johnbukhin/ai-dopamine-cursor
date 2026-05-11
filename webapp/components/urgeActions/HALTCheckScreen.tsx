import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

type HaltKey = 'hungry' | 'angry' | 'lonely' | 'tired';

const OPTIONS: { key: HaltKey; label: string; emoji: string }[] = [
  { key: 'hungry', label: 'Hungry', emoji: '🍎' },
  { key: 'angry', label: 'Angry', emoji: '😤' },
  { key: 'lonely', label: 'Lonely', emoji: '🫥' },
  { key: 'tired', label: 'Tired', emoji: '😴' },
];

/**
 * Recommendation per HALT axis. We surface ONE merged recommendation rather
 * than four independent ones — in a crisis, one clear next action is more
 * useful than a list. Priority order (Hungry > Tired > Angry > Lonely) is
 * based on which need most reliably amplifies cravings when unmet.
 */
const RECS: Record<HaltKey, { headline: string; body: string }> = {
  hungry: {
    headline: 'Eat something first.',
    body: 'Hunger amplifies cravings 2–3×. Even a small snack flips this. Then come back.',
  },
  tired: {
    headline: 'Your willpower is empty.',
    body: 'Sleep debt destroys impulse control. A 20-min nap or a real bedtime is the move — not gritting through.',
  },
  angry: {
    headline: 'The anger needs an exit.',
    body: 'Walk fast for 10 minutes, hit a pillow, or write what you wish you could say. Discharge first.',
  },
  lonely: {
    headline: 'You need a person, not a pixel.',
    body: 'Text one human you trust right now — even a quick "thinking of you". Connection is the actual fix.',
  },
};

const PRIORITY: HaltKey[] = ['hungry', 'tired', 'angry', 'lonely'];

/**
 * HALT check — Hungry / Angry / Lonely / Tired.
 *
 * Classic addiction-recovery primer that surfaces the unmet need driving
 * the urge. Often the urge isn't really about the urge — it's a hunger or
 * exhaustion signal that's been mis-routed. Naming the actual need takes
 * the edge off and points at a real fix.
 */
export const HALTCheckScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [picked, setPicked] = useState<Set<HaltKey>>(new Set());

  const toggle = (key: HaltKey) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Decide which recommendation to show. Highest-priority picked option
  // wins. If nothing is picked yet, no recommendation is shown.
  const topPick = PRIORITY.find((k) => picked.has(k));
  const rec = topPick ? RECS[topPick] : null;

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.halt_check}
      icon={Activity}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={picked.size === 0}
      doneLabel={picked.size === 0 ? 'Tick at least one' : 'I see what this is'}
    >
      <div className="max-w-md mx-auto">
        <p className="text-sm text-rose-800 mb-4 text-center">
          Tick anything you are right now. Be honest.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {OPTIONS.map((o) => {
            const isOn = picked.has(o.key);
            return (
              <button
                key={o.key}
                onClick={() => toggle(o.key)}
                aria-pressed={isOn}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                            ${
                              isOn
                                ? 'bg-rose-100 border-rose-500 shadow-md'
                                : 'bg-white border-rose-100 hover:border-rose-300'
                            }`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {o.emoji}
                </span>
                <span className="font-semibold text-rose-900">{o.label}</span>
              </button>
            );
          })}
        </div>

        {rec && (
          <div className="bg-rose-700 text-white p-5 rounded-2xl shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="font-bold text-lg mb-1">{rec.headline}</p>
            <p className="text-sm text-rose-100 leading-relaxed">{rec.body}</p>
            {picked.size > 1 && (
              <p className="text-xs text-rose-200 mt-3 italic">
                More than one ticked? Start with this — the rest will get easier once it's
                handled.
              </p>
            )}
          </div>
        )}
      </div>
    </ActionScreenShell>
  );
};
