import { describe, it, expect, vi } from 'vitest'
import { listTrainerRequests, respondTrainerRequest, getTrainerProfile, updateTrainerProfile } from '../src/index'

// Mock the auth client
const mockAuth = {
  withAuth: vi.fn((fn) => fn('mock-token'))
}

// Mock fetch
global.fetch = vi.fn()

describe('Trainer API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listTrainerRequests', () => {
    it('should fetch trainer requests with correct parameters', async () => {
      const mockResponse = {
        requests: [
          {
            id: 'trq_1',
            sessionId: 'sess_123',
            status: 'PENDING',
            createdAt: '2025-01-01T10:00:00Z',
            expiresAt: '2025-01-01T12:00:00Z',
            court: { id: 'court_1', name: 'Test Court', area: 'Test Area' },
            startAt: '2025-01-01T16:00:00Z',
            durationMinutes: 60,
            seats: { filled: 2, total: 4 },
            creator: { playerId: 'p_1', name: 'Test Player' }
          }
        ],
        page: 1,
        pageSize: 20,
        totalCount: 1,
        totalPages: 1
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listTrainerRequests(mockAuth as any, { status: 'PENDING', page: 1 })

      expect(mockAuth.withAuth).toHaveBeenCalled()
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/me/trainer-requests?status=PENDING&page=1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors correctly', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      })

      await expect(listTrainerRequests(mockAuth as any, {}))
        .rejects.toThrow('Failed to fetch trainer requests: Not Found')
    })
  })

  describe('respondTrainerRequest', () => {
    it('should respond to trainer request with accept', async () => {
      const mockResponse = { status: 'ACCEPTED' }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await respondTrainerRequest(mockAuth as any, 'trq_1', true, 'Great!')

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/trainer-requests/trq_1/respond',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ accept: true, comment: 'Great!' })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should respond to trainer request with decline', async () => {
      const mockResponse = { status: 'DECLINED' }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await respondTrainerRequest(mockAuth as any, 'trq_1', false)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/trainer-requests/trq_1/respond',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ accept: false })
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTrainerProfile', () => {
    it('should fetch trainer profile', async () => {
      const mockResponse = {
        id: 'trainer_1',
        hourlyPriceLE: 500,
        maxLevel: 'HIGH_D',
        areasCovered: ['Zamalek', 'Nasr City'],
        acceptedCourtIds: ['court_1', 'court_2']
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getTrainerProfile(mockAuth as any)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/me/trainer',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateTrainerProfile', () => {
    it('should update trainer profile', async () => {
      const updateData = {
        hourlyPriceLE: 600,
        maxLevel: 'HIGH_D' as const,
        areasCovered: ['Zamalek'],
        acceptedCourtIds: ['court_1']
      }

      const mockResponse = {
        id: 'trainer_1',
        ...updateData
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await updateTrainerProfile(mockAuth as any, updateData)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/me/trainer',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData)
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
