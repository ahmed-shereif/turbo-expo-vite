import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateSessionStep3 from '../../../../app/(player)/create/trainer';
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

vi.mock('expo-router', () => ({
  router: {
    push: vi.fn(),
    back: vi.fn(),
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

describe('CreateSessionStep3 (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchTrainers as any).mockResolvedValue(mockTrainers);
    (quickCheckTrainer as any).mockResolvedValue(mockAvailabilityCheck);
  });

  it('should render trainer list', async () => {
    render(<CreateSessionStep3 />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('Jane Smith')).toBeTruthy();
    });
  });

  it('should call quickCheckTrainer when trainer is pressed', async () => {
    render(<CreateSessionStep3 />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    // Press on a trainer
    const trainerCard = screen.getByText('John Doe');
    fireEvent.press(trainerCard);

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
    render(<CreateSessionStep3 />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    // Press on a trainer
    const trainerCard = screen.getByText('John Doe');
    fireEvent.press(trainerCard);

    await waitFor(() => {
      // Check that the selected trainer is displayed
      expect(screen.getByText(/Selected: John Doe/)).toBeTruthy();
    });
  });

  it('should show error message when trainer is busy', async () => {
    (quickCheckTrainer as any).mockResolvedValue({
      available: false,
      reason: 'Trainer is booked',
    });

    render(<CreateSessionStep3 />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    // Press on a trainer
    const trainerCard = screen.getByText('John Doe');
    fireEvent.press(trainerCard);

    await waitFor(() => {
      expect(screen.getByText('Trainer is busy at this time.')).toBeTruthy();
    });
  });

  it('should show no available trainers message when none are available', async () => {
    (quickCheckTrainer as any).mockResolvedValue({
      available: false,
      reason: 'Trainer is booked',
    });

    render(<CreateSessionStep3 />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    // Press on both trainers to check availability
    const trainer1Card = screen.getByText('John Doe');
    const trainer2Card = screen.getByText('Jane Smith');
    
    fireEvent.press(trainer1Card);
    fireEvent.press(trainer2Card);

    await waitFor(() => {
      expect(screen.getByText('No available trainers. Please select another date and time.')).toBeTruthy();
    });
  });
});
