import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, User as UserIcon, RotateCcw } from 'lucide-react';
import { getCoachResponse, FALLBACK_COPY } from '../services/claudeService';
import { CheckIn, ChatMessage, UrgeContextSeed } from '../types';
import { URGE_ACTION_BY_ID } from '../data/urgeData';
import { supabase } from '../src/lib/supabase';
import { CoachLighthouse } from './HeroVariants';
import { ResetChatModal } from './ResetChatModal';
import { COACH_WELCOME_MESSAGE, COACH_STARTER_PROMPTS, COACH_QUICK_REPLIES } from '../constants';
import { createDividerMessage, formatDividerLabel } from '../src/lib/urgeAutoMessage';

interface AICoachProps {
    checkInHistory: CheckIn[];
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    /** When present, the Coach is being invoked from inside the Help flow.
     *  We augment the system context with the live urge state so Claude's
     *  first response is targeted instead of generic. */
    currentUrgeContext?: UrgeContextSeed | null;
    /** When set (Help-flow auto-send path), AICoach injects this as the first
     *  user message on mount — preceded by a divider if the chat is non-empty.
     *  Captured by reference once at mount; later prop changes do nothing.
     *  See Issue #61. */
    autoMessage?: string | null;
    /** When true, render in compact "embedded" mode (no edge-to-edge header
     *  image, less vertical chrome). Used by the Help-tab CoachModal. */
    compact?: boolean;
}

/** Format the urge context seed into a compact block the Claude system
 *  prompt can read. Returns an empty string when there's nothing to add,
 *  so the existing recentHistory flow is unaffected for non-urge sessions. */
function formatUrgeContext(seed: UrgeContextSeed | null | undefined): string {
    if (!seed) return '';
    const actionTitles = seed.actionsTried
        .map((id) => URGE_ACTION_BY_ID[id]?.title)
        .filter(Boolean);
    const lines = [
        'ACTIVE URGE SESSION (user opened the Help tab and is currently mid-flow):',
        `- Stage: ${seed.stage}`,
        seed.feeling ? `- Named feeling: ${seed.feeling}` : '- Named feeling: (none yet)',
        seed.intensity != null ? `- Self-reported intensity: ${seed.intensity}/10` : null,
        actionTitles.length > 0
            ? `- Actions tried this session (in order): ${actionTitles.join(' → ')}`
            : null,
        `- Time on Help tab so far: ${seed.elapsedSec}s`,
        "Respond in urge mode: one grounding action + one reframe sentence. Don't suggest an action they've already tried.",
    ].filter(Boolean);
    return lines.join('\n');
}

/** Strip UI-only dividers before anything that goes to the Anthropic API or
 *  to /api/coach-reset — both reject any role other than 'user'/'assistant'. */
function withoutDividers(msgs: ChatMessage[]): ChatMessage[] {
    return msgs.filter((m) => m.role !== 'divider');
}

export const AICoach: React.FC<AICoachProps> = ({ checkInHistory, messages, setMessages, currentUrgeContext, autoMessage, compact = false }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  // When the server returns 402, we lock the input area to a banner. The
  // ISO string lets us format the "Resets on Mar 4, 2026" copy.
  const [quotaEndsAt, setQuotaEndsAt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Generation counter — bumped on reset so a Coach response that arrives
  // AFTER the user already reset the chat doesn't persist its (now stale)
  // messages back to the freshly-wiped `coach_messages` row.
  // (Peer-review MEDIUM #1.)
  const chatGenRef = useRef(0);

  // Auto-send guard. The "I want to talk it through" path mounts AICoach
  // with an `autoMessage` prop — we fire it exactly once per mount so
  // StrictMode double-effect or a parent re-render can't re-send.
  const autoSentRef = useRef(false);

  // Auto-scroll to the latest message only when a NEW message arrives.
  // Skipping the initial mount keeps the hero header visible on first open.
  const prevMessagesLengthRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Send a message, optionally pre-filled from a chip click or the urge
  // auto-send effect. `prependedDivider` lets the auto-send path insert a
  // session marker IN THE SAME state update as the user message — otherwise
  // a second setMessages would race with messagesRef and persist a chat
  // missing either the divider or the user message.
  const handleSend = async (override?: string, prependedDivider?: ChatMessage) => {
    const userMsg = (override ?? input).trim();
    if (!userMsg || isLoading || quotaEndsAt) return;

    if (!override) setInput('');
    setMessages(prev => [
      ...prev,
      ...(prependedDivider ? [prependedDivider] : []),
      { role: 'user', content: userMsg },
    ]);
    setIsLoading(true);

    // Capture identity at call time so racy state changes (chat reset, sign-
    // out, sign-in as another user) can't corrupt this call's persist write.
    const startGen = chatGenRef.current;
    const startUserId = supabase
      ? (await supabase.auth.getUser()).data.user?.id ?? null
      : null;

    // Build context summary from check-in history (last 5 entries) — passed as
    // system-prompt context, separate from chat history. When the Coach is
    // invoked from a live urge session, prepend the urge seed so Claude's
    // first reply is grounded in the actual moment.
    const checkInBlock = checkInHistory.slice(-5).map(c =>
        `Date: ${c.date.toDateString()}, Status: ${c.status}, Emotions: ${c.emotions.join(',')}`
    ).join('; ');
    const urgeBlock = formatUrgeContext(currentUrgeContext);
    const recentHistory = urgeBlock
        ? `${urgeBlock}\n\nRECENT CHECK-INS:\n${checkInBlock}`
        : checkInBlock;

    // Pass the last 10 chat messages so Claude has multi-turn memory.
    // Drop index 0 (hardcoded welcome message — never sent to the model).
    // Strip dividers BEFORE the slice so they don't occupy slots in the
    // 10-message window (and the API would reject role='divider' anyway).
    const chatHistory = withoutDividers(messagesRef.current.slice(1)).slice(-10);

    const result = await getCoachResponse(userMsg, recentHistory, chatHistory);
    setIsLoading(false);

    // 402 → flip into quota-locked state. The chat history we already
    // appended stays — the user sees their own message, then the banner
    // replaces the input area.
    if (result.kind === 'quota_exceeded') {
      setQuotaEndsAt(result.periodEndsAt);
      return;
    }

    const assistantText =
      result.kind === 'text' ? result.text
      : result.kind === 'auth_error' ? FALLBACK_COPY.coach.auth
      : result.message === 'rate_limit' ? FALLBACK_COPY.coach.rateLimit
      : result.message === 'empty' ? FALLBACK_COPY.coach.empty
      : FALLBACK_COPY.coach.server;
    const assistantMsg: ChatMessage = { role: 'assistant', content: assistantText };
    setMessages(prev => [...prev, assistantMsg]);

    // Persist to Supabase — fire-and-forget, never blocks UI.
    // Reconstruct the full conversation from the closure: messages (captured
    // at handleSend call time, excludes the divider + userMsg we just appended)
    // + divider (if any) + userMsg + assistantMsg.
    // Slice off index 0 (hardcoded welcome message — never stored in DB).
    // Only persist real Claude responses; don't write fallback strings to DB.
    //
    // Divider IS persisted — it's part of the chat history so the user sees
    // their past urge sessions when they reopen the Coach later.
    //
    // Two race-condition guards (peer review):
    //   1. chatGenRef bumped on reset — skip persist if the chat was reset
    //      while this response was in flight.
    //   2. user.id must match the id captured at handleSend start — skip
    //      persist if the user logged out / a different user signed in.
    if (supabase && result.kind === 'text') {
      const toStore: ChatMessage[] = [
        ...messagesRef.current,
        ...(prependedDivider ? [prependedDivider] : []),
        { role: 'user' as const, content: userMsg },
        assistantMsg,
      ].slice(1);

      (async () => {
        if (chatGenRef.current !== startGen) return;
        const { data: { user } } = await supabase!.auth.getUser();
        if (!user || user.id !== startUserId) return;
        await supabase!.from('coach_messages').upsert(
          { user_id: user.id, messages: toStore, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      })();
    }
  };

  const formatMessage = (content: string) => {
    return content.split(/(\*\*.*?\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Reset handler — clears chat back to the welcome message after a successful
  // /api/coach-reset call. Quota-on-reset is handled inside the modal which
  // calls onQuotaExceeded → we lock the input here too.
  // Bumping chatGenRef invalidates any in-flight handleSend's persist closure
  // (peer-review MEDIUM #1) so a stale response can't resurrect the wiped row.
  const handleResetComplete = () => {
    chatGenRef.current += 1;
    setMessages([COACH_WELCOME_MESSAGE]);
  };

  // ── Urge auto-send (Issue #61) ────────────────────────────────────────
  // When opened from "I want to talk it through", the parent passes the
  // pre-built auto-message. We fire it exactly once per mount:
  //   - skip the welcome (compact mode hides it via skipWelcome below)
  //   - if chat is non-empty, insert a session divider before the user message
  //   - then call handleSend, which handles loading, API, persist, fallback
  useEffect(() => {
    if (!autoMessage || autoSentRef.current) return;
    autoSentRef.current = true;
    // Count NON-welcome, NON-divider real turns. The chat starts with the
    // hardcoded welcome at index 0; everything past that is real history.
    const realTurnCount = messagesRef.current
      .slice(1)
      .filter((m) => m.role !== 'divider').length;
    const divider = realTurnCount > 0 ? createDividerMessage() : undefined;
    handleSend(autoMessage, divider);
    // handleSend is stable enough for this purpose and listing it as a dep
    // would cause re-fires when checkInHistory / messages change mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMessage]);

  // ── Derived UI flags ──────────────────────────────────────────────────
  // In the compact + autoMessage path, suppress the welcome bubble — the
  // user came in from the Help flow and the very first thing they should
  // see is their own context message + Coach's urge-mode reply.
  const skipWelcome = compact && autoMessage != null;
  // "Empty" = only the welcome turn present. Dividers are UI-only and never
  // appear without a user/assistant pair around them, so we can ignore them
  // here without an extra filter.
  const isEmpty = !skipWelcome && messages.length === 1;
  const lastMessage = messages[messages.length - 1];
  const showQuickReplies =
    !isEmpty
    && !isLoading
    && !quotaEndsAt
    && lastMessage?.role === 'assistant'
    && !input.trim();

  return (
    <div className="flex flex-col h-full bg-purple-50">
      <div className={`flex-1 overflow-y-auto ${compact ? 'pb-4' : 'pb-28 md:pb-4'}`} ref={scrollRef}>
        {/* Hand-drawn SVG hero — shares the cross-tab HeroVariants visual style.
            Hidden in compact (modal) mode where the host provides its chrome. */}
        {!compact && (
          <div className="w-full relative mb-6">
            <CoachLighthouse />
            <div className="absolute top-[41px] md:top-[57px] left-4 md:left-8 pointer-events-none">
              <span className="text-xs md:text-sm font-bold text-purple-700/80 uppercase tracking-wider">
                Mentor
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-purple-900 mt-1 drop-shadow-sm">
                Your AI Coach
              </h2>
            </div>
          </div>
        )}

        <div className={`px-4 space-y-4 max-w-4xl mx-auto ${compact ? 'pt-2' : ''}`}>
          {/* Reset chat button — small, right-aligned, above the messages.
              Visible in both Coach-tab and CoachModal modes; only shown
              once there's at least one real message worth resetting. */}
          {!isEmpty && (
            <div className="flex justify-center -mt-10 mb-2">
              <button
                onClick={() => setShowResetModal(true)}
                disabled={isLoading}
                aria-label="Start a new conversation"
                className="animate-coach-reset-pulse flex items-center gap-2 text-sm font-semibold
                           bg-white border-2 hover:bg-purple-50
                           px-4 py-2 rounded-full shadow-sm
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                <RotateCcw size={16} />
                <span>New conversation</span>
              </button>
            </div>
          )}

          {messages.map((m, i) => {
            // Hide the welcome bubble in the Help-modal auto-send flow so the
            // user lands on their own context message, not a generic greeting.
            if (skipWelcome && i === 0) return null;
            if (m.role === 'divider') {
              return (
                <div
                  key={i}
                  role="separator"
                  aria-label="New urge session"
                  className="flex items-center gap-3 pt-2 pb-1 select-none"
                >
                  <div className="flex-1 h-px bg-purple-300/60" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700/70 whitespace-nowrap">
                    {formatDividerLabel(m.content)}
                  </span>
                  <div className="flex-1 h-px bg-purple-300/60" />
                </div>
              );
            }
            return (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-purple-600 text-white'}`}>
                    {m.role === 'user' ? <UserIcon size={16} /> : <Brain size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-white border border-gray-200 text-gray-900 rounded-tr-none'
                      : 'bg-purple-700 text-white rounded-tl-none shadow-sm'
                  }`}>
                    {formatMessage(m.content)}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                  <Brain size={16} />
                </div>
                <div className="p-4 bg-purple-700 rounded-2xl rounded-tl-none">
                  <TypingDots />
                </div>
              </div>
            </div>
          )}

          {/* Empty-state starter prompts — three buttons under the welcome
              message that pre-fill and send a starter question. Disappear
              after the user sends their first message. */}
          {isEmpty && !quotaEndsAt && (
            <div className="flex flex-wrap gap-2 justify-center pt-2 pb-4">
              {COACH_STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs md:text-sm px-3.5 py-2 rounded-full bg-white border border-purple-200
                             text-purple-800 hover:bg-purple-100 hover:border-purple-300 transition-colors
                             shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Quick-reply chips under the latest assistant message. Hidden the
              moment the user starts typing so the keyboard doesn't compete
              with chips for attention. Center-aligned (no avatar indent) so
              all three chips fit on one row without a scrollbar at typical
              mobile widths (375px+). */}
          {showQuickReplies && (
            <div className="flex flex-nowrap justify-center gap-1.5">
              {COACH_QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleSend(reply)}
                  className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full bg-white border border-purple-200
                             text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-colors
                             whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input area OR quota banner. We swap the entire footer so a blocked
          user sees no input affordance at all — explicit, no false hope. */}
      {quotaEndsAt
        ? <QuotaBanner periodEndsAt={quotaEndsAt} />
        : (
          <div className="p-4 bg-white border-t border-purple-100">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your thought..."
                className="flex-1 p-3 bg-stone-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-200 outline-none text-emerald-900 placeholder-stone-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-purple-700 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )
      }

      <ResetChatModal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        // Strip the hardcoded welcome — server only needs real turns.
        messagesToSave={messages.slice(1)}
        onResetComplete={handleResetComplete}
        onQuotaExceeded={(endsAt) => setQuotaEndsAt(endsAt)}
      />
    </div>
  );
};

// ── Subcomponents ──────────────────────────────────────────────────────

/** Three-dot typing indicator. Stagger via inline animationDelay so we don't
 *  need a Tailwind config change for keyframes. */
const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1.5" aria-label="Coach is typing">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-purple-200 animate-pulse"
        style={{ animationDelay: `${i * 180}ms`, animationDuration: '1.2s' }}
      />
    ))}
  </div>
);

/** Quota-reached banner that replaces the input footer (Issue #54, Scope 4). */
const QuotaBanner: React.FC<{ periodEndsAt: string | null }> = ({ periodEndsAt }) => {
  const resetCopy = periodEndsAt
    ? `Resets on ${new Date(periodEndsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}.`
    : 'Resets next cycle.';
  return (
    <div className="p-4 bg-purple-100 border-t border-purple-200" role="status">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-semibold text-purple-900">AI quota reached</p>
        <p className="text-xs text-purple-800/80 mt-0.5">{resetCopy}</p>
      </div>
    </div>
  );
};
