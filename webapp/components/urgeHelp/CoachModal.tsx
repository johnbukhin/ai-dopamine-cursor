import React from 'react';
import { X, Brain } from 'lucide-react';
import type { CheckIn, ChatMessage, UrgeContextSeed } from '../../types';
import { AICoach } from '../AICoach';

interface CoachModalProps {
  open: boolean;
  onClose: () => void;
  /** Live urge state passed through to AICoach so the system prompt is
   *  seeded with feeling/intensity/action/elapsed. */
  seed: UrgeContextSeed | null;
  // Same coach state the App owns — keeps the modal session continuous
  // with the dedicated Coach view (no parallel conversations).
  checkInHistory: CheckIn[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

/**
 * Slide-up sheet wrapping the existing AICoach component.
 *
 * Designed so the user never leaves the Help flow when they need backup —
 * the urge-session state stays intact behind the modal, and dismissing
 * returns them to whatever stage they were on.
 *
 * Mobile: full-width sheet that fills the bottom 90% of the screen.
 * Desktop: centered card with a max-width.
 */
export const CoachModal: React.FC<CoachModalProps> = ({
  open,
  onClose,
  seed,
  checkInHistory,
  messages,
  setMessages,
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Coach"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center
                 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        // Stop click propagation so taps inside the sheet don't dismiss it.
        onClick={(e) => e.stopPropagation()}
        className="bg-purple-50 w-full md:max-w-2xl md:rounded-2xl rounded-t-3xl
                   max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl
                   animate-in slide-in-from-bottom-8 md:zoom-in-95 duration-300"
      >
        {/* Compact header — matches the AICoach palette so it doesn't feel
            like a different surface. */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-purple-100 border-b border-purple-200">
          <div className="flex items-center gap-2">
            <div className="bg-purple-700 text-white p-1.5 rounded-lg">
              <Brain size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900 leading-tight">Coach</p>
              <p className="text-[10px] text-purple-700/70 leading-tight">
                {seed ? "Has your urge context · keeps your Help flow open" : 'Always here'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close coach"
            className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-200 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          <AICoach
            checkInHistory={checkInHistory}
            messages={messages}
            setMessages={setMessages}
            currentUrgeContext={seed}
            compact
          />
        </div>
      </div>
    </div>
  );
};
