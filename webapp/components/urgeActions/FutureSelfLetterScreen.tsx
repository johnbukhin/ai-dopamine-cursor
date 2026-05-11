import React, { useState } from 'react';
import { Mail, Pencil } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { LetterEditor } from './LetterEditor';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';
import { readLetter, writeLetter, type FutureSelfLetter } from '../../src/lib/urgeLog';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

/**
 * Future-Self Letter.
 *
 * Two modes:
 *   1. First-time use → guided editor (3 fields). The act of writing it is
 *      already valuable — even if the user doesn't reach Reflect, they've
 *      done the introspective work.
 *   2. Letter exists → display in calm prose with an Edit affordance, plus
 *      the standard "I read it" Done CTA from the shell.
 *
 * Persistence is local-only via `urgeLog.ts`. The Settings tab also exposes
 * the same editor so users don't have to re-trigger the action to edit.
 */
export const FutureSelfLetterScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [letter, setLetter] = useState<FutureSelfLetter | null>(() => readLetter());
  const [editing, setEditing] = useState<boolean>(() => readLetter() === null);

  const handleSave = (next: Pick<FutureSelfLetter, 'values' | 'identity' | 'message'>) => {
    writeLetter(next);
    setLetter({ ...next, updatedAt: new Date().toISOString() });
    setEditing(false);
  };

  const isShowingLetter = !editing && letter !== null;

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.future_self_letter}
      icon={Mail}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={!isShowingLetter}
      doneLabel={isShowingLetter ? "I heard myself" : 'Save your letter first'}
      hideDone={editing}
    >
      {editing ? (
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-sm text-rose-800">
            Write this once. Future-you will read it the next time the urge shows up.
          </p>
          <LetterEditor
            initial={letter ?? { values: '', identity: '', message: '' }}
            onSave={handleSave}
          />
        </div>
      ) : letter ? (
        <article className="max-w-md mx-auto space-y-5 text-rose-900">
          <header className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-700/60">
              From past-you to right-now-you
            </p>
          </header>

          <div className="bg-white border border-rose-100 rounded-2xl p-5 space-y-4 shadow-sm">
            <section>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700/60 mb-1">
                What matters
              </p>
              <p className="text-base leading-relaxed">{letter.values}</p>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700/60 mb-1">
                Who you're becoming
              </p>
              <p className="text-base leading-relaxed">{letter.identity}</p>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700/60 mb-1">
                Your message
              </p>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{letter.message}</p>
            </section>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-sm text-rose-700/70 hover:text-rose-900 transition-colors mx-auto"
          >
            <Pencil size={12} />
            Edit letter
          </button>
        </article>
      ) : null}
    </ActionScreenShell>
  );
};
