import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateSessionStep2 from '../../../../app/(player)/create/court-time';
import { auth } from '../../../lib/authClient';
import { fetchCourts, quickCheckCourt } from '@repo/player-api';

// Mock the API functions
vi.mock('../../../lib/authClient', () => ({
  auth: {},
}));

vi.mock('@repo/player-api', () => ({
  fetchCourts: vi.fn(),
  quickCheckCourt: vi.fn(),
  combineDayAndTime: vi.fn((day, time) => `${day}T${time}:00.000Z`),
}));

vi.mock('../../../lib/notify', () => ({
  notify: {
    error: vi.fn(),
  },
}));

vi.mock('expo-router', () => ({
  router: {
    push: vi.fn(),
    back: vi.fn(),
  },
}));

const mockCourts = [
  {
    id: 'court1',
    name: 'Court 1',
    area: 'Maadi',
    priceHourlyLE: 100,
    facilities: ['Air Conditioning', 'Parking'],
  },
  {
    id: 'court2',
    name: 'Court 2',
    area: 'Zamalek',
    priceHourlyLE: 150,
    facilities: ['Lighting'],
  },
];

const mockAvailabilityCheck = {
  available: true,
  reason: undefined,
  conflicts: undefined,
};

describe('CreateSessionStep2 (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchCourts as any).mockResolvedValue(mockCourts);
    (quickCheckCourt as any).mockResolvedValue(mockAvailabilityCheck);
  });

  it('should render court list and time slots', async () => {
    render(<CreateSessionStep2 />);

    await waitFor(() => {
      expect(screen.getByText('Court 1')).toBeTruthy();
      expect(screen.getByText('Court 2')).toBeTruthy();
    });

    // Check that time slots are rendered
    expect(screen.getByText('07:00')).toBeTruthy();
    expect(screen.getByText('18:00')).toBeTruthy();
  });

  it('should call quickCheckCourt when time slot is pressed', async () => {
    render(<CreateSessionStep2 />);

    await waitFor(() => {
      expect(screen.getByText('Court 1')).toBeTruthy();
    });

    // Press on a time slot
    const timeSlot = screen.getByText('18:00');
    fireEvent.press(timeSlot);

    await waitFor(() => {
      expect(quickCheckCourt).toHaveBeenCalledWith(
        auth,
        'court1',
        '2025-10-02T18:00:00.000Z',
        60
      );
    });
  });

  it('should select court and time when available slot is pressed', async () => {
    render(<CreateSessionStep2 />);

    await waitFor(() => {
      expect(screen.getByText('Court 1')).toBeTruthy();
    });

    // Press on a time slot
    const timeSlot = screen.getByText('18:00');
    fireEvent.press(timeSlot);

    await waitFor(() => {
      // Check that the selected court and time are displayed
      expect(screen.getByText(/Selected: Court 1 at 18:00/)).toBeTruthy();
    });
  });

  it('should show error message when time slot is busy', async () => {
    (quickCheckCourt as any).mockResolvedValue({
      available: false,
      reason: 'Court is booked',
    });

    render(<CreateSessionStep2 />);

    await waitFor(() => {
      expect(screen.getByText('Court 1')).toBeTruthy();
    });

    // Press on a time slot
    const timeSlot = screen.getByText('18:00');
    fireEvent.press(timeSlot);

    await waitFor(() => {
      expect(screen.getByText('This time is busy on this court.')).toBeTruthy();
    });
  });

  it('should update duration when duration button is pressed', async () => {
    render(<CreateSessionStep2 />);

    // Press on 90 minutes duration
    const durationButton = screen.getByText('90 min');
    fireEvent.press(durationButton);

    // The duration should be updated in the UI
    await waitFor(() => {
      expect(screen.getByText('90 min')).toBeTruthy();
    });
  });
});
