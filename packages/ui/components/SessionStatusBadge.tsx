import { Text } from 'tamagui';
import type { SessionStatus } from '@repo/player-api';

interface SessionStatusBadgeProps {
  status: SessionStatus;
  size?: 'sm' | 'md';
}

const statusConfig = {
  AWAITING_TRAINER: {
    label: 'Awaiting Trainer',
    color: '$orange10',
    bg: '$orange3',
  },
  AWAITING_TRAINER_AND_COURT: {
    label: 'Awaiting Confirmations',
    color: '$orange10', 
    bg: '$orange3',
  },
  PENDING: {
    label: 'Pending',
    color: '$blue10',
    bg: '$blue3',
  },
  AWAITING_COURT_CONFIRMATION: {
    label: 'Awaiting Court',
    color: '$orange10',
    bg: '$orange3',
  },
  APPROVED: {
    label: 'Approved',
    color: '$green10',
    bg: '$green3',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '$red10',
    bg: '$red3',
  },
} as const;

export function SessionStatusBadge({ status, size = 'md' }: SessionStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  
  return (
    <Text
      fontSize={size === 'sm' ? '$2' : '$3'}
      fontWeight="500"
      color={config.color}
      backgroundColor={config.bg}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$2"
    >
      {config.label}
    </Text>
  );
}