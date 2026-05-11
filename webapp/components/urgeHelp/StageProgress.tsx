import React from 'react';

/** The four stages of the redesigned Help journey. The order is fixed and
 *  the user is always on exactly one of these at any moment. */
export type Stage = 'pause' | 'locate' | 'act' | 'reflect';

const STAGES: { id: Stage; label: string }[] = [
  { id: 'pause', label: 'Pause' },
  { id: 'locate', label: 'Locate' },
  { id: 'act', label: 'Act' },
  { id: 'reflect', label: 'Reflect' },
];

interface StageProgressProps {
  current: Stage;
}

/**
 * Slim wizard-style progress indicator pinned to the top of every Help stage.
 *
 * Shows where the user is in the 4-stage journey (Pause → Locate → Act →
 * Reflect) so they understand the structure of the experience and feel
 * forward motion. Visual language mirrors Plan tab tokens (rounded pills,
 * soft shadow, rose accent for the active step matching the emergency
 * context). Decorative only — never receives focus.
 */
export const StageProgress: React.FC<StageProgressProps> = ({ current }) => {
  const currentIdx = STAGES.findIndex((s) => s.id === current);

  return (
    <>
      {/* Screen-reader-only stage announcement. The visual pill row below
          is decorative; SR users get a single clear "where am I" line
          instead of having every stage label announced as text. */}
      <p className="sr-only" aria-live="polite">
        Stage {currentIdx + 1} of {STAGES.length}: {STAGES[currentIdx].label}
      </p>

      <div
        role="presentation"
        aria-hidden="true"
        className="flex items-center justify-center gap-2 px-4 pt-4 md:pt-6"
      >
      {STAGES.map((s, i) => {
        const isCurrent = i === currentIdx;
        const isDone = i < currentIdx;

        return (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isCurrent
                    ? 'bg-rose-700 ring-4 ring-rose-200'
                    : isDone
                      ? 'bg-rose-500'
                      : 'bg-rose-200'
                }`}
              />
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  isCurrent ? 'text-rose-800' : isDone ? 'text-rose-600' : 'text-rose-300'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <span
                className={`h-px w-4 md:w-6 transition-colors ${
                  isDone ? 'bg-rose-400' : 'bg-rose-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
      </div>
    </>
  );
};
