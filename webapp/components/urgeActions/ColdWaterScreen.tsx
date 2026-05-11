import React, { useState } from 'react';
import { Droplets, Check } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

const STEPS = [
  { title: 'Walk to the sink', body: 'Stand up. Move now — momentum is most of the work.' },
  {
    title: '30 seconds of cold water on your face',
    body: 'Aim for the area around your eyes. The colder the better.',
  },
  {
    title: 'Notice the reset',
    body: "You'll feel your heart rate drop within seconds. That's the diving reflex — the fastest reset your body has.",
  },
] as const;

/**
 * Cold water — guided 3-step instructional screen.
 *
 * We can't enforce that the user actually walks to the sink, but we can
 * make the path frictionless: one tap per step, encouraging copy, and a
 * final "How do you feel?" check that converts the experience into a
 * tangible result. Each tap produces a small dopamine hit that competes
 * with the urge.
 */
export const ColdWaterScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const isLast = stepIdx === STEPS.length - 1;

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.cold_water}
      icon={Droplets}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={!isLast}
    >
      <ol className="space-y-3 max-w-md mx-auto" aria-label="Cold water reset steps">
        {STEPS.map((s, i) => {
          const done = i < stepIdx;
          const current = i === stepIdx;
          return (
            <li
              key={i}
              className={`p-4 rounded-2xl border-2 transition-all
                          ${
                            current
                              ? 'bg-white border-rose-500 shadow-md'
                              : done
                                ? 'bg-rose-50 border-rose-200 opacity-70'
                                : 'bg-white border-rose-100 opacity-50'
                          }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                              ${
                                done
                                  ? 'bg-rose-700 text-white'
                                  : current
                                    ? 'bg-rose-700 text-white'
                                    : 'bg-rose-100 text-rose-400'
                              }`}
                >
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-900 text-sm md:text-base">{s.title}</h4>
                  <p className="text-xs md:text-sm text-rose-700/70 mt-1">{s.body}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {!isLast && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1))}
            className="px-6 py-2.5 bg-white border border-rose-300 text-rose-800 rounded-xl
                       text-sm font-semibold hover:bg-rose-50 transition-colors"
          >
            Next step
          </button>
        </div>
      )}
    </ActionScreenShell>
  );
};
