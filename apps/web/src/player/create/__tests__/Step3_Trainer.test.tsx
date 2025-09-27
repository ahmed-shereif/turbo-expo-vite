import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step3_Trainer } from '../Step3_Trainer';
import { auth } from '../../../lib/authClient';
import { fetchTrainers, quickCheckTrainer } from '@repo/player-api';

// Mock the API functions
vi.mock('../../../lib/authClient', () => ({
  auth: {},
}));

vi.mock('@repo/player-api', () => ({
  fetchTrainers: vi.fn(),
  quickCheckTrainer: vi.fn(),
  combineDayAndTime: vi.fn((day, time) => `${day}T${time}:00.000Z`),
}));

vi.mock('../../../lib/notify', () => ({
  notify: {
    error: vi.fn(),
  },
}));

const mockTrainers = [
  {
    id: 'trainer1',
    name: 'John Doe',
    maxLevel: 3,
    priceHourlyLE: 200,
    areasCovered: ['Maadi', 'Zamalek'],
  },
  {
    id: 'trainer2',
    name: 'Jane Smith',
    maxLevel: 2,
    priceHourlyLE: 150,
    areasCovered: ['Maadi'],
  },
];

const mockAvailabilityCheck = {
  available: true,
  reason: undefined,
  conflicts: undefined,
};

describe('Step3_Trainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchTrainers as any).mockResolvedValue(mockTrainers);
    (quickCheckTrainer as any).mockResolvedValue(mockAvailabilityCheck);
  });

  it('should render trainer list', async () => {
    const mockProps = {
      dayISO: '2025-10-02',
      court: { id: 'court1', name: 'Court 1', area: 'Maadi' },
      startTimeHHmm: '18:00',
      durationMinutes: 60,
      trainer: null,
      onTrainerChange: vi.fn(),
    };

    render(<Step3_Trainer {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should call quickCheckTrainer when trainer is clicked', async () => {
    const mockProps = {
      dayISO: '2025-10-02',
      court: { id: 'court1', name: 'Court 1', area: 'Maadi' },
      startTimeHHmm: '18:00',
      durationMinutes: 60,
      trainer: null,
      onTrainerChange: vi.fn(),
    };

    render(<Step3_Trainer {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on a trainer
    const trainerCard = screen.getByText('John Doe').closest('[data-testid="trainer-card"]') || 
                       screen.getByText('John Doe').closest('div');
    expect(trainerCard).toBeTruthy();
    fireEvent.click(trainerCard!);

    await waitFor(() => {
      expect(quickCheckTrainer).toHaveBeenCalledWith(
        auth,
        'trainer1',
        '2025-10-02T18:00:00.000Z',
        60
      );
    });
  });

  it('should select trainer when available', async () => {
    const mockOnTrainerChange = vi.fn();
    
    const mockProps = {
      dayISO: '2025-10-02',
      court: { id: 'court1', name: 'Court 1', area: 'Maadi' },
      startTimeHHmm: '18:00',
      durationMinutes: 60,
      trainer: null,
      onTrainerChange: mockOnTrainerChange,
    };

    render(<Step3_Trainer {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on a trainer
    const trainerCard = screen.getByText('John Doe').closest('div');
    expect(trainerCard).toBeTruthy();
    fireEvent.click(trainerCard!);

    await waitFor(() => {
      expect(mockOnTrainerChange).toHaveBeenCalledWith(mockTrainers[0]);
    });
  });

  it('should show error message when trainer is busy', async () => {
    (quickCheckTrainer as any).mockResolvedValue({
      available: false,
      reason: 'Trainer is booked',
    });

    const mockProps = {
      dayISO: '2025-10-02',
      court: { id: 'court1', name: 'Court 1', area: 'Maadi' },
      startTimeHHmm: '18:00',
      durationMinutes: 60,
      trainer: null,
      onTrainerChange: vi.fn(),
    };

    render(<Step3_Trainer {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on a trainer
    const trainerCard = screen.getByText('John Doe').closest('div');
    expect(trainerCard).toBeTruthy();
    fireEvent.click(trainerCard!);

    await waitFor(() => {
      expect(screen.getByText('Trainer is busy at this time.')).toBeInTheDocument();
    });
  });

  it('should show no available trainers message when none are available', async () => {
    (quickCheckTrainer as any).mockResolvedValue({
      available: false,
      reason: 'Trainer is booked',
    });

    const mockProps = {
      dayISO: '2025-10-02',
      court: { id: 'court1', name: 'Court 1', area: 'Maadi' },
      startTimeHHmm: '18:00',
      durationMinutes: 60,
      trainer: null,
      onTrainerChange: vi.fn(),
    };

    render(<Step3_Trainer {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on both trainers to check availability
    const trainer1Card = screen.getByText('John Doe').closest('div');
    const trainer2Card = screen.getByText('Jane Smith').closest('div');
    
    expect(trainer1Card).toBeTruthy();
    expect(trainer2Card).toBeTruthy();
    fireEvent.click(trainer1Card!);
    fireEvent.click(trainer2Card!);

    await waitFor(() => {
      expect(screen.getByText('No available trainers. Please select another date and time.')).toBeInTheDocument();
    });
  });

  it('should filter trainers by area coverage', async () => {
    const mockProps = {
      dayISO: '2025-10-02',
      court: { id: 'court1', name: 'Court 1', area: 'Zamalek' },
      startTimeHHmm: '18:00',
      durationMinutes: 60,
      trainer: null,
      onTrainerChange: vi.fn(),
    };

    render(<Step3_Trainer {...mockProps} />);

    await waitFor(() => {
      // John Doe should be shown (covers Zamalek)
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // Jane Smith should not be shown (only covers Maadi)
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
});
