import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMySessions } from '@repo/player-api';
import { auth } from '../../lib/authClient';
import { notify } from '../../lib/notify';
import SessionCard from '../components/SessionCard';
import { Screen, BrandCard, BrandButton, Skeleton } from '@repo/ui'

export default function MySessions() {
  const [tab, setTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const params = useMemo(() => ({ status: tab, page: 1, pageSize: 20 }), [tab]);

  const q = useQuery({
    queryKey: ['my-sessions', params],
    queryFn: () => fetchMySessions(auth as any, params),
    retry: 1,
  });
  useEffect(() => {
    if (q.isError) {
      notify.error((q.error as any)?.message || 'Unexpected error, please try again.');
    }
  }, [q.isError, q.error]);

  return (
    <Screen>
      <h2>My Sessions</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <BrandButton icon="Clock" variant={tab === 'UPCOMING' ? 'primary' : 'outline'} onPress={() => setTab('UPCOMING')}>
          Upcoming
        </BrandButton>
        <BrandButton icon="History" variant={tab === 'PAST' ? 'primary' : 'outline'} onPress={() => setTab('PAST')}>
          Past
        </BrandButton>
      </div>
      {q.isLoading && (
        <BrandCard>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton height={18} />
                <Skeleton height={14} style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
        </BrandCard>
      )}
      {q.isSuccess && (q.data as any).sessions.length === 0 && <div>No sessions.</div>}
      {q.isSuccess && (
        <BrandCard>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {(q.data as any).sessions.map((item: any) => (
              <SessionCard key={item.id} item={item} />
            ))}
          </div>
        </BrandCard>
      )}
    </Screen>
  );
}


