import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CheckIn } from "../types";
import { buildDailyInsightPrompt } from "../prompts/dailyInsight";
import { buildCoachSystemPrompt } from "../prompts/aiCoach";
import { logger } from "../src/lib/logger";

// Use Vite's VITE_GEMINI_API_KEY env var (set in .env.local or Vercel environment variables)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai: GoogleGenAI | null = (() => {
  try {
    return new GoogleGenAI({ apiKey });
  } catch {
    return null;
  }
})();

// Helper to pause execution
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Robust error checking for Google GenAI 429/Quota errors
const isRateLimitError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;
  const record = error as Record<string, unknown>;
  const nested = (record.error && typeof record.error === 'object')
    ? (record.error as Record<string, unknown>)
    : undefined;

  // Check for standard HTTP status codes or gRPC status codes
  if (record.status === 429 || record.code === 429) return true;
  if (record.status === 'RESOURCE_EXHAUSTED') return true;
  
  // Check nested error object structure (common in Google APIs)
  if (nested?.code === 429 || nested?.status === 'RESOURCE_EXHAUSTED') return true;
  
  // Check message content strings as a fallback
  const messageValue = typeof record.message === 'string'
    ? record.message
    : typeof nested?.message === 'string'
      ? nested.message
      : JSON.stringify(error);
  const msg = messageValue.toLowerCase();
  return msg.includes('429') || msg.includes('quota') || msg.includes('resource exhausted');
};

// Helper to make calls with retry logic for rate limits
const callGeminiWithRetry = async (prompt: string, model: string = 'gemini-3-flash-preview', retries = 2): Promise<string | null> => {
    if (!ai) return null;
    for (let i = 0; i <= retries; i++) {
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            return response.text?.trim() || null;
        } catch (error: unknown) {
            // If it's a quota error and we have retries left, wait and retry
            // Note: Retrying RESOURCE_EXHAUSTED (quota) usually doesn't work if the daily limit is hit,
            // but it helps if it's a momentary rate limit (RPM).
            if (isRateLimitError(error) && i < retries) {
                const delay = Math.pow(2, i) * 1000 + (Math.random() * 500); // Exponential backoff + jitter
                logger.warn('Gemini rate-limited. Retrying request.', {
                  retryInMs: Math.round(delay),
                  attempt: i + 1,
                });
                await wait(delay);
                continue;
            }
            
            // If it's not a retryable error or we ran out of retries, throw it
            throw error;
        }
    }
    return null;
};

export const generateDailyInsight = async (checkIn: CheckIn): Promise<string> => {
  if (!apiKey) return "AI Insight unavailable (No API Key).";

  try {
    const prompt = buildDailyInsightPrompt(checkIn);
    const text = await callGeminiWithRetry(prompt);
    return text || "Unable to generate insight.";
  } catch (error: unknown) {
    if (isRateLimitError(error)) {
        logger.warn('Gemini quota exceeded while generating daily insight.');
        return "Insight unavailable (Daily quota exceeded).";
    }
    
    logger.error('Gemini API error while generating daily insight.', { error });
    return "Insight generation temporarily unavailable.";
  }
};

export const getCoachResponse = async (message: string, context: string): Promise<string> => {
  if (!apiKey) return "AI Coach unavailable (No API Key).";

  try {
    const prompt = buildCoachSystemPrompt(message, context);
    const text = await callGeminiWithRetry(prompt);
    return text || "I'm listening, but I can't respond right now.";
  } catch (error: unknown) {
    if (isRateLimitError(error)) {
         logger.warn('Gemini quota exceeded while fetching coach response.');
         return "I'm currently overloaded (Quota limit reached). Please try again later.";
    }
    
    logger.error('Gemini API error while fetching coach response.', { error });
    return "Connection to AI Coach interrupted.";
  }
};