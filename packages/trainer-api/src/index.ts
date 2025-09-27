import { AuthClient } from '@repo/auth-client';
import { 
  TrainerRequest, 
  TrainerProfile, 
  Court, 
  SessionSummary, 
  Pagination, 
  WorkingWindow, 
  Blackout,
  // RequestStatus 
} from './schemas';

export * from './schemas';

type ListTrainerRequestsQuery = {
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'ALL';
  page?: number;
  pageSize?: number;
};

type ListTrainerSessionsQuery = {
  status?: 'UPCOMING' | 'PAST' | 'ALL';
  page?: number;
  pageSize?: number;
};

type GetCourtsQuery = {
  area?: string;
  page?: number;
  pageSize?: number;
};

export async function listTrainerRequests(
  auth: AuthClient,
  query: ListTrainerRequestsQuery = {}
): Promise<Pagination<TrainerRequest>> {
  return auth.withAuth(async (headers) => {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.page) params.set('page', query.page.toString());
    if (query.pageSize) params.set('pageSize', query.pageSize.toString());

    const res = await fetch(`${auth.getBaseUrl()}/me/trainer-requests?${params}`, {
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch trainer requests: ${res.statusText}`);
    }

    const data = await res.json() as any;
      console.log('😟',data )
      console.log('&&&&',{
        items: data.requests || [],
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        totalCount: data.totalCount || 0,
        totalPages: Math.ceil((data.totalCount || 0) / (data.pageSize || 20)),
      })
    return {
      items: data.data.requests || [],
      page: data.data.page || 1,
      pageSize: data.data.pageSize || 20,
      totalCount: data.data.totalCount || 0,
      totalPages: Math.ceil((data.data.totalCount || 0) / (data.data.pageSize || 20)),
    };
  });
}

export async function respondTrainerRequest(
  auth: AuthClient,
  id: string,
  accept: boolean,
  comment?: string
): Promise<{ status: 'ACCEPTED' | 'DECLINED' }> {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/trainer-requests/${id}/respond`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accept, comment }),
    });

    if (!res.ok) {
      throw new Error(`Failed to respond to trainer request: ${res.statusText}`);
    }

    return res.json() as Promise<{ status: 'ACCEPTED' | 'DECLINED' }>;
  });
}

export async function getAllCourts(
  auth: AuthClient,
  query: GetCourtsQuery = {}
): Promise<Court[]> {
  return auth.withAuth(async (headers) => {
    const params = new URLSearchParams();
    if (query.area) params.set('area', query.area);
    if (query.page) params.set('page', query.page.toString());
    if (query.pageSize) params.set('pageSize', query.pageSize.toString());

    const res = await fetch(`${auth.getBaseUrl()}/courts?${params}`, {
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch courts: ${res.statusText}`);
    }

    const data = await res.json() as any;
    return Array.isArray(data) ? data : data.courts || [];
  });
}

export async function getTrainerProfile(auth: AuthClient): Promise<TrainerProfile> {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/me/trainer`, {
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch trainer profile: ${res.statusText}`);
    }

    return res.json() as Promise<TrainerProfile>;
  });
}

export async function updateTrainerProfile(
  auth: AuthClient,
  patch: Partial<Omit<TrainerProfile, 'id'>>
): Promise<TrainerProfile> {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/me/trainer`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      throw new Error(`Failed to update trainer profile: ${res.statusText}`);
    }

    return res.json() as Promise<TrainerProfile>;
  });
}

export async function listTrainerSessions(
  auth: AuthClient,
  query: ListTrainerSessionsQuery = {}
): Promise<Pagination<SessionSummary>> {
  return auth.withAuth(async (headers) => {
    const params = new URLSearchParams();
    params.set('role', 'TRAINER');
    if (query.status) params.set('status', query.status);
    if (query.page) params.set('page', query.page.toString());
    if (query.pageSize) params.set('pageSize', query.pageSize.toString());

    const res = await fetch(`${auth.getBaseUrl()}/me/sessions?${params}`, {
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch trainer sessions: ${res.statusText}`);
    }

    const data = await res.json() as any;
    return {
      items: data.data?.sessions || data.sessions || [],
      page: data.data?.page || data.page || 1,
      pageSize: data.data?.pageSize || data.pageSize || 20,
      totalCount: data.data?.totalCount || data.totalCount || 0,
      totalPages: data.data?.totalPages || data.totalPages || 0,
    };
  });
}

export async function getTrainerCalendar(auth: AuthClient, trainerId: string) {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/calendar/TRAINER/${trainerId}`, {
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch trainer calendar: ${res.statusText}`);
    }

    return res.json();
  });
}

export async function putWorkingWindows(
  auth: AuthClient,
  trainerId: string,
  payload: { week: WorkingWindow[] }
) {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/calendar/TRAINER/${trainerId}/working-windows`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to update working windows: ${res.statusText}`);
    }

    return res.json();
  });
}

export async function patchWorkingWindows(
  auth: AuthClient,
  trainerId: string,
  payload: Partial<{ week: WorkingWindow[] }>
) {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/calendar/TRAINER/${trainerId}/working-windows`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to patch working windows: ${res.statusText}`);
    }

    return res.json();
  });
}

export async function listBlackouts(auth: AuthClient, trainerId: string): Promise<Blackout[]> {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/calendar/TRAINER/${trainerId}/blackouts`, {
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch blackouts: ${res.statusText}`);
    }

    const data = await res.json() as any;
    return Array.isArray(data) ? data : data.blackouts || [];
  });
}

export async function addBlackout(
  auth: AuthClient,
  trainerId: string,
  blackout: { startAt: string; endAt: string; reason?: string }
) {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/calendar/TRAINER/${trainerId}/blackouts`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blackout),
    });

    if (!res.ok) {
      throw new Error(`Failed to add blackout: ${res.statusText}`);
    }

    return res.json();
  });
}

export async function removeBlackout(auth: AuthClient, blackoutId: string) {
  return auth.withAuth(async (headers) => {
    const res = await fetch(`${auth.getBaseUrl()}/calendar/blackouts/${blackoutId}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to remove blackout: ${res.statusText}`);
    }

    return res.json();
  });
}