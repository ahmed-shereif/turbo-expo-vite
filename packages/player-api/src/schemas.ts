import { z } from 'zod';

export const Rank = z.enum(['UNKNOWN', 'LOW_D', 'MID_D', 'HIGH_D']);
export type Rank = z.infer<typeof Rank>;

export const Seats = z.object({
  filled: z.number(),
  total: z.number(),
});

export const Pricing = z
  .object({
    currency: z.literal('EGP').optional(),
    courtPriceHourlyLE: z.number().optional(),
    trainerPriceHourlyLE: z.number().optional(),
    appFeeHourlyLE: z.number().optional(),
  })
  .optional();

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
  type: z.string(),
  status: SessionStatus,
  startAt: z.string(),
  durationMinutes: z.number(),
  seats: Seats,
  minRank: Rank.nullable().optional().transform(val => val === null ? undefined : val),
  court: z.object({
    id: z.string(),
    name: z.string(),
    area: z.string().optional(),
    address: z.string().optional(),
    priceHourlyLE: z.number().optional(),
    facilities: z.array(z.string()).optional(),
  }),
  trainer: z.object({
    id: z.string(),
    name: z.string().optional(),
    maxLevel: z.number().optional(),
    priceHourlyLE: z.number().optional(),
  }),
  pricing: Pricing,
  creator: z.object({ playerId: z.string() }).optional(),
  rating: z
    .object({
      court: z.number().optional(),
      trainer: z.number().optional(),
    })
    .optional(),
});

export type SessionSummary = z.infer<typeof SessionSummary>;

export const OpenSessionItem = SessionSummary;
export type OpenSessionItem = z.infer<typeof OpenSessionItem>;

export const Member = z.object({
  playerId: z.string(),
  role: z.enum(['CREATOR', 'PARTICIPANT']),
  name: z.string().optional(),
  rank: Rank.nullable().optional().transform(val => val === null ? undefined : val),
  avatarUrl: z.string().url().optional(),
  joinedAt: z.string().optional(),
});
export type Member = z.infer<typeof Member>;

export const SessionDetail = SessionSummary.extend({
  members: z.array(Member).default([]),
});
export type SessionDetail = z.infer<typeof SessionDetail>;

export const CourtConfirmation = z.object({
  status: z.enum(['PENDING', 'CONFIRMED']),
  requestedAt: z.string().optional(),
  respondedAt: z.string().nullable().optional(),
  deadlineAt: z.string().optional(),
});
export type CourtConfirmation = z.infer<typeof CourtConfirmation>;

export const MySessionsResp = z.object({
  sessions: z.array(SessionSummary),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});
export type MySessionsResp = z.infer<typeof MySessionsResp>;

// Create Session Wizard Schemas
export const Court = z.object({
  id: z.string(),
  name: z.string(),
  area: z.string().optional(),
  address: z.string().optional(),
  priceHourlyLE: z.number(),
  facilities: z.array(z.string()).optional(),
});
export type Court = z.infer<typeof Court>;

export const Trainer = z.object({
  id: z.string(),
  name: z.string(),
  rank: Rank.optional(),
  maxLevel: z.number().optional(),
  hourlyPrice: z.number().optional(),
  priceHourlyLE: z.number().optional(),
  areasCovered: z.array(z.string()).optional(),
  isVerified: z.boolean().optional(),
  verifiedAt: z.string().nullable().optional(),
  rating: z.object({
    avgStars: z.number(),
    count: z.number(),
  }).nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Trainer = z.infer<typeof Trainer>;

export const AvailabilityCheck = z.object({
  available: z.boolean(),
  reason: z.string().optional(),
  conflicts: z.array(z.string()).optional(),
});
export type AvailabilityCheck = z.infer<typeof AvailabilityCheck>;

export const CreateSessionPayload = z.object({
  entryFlow: z.literal('COURT_FIRST'),
  courtId: z.string(),
  trainerId: z.string(),
  startAt: z.string(),
  durationMinutes: z.number(),
  type: z.enum(['OPEN', 'PRIVATE']),
  seatsTotal: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  minRank: Rank.nullable().optional().transform(val => val === null ? undefined : val),
});
export type CreateSessionPayload = z.infer<typeof CreateSessionPayload>;

export const CreateSessionResponse = z.object({
  session: z.object({
    id: z.string(),
    creatorId: z.string(),
    courtId: z.string(),
    trainerId: z.string(),
    status: SessionStatus,
    type: z.string(),
    startAt: z.string(),
    durationMinutes: z.number(),
    seatsTotal: z.number(),
    seatsFilled: z.number(),
    minRank: Rank.nullable().optional(),
    lockedAfterPayNow: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    approvedAt: z.string().nullable().optional(),
    paymentGraceEndsAt: z.string().nullable().optional(),
  }),
  pricing: z.object({
    currency: z.string(),
    courtPriceHourlyLE: z.number(),
    trainerPriceHourlyLE: z.number(),
    appFeeHourlyLE: z.number(),
    intendedShareLE: z.number(),
  }),
  note: z.string().optional(),
});
export type CreateSessionResponse = z.infer<typeof CreateSessionResponse>;


