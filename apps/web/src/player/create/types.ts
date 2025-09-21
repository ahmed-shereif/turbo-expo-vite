import type { Court, Trainer, Rank } from '@repo/player-api';

export interface WizardState {
  dayISO: string | null; // 'YYYY-MM-DD'
  court: Court | null;
  startTimeHHmm: string | null; // '18:00'
  durationMinutes: number; // default 60
  trainer: Trainer | null;
  seatsTotal: 2 | 3 | 4; // default 4; allow 2..4
  type: 'OPEN' | 'PRIVATE'; // default 'OPEN'
  minRank?: Rank; // optional
}

// Explicit export for better module resolution
export type { WizardState as WizardStateType };
