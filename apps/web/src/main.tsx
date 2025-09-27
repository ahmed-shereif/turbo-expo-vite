import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AppRouter } from './AppRouter';
import { Toaster } from 'react-hot-toast'
import { ErrorFallback, InfoBar, CurrentUserProvider } from '@repo/ui'
import { YStack } from 'tamagui'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../tamagui.config'

const queryClient = new QueryClient();

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

function App() {
  return (
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
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
