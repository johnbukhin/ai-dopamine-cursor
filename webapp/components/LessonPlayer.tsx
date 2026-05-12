import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Star, CheckCircle2, BookOpen, Lightbulb, Quote } from 'lucide-react';
import { Lesson, LessonSection } from '../data/lessonsData';

interface LessonPlayerProps {
  /** The lesson to play. Looked up from lessonsData by day number in PlanLessonContent. */
  lesson: Lesson;
  /** True when 'lesson' task key already exists in plan_progress for this day. */
  isCompleted: boolean;
  /** Called when the user finishes the complete section — writes 'lesson' to plan_progress. */
  onComplete: () => void;
  /** Dismisses the player and returns to the bottom sheet. */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Text rendering helpers
// ---------------------------------------------------------------------------

/** Renders a single line of text with **bold** markdown support. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
}

/**
 * Renders body text with paragraph breaks (\n\n), blockquotes ("> "),
 * numbered lists ("1. "), and **bold** inline markdown.
 */
const BodyText = ({ text, className = '' }: { text: string; className?: string }) => {
  const paragraphs = text.split('\n\n').filter(Boolean);
  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((para, i) => {
        if (para.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-purple-300 pl-4 italic text-gray-600 leading-relaxed"
            >
              {renderInline(para.slice(2))}
            </blockquote>
          );
        }
        if (/^\d+\.\s/.test(para)) {
          const items = para.split('\n').filter(Boolean);
          return (
            <ol key={i} className="list-decimal pl-5 space-y-2 text-stone-700">
              {items.map((item, j) => (
                <li key={j} className="leading-relaxed">
                  {renderInline(item.replace(/^\d+\.\s/, ''))}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="text-stone-700 leading-relaxed">
            {renderInline(para)}
          </p>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

/** Intro section — title, body, optional bullets + closing, CTA. */
const IntroSection = ({
  section,
  onNext,
}: {
  section: LessonSection;
  onNext: () => void;
}) => (
  <div className="flex flex-col min-h-full">
    <div className="flex-1 space-y-6">
      <h1 className="text-2xl font-bold text-purple-900">{section.title}</h1>
      {section.body && <BodyText text={section.body} />}
      {section.bullets && (
        <ul className="space-y-2">
          {section.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
              <span className="text-stone-700 leading-relaxed">{renderInline(bullet)}</span>
            </li>
          ))}
        </ul>
      )}
      {section.closing && (
        <p className="text-stone-600 leading-relaxed italic">{section.closing}</p>
      )}
    </div>
    <button
      onClick={onNext}
      className="mt-8 w-full py-4 rounded-2xl bg-purple-600 text-white font-semibold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors"
    >
      {section.cta ?? 'Continue'}
    </button>
  </div>
);

/** Content section — title, body, optional subsections, Continue. */
const ContentSection = ({
  section,
  onNext,
}: {
  section: LessonSection;
  onNext: () => void;
}) => (
  <div className="flex flex-col min-h-full">
    <div className="flex-1 space-y-5">
      {section.title && (
        <h2 className="text-xl font-bold text-purple-900">{section.title}</h2>
      )}
      {section.body && <BodyText text={section.body} />}
      {section.subsections && section.subsections.length > 0 && (
        <div className="space-y-4 mt-2">
          {section.subsections.map((sub, i) => (
            <div key={i} className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <h3 className="font-bold text-purple-900 mb-1">{sub.heading}</h3>
              <p className="text-stone-700 text-sm leading-relaxed">{renderInline(sub.body)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    <button
      onClick={onNext}
      className="mt-8 w-full py-4 rounded-2xl bg-purple-600 text-white font-semibold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors"
    >
      {section.cta ?? 'Continue'}
    </button>
  </div>
);

/** Question section — question, two answer cards, response card, Continue. */
const QuestionSection = ({
  section,
  onNext,
}: {
  section: LessonSection;
  onNext: () => void;
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (answer: string) => {
    // Allow re-selection before continuing.
    setSelected(answer);
  };

  const selectedOption = section.options?.find(o => o.answer === selected);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 space-y-5">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">
          Self-discovery
        </p>
        {section.question && (
          <h2 className="text-xl font-bold text-purple-900 leading-snug">{section.question}</h2>
        )}
        <div className="space-y-3 mt-2">
          {section.options?.map(option => (
            <button
              key={option.answer}
              onClick={() => handleSelect(option.answer)}
              className={`w-full text-left p-4 rounded-2xl border-2 font-semibold text-base transition-all ${
                selected === option.answer
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 bg-white text-stone-700 hover:border-purple-200 hover:bg-purple-50/50'
              }`}
            >
              {option.answer}
            </button>
          ))}
        </div>
        {selectedOption && (
          <div className="bg-purple-900 text-white rounded-2xl p-5 mt-2 animate-in fade-in duration-300">
            <p className="text-sm leading-relaxed">{selectedOption.responseCard}</p>
          </div>
        )}
      </div>
      <button
        onClick={onNext}
        disabled={!selected}
        className="mt-8 w-full py-4 rounded-2xl bg-purple-600 text-white font-semibold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {section.cta ?? 'Continue'}
      </button>
    </div>
  );
};

/** Quote section — large centred quote + follow-up line, Continue. */
const QuoteSection = ({
  section,
  onNext,
}: {
  section: LessonSection;
  onNext: () => void;
}) => (
  <div className="flex flex-col min-h-full">
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8">
      <Quote size={32} className="text-purple-300" />
      {section.quote && (
        <p className="text-2xl font-bold text-purple-900 leading-snug italic">
          {section.quote}
        </p>
      )}
      {section.quoteFollowUp && (
        <p className="text-stone-500 leading-relaxed max-w-xs">{section.quoteFollowUp}</p>
      )}
    </div>
    <button
      onClick={onNext}
      className="mt-8 w-full py-4 rounded-2xl bg-purple-600 text-white font-semibold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors"
    >
      {section.cta ?? 'Continue'}
    </button>
  </div>
);

/** ProTip section — amber callout card + Continue. */
const ProTipSection = ({
  section,
  onNext,
}: {
  section: LessonSection;
  onNext: () => void;
}) => (
  <div className="flex flex-col min-h-full">
    <div className="flex-1">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Pro Tip</span>
        </div>
        {section.title && (
          <h3 className="font-bold text-amber-900 mb-2">{section.title}</h3>
        )}
        {section.body && (
          <BodyText text={section.body} className="text-amber-800 text-sm" />
        )}
      </div>
    </div>
    <button
      onClick={onNext}
      className="mt-8 w-full py-4 rounded-2xl bg-purple-600 text-white font-semibold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors"
    >
      {section.cta ?? 'Continue'}
    </button>
  </div>
);

/** Summary section — recap bullets + closing + Complete CTA. */
const SummarySection = ({
  section,
  onNext,
}: {
  section: LessonSection;
  onNext: () => void;
}) => (
  <div className="flex flex-col min-h-full">
    <div className="flex-1 space-y-5">
      {section.title && (
        <h2 className="text-xl font-bold text-purple-900">{section.title}</h2>
      )}
      {section.body && <BodyText text={section.body} />}
      {section.bullets && (
        <ul className="space-y-3">
          {section.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3 bg-purple-50 rounded-xl p-3">
              <CheckCircle2 size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
              <span className="text-stone-700 text-sm leading-relaxed">{renderInline(bullet)}</span>
            </li>
          ))}
        </ul>
      )}
      {section.closing && (
        <p className="text-stone-600 leading-relaxed italic border-t border-stone-100 pt-4">
          {section.closing}
        </p>
      )}
    </div>
    <button
      onClick={onNext}
      className="mt-8 w-full py-4 rounded-2xl bg-emerald-600 text-white font-semibold text-base hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
    >
      {section.cta ?? 'Complete'}
    </button>
  </div>
);

/** Complete section — celebration UI + cosmetic 5-star rating + CTA fires onComplete. */
const CompleteSection = ({
  section,
  onComplete,
  onClose,
}: {
  section: LessonSection;
  onComplete: () => void;
  onClose: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const handleContinue = () => {
    onComplete(); // persists 'lesson' key to plan_progress
    onClose();    // dismisses player, returns to sheet
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        {section.title && (
          <h2 className="text-2xl font-bold text-purple-900">{section.title}</h2>
        )}
        {section.body && (
          <p className="text-stone-600 leading-relaxed max-w-xs">{section.body}</p>
        )}
        {section.closing && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-stone-500">{section.closing}</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hovered || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={handleContinue}
        className="mt-8 w-full py-4 rounded-2xl bg-emerald-600 text-white font-semibold text-base hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
      >
        {section.cta ?? 'Continue'}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Completed-state screen shown when isCompleted && not replaying
// ---------------------------------------------------------------------------

const CompletedScreen = ({
  lesson,
  onReplay,
  onClose,
}: {
  lesson: Lesson;
  onReplay: () => void;
  onClose: () => void;
}) => (
  <div className="flex flex-col items-center justify-center min-h-full text-center space-y-6 py-12">
    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
      <BookOpen size={36} className="text-emerald-500" />
    </div>
    <div className="space-y-2">
      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
        Lesson completed
      </p>
      <h2 className="text-2xl font-bold text-purple-900">{lesson.title}</h2>
      <p className="text-stone-500 text-sm">{lesson.duration} · Day {lesson.day}</p>
    </div>
    <div className="flex items-center gap-2">
      <CheckCircle2 size={20} className="text-emerald-500" />
      <span className="text-emerald-700 font-semibold text-sm">You've completed this lesson</span>
    </div>
    <div className="w-full space-y-3 pt-4">
      <button
        onClick={onReplay}
        className="w-full py-4 rounded-2xl bg-purple-600 text-white font-semibold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors"
      >
        Replay lesson
      </button>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-2xl text-stone-500 font-medium text-sm hover:text-purple-700 transition-colors"
      >
        Back to day plan
      </button>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main LessonPlayer component
// ---------------------------------------------------------------------------

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  isCompleted,
  onComplete,
  onClose,
}) => {
  // Show the completed screen first if the lesson is already done.
  const [showCompletedScreen, setShowCompletedScreen] = useState(isCompleted);
  const [sectionIndex, setSectionIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever the active section changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [sectionIndex]);

  const sections = lesson.sections;
  const currentSection = sections[sectionIndex];

  const handleNext = () => {
    if (sectionIndex < sections.length - 1) {
      setSectionIndex(i => i + 1);
    }
  };

  const handleBack = () => {
    if (showCompletedScreen) {
      onClose();
    } else if (sectionIndex === 0) {
      onClose();
    } else {
      setSectionIndex(i => i - 1);
    }
  };

  const handleReplay = () => {
    setSectionIndex(0);
    setShowCompletedScreen(false);
  };

  // Fractional progress: completed sections / total. Complete section counts as final.
  const progress = showCompletedScreen ? 1 : (sectionIndex + 1) / sections.length;

  const renderSection = (section: LessonSection) => {
    switch (section.type) {
      case 'intro':
        return <IntroSection section={section} onNext={handleNext} />;
      case 'content':
        return <ContentSection section={section} onNext={handleNext} />;
      case 'question':
        // Re-mount on each new question section so answer state resets cleanly.
        return <QuestionSection key={sectionIndex} section={section} onNext={handleNext} />;
      case 'quote':
        return <QuoteSection section={section} onNext={handleNext} />;
      case 'proTip':
        return <ProTipSection section={section} onNext={handleNext} />;
      case 'summary':
        return <SummarySection section={section} onNext={handleNext} />;
      case 'complete':
        return (
          <CompleteSection
            section={section}
            onComplete={onComplete}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    // z-[60] sits above the LessonBottomSheet (z-50) so the player covers the entire screen.
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-200">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-safe">
        {/* Progress bar — thin purple stripe showing how far through the lesson. */}
        <div className="h-1 w-full bg-gray-100 rounded-full mt-3">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-3 py-4">
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-stone-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest truncate">
              Day {lesson.day} · {lesson.duration}
            </p>
            <h1 className="text-base font-bold text-purple-900 truncate">{lesson.title}</h1>
          </div>
        </div>
      </div>

      {/* ── Scrollable section content ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 pb-8"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
      >
        {showCompletedScreen ? (
          <CompletedScreen
            lesson={lesson}
            onReplay={handleReplay}
            onClose={onClose}
          />
        ) : (
          // Key forces a fresh render on section change so scroll position and
          // any internal state (e.g. selected answer) resets for each new section.
          <div key={sectionIndex} className="animate-in fade-in duration-200 h-full">
            {renderSection(currentSection)}
          </div>
        )}
      </div>
    </div>
  );
};
