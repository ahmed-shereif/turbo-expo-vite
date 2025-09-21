import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step2_CourtTime } from '../Step2_CourtTime';
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

describe('Step2_CourtTime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchCourts as any).mockResolvedValue(mockCourts);
    (quickCheckCourt as any).mockResolvedValue(mockAvailabilityCheck);
  });

  it('should render court list and time slots', async () => {
    const mockProps = {
      dayISO: '2025-10-02',
      court: null,
      startTimeHHmm: null,
      durationMinutes: 60,
      onCourtChange: vi.fn(),
      onTimeChange: vi.fn(),
      onDurationChange: vi.fn(),
    };

    render(<Step2_CourtTime {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Court 1')).toBeInTheDocument();
      expect(screen.getByText('Court 2')).toBeInTheDocument();
    });

    // Check that time slots are rendered
    expect(screen.getByText('07:00')).toBeInTheDocument();
    expect(screen.getByText('18:00')).toBeInTheDocument();
  });

  it('should call quickCheckCourt when time slot is clicked', async () => {
    const mockProps = {
      dayISO: '2025-10-02',
      court: null,
      startTimeHHmm: null,
      durationMinutes: 60,
      onCourtChange: vi.fn(),
      onTimeChange: vi.fn(),
      onDurationChange: vi.fn(),
    };

    render(<Step2_CourtTime {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Court 1')).toBeInTheDocument();
    });

    // Click on a time slot
    const timeSlot = screen.getByText('18:00');
    fireEvent.click(timeSlot);

    await waitFor(() => {
      expect(quickCheckCourt).toHaveBeenCalledWith(
        auth,
        'court1',
        '2025-10-02T18:00:00.000Z',
        60
      );
    });
  });

  it('should select court and time when available slot is clicked', async () => {
    const mockOnCourtChange = vi.fn();
    const mockOnTimeChange = vi.fn();
    
    const mockProps = {
      dayISO: '2025-10-02',
      court: null,
      startTimeHHmm: null,
      durationMinutes: 60,
      onCourtChange: mockOnCourtChange,
      onTimeChange: mockOnTimeChange,
      onDurationChange: vi.fn(),
    };

    render(<Step2_CourtTime {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Court 1')).toBeInTheDocument();
    });

    // Click on a time slot
    const timeSlot = screen.getByText('18:00');
    fireEvent.click(timeSlot);

    await waitFor(() => {
      expect(mockOnCourtChange).toHaveBeenCalledWith(mockCourts[0]);
      expect(mockOnTimeChange).toHaveBeenCalledWith('18:00');
    });
  });

  it('should show error message when time slot is busy', async () => {
    (quickCheckCourt as any).mockResolvedValue({
      available: false,
      reason: 'Court is booked',
    });

    const mockProps = {
      dayISO: '2025-10-02',
      court: null,
      startTimeHHmm: null,
      durationMinutes: 60,
      onCourtChange: vi.fn(),
      onTimeChange: vi.fn(),
      onDurationChange: vi.fn(),
    };

    render(<Step2_CourtTime {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Court 1')).toBeInTheDocument();
    });

    // Click on a time slot
    const timeSlot = screen.getByText('18:00');
    fireEvent.click(timeSlot);

    await waitFor(() => {
      expect(screen.getByText('This time is busy on this court.')).toBeInTheDocument();
    });
  });

  it('should update duration when duration button is clicked', async () => {
    const mockOnDurationChange = vi.fn();
    
    const mockProps = {
      dayISO: '2025-10-02',
      court: null,
      startTimeHHmm: null,
      durationMinutes: 60,
      onCourtChange: vi.fn(),
      onTimeChange: vi.fn(),
      onDurationChange: mockOnDurationChange,
    };

    render(<Step2_CourtTime {...mockProps} />);

    // Click on 90 minutes duration
    const durationButton = screen.getByText('90 min');
    fireEvent.click(durationButton);

    expect(mockOnDurationChange).toHaveBeenCalledWith(90);
  });
});
