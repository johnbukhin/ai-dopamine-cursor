import React, { useEffect, useState } from 'react';
import { Mail, Pencil, Loader2 } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { LetterEditor } from './LetterEditor';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';
import type { FutureSelfLetter, FutureSelfLetterDraft } from '../../src/lib/urgeLog';

interface ScreenProps {
  /** Letter for the signed-in user (Issue #65). `undefined` during the
   *  initial fetch — render a spinner so a returning user never sees the
   *  first-time-write UI flash. `null` means loaded but no letter exists
   *  yet → first-time guided write. Object means show + offer Edit. */
  letter: FutureSelfLetter | null | undefined;
  /** Persist a draft. App stamps `updatedAt` and fires the Supabase upsert
   *  best-effort; this screen flips back to display mode optimistically. */
  onSaveLetter: (draft: FutureSelfLetterDraft) => void;
  onDone: () => void;
  onBack: () => void;
}

/**
 * Future-Self Letter.
 *
 * Three states drive the UI:
 *   1. `letter === undefined` → loading spinner (initial fetch in flight).
 *   2. `letter === null` → first-time guided editor (3 fields). The act of
 *      writing it is already valuable — even if the user doesn't reach
 *      Reflect, they've done the introspective work.
 *   3. letter exists → display in calm prose with an Edit affordance, plus
 *      the standard "I read it" Done CTA from the shell.
 *
 * Persistence is owned by App.tsx via the `onSaveLetter` callback; this
 * screen is purely presentational + maintains the local edit-mode toggle.
 */
export const FutureSelfLetterScreen: React.FC<ScreenProps> = ({
  letter,
  onSaveLetter,
  onDone,
  onBack,
}) => {
  // Edit mode is local UI state. Auto-flips to true the first time we see
  // `letter === null` (first-time write) so the user lands directly in the
  // editor; the user can still toggle Edit on an existing letter manually.
  const [editing, setEditing] = useState<boolean>(false);
  useEffect(() => {
    if (letter === null) setEditing(true);
  }, [letter]);

  const handleSave = (draft: FutureSelfLetterDraft) => {
    onSaveLetter(draft);
    setEditing(false);
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (letter === undefined) {
    return (
      <ActionScreenShell
        action={URGE_ACTION_BY_ID.future_self_letter}
        icon={Mail}
        onDone={onDone}
        onBack={onBack}
        doneDisabled
        doneLabel="Loading…"
        hideDone
      >
        <div className="flex items-center justify-center py-16 text-rose-700/60">
          <Loader2 size={20} className="animate-spin" />
        </div>
      </ActionScreenShell>
    );
  }

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
