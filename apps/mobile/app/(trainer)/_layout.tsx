import { Stack } from 'expo-router';

export default function TrainerLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: 'Trainer Dashboard' }} />
      <Stack.Screen name="requests" options={{ title: 'Training Requests' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="sessions" options={{ title: 'My Sessions' }} />
      <Stack.Screen name="availability" options={{ title: 'Availability' }} />
    </Stack>
  );
}
