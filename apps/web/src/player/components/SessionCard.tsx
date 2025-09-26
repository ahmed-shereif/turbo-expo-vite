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
import { BrandCard, BrandButton, Icon } from '@repo/ui'

export default function SessionCard({ item }: { item: any }) {
  const rank = usePlayerRank();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const totalSeats = item.seats.total;
  const pricingTotal = (item.pricing?.courtPriceHourlyLE ?? 0) + (item.pricing?.trainerPriceHourlyLE ?? 0) + (item.pricing?.appFeeHourlyLE ?? 0);
  const yourShare = totalSeats > 0 ? Math.ceil(pricingTotal / totalSeats) : 0;
  const minRank = item.minRank as Rank | undefined;
  const eligible = isEligible(rank as Rank | undefined, minRank);
  const isJoined = item.isJoined || false;

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

  const availableSeats = totalSeats - item.seats.filled;
  const isAlmostFull = availableSeats <= 2 && availableSeats > 0;
  const isFull = availableSeats === 0;

  return (
    <BrandCard style={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: isJoined 
        ? '2px solid #10b981' 
        : eligible === false 
          ? '1px solid #fecaca' 
          : undefined,
      backgroundColor: isJoined 
        ? '#f0fdf4' 
        : eligible === false 
          ? '#fef2f2' 
          : undefined,
      position: 'relative'
    }}>
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          marginBottom: '0.75rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.125rem', 
                fontWeight: '600',
                color: '#1f2937',
                lineHeight: '1.3'
              }}>
                {item.court.name}
              </h3>
              {isJoined && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: '#10b981',
                  color: 'white'
                }}>
                  <Icon name="CheckCircle" size={12} />
                  Joined
                </div>
              )}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.375rem',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              <Icon name="MapPin" size={14} color="#9ca3af" />
              {item.court.area}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            backgroundColor: isFull ? '#fef2f2' : isAlmostFull ? '#fef3c7' : '#f0fdf4',
            color: isFull ? '#dc2626' : isAlmostFull ? '#d97706' : '#16a34a'
          }}>
            <Icon 
              name={isFull ? "XCircle" : isAlmostFull ? "AlertTriangle" : "CheckCircle"} 
              size={12} 
            />
            {availableSeats} left
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <Icon name="User" size={14} color="#6b7280" />
            <span style={{ color: '#374151' }}>{item.trainer.name}</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <Icon name="Clock" size={14} color="#6b7280" />
            <span style={{ color: '#374151' }}>
              {new Date(item.startAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <Icon name="Users" size={14} color="#6b7280" />
            <span style={{ color: '#374151' }}>
              {item.seats.filled}/{item.seats.total} players
            </span>
          </div>
          
          {minRank && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <Icon name="Award" size={14} color="#6b7280" />
              <span style={{ color: '#374151' }}>Min: {minRank}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {item.pricing && (
          <div style={{ 
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            marginBottom: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                color: '#64748b' 
              }}>Your share:</span>
              <span style={{ 
                fontSize: '1.125rem', 
                fontWeight: '700', 
                color: '#059669' 
              }}>
                {formatEGP(yourShare)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '0.375rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid #f1f5f9'
      }}>
        <BrandButton 
          icon="Eye" 
          variant="outline" 
          onPress={() => navigate(`/player/session/${item.id || item.sessionId}`)}
          style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
        >
          View
        </BrandButton>
        {isJoined ? (
          <BrandButton 
            icon="CheckCircle" 
            disabled={true}
            style={{ 
              flex: 1, 
              fontSize: '0.75rem', 
              padding: '0.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: '1px solid #10b981'
            }}
          >
            Joined
          </BrandButton>
        ) : (
          <BrandButton 
            icon={loading ? "Loader2" : "CalendarPlus"} 
            disabled={eligible === false || loading || isFull} 
            onPress={handleJoin}
            style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
          >
            {eligible === false ? 'Ineligible' : 
             isFull ? 'Full' :
             loading ? 'Joining...' : 'Join'}
          </BrandButton>
        )}
      </div>
    </BrandCard>
  );
}


