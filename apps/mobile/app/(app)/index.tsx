import { useAuth } from '../../src/providers/AuthProvider';
import { YStack, Text } from 'tamagui';
import { Screen, BrandCard, BrandButton } from '@repo/ui'
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function Home() {
  const { user, logout } = useAuth();

  // Role-based redirects
  useEffect(() => {
    if (user?.roles?.includes('TRAINER')) {
      router.replace('/(trainer)/home');
    } else if (user?.roles?.includes('PLAYER')) {
      router.replace('/(player)/home');
    } else if (user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_USER')) {
      router.replace('/(app)/admin');
    }
  }, [user]);

  return (
    <Screen>
      <BrandCard>
        <Text fontSize="$6">Welcome</Text>
        {user && (
          <>
            <Text>Logged in as {user.email}</Text>
            <Text>Roles: {user.roles?.join(', ')}</Text>
            {user.roles?.includes('TRAINER') && (
              <BrandButton onPress={() => router.push('/(trainer)/home')}>Trainer Dashboard</BrandButton>
            )}
            {user.roles?.includes('PLAYER') && (
              <BrandButton onPress={() => router.push('/(player)/home')}>Player Dashboard</BrandButton>
            )}
            {(user.roles?.includes('ADMIN') || user.roles?.includes('SUPER_USER')) && (
              <BrandButton onPress={() => router.push('/(app)/admin')}>Admin Dashboard</BrandButton>
            )}
          </>
        )}
        <BrandButton onPress={logout}>Logout</BrandButton>
      </BrandCard>
    </Screen>
  );
}
