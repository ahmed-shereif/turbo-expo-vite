import { useAuth } from '../../auth/AuthContext';
import type { Rank } from '@repo/player-api';

const ALLOWED_RANKS: readonly Rank[] = ['UNKNOWN', 'LOW_D', 'MID_D', 'HIGH_D'] as const;

function coerceToRank(value: unknown): Rank | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.toUpperCase().replace(/[-\s]+/g, '_').trim();
  return (ALLOWED_RANKS as readonly string[]).includes(normalized)
    ? (normalized as Rank)
    : undefined;
}

export function usePlayerRank(): Rank | undefined {
  const { user } = useAuth();
  return coerceToRank(user?.rank);
}


