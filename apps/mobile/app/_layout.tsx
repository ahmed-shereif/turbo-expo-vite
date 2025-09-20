import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { AuthProvider } from '../src/providers/AuthProvider';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../tamagui.config';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
