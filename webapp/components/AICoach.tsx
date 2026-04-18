import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, User as UserIcon, Loader2 } from 'lucide-react';
import { getCoachResponse } from '../services/geminiService';
import { CheckIn, ChatMessage } from '../types';
import { supabase } from '../src/lib/supabase';

interface AICoachProps {
    checkInHistory: CheckIn[];
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const AICoach: React.FC<AICoachProps> = ({ checkInHistory, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Build context summary from history (last 5 entries)
    const recentHistory = checkInHistory.slice(-5).map(c => 
        `Date: ${c.date.toDateString()}, Status: ${c.status}, Emotions: ${c.emotions.join(',')}`
    ).join('; ');

    const response = await getCoachResponse(userMsg, recentHistory);

    const assistantMsg: ChatMessage = { role: 'assistant', content: response };

    // Update UI — pure state update, no side effects inside updater
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);

    // Persist to Supabase — fire-and-forget, never blocks UI.
    // Reconstruct the full conversation from the closure: messages (captured at
    // handleSend call time, excludes userMsg) + userMsg + assistantMsg.
    // Slice off index 0 (hardcoded welcome message — never stored in DB).
    if (supabase) {
      const toStore: ChatMessage[] = [
        ...messagesRef.current,
        { role: 'user' as const, content: userMsg },
        assistantMsg,
      ].slice(1);

      (async () => {
        const { data: { user } } = await supabase!.auth.getUser();
        if (!user) return;
        await supabase!.from('coach_messages').upsert(
          { user_id: user.id, messages: toStore, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      })();
    }
  };

  const formatMessage = (content: string) => {
    // Split by bold markers (**text**)
    return content.split(/(\*\*.*?\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-purple-50">
      <div className="flex-1 overflow-y-auto pb-28 md:pb-4" ref={scrollRef}>
        {/* Edge-to-Edge Header Image */}
        <div className="w-full h-48 md:h-56 relative mb-6 overflow-hidden">
          <img src="/illustrations/coach.png" alt="AI Coach" className="w-full h-full object-cover scale-[1.4] origin-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-50" />
          <div className="absolute bottom-10 md:bottom-12 left-4 md:left-8 right-4 md:right-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-purple-900 mt-1">Your AI Coach</h2>
          </div>
        </div>
        
        <div className="px-4 space-y-4 max-w-4xl mx-auto">
          {messages.map((m, i) => (
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
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Brain size={16} />
                    </div>
                    <div className="p-4 bg-purple-700 rounded-2xl rounded-tl-none flex items-center">
                        <Loader2 className="animate-spin text-purple-200" size={16} />
                    </div>
                 </div>
            </div>
        )}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-purple-100">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your thought..."
            className="flex-1 p-3 bg-stone-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-200 outline-none text-emerald-900 placeholder-stone-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-purple-700 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};