import { useAuth } from '../../src/providers/AuthProvider';
import { YStack, Text } from 'tamagui';
import { Screen, BrandCard, BrandButton } from '@repo/ui'
import { router } from 'expo-router';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <BrandCard>
        <Text fontSize="$6">Welcome</Text>
        {user && (
          <>
            <Text>Logged in as {user.email}</Text>
            {user.roles?.includes('TRAINER') && (
              <BrandButton onPress={() => router.push('/(app)/trainer')}>Trainer Area</BrandButton>
            )}
          </>
        )}
        <BrandButton onPress={logout}>Logout</BrandButton>
      </BrandCard>
    </Screen>
  );
}
