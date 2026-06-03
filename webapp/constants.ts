import type { ChatMessage } from './types';

// Coach welcome — prepended at chat load and re-applied after a reset.
// Never persisted to DB; the server-side coach_messages row stores only
// real user/assistant turns.
export const COACH_WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hello. I'm your Mind Compass coach.\n\nI'm here to help you reflect, analyze patterns, and maintain control.\n\nWhat's on your mind today?",
};

// Three starter prompts shown only when the chat is empty (just the welcome
// message). Click → fills input and sends. Issue #54, Scope 3.
export const COACH_STARTER_PROMPTS = [
  "I'm struggling with an urge",
  "I want to reflect on yesterday",
  "What pattern do you see?",
];

// Static quick-reply chips shown after each assistant turn. Hidden once the
// user starts typing their own message. Issue #54, Scope 3.
export const COACH_QUICK_REPLIES = [
  "Tell me more",
  "Give me an action",
  "Different approach",
];

export const FLOW_A_HELPED_OPTIONS = [
  "I stayed busy",
  "I avoided triggers",
  "I used the Help Button",
  "I exercised / moved my body",
  "I talked to someone",
  "I followed today's protocol",
  "Luck / no urges today"
];

export const EMOTIONS_POSITIVE = [
  "Calm", "Focused", "Neutral", "Slightly tense", "Proud", "Tired"
];

export const EMOTIONS_NEGATIVE = [
  "Shame", "Anxiety", "Loneliness", "Frustration", "Sadness", "Numbness", "Stress"
];

export const TRIGGERS = [
  "Boredom", "Anxiety", "Loneliness", "Stress", "Sexual frustration", 
  "Tiredness", "Scrolling / social media", "Alcohol / late night", "Other"
];

export const TIME_OF_DAY = [
  "Morning", "Afternoon", "Evening", "Late night"
];

export const SLIP_REACTIONS = [
  "I acted immediately",
  "I tried to resist but gave in",
  "I felt overwhelmed",
  "I didn't think, it was automatic",
  "I felt tension and wanted relief"
];

export const SLIP_LEARNINGS = [
  "Use Help Button",
  "Leave the room",
  "Physical movement",
  "Cold water / breathing",
  "Message someone",
  "Open today's distraction task",
  "Go to sleep",
  "Block the trigger (phone / site)"
];
