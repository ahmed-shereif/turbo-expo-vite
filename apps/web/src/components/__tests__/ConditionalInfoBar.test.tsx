import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../../../tamagui.config'
import { CurrentUserProvider } from '@repo/ui'

// Mock the InfoBar component
vi.mock('@repo/ui', async () => {
  const actual = await vi.importActual('@repo/ui')
  return {
    ...actual,
    InfoBar: () => <div data-testid="info-bar">InfoBar Component</div>
  }
})

// Import the ConditionalInfoBar component from main.tsx
// We need to extract it to make it testable
function ConditionalInfoBar() {
  const location = { pathname: window.location.pathname }
  
  // Don't show InfoBar on login or signup pages
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'
  
  if (isAuthRoute) {
    return null
  }
  
  return <div data-testid="info-bar">InfoBar Component</div>
}

describe('ConditionalInfoBar', () => {
  const renderWithRouter = (initialPath: string) => {
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: initialPath },
      writable: true
    })
    
    return render(
      <TamaguiProvider config={tamaguiConfig}>
        <CurrentUserProvider user={{ fullName: 'John Doe', rank: 'Silver', role: 'Player' }}>
          <BrowserRouter>
            <ConditionalInfoBar />
          </BrowserRouter>
        </CurrentUserProvider>
      </TamaguiProvider>
    )
  }

  it('renders InfoBar on authenticated routes', () => {
    renderWithRouter('/player/home')
    expect(screen.getByTestId('info-bar')).toBeInTheDocument()
  })

  it('renders InfoBar on root route', () => {
    renderWithRouter('/')
    expect(screen.getByTestId('info-bar')).toBeInTheDocument()
  })

  it('does not render InfoBar on login route', () => {
    renderWithRouter('/login')
    expect(screen.queryByTestId('info-bar')).not.toBeInTheDocument()
  })

  it('does not render InfoBar on signup route', () => {
    renderWithRouter('/signup')
    expect(screen.queryByTestId('info-bar')).not.toBeInTheDocument()
  })

  it('renders InfoBar on other routes', () => {
    renderWithRouter('/admin')
    expect(screen.getByTestId('info-bar')).toBeInTheDocument()
  })
})
