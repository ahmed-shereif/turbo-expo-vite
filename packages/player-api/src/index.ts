import { z } from 'zod';
import {
  type Rank as RankT,
  OpenSessionItem,
  SessionDetail,
  CourtConfirmation,
  MySessionsResp,
} from './schemas';

export type { RankT as Rank };

export const rankOrder: Record<RankT, number> = {
  UNKNOWN: 0,
  LOW_D: 1,
  MID_D: 2,
  HIGH_D: 3,
};

export function isEligible(playerRank?: RankT, minRank?: RankT): boolean {
  console.log('isEligible', playerRank, minRank);
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
  baseUrl?: string;
  getBaseUrl?: () => string;
};

function base(auth: AuthLike): string {
  const raw = (auth.getBaseUrl && auth.getBaseUrl()) || auth.baseUrl || '';
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
    const sessionId = ensureSessionId(id);
    const res = await fetch(`${base(auth)}/sessions/${sessionId}`, { headers });
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


