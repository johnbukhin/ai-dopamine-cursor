import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { UrgeAction } from '../../types';
import { URGE_CATEGORY_META } from '../../data/urgeData';

interface ActionScreenShellProps {
  action: UrgeAction;
  /** Visual icon for the header — passed in by the registry so it stays in
   *  sync with the Act-stage card icons. */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Tap target for "I did this" — closes the screen and advances to Reflect. */
  onDone: () => void;
  /** Tap target for "Back" — returns to the Act grid without advancing. */
  onBack: () => void;
  /** When true, the "Done" CTA is shown but disabled. Used by screens that
   *  complete passively (e.g. timer screens where the timer must finish). */
  doneDisabled?: boolean;
  /** Override the default "I did this" copy when a more natural verb fits
   *  (e.g. "I'm done writing" on the journal screen). */
  doneLabel?: string;
  /** When true, hide the Done CTA entirely. Useful for screens that handle
   *  their own completion via a custom button (e.g. the journal Save). */
  hideDone?: boolean;
  children: React.ReactNode;
}

/**
 * Shared wrapper for every action mini-screen.
 *
 * Provides one consistent visual + interaction shell so the user learns the
 * pattern once and never has to re-orient: header up top with icon + title +
 * "why it works", interactive content in the middle, "Back" + "I did this"
 * footer pinned to the bottom of the viewport on mobile.
 *
 * The category tint colours the icon badge so screens within the same
 * category (Reset / Ground / Protect / Reframe) feel like siblings.
 */
export const ActionScreenShell: React.FC<ActionScreenShellProps> = ({
  action,
  icon: Icon,
  onDone,
  onBack,
  doneDisabled,
  doneLabel = 'I did this',
  hideDone,
  children,
}) => {
  const meta = URGE_CATEGORY_META[action.category];

  return (
    // Animation keeps the entrance direction consistent across all 10
    // screens so the user perceives "going deeper" into a single flow,
    // not jumping into separate features.
    <div className="flex-1 flex flex-col bg-rose-50 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <header className="px-4 md:px-6 pt-4 md:pt-6 pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-rose-700/70 hover:text-rose-900 text-sm font-medium mb-4 transition-colors"
          aria-label="Back to actions"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-start gap-3 mb-1">
          <div
            className={`flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl
                        ${meta.tint} ${meta.accent}`}
          >
            <Icon size={22} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-xl md:text-2xl font-bold text-rose-900 leading-tight">
              {action.title}
            </h2>
            <p className="text-xs md:text-sm text-rose-700/70 mt-0.5">{action.whyItWorks}</p>
          </div>
        </div>
      </header>

      {/* Interactive area — scrolls if a screen needs it (e.g. letter editor) */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">{children}</div>

      {/* Footer CTA — pinned, with safe spacing for the mobile nav */}
      {!hideDone && (
        <footer className="px-4 md:px-6 py-3 pb-[5.5rem] md:pb-4 bg-rose-50 border-t border-rose-100">
          <button
            onClick={onDone}
            disabled={doneDisabled}
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                        font-semibold text-sm shadow-md transition-all
                        ${
                          doneDisabled
                            ? 'bg-rose-200 text-rose-400 cursor-not-allowed'
                            : 'bg-rose-700 text-white hover:bg-rose-800 active:scale-[0.99]'
                        }`}
          >
            <Check size={18} />
            <span>{doneLabel}</span>
          </button>
        </footer>
      )}
    </div>
  );
};
