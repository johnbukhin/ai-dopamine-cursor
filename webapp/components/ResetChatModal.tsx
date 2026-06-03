import React, { useState } from 'react';
import { X, Loader2, Bookmark, Trash2 } from 'lucide-react';
import type { ChatMessage } from '../types';
import { resetCoachChat } from '../services/claudeService';

interface ResetChatModalProps {
  open: boolean;
  onClose: () => void;
  /** Current chat messages excluding the hardcoded welcome (parent passes
   *  the already-sliced array). Used for the "Save" summarize call. */
  messagesToSave: ChatMessage[];
  /** Called after a successful reset so the parent can clear local state
   *  back to the welcome message. */
  onResetComplete: () => void;
  /** Called if the reset hit the 402 quota cap so the parent can show its
   *  banner instead of the chat input. */
  onQuotaExceeded: (periodEndsAt: string | null) => void;
}

/**
 * Two-action modal that fronts /api/coach-reset (Issue #54, Scope 2).
 * Sync UX: "Saving…" state while the server summarizes; modal stays open
 * so the user gets explicit confirmation that the memory was written
 * before the chat clears.
 */
export const ResetChatModal: React.FC<ResetChatModalProps> = ({
  open,
  onClose,
  messagesToSave,
  onResetComplete,
  onQuotaExceeded,
}) => {
  const [busy, setBusy] = useState<'save' | 'discard' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleReset = async (save: boolean) => {
    setError(null);
    setBusy(save ? 'save' : 'discard');
    const result = await resetCoachChat(messagesToSave, save);
    setBusy(null);

    if (result.kind === 'text') {
      onResetComplete();
      onClose();
      return;
    }
    if (result.kind === 'quota_exceeded') {
      onQuotaExceeded(result.periodEndsAt);
      onClose();
      return;
    }
    setError(
      result.kind === 'auth_error'
        ? 'Please sign in again to reset your chat.'
        : 'Reset failed. Please try again.',
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reset chat"
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center
                 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={busy ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-3xl
                   max-h-[90vh] flex flex-col overflow-hidden shadow-2xl
                   animate-in slide-in-from-bottom-8 md:zoom-in-95 duration-300"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="text-base font-semibold text-purple-900">Start a new conversation</h2>
          <button
            onClick={onClose}
            disabled={busy !== null}
            aria-label="Close"
            className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors disabled:opacity-30"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            Your current chat will be cleared. Choose how the coach should handle what you've shared so far.
          </p>

          <button
            onClick={() => handleReset(true)}
            disabled={busy !== null || messagesToSave.length === 0}
            className="w-full flex items-start gap-3 p-4 border border-purple-200 rounded-xl
                       hover:bg-purple-50 hover:border-purple-300 transition-colors
                       text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              {busy === 'save' ? <Loader2 size={18} className="animate-spin" /> : <Bookmark size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-purple-900 text-sm">
                {busy === 'save' ? 'Saving…' : 'Save & start fresh'}
              </div>
              <div className="text-xs text-stone-600 mt-0.5 leading-snug">
                Compress this chat into a memory note. The coach will remember context next time.
              </div>
            </div>
          </button>

          <button
            onClick={() => handleReset(false)}
            disabled={busy !== null}
            className="w-full flex items-start gap-3 p-4 border border-stone-200 rounded-xl
                       hover:bg-stone-50 hover:border-stone-300 transition-colors
                       text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
              {busy === 'discard' ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-stone-800 text-sm">
                {busy === 'discard' ? 'Clearing…' : 'Discard & start fresh'}
              </div>
              <div className="text-xs text-stone-600 mt-0.5 leading-snug">
                Wipe this chat and any saved memory. The coach starts with a clean slate.
              </div>
            </div>
          </button>

          {error && (
            <p className="text-xs text-red-600 text-center" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
