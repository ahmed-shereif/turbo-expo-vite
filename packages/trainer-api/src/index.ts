import type { AuthClient } from '@repo/auth-client'
import {
  TrainerRequest,
  TrainerProfile,
  SessionSummary,
  Court,
  Pagination,
  RespondRequest,
  UpdateTrainerProfile,
  WorkingWindows,
  Blackout,
  AddBlackout,
  TrainerRequestsQuery,
  TrainerSessionsQuery,
  CourtsQuery,
  RequestStatus,
  SessionStatus,
} from './schemas'

// Trainer Requests API
export async function listTrainerRequests(
  authClient: AuthClient,
  query: TrainerRequestsQuery = {}
): Promise<Pagination<TrainerRequest>> {
  const params = new URLSearchParams()
  if (query.status) params.append('status', query.status)
  if (query.page) params.append('page', query.page.toString())
  if (query.pageSize) params.append('pageSize', query.pageSize.toString())

  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/me/trainer-requests?${params}`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trainer requests: ${response.statusText}`)
    }
    
    return response.json()
  })
}

export async function respondTrainerRequest(
  authClient: AuthClient,
  id: string,
  accept: boolean,
  comment?: string
): Promise<{ status: 'ACCEPTED' | 'DECLINED' }> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/trainer-requests/${id}/respond`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accept, comment }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to respond to trainer request: ${response.statusText}`)
    }
    
    return response.json()
  })
}

// Courts API
export async function getAllCourts(
  authClient: AuthClient,
  query: CourtsQuery = {}
): Promise<Court[]> {
  const params = new URLSearchParams()
  if (query.area) params.append('area', query.area)
  if (query.page) params.append('page', query.page.toString())
  if (query.pageSize) params.append('pageSize', query.pageSize.toString())

  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/courts?${params}`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch courts: ${response.statusText}`)
    }
    
    return response.json()
  })
}

// Trainer Profile API
export async function getTrainerProfile(authClient: AuthClient): Promise<TrainerProfile> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/me/trainer`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trainer profile: ${response.statusText}`)
    }
    
    return response.json()
  })
}

export async function updateTrainerProfile(
  authClient: AuthClient,
  patch: UpdateTrainerProfile
): Promise<TrainerProfile> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/me/trainer`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update trainer profile: ${response.statusText}`)
    }
    
    return response.json()
  })
}

// Trainer Sessions API
export async function listTrainerSessions(
  authClient: AuthClient,
  query: TrainerSessionsQuery = {}
): Promise<Pagination<SessionSummary>> {
  const params = new URLSearchParams()
  params.append('role', 'TRAINER')
  if (query.status) params.append('status', query.status)
  if (query.page) params.append('page', query.page.toString())
  if (query.pageSize) params.append('pageSize', query.pageSize.toString())

  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/me/sessions?${params}`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trainer sessions: ${response.statusText}`)
    }
    
    return response.json()
  })
}

// Calendar API
export async function getTrainerCalendar(
  authClient: AuthClient,
  trainerId: string
): Promise<any> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/calendar/TRAINER/${trainerId}`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trainer calendar: ${response.statusText}`)
    }
    
    return response.json()
  })
}

export async function putWorkingWindows(
  authClient: AuthClient,
  trainerId: string,
  payload: WorkingWindows
): Promise<void> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/calendar/TRAINER/${trainerId}/working-windows`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update working windows: ${response.statusText}`)
    }
  })
}

export async function patchWorkingWindows(
  authClient: AuthClient,
  trainerId: string,
  payload: Partial<WorkingWindows>
): Promise<void> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/calendar/TRAINER/${trainerId}/working-windows`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to patch working windows: ${response.statusText}`)
    }
  })
}

export async function listBlackouts(
  authClient: AuthClient,
  trainerId: string
): Promise<Blackout[]> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/calendar/TRAINER/${trainerId}/blackouts`, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blackouts: ${response.statusText}`)
    }
    
    return response.json()
  })
}

export async function addBlackout(
  authClient: AuthClient,
  trainerId: string,
  blackout: AddBlackout
): Promise<Blackout> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/calendar/TRAINER/${trainerId}/blackouts`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blackout),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to add blackout: ${response.statusText}`)
    }
    
    return response.json()
  })
}

export async function removeBlackout(
  authClient: AuthClient,
  blackoutId: string
): Promise<void> {
  return authClient.withAuth(async (headers) => {
    const response = await fetch(`${authClient.getBaseUrl()}/api/calendar/blackouts/${blackoutId}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to remove blackout: ${response.statusText}`)
    }
  })
}

// Re-export schemas
export * from './schemas'
