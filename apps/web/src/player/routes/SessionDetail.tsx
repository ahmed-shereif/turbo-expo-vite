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
import { Screen, BrandCard, BrandButton } from '@repo/ui'



export default function SessionDetailPage() {
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
        navigate(getBackNavigationPath(), { replace: true });
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
      navigate(getBackNavigationPath(), { replace: true });
    },
    onError: (e: any) => notify.error(e?.message || 'Could not leave session.'),
  });

  if (sessionQ.isPending) return (
    <Screen>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#6b7280', fontSize: 16 }}>Loading session details...</div>
      </div>
    </Screen>
  );
  if (sessionQ.isError)
    return (
      <Screen>
        <h2>SessionDetailType Detail</h2>
        <BrandCard>
          <div>Could not load session. Please try again.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <BrandButton icon="RefreshCw" variant="outline" onPress={() => sessionQ.refetch()}>Retry</BrandButton>
            <BrandButton icon="ArrowLeft" variant="outline" onPress={() => navigate(getBackNavigationPath())}>Back to {isTrainer ? 'Trainer Home' : 'Player Home'}</BrandButton>
          </div>
        </BrandCard>
      </Screen>
    );
  if (!sessionQ.data) return null;

  const s = sessionQ.data;
  console.log('SessionDetailType session data:', s);
  const memberIds = new Set(s.members.map((m) => m.playerId));
  const seatsAvailable = s.seats.filled < s.seats.total;
  const userEligible = isEligible(rank as Rank | undefined, s.minRank as Rank | undefined);
  const isPlayer = user?.roles?.includes('PLAYER');
  const isTrainer = user?.roles?.includes('TRAINER');
  const pricingTotal = (s.pricing?.courtPriceHourlyLE ?? 0) + (s.pricing?.trainerPriceHourlyLE ?? 0) + (s.pricing?.appFeeHourlyLE ?? 0);
  console.log('SessionDetailType pricingTotal:', pricingTotal);
  const intendedShare = s.seats.total > 0 ? Math.ceil(pricingTotal / s.seats.total) : undefined;
  console.log('SessionDetailType intendedShare:', intendedShare);
  const isMember = memberIds.has(user?.id || '');
  // const isCreator = (s.creator?.playerId || '') === (user?.id || '');

  // Determine the correct back navigation path based on user role
  const getBackNavigationPath = () => {
    if (isTrainer) return '/trainer/home';
    if (isPlayer) return '/player/home';
    return '/'; // fallback
  };

  function avatarFallback(name?: string, playerId?: string) {
    if (name) {
      const parts = name.trim().split(/\s+/);
      const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
      return initials || 'P#';
    }
    return (playerId && `P${playerId.slice(0, 4)}`) || 'P#';
  }

  return (
    <Screen>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          color: #374151;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
        }
        .player-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 12px;
          margin-bottom: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }
        .player-card:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
        }
        .rank-badge {
          padding: 4px 8px;
          background: #3b82f6;
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .role-badge {
          padding: 2px 8px;
          background: #10b981;
          color: white;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 500;
        }
        .price-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          font-size: 18px;
        }
      `}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BrandButton icon="ArrowLeft" variant="outline" onPress={() => navigate(getBackNavigationPath())} />
          <h1 style={{ margin: 0, color: '#1f2937', fontSize: 24, fontWeight: 700 }}>Session Details</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {s.status === 'ACTIVE' && <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />}
          <span style={{ color: '#6b7280', fontSize: 14, textTransform: 'capitalize' }}>{s.status.toLowerCase()}</span>
        </div>
      </div>

      {/* Court Confirmation Status */}
      {courtQ.isSuccess && (
        <BrandCard style={{ marginBottom: 24, background: courtQ.data.status === 'CONFIRMED' ? '#f0fdf4' : '#fffbeb', border: `1px solid ${courtQ.data.status === 'CONFIRMED' ? '#bbf7d0' : '#fed7aa'}` }}>
          <div className={`status-badge ${courtQ.data.status === 'CONFIRMED' ? 'status-confirmed' : 'status-pending'}`}>
            {courtQ.data.status === 'PENDING' ? '⏳' : '✅'}
            {courtQ.data.status === 'PENDING' ? 'Awaiting court confirmation' : 'Court confirmed'}
          </div>
        </BrandCard>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        
        {/* Court & Trainer Info */}
        <BrandCard style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)', color: 'white', border: 'none' }}>
          <div className="section-header" style={{ color: 'white' }}>
            🏢 Venue Details
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s.court.name || 'Unknown court'}</div>
            <div className="info-item" style={{ color: 'rgba(255,255,255,0.9)' }}>
              📍 {s.court.area || 'Location not specified'}
            </div>
            <div className="info-item" style={{ color: 'rgba(255,255,255,0.9)' }}>
              💰 <span className="price-highlight" style={{ color: '#fef3c7' }}>{formatEGP(s.court.priceHourlyLE ?? 0)}/hr</span>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              👨‍🏫 Trainer
            </div>
            <div className="info-item" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {s.trainer.name || 'No trainer assigned'}
            </div>
            {s.trainer.maxLevel && (
              <div className="info-item" style={{ color: 'rgba(255,255,255,0.9)' }}>
                🏆 Max level: {s.trainer.maxLevel}
              </div>
            )}
            <div className="info-item" style={{ color: 'rgba(255,255,255,0.9)' }}>
              💰 <span style={{ color: '#fef3c7', fontWeight: 600 }}>{formatEGP(s.trainer.priceHourlyLE ?? 0)}/hr</span>
            </div>
          </div>
        </BrandCard>

        {/* SessionDetailType Info & Players */}
        <BrandCard>
          <div className="section-header">
            ⚡ Session Info
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
            <div className="info-item">
              🕐 {formatLocal(s.startAt)}
            </div>
            <div className="info-item">
              ⏱️ {s.durationMinutes} min
            </div>
            <div className="info-item">
              👥 {s.seats.filled}/{s.seats.total} seats
            </div>
            {s.minRank && (
              <div className="info-item">
                🏅 Min: {s.minRank}
              </div>
            )}
          </div>
          
          {intendedShare != null && user?.roles?.includes('PLAYER') && (
            <div style={{ background: '#f0f9ff', padding: 12, borderRadius: 8, marginBottom: 20, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369a1' }}>
                💳 <strong>Your share: <span className="price-highlight">{formatEGP(intendedShare)}</span></strong>
              </div>
            </div>
          )}
          
          <div className="section-header" style={{ fontSize: 16, marginBottom: 12 }}>
            👥 Players ({s.members.length})
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {s.members.map((m) => {
              const name = m.name || `Player ${m.playerId?.slice(-4) || 'Unknown'}`;
              const isYou = (m.playerId || '') === (user?.id || '');
              const rank = m.rank || 'UNKNOWN';
              const initials = avatarFallback(m.name, m.playerId);
              return (
                <div key={m.playerId} className="player-card">
                  <div className="avatar">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong style={{ color: '#1f2937' }}>{name}</strong>
                      {isYou && <span style={{ color: '#3b82f6', fontSize: 12, fontWeight: 600 }}>(You)</span>}
                      <span className="rank-badge">{rank}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="role-badge">{m.role}</span>
                      {m.joinedAt && (
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          Joined {formatLocal(m.joinedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!memberIds.has(user?.id || '') && userEligible && seatsAvailable && isPlayer && (
              <BrandButton 
                icon="UserPlus" 
                onPress={() => joinMut.mutate()} 
                disabled={joinMut.isPending}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
              >
                {joinMut.isPending ? '⏳ Joining...' : '🚀 Join Session'}
              </BrandButton>
            )}
            {memberIds.has(user?.id || '') && seatsAvailable && isPlayer && (
              <BrandButton 
                icon="CheckCircle" 
                onPress={() => confirmMut.mutate()} 
                disabled={confirmMut.isPending}
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', border: 'none' }}
              >
                {confirmMut.isPending ? '⏳ Processing...' : '✅ Confirm with Current Players'}
              </BrandButton>
            )}
            {isMember && isPlayer && (
              <BrandButton
                icon="LogOut"
                onPress={() => setShowLeaveModal(true)}
                disabled={leaveMut.isPending}
                variant="outline"
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                {leaveMut.isPending ? '⏳ Leaving…' : ' Leave Session'}
              </BrandButton>
            )}
          </div>
        </BrandCard>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && confirmData && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: 16, 
            padding: 24, 
            width: '90%', 
            maxWidth: 500,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                borderRadius: 24, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 20
              }}>
                ✅
              </div>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: 20, fontWeight: 700 }}>Confirm with Current Players</h3>
            </div>
            
            <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid #bae6fd' }}>
              <p style={{ margin: 0, color: '#0369a1', lineHeight: 1.5 }}>
                👥 You'll proceed with the current group ({sessionQ.data?.seats.filled} players).
                <br />
                💰 Your share will be <strong>{formatEGP(
                  confirmData.share || Math.ceil(((s.pricing?.courtPriceHourlyLE ?? 0) + (s.pricing?.trainerPriceHourlyLE ?? 0)) / s.seats.filled),
                )}</strong>.
                <br />
                ✅ All players must accept to continue.
              </p>
            </div>
            
            <div style={{ background: '#fef3c7', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid #fcd34d' }}>
              <div style={{ color: '#92400e', fontWeight: 600, marginBottom: 8 }}>
                📊 Consensus Status
              </div>
              <div style={{ color: '#92400e' }}>
                ✅ Accepted: {confirmData.accepted}/{confirmData.required}
                <br />
                ⏳ Pending: {confirmData.pending.join(', ')}
              </div>
            </div>
            
            {confirmData.expiresAt && (
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⏰ Expires at: {formatLocal(confirmData.expiresAt)}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <BrandButton 
                variant="outline" 
                icon="X" 
                onPress={() => setShowConfirmModal(false)}
                style={{ borderColor: '#d1d5db', color: '#6b7280' }}
              >
                Close
              </BrandButton>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: 16, 
            padding: 24, 
            width: '90%', 
            maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                borderRadius: 24, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 20
              }}>
                ⚠️
              </div>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: 20, fontWeight: 700 }}>Leave Session?</h3>
            </div>
            
            <div style={{ background: '#fef2f2', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid #fecaca' }}>
              <div style={{ color: '#991b1b', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  ✅ <strong>&gt;24h before start:</strong> Full refund if you already paid
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  ❌ <strong>&lt;24h before start:</strong> No refund; payment redistributed to remaining players
                </div>
                <div style={{ fontSize: 14, color: '#7f1d1d' }}>
                  Are you sure you want to continue?
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <BrandButton 
                variant="outline" 
                icon="X" 
                onPress={() => setShowLeaveModal(false)} 
                disabled={leaveMut.isPending}
                style={{ borderColor: '#d1d5db', color: '#6b7280' }}
              >
                Cancel
              </BrandButton>
              <BrandButton 
                icon="LogOut" 
                onPress={() => leaveMut.mutate()} 
                disabled={leaveMut.isPending}
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none' }}
              >
                {leaveMut.isPending ? '⏳ Leaving…' : ' Confirm Leave'}
              </BrandButton>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}