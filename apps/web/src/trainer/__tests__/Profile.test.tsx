import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import TrainerProfile from '../routes/Profile';
import * as trainerQueries from '../hooks/useTrainerQueries';

// Mock the hooks
vi.mock('../hooks/useTrainerQueries');
vi.mock('../../lib/notify', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProfile = {
  id: 'trainer_123',
  hourlyPriceLE: 500,
  maxLevel: 'HIGH_D' as const,
  areasCovered: ['Zamalek', 'Nasr City'],
  acceptedCourtIds: ['court_1', 'court_2'],
};

const mockCourts = [
  { id: 'court_1', name: 'Court 1', area: 'Zamalek', priceHourlyLE: 100 },
  { id: 'court_2', name: 'Court 2', area: 'Nasr City', priceHourlyLE: 120 },
];

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TrainerProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(trainerQueries.useTrainerProfile).mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(trainerQueries.useCourts).mockReturnValue({
      data: mockCourts,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(trainerQueries.useUpdateTrainerProfile).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(mockProfile),
      isPending: false,
      error: null,
    } as any);
  });

  it('should render profile form with current values', async () => {
    renderWithProviders(<TrainerProfile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('500')).toBeInTheDocument();
      expect(screen.getByText('Zamalek')).toBeInTheDocument();
      expect(screen.getByText('Nasr City')).toBeInTheDocument();
    });
  });

  it('should validate hourly price range', async () => {
    renderWithProviders(<TrainerProfile />);

    const priceInput = screen.getByDisplayValue('500');
    fireEvent.change(priceInput, { target: { value: '30' } }); // Below minimum

    const saveButton = screen.getByText('Save Profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Number must be greater than or equal to 50/)).toBeInTheDocument();
    });
  });

  it('should require at least one area to be selected', async () => {
    vi.mocked(trainerQueries.useTrainerProfile).mockReturnValue({
      data: { ...mockProfile, areasCovered: [] },
      isLoading: false,
      error: null,
    } as any);

    renderWithProviders(<TrainerProfile />);

    const saveButton = screen.getByText('Save Profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Array must contain at least 1 element/)).toBeInTheDocument();
    });
  });

  it('should call update mutation with correct payload', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(mockProfile);
    vi.mocked(trainerQueries.useUpdateTrainerProfile).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as any);

    renderWithProviders(<TrainerProfile />);

    const saveButton = screen.getByText('Save Profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        hourlyPriceLE: 500,
        maxLevel: 'HIGH_D',
        areasCovered: ['Zamalek', 'Nasr City'],
        acceptedCourtIds: ['court_1', 'court_2'],
      });
    });
  });
});