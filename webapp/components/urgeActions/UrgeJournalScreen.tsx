import React, { useState } from 'react';
import { PenTool, Check } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';
import { appendJournal } from '../../src/lib/urgeLog';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

const TRIGGER_CHIPS = [
  'Phone',
  'Boredom',
  'Late night',
  'Stress',
  'Loneliness',
  'Conflict',
  'Specific memory',
  'Other',
];

/**
 * Urge Journal — 3 quick fields.
 *
 * The act of putting words to the urge weakens it (affect labeling). We
 * keep the form micro-light: chip-based trigger picker, an optional 1-10
 * intensity slider, and a single short note field. No required fields,
 * because in a crisis the user shouldn't have to fight a form.
 *
 * Note: the journal output is currently visualized only via Done. Future-
 * iteration: surface in Dashboard or Coach context. Out-of-scope for #34.
 */
export const UrgeJournalScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [trigger, setTrigger] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [note, setNote] = useState('');

  // No hard requirement — but Done is dimmed until at least one field has
  // signal so the user knows something's expected.
  const hasContent = trigger !== null || note.trim().length > 0;

  /** Persist the journal entry to localStorage before the orchestrator
   *  closes the screen. Wrapping `onDone` so the caller stays unchanged. */
  const handleDone = () => {
    if (!hasContent) return;
    const now = Date.now();
    appendJournal({
      id: now,
      savedAt: new Date(now).toISOString(),
      trigger,
      intensity,
      note: note.trim(),
    });
    onDone();
  };

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.urge_journal}
      icon={PenTool}
      onDone={handleDone}
      onBack={onBack}
      doneDisabled={!hasContent}
      doneLabel={hasContent ? "I named it" : 'Add a trigger or note'}
    >
      <div className="max-w-md mx-auto space-y-5">
        {/* Trigger chips */}
        <section>
          <label className="block text-xs font-bold uppercase tracking-wider text-rose-700/70 mb-2">
            What triggered it?
          </label>
          <div className="flex flex-wrap gap-2">
            {TRIGGER_CHIPS.map((chip) => {
              const isOn = trigger === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setTrigger(isOn ? null : chip)}
                  aria-pressed={isOn}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                              ${
                                isOn
                                  ? 'bg-rose-700 text-white shadow-sm'
                                  : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                              }`}
                >
                  {isOn && <Check size={12} className="inline mr-1" />}
                  {chip}
                </button>
              );
            })}
          </div>
        </section>

        {/* Intensity */}
        <section className="bg-white border border-rose-100 rounded-2xl p-4">
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-rose-700/70">
              Intensity
            </label>
            <span className="text-sm font-bold text-rose-900 tabular-nums">{intensity}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
            className="w-full accent-rose-700"
          />
        </section>

        {/* Note */}
        <section>
          <label
            htmlFor="urge-journal-note"
            className="block text-xs font-bold uppercase tracking-wider text-rose-700/70 mb-2"
          >
            One sentence (optional)
          </label>
          <textarea
            id="urge-journal-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What were you doing? What were you avoiding?"
            rows={3}
            className="w-full p-3 bg-white border border-rose-200 rounded-xl text-sm text-rose-900
                       placeholder-rose-400/60 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </section>
      </div>
    </ActionScreenShell>
  );
};
