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

export const SessionSummary = z.object({
  id: z.string(),
  type: z.string(),
  status: z.string(),
  startAt: z.string(),
  durationMinutes: z.number(),
  seats: Seats,
  minRank: Rank.optional(),
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
    maxLevel: z.coerce.number().optional(),
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
  rank: Rank.optional(),
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


