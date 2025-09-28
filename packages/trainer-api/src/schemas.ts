import { z } from 'zod';

export const Rank = z.enum(['UNKNOWN', 'LOW_D', 'MID_D', 'HIGH_D']);
export type Rank = z.infer<typeof Rank>;

export const RequestStatus = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED']);
export type RequestStatus = z.infer<typeof RequestStatus>;

export const TrainerRequest = z.object({
  id: z.string(),
  sessionId: z.string(),
  status: RequestStatus,
  createdAt: z.string(),
  expiresAt: z.string(),
  court: z.object({
    id: z.string(),
    name: z.string(),
    area: z.string().optional(),
  }),
  startAt: z.string(),
  durationMinutes: z.number(),
  seats: z.object({
    filled: z.number(),
    total: z.number(),
  }),
  creator: z.object({
    playerId: z.string(),
    name: z.string().optional(),
  }),
});
export type TrainerRequest = z.infer<typeof TrainerRequest>;

export const TrainerProfile = z.object({
  id: z.string(),
  hourlyPriceLE: z.number().min(50).max(10000),
  maxLevel: Rank,
  areasCovered: z.array(z.string()).min(1),
  acceptedCourtIds: z.array(z.string()),
});
export type TrainerProfile = z.infer<typeof TrainerProfile>;

export const Court = z.object({
  id: z.string(),
  name: z.string(),
  area: z.string().optional(),
  address: z.string().optional(),
  priceHourlyLE: z.number(),
});
export type Court = z.infer<typeof Court>;

export const SessionStatus = z.enum([
  'AWAITING_TRAINER',
  'AWAITING_TRAINER_AND_COURT',
  'PENDING', 
  'AWAITING_COURT_CONFIRMATION',
  'APPROVED',
  'CANCELLED'
]);
export type SessionStatus = z.infer<typeof SessionStatus>;

export const SessionSummary = z.object({
  id: z.string(),
  type: z.enum(['OPEN', 'PRIVATE']),
  status: SessionStatus,
  startAt: z.string(),
  durationMinutes: z.number(),
  seats: z.object({
    filled: z.number(),
    total: z.number(),
  }),
  court: z.object({
    id: z.string(),
    name: z.string(),
    area: z.string().optional(),
  }),
  creator: z.object({
    playerId: z.string(),
    name: z.string().optional(),
  }).optional(),
});
export type SessionSummary = z.infer<typeof SessionSummary>;

export const Pagination = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
  });

export type Pagination<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export const WorkingWindow = z.object({
  day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  ranges: z.array(z.object({
    from: z.string().regex(/^\d{2}:\d{2}$/),
    to: z.string().regex(/^\d{2}:\d{2}$/),
  })),
});
export type WorkingWindow = z.infer<typeof WorkingWindow>;

export const Blackout = z.object({
  id: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  reason: z.string().optional(),
});
export type Blackout = z.infer<typeof Blackout>;