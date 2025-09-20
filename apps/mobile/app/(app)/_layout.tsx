import { Slot } from 'expo-router';
import { AuthGate } from '../../src/navigation/guards';

export default function AppLayout() {
  return (
    <AuthGate>
      <Slot />
    </AuthGate>
  );
}
