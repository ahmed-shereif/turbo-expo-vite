import { useNavigate } from 'react-router-dom';
import type { Rank } from '@repo/player-api';
import { isEligible } from '@repo/player-api';
import { usePlayerRank } from '../hooks/usePlayerRank';
import { formatEGP } from '../utils/money';
import { formatLocal } from '../utils/date';
import { notify } from '../../lib/notify';
import { auth } from '../../lib/authClient';
import { joinSession } from '@repo/player-api';
import { useState } from 'react';
import { BrandCard, BrandButton } from '@repo/ui'

export default function SessionCard({ item }: { item: any }) {
  const rank = usePlayerRank();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const totalSeats = item.seats.total;
  const pricingTotal = (item.pricing?.courtPriceHourlyLE ?? 0) + (item.pricing?.trainerPriceHourlyLE ?? 0) + (item.pricing?.appFeeHourlyLE ?? 0);
  const yourShare = totalSeats > 0 ? Math.ceil(pricingTotal / totalSeats) : 0;
  const minRank = item.minRank as Rank | undefined;
  const eligible = isEligible(rank as Rank | undefined, minRank);

  const handleJoin = async () => {
    if (!eligible) return;
    // Check for both possible field names
    const sessionId = item?.id || item?.sessionId;
    if (!sessionId) {
      console.error('Session item missing ID:', item);
      notify.error('Unable to join: invalid session. Please refresh and try again.');
      return;
    }
    setLoading(true);
    try {
      await joinSession(auth as any, sessionId);
      navigate(`/session/${sessionId}`);
    } catch (e: any) {
      const status = e?.status;
      const message: string = e?.message || '';
      if (status === 409 || status === 422 || /filled/i.test(message)) {
        notify.error('This session just filled. Please choose another session.');
      } else {
        notify.error('Unexpected error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div><strong>{item.court.name}</strong> — {item.court.area}</div>
          <div>Trainer: {item.trainer.name}</div>
          <div>Start: {formatLocal(item.startAt)}</div>
          <div>Seats: {item.seats.filled}/{item.seats.total}</div>
          {minRank && <div>Min Rank: {minRank}</div>}
          {item.pricing && <div>Your share now: {formatEGP(yourShare)}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 ,flexDirection:'column'}}>
          <BrandButton icon="Eye" variant="outline" onPress={() => navigate(`/session/${item.id || item.sessionId}`)}>
            View details
          </BrandButton>
          <BrandButton icon="CalendarPlus" disabled={eligible === false || loading} onPress={handleJoin}>
            {eligible === false ? 'Not eligible' : (loading ? 'Joining...' : 'Join Session')}
          </BrandButton>
        </div>
      </div>
    </BrandCard>
  );
}


