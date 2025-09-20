import { useAuth } from '../../src/providers/AuthProvider';
import { Redirect, Slot } from 'expo-router';

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(app)" />;
  }

  return <Slot />;
}
