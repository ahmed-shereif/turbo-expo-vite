import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  };
});

vi.mock('../../auth/AuthContext', async () => ({
  useAuth: () => ({ user: { id: 'u1', roles: ['PLAYER'] } }),
}));

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

describe('SessionDetail data rendering', () => {
  it('renders member name and rank when provided', async () => {
    (playerApi.fetchSession as any).mockResolvedValue({
      id: 's1',
      type: 'OPEN',
      status: 'PENDING',
      startAt: new Date().toISOString(),
      durationMinutes: 60,
      seats: { filled: 2, total: 4 },
      court: { id: 'c1', name: 'Court A', area: 'Zamalek', priceHourlyLE: 200 },
      trainer: { id: 't1', name: 'Trainer A', maxLevel: 3, priceHourlyLE: 150 },
      pricing: { currency: 'EGP', courtPriceHourlyLE: 200, trainerPriceHourlyLE: 150, appFeeHourlyLE: 0 },
      minRank: 'LOW_D',
      members: [
        { playerId: 'u1', role: 'PARTICIPANT', name: 'User One', rank: 'MID_D' },
        { playerId: 'u2', role: 'PARTICIPANT', name: 'User Two', rank: 'HIGH_D' },
      ],
      creator: { playerId: 'u1' },
    });

    setupRoute('s1');

    expect(await screen.findByText('Session Detail')).toBeInTheDocument();
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText(/Rank: MID_D/)).toBeInTheDocument();
    expect(screen.getByText('Trainer A')).toBeInTheDocument();
    expect(screen.getByText('Court A')).toBeInTheDocument();
  });

  it('falls back to generic labels when member name is missing', async () => {
    (playerApi.fetchSession as any).mockResolvedValue({
      id: 's2',
      type: 'OPEN',
      status: 'PENDING',
      startAt: new Date().toISOString(),
      durationMinutes: 60,
      seats: { filled: 2, total: 4 },
      court: { id: 'c1', name: 'Court B', area: '', priceHourlyLE: 0 },
      trainer: { id: 't1', name: '', maxLevel: undefined, priceHourlyLE: undefined },
      pricing: { currency: 'EGP', courtPriceHourlyLE: 0, trainerPriceHourlyLE: 0, appFeeHourlyLE: 0 },
      members: [
        { playerId: 'u1', role: 'PARTICIPANT' },
      ],
    });

    setupRoute('s2');

    expect(await screen.findByText('Session Detail')).toBeInTheDocument();
    // Fallback name used in component is 'Player'
    expect(screen.getByText('Player')).toBeInTheDocument();
    // Court fallback name still renders provided name
    expect(screen.getByText('Court B')).toBeInTheDocument();
  });
});


