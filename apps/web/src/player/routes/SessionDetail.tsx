import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../../lib/authClient';
import {
  fetchSession,
  getCourtConfirmation,
  joinSession,
  confirmWithCurrent,
  isEligible,
  type Rank,
} from '@repo/player-api';
import { notify } from '../../lib/notify';
import { formatEGP } from '../utils/money';
import { formatLocal } from '../utils/date';
import { usePlayerRank } from '../hooks/usePlayerRank';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

export default function SessionDetail() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const rank = usePlayerRank();
  const qc = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState<null | { share?: number; required: number; accepted: number; pending: string[]; expiresAt?: string }>(null);

  const sessionQ = useQuery({
    queryKey: ['session', id],
    queryFn: () => fetchSession(auth as any, id),
    retry: 1,
  });
  useEffect(() => {
    if (sessionQ.isError) {
      notify.error((sessionQ.error as any)?.message || 'Unexpected error, please try again.');
    }
  }, [sessionQ.isError, sessionQ.error]);

  const courtQ = useQuery({
    queryKey: ['court-confirmation', id],
    queryFn: () => getCourtConfirmation(auth as any, id),
    enabled: !!id,
    retry: 1,
  });
  useEffect(() => {
    if (courtQ.isError) {
      notify.error((courtQ.error as any)?.message || 'Unexpected error, please try again.');
    }
  }, [courtQ.isError, courtQ.error]);

  const joinMut = useMutation({
    mutationFn: () => joinSession(auth as any, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session', id] });
    },
    onError: (e: any) => {
      const status = e?.status;
      const message: string = e?.message || '';
      if (status === 409 || status === 422 || /filled/i.test(message)) {
        notify.error('This session just filled. Please choose another session.');
      } else {
        notify.error('Unexpected error, please try again.');
      }
    },
  });

  const confirmMut = useMutation({
    mutationFn: () => confirmWithCurrent(auth as any, id),
    onSuccess: (data) => {
      setConfirmData({
        share: data.proposedActualShare,
        required: data.consensus.required,
        accepted: data.consensus.accepted,
        pending: data.consensus.pending,
        expiresAt: data.expiresAt,
      });
      setShowConfirmModal(true);
    },
    onError: (e: any) => notify.error(e?.message || 'Unexpected error, please try again.'),
  });

  if (sessionQ.isLoading) return <div>Loading...</div>;
  if (sessionQ.isError) return null;

  const s = sessionQ.data!;
  const memberIds = new Set(s.members.map((m) => m.playerId));
  const seatsAvailable = s.seats.filled < s.seats.total;
  const userEligible = isEligible(rank as Rank | undefined, s.minRank as Rank | undefined);
  const pricingTotal = (s.pricing?.courtPriceHourlyLE ?? 0) + (s.pricing?.trainerPriceHourlyLE ?? 0) + (s.pricing?.appFeeHourlyLE ?? 0);
  const intendedShare = s.seats.total > 0 ? Math.ceil(pricingTotal / s.seats.total) : undefined;

  return (
    <div>
      <h2>Session Detail</h2>
      {courtQ.isSuccess && (
        <div style={{ padding: 8, marginBottom: 8, background: '#f8f8f8' }}>
          {courtQ.data.status === 'PENDING' && 'Awaiting court confirmation'}
          {courtQ.data.status === 'CONFIRMED' &&
            'Court confirmed. You can proceed to payment once payment UI is implemented.'}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h3>Court</h3>
          <div>{s.court.name}</div>
          <div>Area: {s.court.area}</div>
          <div>Price/hr: {formatEGP(s.court.priceHourlyLE)}</div>

          <h3>Trainer</h3>
          <div>{s.trainer.name}</div>
          <div>Max level: {s.trainer.maxLevel}</div>
          <div>Price/hr: {formatEGP(s.trainer.priceHourlyLE)}</div>
        </div>
        <div>
          <h3>Session</h3>
          <div>Start: {formatLocal(s.startAt)}</div>
          <div>Duration: {s.durationMinutes} min</div>
          <div>Seats: {s.seats.filled}/{s.seats.total}</div>
          {s.minRank && <div>Min Rank: {s.minRank}</div>}
          {intendedShare != null && <div>Your current share = {formatEGP(intendedShare)}</div>}
          <h4>Members</h4>
          <ul>
            {s.members.map((m) => (
              <li key={m.playerId}>
                {m.playerId} — {m.role}
              </li>
            ))}
          </ul>

          {!memberIds.has(user?.id || '') && userEligible && seatsAvailable && (
            <button onClick={() => joinMut.mutate()} disabled={joinMut.isPending}>
              {joinMut.isPending ? 'Joining...' : 'Join Session'}
            </button>
          )}
          {memberIds.has(user?.id || '') && seatsAvailable && (
            <button onClick={() => confirmMut.mutate()} disabled={confirmMut.isPending}>
              {confirmMut.isPending ? 'Processing...' : 'Confirm with Current Players'}
            </button>
          )}
        </div>
      </div>

      {showConfirmModal && confirmData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: 'white', margin: '10% auto', padding: 16, width: 500 }}>
            <h3>Confirm with Current Players</h3>
            <p>
              You’ll proceed with the current group ({sessionQ.data?.seats.filled} players). Your share will be{' '}
              {formatEGP(
                confirmData.share ||
                  Math.ceil(((s.pricing?.courtPriceHourlyLE ?? 0) + (s.pricing?.trainerPriceHourlyLE ?? 0)) / s.seats.filled),
              )}{' '}
              EGP. All players must accept to continue.
            </p>
            <p>
              Consensus: {confirmData.accepted}/{confirmData.required} accepted. Pending: {confirmData.pending.join(', ')}
            </p>
            {confirmData.expiresAt && <p>Expires at: {formatLocal(confirmData.expiresAt)}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowConfirmModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


