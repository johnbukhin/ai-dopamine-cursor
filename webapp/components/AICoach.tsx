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
    setMessages(prev => {
      const updated = [...prev, assistantMsg];

      // Persist after state update — fire-and-forget, never blocks UI.
      // The welcome message (index 0) is a hardcoded system greeting and is
      // excluded from storage; only real user↔AI exchanges are persisted.
      if (supabase) {
        const toStore = updated.slice(1); // strip welcome message
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase!.from('coach_messages').upsert({
            user_id: user.id,
            messages: toStore,
            updated_at: new Date().toISOString(),
          });
        });
      }

      return updated;
    });
    setIsLoading(false);
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
    <div className="flex flex-col h-full bg-stone-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-stone-300 text-stone-600' : 'bg-emerald-700 text-white'}`}>
                {m.role === 'user' ? <UserIcon size={16} /> : <Brain size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' 
                  ? 'bg-white border border-stone-200 text-emerald-900 rounded-tr-none' 
                  : 'bg-emerald-800 text-stone-50 rounded-tl-none shadow-sm'
              }`}>
                {formatMessage(m.content)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                        <Brain size={16} />
                    </div>
                    <div className="p-4 bg-emerald-800 rounded-2xl rounded-tl-none flex items-center">
                        <Loader2 className="animate-spin text-stone-300" size={16} />
                    </div>
                 </div>
            </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-stone-200">
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
            className="p-3 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};