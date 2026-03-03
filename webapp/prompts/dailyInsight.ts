import { CheckIn, CheckInStatus } from "../types";

export const buildDailyInsightPrompt = (checkIn: CheckIn): string => {
  const isClean = checkIn.status === CheckInStatus.CLEAN;
  
  return `
      Analyze this daily check-in for a user recovering from impulse control issues (porn addiction).
      
      Context:
      Status: ${isClean ? 'Maintained Control' : 'Slip/Relapse'}
      Time of Day: ${checkIn.timeOfDay || 'N/A'}
      Emotions: ${checkIn.emotions.join(', ')}
      ${isClean ? `Helpers: ${checkIn.copingStrategies?.join(', ')}` : `Triggers: ${checkIn.triggers.join(', ')}`}
      ${!isClean ? `Reaction: ${checkIn.reaction}` : ''}
      User Notes: ${checkIn.notes || 'None'}

      Task: Provide a single, short paragraph (2-3 sentences) insight.
      Tone: Neutral, supportive, human, non-moralizing, scientific.
      Goal: Connect the specific data points to a behavioral pattern or reinforcement.
      
      Example output style: "Today's urges were linked to loneliness in the evening. This suggests that unstructured time is your main vulnerability today."
    `;
};