import { Stack } from 'expo-router';
import { AuthGate, RoleGate } from '../../src/navigation/guards';

export default function TrainerLayout() {
  return (
    <AuthGate>
      <RoleGate roles={['TRAINER']}>
        <Stack>
          <Stack.Screen name="home" options={{ title: 'Trainer Dashboard' }} />
          <Stack.Screen name="requests" options={{ title: 'Training Requests' }} />
          <Stack.Screen name="profile" options={{ title: 'Trainer Profile' }} />
          <Stack.Screen name="sessions" options={{ title: 'My Sessions' }} />
          <Stack.Screen name="availability" options={{ title: 'Availability' }} />
        </Stack>
      </RoleGate>
    </AuthGate>
  );
}