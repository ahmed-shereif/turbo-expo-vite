import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TrainerHome from '../Home'

// Mock the auth client
vi.mock('@repo/auth-client', () => ({
  auth: {
    withAuth: vi.fn()
  }
}))

// Mock the trainer API
vi.mock('@repo/trainer-api', () => ({
  listTrainerRequests: vi.fn()
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  )
}))

// Mock notify
vi.mock('../lib/notify', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('TrainerHome', () => {
  it('renders trainer dashboard', () => {
    const queryClient = createTestQueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <TrainerHome />
      </QueryClientProvider>
    )

    expect(screen.getByText('Trainer Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Quick Stats')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    const queryClient = createTestQueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <TrainerHome />
      </QueryClientProvider>
    )

    expect(screen.getByText('View Requests')).toBeInTheDocument()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    expect(screen.getByText('Set Availability')).toBeInTheDocument()
    expect(screen.getByText('My Sessions')).toBeInTheDocument()
  })

  it('shows pending requests count', () => {
    const queryClient = createTestQueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <TrainerHome />
      </QueryClientProvider>
    )

    expect(screen.getByText('Pending Requests')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // Default value
  })
})
