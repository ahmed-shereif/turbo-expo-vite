import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { AppRouter } from './AppRouter';
import { Toaster } from 'react-hot-toast'
import { ErrorFallback } from '@repo/ui'
import { InfoBar, CurrentUserProvider } from '@repo/ui'
import { YStack } from 'tamagui'
import { useAuth } from './auth/AuthContext'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../tamagui.config'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TamaguiProvider config={tamaguiConfig}>
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
                />
              )}
              onReset={() => {
                // Let react-query retry failed queries on reset
              }}
            >
              <BrowserRouter>
                <AuthProvider>
                  <AuthBridge>
                    <YStack>
                      <InfoBar />
                      <YStack paddingTop="$4">
                        <AppRouter />
                      </YStack>
                    </YStack>
                  </AuthBridge>
                </AuthProvider>
              </BrowserRouter>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
        <Toaster position="top-right" gutter={12} />
      </QueryClientProvider>
    </TamaguiProvider>
  </StrictMode>,
)

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]
  const lastName = user?.name?.split(' ').slice(1).join(' ')
  const role = (user?.roles && user.roles[0]) || undefined
  const rank = (user as any)?.rank
  return (
    <CurrentUserProvider
      user={{
        firstName,
        lastName,
        fullName: user?.name,
        rank: rank,
        role: role,
      }}
    >
      {children}
    </CurrentUserProvider>
  )
}

function InfoBarSpacer({ children }: { children: React.ReactNode }) {
  // Provide top padding to avoid overlap; match approx InfoBar height using tokens
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '48px' }} />
      <div style={{ position: 'fixed', left: 0, right: 0, top: 0 }}>
        {children}
      </div>
    </div>
  )
}
