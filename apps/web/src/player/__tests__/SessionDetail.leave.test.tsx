import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as playerApi from '@repo/player-api';
import SessionDetail from '../routes/SessionDetail';

vi.mock('@repo/player-api', async () => {
  const actual = await vi.importActual<any>('@repo/player-api');
  return {
    ...actual,
    fetchSession: vi.fn(),
    getCourtConfirmation: vi.fn().mockResolvedValue({ status: 'PENDING' }),
    leaveSession: vi.fn(),
  };
});

function setupRoute(id: string) {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/player/session/${id}`]}>
        <Routes>
          <Route path="/player/session/:id" element={<SessionDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SessionDetail leave flow', () => {
  it('calls leaveSession with correct ids', async () => {
    // Mock auth context via hook
    vi.mock('../../auth/AuthContext', async () => ({
      useAuth: () => ({ user: { id: 'u1', roles: ['PLAYER'] } }),
    }));

    (playerApi.fetchSession as any).mockResolvedValue({
      id: 's1',
      type: 'OPEN',
      status: 'PENDING',
      startAt: new Date().toISOString(),
      durationMinutes: 60,
      seats: { filled: 1, total: 4 },
      court: { id: 'c1', name: 'Court A', area: 'Zamalek', priceHourlyLE: 200 },
      trainer: { id: 't1', name: 'Trainer A', maxLevel: 3, priceHourlyLE: 150 },
      pricing: { currency: 'EGP', courtPriceHourlyLE: 200, trainerPriceHourlyLE: 150, appFeeHourlyLE: 0 },
      minRank: 'LOW_D',
      members: [{ playerId: 'u1', role: 'PARTICIPANT', name: 'User One' }],
      creator: { playerId: 'u1' },
    });
    (playerApi.leaveSession as any).mockResolvedValue({ status: 'OK', refund: 'FULL' });

    setupRoute('s1');

    // Wait for detail load
    expect(await screen.findByText('Session Detail')).toBeInTheDocument();

    // Open leave modal
    const leaveBtn = screen.getByText('Leave Session');
    fireEvent.click(leaveBtn);

    // Confirm leave
    const confirmBtn = await screen.findByText('Confirm Leave');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(playerApi.leaveSession).toHaveBeenCalledWith(expect.anything(), 's1', 'u1');
    });
  });
});


