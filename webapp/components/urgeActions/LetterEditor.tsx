import React, { useId, useState } from 'react';
import { Check } from 'lucide-react';
import type { FutureSelfLetter } from '../../src/lib/urgeLog';

type LetterDraft = Pick<FutureSelfLetter, 'values' | 'identity' | 'message'>;

interface LetterEditorProps {
  initial: LetterDraft;
  onSave: (letter: LetterDraft) => void;
  /** Override the default save-button copy ("Save letter") when a more
   *  specific verb fits the host context. */
  saveLabel?: string;
  /** Called after a successful save AND optional close — used by Settings to
   *  show a momentary success state. */
  onSaveSuccess?: () => void;
}

/**
 * Three-field editor for the Future-Self Letter.
 *
 * Lifted out of FutureSelfLetterScreen so the same component can be reused
 * by the Settings "Your Future-Self Letter" section. Single source of truth
 * for the field shape, validation, and copy.
 */
export const LetterEditor: React.FC<LetterEditorProps> = ({
  initial,
  onSave,
  saveLabel = 'Save letter',
  onSaveSuccess,
}) => {
  const [values, setValues] = useState(initial.values);
  const [identity, setIdentity] = useState(initial.identity);
  const [message, setMessage] = useState(initial.message);

  // Per-instance ID prefix so two LetterEditors mounted simultaneously
  // (e.g. Settings panel + an action screen modal in some future flow)
  // don't collide on `for`/`id` pairs.
  const baseId = useId();
  const valuesId = `${baseId}-values`;
  const identityId = `${baseId}-identity`;
  const messageId = `${baseId}-message`;

  const isValid =
    values.trim().length > 0 && identity.trim().length > 0 && message.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ values, identity, message });
    onSaveSuccess?.();
  };

  return (
    <div className="space-y-4">
      <section>
        <label
          htmlFor={valuesId}
          className="block text-xs font-bold uppercase tracking-wider text-rose-700/70 mb-1"
        >
          Three things that matter most to you
        </label>
        <input
          id={valuesId}
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder="e.g. my health, my partner, my work"
          className="w-full p-3 bg-white border border-rose-200 rounded-xl text-sm text-rose-900
                     placeholder-rose-400/60 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </section>

      <section>
        <label
          htmlFor={identityId}
          className="block text-xs font-bold uppercase tracking-wider text-rose-700/70 mb-1"
        >
          Who you are becoming
        </label>
        <input
          id={identityId}
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder="e.g. someone who keeps promises to themselves"
          className="w-full p-3 bg-white border border-rose-200 rounded-xl text-sm text-rose-900
                     placeholder-rose-400/60 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </section>

      <section>
        <label
          htmlFor={messageId}
          className="block text-xs font-bold uppercase tracking-wider text-rose-700/70 mb-1"
        >
          A message to yourself, in this exact moment
        </label>
        <textarea
          id={messageId}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Write what you need to hear right now."
          className="w-full p-3 bg-white border border-rose-200 rounded-xl text-sm text-rose-900
                     placeholder-rose-400/60 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </section>

      <button
        onClick={handleSave}
        disabled={!isValid}
        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                    font-semibold text-sm transition-all
                    ${
                      isValid
                        ? 'bg-rose-700 text-white shadow-md hover:bg-rose-800'
                        : 'bg-rose-200 text-rose-400 cursor-not-allowed'
                    }`}
      >
        <Check size={16} />
        {saveLabel}
      </button>
    </div>
  );
};
