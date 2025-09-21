import { z } from 'zod';
import {
  type Rank as RankT,
  OpenSessionItem,
  SessionDetail,
  CourtConfirmation,
  MySessionsResp,
  Court,
  Trainer,
  AvailabilityCheck,
  CreateSessionPayload,
  CreateSessionResponse,
} from './schemas';

export type { Court, Trainer };

export type { RankT as Rank };

export const rankOrder: Record<RankT, number> = {
  UNKNOWN: 0,
  LOW_D: 1,
  MID_D: 2,
  HIGH_D: 3,
};

export function isEligible(playerRank?: RankT, minRank?: RankT): boolean {
  if (!minRank) return true;
  if (!playerRank) return false;
  return rankOrder[playerRank] >= rankOrder[minRank];
}

type OpenSessionsParams = {
  area?: string;
  bbox?: string;
  dateFrom?: string;
  dateTo?: string;
  minRankEligible?: boolean;
  facilities?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: string; // startAt|price|rating
  page?: number;
  pageSize?: number;
};

type AuthLike = {
  withAuth<T>(fn: (headers: Record<string, string>) => Promise<T>): Promise<T>;
  getBaseUrl(): string;
};

function base(auth: AuthLike): string {
  const raw = auth.getBaseUrl();
  // Ensure no trailing slash to avoid accidental double slashes when composing URLs
  return raw.replace(/\/+$/, '');
}

function ensureSessionId(id: string): string {
  const trimmed = (id ?? '').toString().trim();
  if (!trimmed) {
    const error = new Error('Missing session id') as any;
    (error.status = 400);
    throw error;
  }
  return encodeURIComponent(trimmed);
}

function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) q.append(`${key}[]`, String(v));
    } else {
      q.set(key, String(value));
    }
  }
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

function unwrapApi<T>(body: any): T {
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    (body as any).success === true &&
    'data' in body
  ) {
    return (body as any).data as T;
  }
  return body as T;
}

export async function fetchOpenSessions(auth: AuthLike, params: OpenSessionsParams) {
  const qs = buildQuery({
    area: params.area,
    bbox: params.bbox,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    minRankEligible: params.minRankEligible,
    facilities: params.facilities,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize,
  });
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const res = await fetch(`${base(auth)}/open-sessions${qs}`, { headers });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      (error.status = status), (error.body = body);
      throw error;
    }
    return unwrapApi(body);
  });
  let items: any[] = [];
  if (Array.isArray(data)) {
    items = data as any[];
  } else if (data && Array.isArray((data as any).items)) {
    items = (data as any).items as any[];
  } else {
    throw Object.assign(new Error('Unexpected response from server'), { status: 500, body: data });
  }

  const mapped = items.map((it: any) => {
    const trainerMax = Number(it?.trainer?.maxLevel);
    // Handle both possible field names for session ID
    const sessionId = it.sessionId ?? it.id ?? '';
    if (!sessionId) {
      console.warn('Session item missing ID:', it);
    }
    return {
      id: sessionId,
      type: 'OPEN',
      status: 'PENDING',
      startAt: it.startAt,
      durationMinutes: it.durationMinutes,
      seats: it.seats ?? { filled: 0, total: 0 },
      minRank: it.minRank,
      isJoined: it.isJoined ?? false,
      court: {
        id: it.court?.id ?? '',
        name: it.court?.name ?? '',
        area: it.court?.area ?? '',
        priceHourlyLE: it.court?.priceHourlyLE ?? 0,
      },
      trainer: {
        id: it.trainer?.id ?? '',
        name: it.trainer?.name ?? '',
        maxLevel: Number.isFinite(trainerMax) ? trainerMax : 0,
        priceHourlyLE: it.trainer?.priceHourlyLE ?? 0,
      },
      // pricing intentionally omitted for discover
    };
  });

  const parsed = z.array(OpenSessionItem).parse(mapped);
  return parsed;
}

export async function fetchSession(auth: AuthLike, id: string) {
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    // console.log("data=>>",data)
    const sessionId = ensureSessionId(id);
    const res = await fetch(`${base(auth)}/sessions/${sessionId}`, { headers });
    console.log('🧛', res)
    const body = await res.json().catch(() => ({}));
    console.log('🙆‍♂️body ', body)
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      (error.status = status), (error.body = body);
      throw error;
    }
    const raw = unwrapApi<any>(body);
    console.log('🧖‍♀️=> ', raw)
    // Defensive normalize for partial fields
    const normalized = {
      ...raw,
      court: {
        id: raw?.court?.id ?? '',
        name: raw?.court?.name ?? '',
        area: raw?.court?.area ?? raw?.court?.district ?? undefined,
        address: raw?.court?.address ?? undefined,
        priceHourlyLE: isFinite(Number(raw?.court?.priceHourlyLE)) ? Number(raw?.court?.priceHourlyLE) : undefined,
        facilities: Array.isArray(raw?.court?.facilities) ? raw.court.facilities : undefined,
      },
      trainer: {
        id: raw?.trainer?.id ?? '',
        name: raw?.trainer?.name ?? undefined,
        maxLevel: isFinite(Number(raw?.trainer?.maxLevel)) ? Number(raw?.trainer?.maxLevel) : undefined,
        priceHourlyLE: isFinite(Number(raw?.trainer?.priceHourlyLE)) ? Number(raw?.trainer?.priceHourlyLE) : undefined,
      },
    };
    return normalized;
  });
  return SessionDetail.parse(data);
}

export async function joinSession(auth: AuthLike, id: string) {
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const sessionId = ensureSessionId(id);
    const res = await fetch(`${base(auth)}/sessions/${sessionId}/join`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      (error.status = status), (error.body = body);
      throw error;
    }
    return unwrapApi(body);
  });
  return z
    .object({ status: z.literal('PENDING'), seats: z.object({ filled: z.number(), total: z.number() }) })
    .parse(data);
}

export async function confirmWithCurrent(auth: AuthLike, id: string) {
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const sessionId = ensureSessionId(id);
    const res = await fetch(`${base(auth)}/sessions/${sessionId}/confirm-with-current`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      (error.status = status), (error.body = body);
      throw error;
    }
    return unwrapApi(body);
  });
  return z
    .object({
      consensus: z.object({ required: z.number(), accepted: z.number(), pending: z.array(z.string()) }),
      proposedActualShare: z.number().optional(),
      expiresAt: z.string().optional(),
    })
    .parse(data);
}

export async function getCourtConfirmation(auth: AuthLike, id: string) {
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const sessionId = ensureSessionId(id);
    const res = await fetch(`${base(auth)}/sessions/${sessionId}/court-confirmation`, {
      headers,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      (error.status = status), (error.body = body);
      throw error;
    }
    return unwrapApi(body);
  });
  return CourtConfirmation.parse(data);
}

export async function fetchMySessions(
  auth: AuthLike,
  q: { status?: 'UPCOMING' | 'PAST' | 'ALL'; page?: number; pageSize?: number },
) {
  const qs = buildQuery({ status: q.status, page: q.page, pageSize: q.pageSize });
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const res = await fetch(`${base(auth)}/me/sessions${qs}`, { headers });
    console.log('💆‍♂️me/sessions =>?', res)
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      (error.status = status), (error.body = body);
      throw error;
    }
    return unwrapApi(body);
  });
  return MySessionsResp.parse(data);
}
export async function leaveSession(
  auth: AuthLike,
  id: string,
  playerId: string,
  reason = 'player_left',
) {
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const sessionId = ensureSessionId(id);
    const res = await fetch(`${base(auth)}/sessions/${sessionId}/cancel`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, reason }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      (error.status = status), (error.body = body);
      throw error;
    }
    return unwrapApi(body);
  });
  return z
    .object({ status: z.string(), refund: z.enum(['FULL', 'NONE', 'PARTIAL']).optional() })
    .parse(data);
}

export function formatEGP(amountLE?: number) {
  if (amountLE == null) return '';
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amountLE);
}

// Create Session Wizard API Functions

export async function fetchCourts(
  auth: AuthLike,
  q: {
    area?: string;
    priceMin?: number;
    priceMax?: number;
    facilities?: string[];
    page?: number;
    pageSize?: number;
    sort?: 'price' | 'rating' | 'name';
  }
): Promise<Court[]> {
  const qs = buildQuery({
    area: q.area,
    priceMin: q.priceMin,
    priceMax: q.priceMax,
    facilities: q.facilities,
    page: q.page,
    pageSize: q.pageSize,
    sort: q.sort,
  });
  
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const res = await fetch(`${base(auth)}/courts${qs}`, { headers });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      error.status = status;
      error.body = body;
      throw error;
    }
    return unwrapApi(body);
  });

  let items: any[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data && Array.isArray((data as any).courts)) {
    items = (data as any).courts;
  } else if (data && Array.isArray((data as any).items)) {
    items = (data as any).items;
  } else {
    throw Object.assign(new Error('Unexpected response from server'), { status: 500, body: data });
  }

  const mapped = items.map((item: any) => ({
    id: item.id ?? '',
    name: item.name ?? '',
    area: item.area ?? undefined,
    address: item.address ?? undefined,
    priceHourlyLE: Number(item.hourlyPrice ?? item.priceHourlyLE ?? 0),
    facilities: Array.isArray(item.facilities) ? item.facilities : undefined,
  }));

  return z.array(Court).parse(mapped);
}

export async function quickCheckCourt(
  auth: AuthLike,
  courtId: string,
  startAtISO: string,
  durationMinutes: number
): Promise<AvailabilityCheck> {
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const res = await fetch(
      `${base(auth)}/calendar/COURT/${encodeURIComponent(courtId)}/availability/check?startAt=${encodeURIComponent(startAtISO)}&durationMinutes=${durationMinutes}`,
      { headers }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      error.status = status;
      error.body = body;
      throw error;
    }
    return unwrapApi(body);
  });

  return AvailabilityCheck.parse(data);
}

export async function fetchTrainers(
  auth: AuthLike,
  q: {
    area?: string;
    maxLevel?: RankT;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    pageSize?: number;
    sort?: 'price' | 'rating' | 'name';
  }
): Promise<Trainer[]> {
  const qs = buildQuery({
    area: q.area,
    maxLevel: q.maxLevel,
    priceMin: q.priceMin,
    priceMax: q.priceMax,
    page: q.page,
    pageSize: q.pageSize,
    sort: q.sort,
  });
  
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const res = await fetch(`${base(auth)}/trainers${qs}`, { headers });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      error.status = status;
      error.body = body;
      throw error;
    }
    return unwrapApi(body);
  });

  let items: any[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data && Array.isArray((data as any).trainers)) {
    items = (data as any).trainers;
  } else if (data && Array.isArray((data as any).items)) {
    items = (data as any).items;
  } else {
    throw Object.assign(new Error('Unexpected response from server'), { status: 500, body: data });
  }

  const mapped = items.map((item: any) => ({
    id: item.id ?? '',
    name: item.name ?? '',
    maxLevel: isFinite(Number(item.maxLevel)) ? Number(item.maxLevel) : undefined,
    priceHourlyLE: isFinite(Number(item.priceHourlyLE)) ? Number(item.priceHourlyLE) : undefined,
    areasCovered: Array.isArray(item.areasCovered) ? item.areasCovered : undefined,
  }));

  return z.array(Trainer).parse(mapped);
}

export async function quickCheckTrainer(
  auth: AuthLike,
  trainerId: string,
  startAtISO: string,
  durationMinutes: number
): Promise<AvailabilityCheck> {
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const res = await fetch(
      `${base(auth)}/calendar/TRAINER/${encodeURIComponent(trainerId)}/availability/check?startAt=${encodeURIComponent(startAtISO)}&durationMinutes=${durationMinutes}`,
      { headers }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      error.status = status;
      error.body = body;
      throw error;
    }
    return unwrapApi(body);
  });

  return AvailabilityCheck.parse(data);
}

export async function createSession(
  auth: AuthLike,
  payload: CreateSessionPayload
): Promise<CreateSessionResponse> {
  const data = await auth.withAuth(async (headers: Record<string, string>) => {
    const res = await fetch(`${base(auth)}/sessions`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      const status = res.status;
      const error = new Error(message) as any;
      error.status = status;
      error.body = body;
      throw error;
    }
    return unwrapApi(body);
  });

  return CreateSessionResponse.parse(data);
}

// Utility functions
export function toUTCISO(dateLocal: Date): string {
  return dateLocal.toISOString();
}

export function combineDayAndTime(dayISO: string, timeHHmm: string): string {
  // Combine day (YYYY-MM-DD) and time (HH:mm) and convert to UTC ISO
  const localDateTime = new Date(`${dayISO}T${timeHHmm}:00`);
  return localDateTime.toISOString();
}

export function estimateIntendedShareLE(
  courtPriceLE?: number,
  trainerPriceLE?: number,
  seatsTotal: number = 4,
  appFeeLE: number = 0
): number {
  const courtShare = (courtPriceLE ?? 0) / seatsTotal;
  const trainerShare = (trainerPriceLE ?? 0) / seatsTotal;
  const appFeeShare = appFeeLE / seatsTotal;
  return Math.round(courtShare + trainerShare + appFeeShare);
}
