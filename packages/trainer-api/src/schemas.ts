import { z } from 'zod'

// Enums
export const Rank = z.enum(['UNKNOWN', 'LOW_D', 'MID_D', 'HIGH_D'])
export type Rank = z.infer<typeof Rank>

export const RequestStatus = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'])
export type RequestStatus = z.infer<typeof RequestStatus>

export const SessionType = z.enum(['OPEN', 'PRIVATE'])
export type SessionType = z.infer<typeof SessionType>

export const SessionStatus = z.enum(['PENDING', 'APPROVED', 'LOCKED', 'UPCOMING', 'COMPLETED', 'CANCELLED'])
export type SessionStatus = z.infer<typeof SessionStatus>

// Core schemas
export const Court = z.object({
  id: z.string(),
  name: z.string(),
  area: z.string().optional(),
  address: z.string().optional(),
  priceHourlyLE: z.number(),
})
export type Court = z.infer<typeof Court>

export const Player = z.object({
  playerId: z.string(),
  name: z.string().optional(),
})
export type Player = z.infer<typeof Player>

export const Seats = z.object({
  filled: z.number(),
  total: z.number(),
})
export type Seats = z.infer<typeof Seats>

export const TrainerRequest = z.object({
  id: z.string(),
  sessionId: z.string(),
  status: RequestStatus,
  createdAt: z.string(),
  expiresAt: z.string(),
  court: Court,
  startAt: z.string(),
  durationMinutes: z.number(),
  seats: Seats,
  creator: Player,
})
export type TrainerRequest = z.infer<typeof TrainerRequest>

export const TrainerProfile = z.object({
  id: z.string(),
  hourlyPriceLE: z.number().min(50).max(10000),
  maxLevel: Rank,
  areasCovered: z.array(z.string()),
  acceptedCourtIds: z.array(z.string()),
})
export type TrainerProfile = z.infer<typeof TrainerProfile>

export const SessionSummary = z.object({
  id: z.string(),
  type: SessionType,
  status: SessionStatus,
  startAt: z.string(),
  durationMinutes: z.number(),
  seats: Seats,
  court: Court,
  creator: Player.optional(),
})
export type SessionSummary = z.infer<typeof SessionSummary>

// Pagination
export const Pagination = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
  })

export type Pagination<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// Request/Response schemas
export const RespondRequestSchema = z.object({
  accept: z.boolean(),
  comment: z.string().optional(),
})
export type RespondRequest = z.infer<typeof RespondRequestSchema>

export const UpdateTrainerProfileSchema = z.object({
  hourlyPriceLE: z.number().min(50).max(10000).optional(),
  maxLevel: Rank.optional(),
  areasCovered: z.array(z.string()).optional(),
  acceptedCourtIds: z.array(z.string()).optional(),
})
export type UpdateTrainerProfile = z.infer<typeof UpdateTrainerProfileSchema>

// Calendar schemas
export const TimeRange = z.object({
  from: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm format
  to: z.string().regex(/^\d{2}:\d{2}$/),   // HH:mm format
})
export type TimeRange = z.infer<typeof TimeRange>

export const WorkingDay = z.object({
  day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  ranges: z.array(TimeRange),
})
export type WorkingDay = z.infer<typeof WorkingDay>

export const WorkingWindows = z.object({
  week: z.array(WorkingDay),
})
export type WorkingWindows = z.infer<typeof WorkingWindows>

export const Blackout = z.object({
  id: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  reason: z.string().optional(),
})
export type Blackout = z.infer<typeof Blackout>

export const AddBlackoutSchema = z.object({
  startAt: z.string(),
  endAt: z.string(),
  reason: z.string().optional(),
})
export type AddBlackout = z.infer<typeof AddBlackoutSchema>

// Query schemas
export const TrainerRequestsQuery = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'ALL']).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
})
export type TrainerRequestsQuery = z.infer<typeof TrainerRequestsQuery>

export const TrainerSessionsQuery = z.object({
  status: z.enum(['UPCOMING', 'PAST', 'ALL']).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
})
export type TrainerSessionsQuery = z.infer<typeof TrainerSessionsQuery>

export const CourtsQuery = z.object({
  area: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
})
export type CourtsQuery = z.infer<typeof CourtsQuery>
