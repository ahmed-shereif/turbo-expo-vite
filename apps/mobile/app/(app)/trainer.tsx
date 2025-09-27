import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { RoleGate } from '../../src/navigation/guards';
import { useAuth } from '../../src/providers/AuthProvider';

export default function TrainerScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.roles?.includes('TRAINER')) {
      router.replace('/(trainer)/home');
    }
  }, [user, router]);

  return (
    <RoleGate roles={['TRAINER']}>
      {null}
    </RoleGate>
  );
}
