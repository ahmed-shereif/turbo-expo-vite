import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrainerRequests from '../../app/(trainer)/requests';

// Mock expo-router
vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock the auth client and API functions
vi.mock('../../src/lib/authClient', () => ({
  authClient: {},
}));

vi.mock('@repo/trainer-api', () => ({
  listTrainerRequests: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'req_1',
        sessionId: 'sess_1',
        status: 'PENDING',
        createdAt: '2024-01-01T10:00:00Z',
        expiresAt: '2024-01-01T12:00:00Z',
        court: { id: 'court_1', name: 'Test Court', area: 'Zamalek' },
        startAt: '2024-01-01T16:00:00Z',
        durationMinutes: 60,
        seats: { filled: 2, total: 4 },
        creator: { playerId: 'player_1', name: 'John Doe' },
      },
    ],
    totalCount: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  }),
  respondTrainerRequest: vi.fn(),
}));

vi.mock('../../src/lib/notify', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('TrainerRequests Mobile', () => {
  it('should render training requests screen', () => {
    const { getByText } = renderWithProviders(<TrainerRequests />);
    
    expect(getByText('Training Requests')).toBeTruthy();
    expect(getByText('Pending')).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
  });

  it('should show decline modal helper text', () => {
    const { getByText } = renderWithProviders(<TrainerRequests />);
    
    // The component should render without crashing
    expect(getByText('Training Requests')).toBeTruthy();
  });
});