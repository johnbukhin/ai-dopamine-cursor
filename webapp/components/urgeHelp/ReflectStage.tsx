import React, { useState } from 'react';
import { Sparkles, RotateCcw, MessageCircle } from 'lucide-react';
import type { UrgeOutcome } from '../../types';

interface ReflectStageProps {
  /** Total count of completed surfs INCLUDING this one. Drives the
   *  celebration copy ("Surf #N done") so the user feels the streak. */
  totalSurfsAfterThisOne: number;
  onChoose: (outcome: UrgeOutcome) => void;
}

/**
 * Stage 4 — Reflect.
 *
 * Three options, deliberately phrased as outcomes the user *experienced*
 * rather than buttons they're judging themselves with:
 *   • "Yes, it passed"   — fires the micro-celebration and returns to Pause
 *   • "Still here"       — back to the action grid with prior actions
 *                          marked, so the user knows what they've already
 *                          tried this session
 *   • "I want to talk"   — opens the AI Coach modal pre-seeded with context
 *
 * The micro-celebration that follows "passed" lives in the orchestrator
 * (single source of truth), but this screen owns the moment of choice and
 * the gentle wrap-up copy.
 */
export const ReflectStage: React.FC<ReflectStageProps> = ({ totalSurfsAfterThisOne, onChoose }) => {
  // Local lock so a fast double-tap doesn't fire two log writes.
  const [submitted, setSubmitted] = useState(false);
  const handle = (outcome: UrgeOutcome) => {
    if (submitted) return;
    setSubmitted(true);
    onChoose(outcome);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28 md:pb-8 animate-in fade-in duration-300">
      <div className="px-4 md:px-6 max-w-md mx-auto">
        <header className="text-center mt-12 md:mt-14 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-rose-900 mb-2">
            How are you now?
          </h2>
          <p className="text-sm md:text-base text-rose-700/80">
            Whatever you say, this counts. Showing up for the urge is the work.
          </p>
        </header>

        <div className="space-y-3">
          <button
            onClick={() => handle('passed')}
            disabled={submitted}
            className="w-full p-5 rounded-2xl bg-rose-700 text-white shadow-md hover:bg-rose-800
                       transition-all active:scale-[0.99] disabled:opacity-60 text-left flex items-center gap-3"
          >
            <Sparkles size={24} className="flex-shrink-0" />
            <div>
              <div className="font-bold text-base md:text-lg">Yes, it passed</div>
              <div className="text-xs text-rose-100">
                You'll be Surf #{totalSurfsAfterThisOne} on your record.
              </div>
            </div>
          </button>

          <button
            onClick={() => handle('still_here')}
            disabled={submitted}
            className="w-full p-5 rounded-2xl bg-white border-2 border-rose-300 text-rose-900
                       hover:bg-rose-50 transition-all active:scale-[0.99] disabled:opacity-60 text-left flex items-center gap-3"
          >
            <RotateCcw size={24} className="flex-shrink-0 text-rose-700" />
            <div>
              <div className="font-bold text-base md:text-lg">Still here</div>
              <div className="text-xs text-rose-700/70">Try another action — no shame, this is normal.</div>
            </div>
          </button>

          <button
            onClick={() => handle('escalated')}
            disabled={submitted}
            className="w-full p-5 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900
                       hover:bg-purple-100 transition-all active:scale-[0.99] disabled:opacity-60 text-left flex items-center gap-3"
          >
            <MessageCircle size={24} className="flex-shrink-0 text-purple-700" />
            <div>
              <div className="font-bold text-base md:text-lg">I want to talk it through</div>
              <div className="text-xs text-purple-700/70">Open the Coach with your context.</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
