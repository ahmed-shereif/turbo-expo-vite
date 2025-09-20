import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../../lib/authClient';
import {
  fetchSession,
  getCourtConfirmation,
  joinSession,
  confirmWithCurrent,
  leaveSession,
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const rank = usePlayerRank();
  const qc = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState<null | { share?: number; required: number; accepted: number; pending: string[]; expiresAt?: string }>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const sessionQ = useQuery({
    queryKey: ['session', id],
    queryFn: () => fetchSession(auth as any, id),
    retry: 1,
  });
  useEffect(() => {
    if (sessionQ.isError) {
      const e = sessionQ.error as any;
      if ((e?.status ?? 0) === 404) {
        notify.error('Session no longer available.');
        navigate('/player/open', { replace: true });
      } else {
        notify.error(e?.message || 'Could not load session. Please try again.');
      }
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
      notify.error((courtQ.error as any)?.message || 'Could not load session. Please try again.');
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

  const leaveMut = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Missing user');
      return leaveSession(auth as any, id, user.id);
    },
    onSuccess: (res: any) => {
      const refund = res?.refund as 'FULL' | 'NONE' | 'PARTIAL' | undefined;
      notify.success(`You left the session.${refund ? ` Refund: ${refund}` : ''}`.trim());
      qc.invalidateQueries({ queryKey: ['session', id] });
      qc.invalidateQueries({ queryKey: ['my-sessions'] });
      qc.invalidateQueries({ queryKey: ['open-sessions'] });
      navigate('/player/sessions', { replace: true });
    },
    onError: (e: any) => notify.error(e?.message || 'Could not leave session.'),
  });

  if (sessionQ.isPending) return <div>Loading...</div>;
  if (sessionQ.isError)
    return (
      <div>
        <h2>Session Detail</h2>
        <div style={{ padding: 8, marginTop: 8, background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: 6 }}>
          Could not load session. Please try again.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => sessionQ.refetch()}>Retry</button>
          <button onClick={() => navigate('/player/open')}>Back to Open Sessions</button>
        </div>
      </div>
    );
  if (!sessionQ.data) return null;

  const s = sessionQ.data;
  const memberIds = new Set(s.members.map((m) => m.playerId));
  const seatsAvailable = s.seats.filled < s.seats.total;
  const userEligible = isEligible(rank as Rank | undefined, s.minRank as Rank | undefined);
  const pricingTotal = (s.pricing?.courtPriceHourlyLE ?? 0) + (s.pricing?.trainerPriceHourlyLE ?? 0) + (s.pricing?.appFeeHourlyLE ?? 0);
  const intendedShare = s.seats.total > 0 ? Math.ceil(pricingTotal / s.seats.total) : undefined;
  const isMember = memberIds.has(user?.id || '');
  // const isCreator = (s.creator?.playerId || '') === (user?.id || '');

  function avatarFallback(name?: string, playerId?: string) {
    if (name) {
      const parts = name.trim().split(/\s+/);
      const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
      return initials || 'P#';
    }
    return (playerId && `P${playerId.slice(0, 4)}`) || 'P#';
  }

  return (
    <div>
      <h2>Session Detail</h2>
      {courtQ.isSuccess && (
        <div style={{ padding: 8, marginBottom: 8, background: '#f8f8f8' }}>
          {courtQ.data.status === 'PENDING' && 'Awaiting court confirmation'}
          {courtQ.data.status === 'CONFIRMED' && 'Court confirmed'}
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
          <h4>Players in this session</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {s.members.map((m) => {
              const name = m.name || '•••';
              const isYou = (m.playerId || '') === (user?.id || '');
              return (
                <li key={m.playerId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12 }}>{avatarFallback(m.name, m.playerId)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>
                      <strong>{name}</strong> {isYou && <span>(You)</span>} {m.rank && <span style={{ marginLeft: 6, color: '#666' }}>Rank: {m.rank}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <span style={{ padding: '2px 6px', border: '1px solid #ddd', borderRadius: 8 }}>{m.role}</span>
                      {m.joinedAt && <span style={{ marginLeft: 8 }}>Joined: {formatLocal(m.joinedAt)}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
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

          {isMember && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setShowLeaveModal(true)}
                disabled={leaveMut.isPending}
                style={{ background: '#ffe5e5', border: '1px solid #f00', color: '#900', padding: '8px 12px', borderRadius: 6 }}
              >
                {leaveMut.isPending ? 'Leaving…' : 'Leave Session'}
              </button>
            </div>
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

      {showLeaveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: 'white', margin: '10% auto', padding: 16, width: 520 }}>
            <h3>Are you sure you want to leave this session?</h3>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
{`• >24h before start: Full refund if you already paid.
• <24h before start: No refund; your payment is redistributed to remaining players.

Continue?`}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowLeaveModal(false)} disabled={leaveMut.isPending}>Cancel</button>
              <button onClick={() => leaveMut.mutate()} disabled={leaveMut.isPending} style={{ background: '#f00', color: '#fff', padding: '6px 12px', borderRadius: 6 }}>
                {leaveMut.isPending ? 'Leaving…' : 'Confirm Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


