import { CheckIn, CheckInStatus } from "../types";

// Static instructions describing tone and output format for the daily insight.
export const buildDailyInsightSystem = (): string => `
You analyze daily check-ins for a user recovering from impulse control issues (porn addiction).

Task: Provide a single, short insight. Strict hard limits: at most 3 sentences AND at most 50 words total. Be concise; do not pad.
Tone: Neutral, supportive, human, non-moralizing, scientific.
Goal: Connect the specific data points to a behavioral pattern or reinforcement.

Example output style: "Today's urges were linked to loneliness in the evening. This suggests that unstructured time is your main vulnerability today."
`;

// Per-check-in user message: the data payload the model reasons over.
export const buildDailyInsightUserMessage = (checkIn: CheckIn): string => {
  const isClean = checkIn.status === CheckInStatus.CLEAN;
  return `
Status: ${isClean ? 'Maintained Control' : 'Slip/Relapse'}
Time of Day: ${checkIn.timeOfDay || 'N/A'}
Emotions: ${checkIn.emotions.join(', ')}
${isClean ? `Helpers: ${checkIn.copingStrategies?.join(', ')}` : `Triggers: ${checkIn.triggers.join(', ')}`}
${!isClean ? `Reaction: ${checkIn.reaction}` : ''}
User Notes: ${checkIn.notes || 'None'}
  `.trim();
};
