import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMySessions } from '@repo/player-api';
import { auth } from '../../lib/authClient';
import { notify } from '../../lib/notify';
import SessionCard from '../components/SessionCard';

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
    <div>
      <h2>My Sessions</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => setTab('UPCOMING')} disabled={tab === 'UPCOMING'}>
          Upcoming
        </button>
        <button onClick={() => setTab('PAST')} disabled={tab === 'PAST'}>
          Past
        </button>
      </div>
      {q.isLoading && <div>Loading...</div>}
      {q.isSuccess && (q.data as any).sessions.length === 0 && <div>No sessions.</div>}
      {q.isSuccess && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {(q.data as any).sessions.map((item: any) => (
            <SessionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}


