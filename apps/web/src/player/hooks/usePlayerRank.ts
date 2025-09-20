import { useAuth } from '../../auth/AuthContext';

export function usePlayerRank() {
  const { user } = useAuth();
  return user?.rank;
}


