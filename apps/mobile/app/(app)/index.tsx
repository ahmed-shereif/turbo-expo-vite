import { useAuth } from '../../src/providers/AuthProvider';
import { YStack, Text, Button } from 'tamagui';
import { router } from 'expo-router';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" space>
      <Text fontSize="$6">Welcome</Text>
      {user && (
        <>
          <Text>Logged in as {user.email}</Text>
          {user.roles?.includes('TRAINER') && (
            <Button onPress={() => router.push('/(app)/trainer')}>Trainer Area</Button>
          )}
        </>
      )}
      <Button onPress={logout}>Logout</Button>
    </YStack>
  );
}
