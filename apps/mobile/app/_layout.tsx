import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Slot } from 'expo-router';
import { AuthProvider } from '../src/providers/AuthProvider';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import { ErrorFallback } from '@repo/ui';

const queryClient = new QueryClient();

export default function RootLayout() {
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
                  onReport={(err) => {
                    // Wire telemetry here for mobile (Sentry/Bugsnag)
                    console.error('User reported issue (mobile):', err)
                  }}
                />
              )}
            >
              <AuthProvider>
                <Slot />
              </AuthProvider>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
