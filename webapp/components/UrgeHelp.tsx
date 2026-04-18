import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { Wind, Footprints, PenTool, PhoneOff, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface UrgeHelpProps {
  onChangeView?: (view: View) => void;
}

export const UrgeHelp: React.FC<UrgeHelpProps> = ({ onChangeView }) => {
  const [step, setStep] = useState(1);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [activeTechnique, setActiveTechnique] = useState<number | null>(null);

  // --- Step 1: Timer Logic ---
  const [timeLeft, setTimeLeft] = useState(60);
  const duration = 60;
  
  useEffect(() => {
    let interval: any;
    if (step === 1 && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 1 && timeLeft === 0) {
      // Auto advance when timer hits 0
      setStep(2);
    }
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  // Calculate SVG Circle props
  // Using a fixed viewBox size for consistent calculation
  const size = 280;
  const strokeWidth = 20; // Thicker for better aesthetics
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((duration - timeLeft) / duration) * circumference;

  // --- Lists ---
  const feelings = [
    "Boredom", "Anxiety", "Loneliness", "Stress", 
    "Frustration", "Tiredness", "Sexual Tension"
  ];

  const techniques = [
    {
      id: 1,
      icon: Wind,
      title: "Box Breathing",
      desc: "Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.",
      action: () => setActiveTechnique(1)
    },
    {
      id: 2,
      icon: Footprints,
      title: "Leave the Room",
      desc: "Change your physical environment immediately.",
      action: () => setActiveTechnique(2)
    },
    {
      id: 3,
      icon: PenTool,
      title: "Write it Down",
      desc: "Write what you feel. Don't judge it, just capture it.",
      action: () => setActiveTechnique(3)
    },
    {
      id: 4,
      icon: PhoneOff,
      title: "Put Phone Away",
      desc: "Place your device in another room for 15 minutes.",
      action: () => setActiveTechnique(4)
    }
  ];

  // --- Handlers ---
  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling);
    setStep(3);
  };

  const handleFeedback = (type: 'passed' | 'still_there' | 'need_help') => {
    if (type === 'passed') {
      // Reset
      setStep(1);
      setTimeLeft(60);
      setSelectedFeeling(null);
      setActiveTechnique(null);
    } else if (type === 'still_there') {
      setStep(3); // Go back to tools
      setActiveTechnique(null);
    } else if (type === 'need_help') {
      if (onChangeView) onChangeView(View.AI_COACH);
    }
  };

  // --- Renders ---

  // Screen 1: Timer
  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-rose-50 animate-in fade-in duration-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-64 md:h-80 z-0 overflow-hidden">
          <img src="/illustrations/urge.png" alt="Calm" className="w-full h-full object-cover mix-blend-multiply opacity-40 scale-[1.4] origin-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-50/60 to-rose-50" />
        </div>
        
        <h2 className="text-xl md:text-2xl font-medium text-rose-900 mb-10 text-center max-w-md leading-relaxed relative z-10 mt-12">
          You don't need to decide right now.
        </h2>

        <div className="relative w-72 h-72 mb-10 z-10">
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-rose-200"
            />
            {/* Progress Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-rose-800 transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-7xl font-light text-rose-900 tracking-tighter tabular-nums">
              {timeLeft}
            </span>
             <span className="text-xs font-bold text-rose-800/40 uppercase tracking-widest mt-2">
              Seconds
            </span>
          </div>
        </div>

        <p className="text-stone-500 mb-10 font-medium">Urges rise and fall like waves.</p>

        <button 
            onClick={() => setStep(2)}
            className="px-8 py-4 bg-stone-200 text-stone-600 rounded-xl hover:bg-stone-300 transition-colors font-semibold text-sm tracking-wide"
        >
            Skip Timer (I'm grounded)
        </button>
      </div>
    );
  }

  // Screen 2: Feelings
  if (step === 2) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-rose-50 animate-in slide-in-from-right-8 duration-300">
        <h2 className="text-2xl md:text-3xl font-bold text-rose-900 mb-8 text-center">
          What are you feeling?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          {feelings.map((feeling) => (
            <button
              key={feeling}
              onClick={() => handleFeelingSelect(feeling)}
              className="p-6 bg-white border border-rose-200 rounded-xl text-lg font-medium text-rose-900 hover:border-rose-400 hover:shadow-md transition-all text-center"
            >
              {feeling}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Screen 3: Urge Emergency Actions
  if (step === 3) {
    return (
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-rose-50 flex flex-col items-center justify-center animate-in slide-in-from-right-8 duration-300">
        <div className="max-w-2xl w-full space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-rose-900">Urge Emergency</h2>
                <p className="text-rose-800/70">Don't fight the urge. Just delay the reaction. Pick one action now.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {techniques.map((t) => (
                    <button
                        key={t.id}
                        onClick={t.action}
                        className={`p-6 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${
                            activeTechnique === t.id 
                            ? 'bg-rose-100 border-rose-500 shadow-md ring-1 ring-rose-500' 
                            : 'bg-white border-rose-200 hover:border-rose-400'
                        }`}
                    >
                        <div className="flex items-center gap-4 mb-2 relative z-10">
                            <div className={`p-3 rounded-full ${activeTechnique === t.id ? 'bg-rose-600 text-white' : 'bg-white text-rose-800'}`}>
                                <t.icon size={24} />
                            </div>
                            <span className="font-bold text-rose-900 text-lg">{t.title}</span>
                        </div>
                        <p className="text-stone-600 pl-[3.25rem] relative z-10">{t.desc}</p>
                    </button>
                ))}
            </div>

            {/* Animation Area for specific techniques */}
            {activeTechnique === 1 && (
                <div className="bg-rose-700 text-stone-100 p-8 rounded-2xl text-center animate-in zoom-in duration-300">
                    <p className="text-xl font-light mb-4">Breathe In...</p>
                    <div className="w-full h-2 bg-emerald-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 animate-[pulse_4s_infinite]"></div>
                    </div>
                </div>
            )}

            {/* Next Button - Appears if a technique is selected */}
            {activeTechnique !== null && (
                <div className="pt-4 flex justify-end animate-in fade-in slide-in-from-bottom-4">
                     <button 
                        onClick={() => setStep(4)}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-800 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-lg"
                     >
                        <span>I did this</span>
                        <ArrowRight size={20} />
                     </button>
                </div>
            )}
        </div>
      </div>
    );
  }

  // Screen 4: Feedback
  if (step === 4) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-rose-50 animate-in slide-in-from-right-8 duration-300">
         <h2 className="text-2xl md:text-3xl font-bold text-rose-900 mb-8 text-center">
            Did the urge decrease?
         </h2>
         
         <div className="w-full max-w-md space-y-4">
            <button 
                onClick={() => handleFeedback('passed')}
                className="w-full p-4 bg-rose-700 text-white rounded-xl font-medium hover:bg-rose-800 transition-colors shadow-md"
            >
                Yes, it passed
            </button>
            
            <button 
                onClick={() => handleFeedback('still_there')}
                className="w-full p-4 bg-white border-2 border-rose-700 text-rose-900 rounded-xl font-medium hover:bg-rose-50 transition-colors"
            >
                It's still there (Try another)
            </button>
            
            <button 
                onClick={() => handleFeedback('need_help')}
                className="w-full p-4 bg-stone-300 text-stone-800 rounded-xl font-medium hover:bg-stone-400 transition-colors"
            >
                I need more help (Return to Coach)
            </button>
         </div>

         <p className="mt-8 text-stone-500 text-sm">You slowed the pattern. That matters.</p>
      </div>
    );
  }

  return null;
};