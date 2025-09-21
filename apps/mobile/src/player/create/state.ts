import { create } from 'zustand';
import type { Court, Trainer, Rank } from '@repo/player-api';

export interface CreateSessionState {
  dayISO: string | null; // 'YYYY-MM-DD'
  court: Court | null;
  startTimeHHmm: string | null; // '18:00'
  durationMinutes: number; // default 60
  trainer: Trainer | null;
  seatsTotal: 2 | 3 | 4; // default 4
  type: 'OPEN' | 'PRIVATE'; // default 'OPEN'
  minRank?: Rank; // optional
}

interface CreateSessionStore extends CreateSessionState {
  updateState: (updates: Partial<CreateSessionState>) => void;
  reset: () => void;
}

const initialState: CreateSessionState = {
  dayISO: null,
  court: null,
  startTimeHHmm: null,
  durationMinutes: 60,
  trainer: null,
  seatsTotal: 4,
  type: 'OPEN',
  minRank: undefined,
};

export const useCreateSessionStore = create<CreateSessionStore>((set) => ({
  ...initialState,
  
  updateState: (updates) => set((state) => ({ ...state, ...updates })),
  
  reset: () => set(initialState),
}));
