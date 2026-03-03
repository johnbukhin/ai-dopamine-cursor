import React, { useState } from 'react';
import { CheckIn, CheckInStatus } from '../types';
import { Button } from './Button';
import { 
  POSITIVE_FEEDBACK, FLOW_A_HELPED_OPTIONS, EMOTIONS_POSITIVE, EMOTIONS_NEGATIVE, 
  TRIGGERS, TIME_OF_DAY, SLIP_REACTIONS, SLIP_LEARNINGS 
} from '../constants';
import { generateDailyInsight } from '../services/geminiService';
import { Check, X, CheckCircle, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';

interface DailyCheckInProps {
  onComplete: (checkIn: CheckIn) => void;
  onClose: () => void;
  payload: { tasksCompleted: boolean } | null;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ onComplete, onClose, payload }) => {
  // Flow State
  const [step, setStep] = useState<number>(0);
  const [flow, setFlow] = useState<'A' | 'B' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data State
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  // All selections are now single-string due to "1 option only" requirement
  const [selectedHelped, setSelectedHelped] = useState<string>('');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [reaction, setReaction] = useState<string>('');
  const [selectedLearning, setSelectedLearning] = useState<string>('');
  const [emotion, setEmotion] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const handleStartFlow = (isSuccess: boolean) => {
    setStatus(isSuccess ? CheckInStatus.CLEAN : CheckInStatus.SLIP);
    setFlow(isSuccess ? 'A' : 'B');
    setStep(1);
  };

  const handleNext = () => setStep(prev => prev + 1);

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      // Reset to initial state
      setStep(0);
      setFlow(null);
      setStatus(null);
    }
  };

  // Helper to set state and move to next step automatically
  const selectAndAdvance = (setter: (val: any) => void, value: any) => {
    setter(value);
    // Short delay for visual feedback before auto-advancing
    setTimeout(() => {
        handleNext();
    }, 250);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const checkIn: CheckIn = {
      id: Date.now().toString(),
      date: new Date(),
      status: status!,
      triggers: flow === 'B' ? [selectedTrigger] : [],
      emotions: [emotion],
      reaction: flow === 'B' ? reaction : undefined,
      // Wrap single string in array to match Interface
      copingStrategies: flow === 'A' ? [selectedHelped] : [selectedLearning],
      notes: note,
      timeOfDay: timeOfDay as any,
      tasksCompleted: payload?.tasksCompleted ?? false,
    };

    // Generate AI Insight
    const insight = await generateDailyInsight(checkIn);
    checkIn.aiInsight = insight;

    setIsSubmitting(false);
    onComplete(checkIn);
  };

  // ----------------------------------------------------------------------
  // Renders
  // ----------------------------------------------------------------------

  const renderInitialQuestion = () => (
    <div className="text-center animate-in fade-in duration-500">
      <h2 className="text-2xl font-semibold text-emerald-900 mb-8">Did you maintain control since your last check-in?</h2>
      <div className="flex justify-center gap-6">
        <button 
          onClick={() => handleStartFlow(true)}
          className="group flex flex-col items-center gap-3"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100/60 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-105 transition-all border border-emerald-100">
            <Check size={36} strokeWidth={2.5} />
          </div>
          <span className="font-medium text-emerald-800">Yes</span>
        </button>
        <button 
          onClick={() => handleStartFlow(false)}
          className="group flex flex-col items-center gap-3"
        >
          <div className="w-20 h-20 rounded-full bg-rose-100/60 flex items-center justify-center text-rose-600 group-hover:bg-rose-100 group-hover:scale-105 transition-all border border-rose-100">
            <X size={36} strokeWidth={2.5} />
          </div>
          <span className="font-medium text-emerald-800">No</span>
        </button>
      </div>
      <div className="mt-12">
        <button 
          onClick={onClose} 
          className="text-stone-500 hover:text-emerald-800 font-medium text-sm transition-colors py-2 px-4"
        >
          Skip
        </button>
      </div>
    </div>
  );

  // --- FLOW A (SUCCESS) ---
  const renderFlowA = () => {
    switch (step) {
      case 1: // Confirmation (Statement, requires Continue)
        return (
          <div className="space-y-6 text-center animate-in slide-in-from-right-8 duration-300">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-medium">Great. You stayed in control today.</h3>
            <p className="text-emerald-700 italic">"{POSITIVE_FEEDBACK[Math.floor(Math.random() * POSITIVE_FEEDBACK.length)]}"</p>
            <Button onClick={handleNext} fullWidth>Continue</Button>
          </div>
        );
      case 2: // Reflection (Single-select: Auto-Advance)
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">What helped you stay in control today?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FLOW_A_HELPED_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectAndAdvance(setSelectedHelped, opt)}
                  className={`p-3 text-sm text-left rounded-lg border transition-all ${selectedHelped === opt ? 'bg-emerald-100 border-emerald-300 ring-1 ring-emerald-300' : 'bg-white border-stone-200 hover:border-emerald-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 3: // Emotion (Single-select: Auto-Advance)
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">How did you mostly feel today?</h3>
            <div className="grid grid-cols-2 gap-3">
              {EMOTIONS_POSITIVE.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectAndAdvance(setEmotion, opt)}
                  className={`p-3 text-sm rounded-lg border transition-all ${emotion === opt ? 'bg-emerald-100 border-emerald-300 ring-1 ring-emerald-300' : 'bg-white border-stone-200 hover:border-emerald-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 4: // Free Input
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">Is there one thing you want to remember from today?</h3>
            <input 
              type="text" 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="For example: evenings are easier when I stay offline."
              className="w-full p-4 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
            <Button onClick={handleSubmit} fullWidth disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Complete Check-in"}
            </Button>
          </div>
        );
      default: return null;
    }
  };

  // --- FLOW B (SLIP) ---
  const renderFlowB = () => {
    switch (step) {
      case 1: // Neutral Framing (Statement, requires Continue)
        return (
          <div className="space-y-6 text-center animate-in slide-in-from-right-8 duration-300">
            <p className="text-lg text-emerald-800">Thank you for being honest. This is not failure. This is information.</p>
            <Button onClick={handleNext} fullWidth variant="secondary">Continue</Button>
          </div>
        );
      case 2: // Trigger (Single-select: Auto-Advance)
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">What was the main trigger?</h3>
            <div className="grid grid-cols-2 gap-3">
              {TRIGGERS.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectAndAdvance(setSelectedTrigger, opt)}
                  className={`p-3 text-sm rounded-lg border transition-all ${selectedTrigger === opt ? 'bg-stone-200 border-stone-400 ring-1 ring-stone-400' : 'bg-white border-stone-200 hover:border-stone-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 3: // Time Context (Single-select: Auto-Advance)
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">When did it happen?</h3>
            <div className="grid grid-cols-2 gap-3">
              {TIME_OF_DAY.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectAndAdvance(setTimeOfDay, opt)}
                  className={`p-3 text-sm rounded-lg border transition-all ${timeOfDay === opt ? 'bg-stone-200 border-stone-400 ring-1 ring-stone-400' : 'bg-white border-stone-200 hover:border-stone-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 4: // Reaction (Single-select: Auto-Advance)
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">How did you react to the urge?</h3>
            <div className="space-y-3">
              {SLIP_REACTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectAndAdvance(setReaction, opt)}
                  className={`w-full p-3 text-sm text-left rounded-lg border transition-all ${reaction === opt ? 'bg-stone-200 border-stone-400 ring-1 ring-stone-400' : 'bg-white border-stone-200 hover:border-stone-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 5: // Alternative (Single-select: Auto-Advance)
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">What could help next time?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SLIP_LEARNINGS.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectAndAdvance(setSelectedLearning, opt)}
                  className={`p-3 text-sm text-left rounded-lg border transition-all ${selectedLearning === opt ? 'bg-emerald-100 border-emerald-300 ring-1 ring-emerald-300' : 'bg-white border-stone-200 hover:border-emerald-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
       case 6: // Emotion (Single-select: Auto-Advance)
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">What emotion was strongest?</h3>
            <div className="grid grid-cols-2 gap-3">
              {EMOTIONS_NEGATIVE.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectAndAdvance(setEmotion, opt)}
                  className={`p-3 text-sm rounded-lg border transition-all ${emotion === opt ? 'bg-stone-200 border-stone-400 ring-1 ring-stone-400' : 'bg-white border-stone-200 hover:border-stone-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
       case 7: // Free Input & Complete
        return (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-medium text-center">One sentence about what you learned today.</h3>
            <input 
              type="text" 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="For example: being alone at night is my weak point."
              className="w-full p-4 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
            <div className="pt-4 text-center">
                <p className="text-sm text-emerald-700 italic mb-4">"This is not a relapse. This is data."</p>
                <Button onClick={handleSubmit} fullWidth disabled={isSubmitting}>
                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Complete Check-in"}
                </Button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-100/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 border border-stone-200 relative overflow-hidden">
        {/* Progress Bar */}
        {step > 0 && (
            <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-300" style={{ width: `${(step / (flow === 'A' ? 4 : 7)) * 100}%`}}></div>
        )}
        
        {/* Back Button */}
        {step > 0 && (
            <button 
                onClick={handleBack}
                className="absolute top-6 left-6 p-2 text-stone-400 hover:text-emerald-800 hover:bg-stone-100 rounded-full transition-colors z-10"
                aria-label="Go back"
            >
                <ChevronLeft size={24} />
            </button>
        )}
        
        <div className="min-h-[300px] flex flex-col justify-center pt-8">
            {step === 0 ? renderInitialQuestion() : (
                flow === 'A' ? renderFlowA() : renderFlowB()
            )}
        </div>
      </div>
    </div>
  );
};