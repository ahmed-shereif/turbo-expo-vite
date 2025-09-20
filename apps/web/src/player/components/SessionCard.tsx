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
      navigate(`/player/session/${sessionId}`);
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
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div><strong>{item.court.name}</strong> — {item.court.area}</div>
          <div>Trainer: {item.trainer.name}</div>
          <div>Start: {formatLocal(item.startAt)}</div>
          <div>Seats: {item.seats.filled}/{item.seats.total}</div>
          {minRank && <div>Min Rank: {minRank}</div>}
          {item.pricing && <div>Your share now: {formatEGP(yourShare)}</div>}
        </div>
        <div>
          <button onClick={() => navigate(`/player/session/${item.id || item.sessionId}`)} style={{ marginRight: 8 }}>
            View details
          </button>
          <button disabled={eligible === false || loading} onClick={handleJoin} title={eligible === false ? "Your rank doesn’t meet the minimum" : undefined}>
            {eligible === false ? 'Not eligible' : (loading ? 'Joining...' : 'Join Session')}
          </button>
        </div>
      </div>
    </div>
  );
}


