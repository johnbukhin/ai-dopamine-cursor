export enum View {
  LOGIN = 'LOGIN',
  CHECK_IN = 'CHECK_IN',
  DASHBOARD = 'DASHBOARD',
  PLAN_21 = 'PLAN_21',
  AI_COACH = 'AI_COACH',
  URGE_HELP = 'URGE_HELP',
  FUTURE = 'FUTURE',
  SETTINGS = 'SETTINGS',
}

export enum CheckInStatus {
  CLEAN = 'CLEAN',
  SLIP = 'SLIP',
  SKIPPED = 'SKIPPED',
}

export interface CheckIn {
  id: string;
  date: Date;
  status: CheckInStatus;
  triggers: string[];
  emotions: string[];
  reaction?: string;
  copingStrategies?: string[];
  notes?: string;
  aiInsight?: string;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Late night';
  tasksCompleted?: boolean;
}

export interface User {
  username: string;
  streak: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}