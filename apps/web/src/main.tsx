import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@repo/ui'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { AppRouter } from './AppRouter';
import { TamaguiProvider } from '@repo/ui'
import config from '@repo/ui/tamagui.config'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TamaguiProvider config={config} defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => (
                <ErrorFallback
                  error={error}
                  resetErrorBoundary={() => {
                    reset()
                    resetErrorBoundary()
                  }}
                  onReport={(err) => {
                    // Placeholder: Wire telemetry here (Sentry/Bugsnag)
                    console.error('User reported issue:', err)
                  }}
                />
              )}
              onReset={() => {
                // Let react-query retry failed queries on reset
              }}
            >
              <BrowserRouter>
                <AuthProvider>
                  <AppRouter />
                </AuthProvider>
              </BrowserRouter>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </QueryClientProvider>
      <Toaster position="top-right" gutter={12} />
    </TamaguiProvider>
  </StrictMode>,
)
