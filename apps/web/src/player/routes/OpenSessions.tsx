import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOpenSessions } from '@repo/player-api';
import { auth } from '../../lib/authClient';
import { notify } from '../../lib/notify';
import Filters from '../components/Filters';
import SessionCard from '../components/SessionCard';

export default function OpenSessions() {
  const [search] = useSearchParams();
  const params = useMemo(() => {
    const facilities = search.getAll('facilities[]');
    return {
      area: search.get('area') || undefined,
      dateFrom: search.get('dateFrom') || undefined,
      dateTo: search.get('dateTo') || undefined,
      minRankEligible: search.get('minRankEligible') === 'true' || undefined,
      facilities: facilities.length ? facilities : undefined,
      priceMin: search.get('priceMin') ? Number(search.get('priceMin')) : undefined,
      priceMax: search.get('priceMax') ? Number(search.get('priceMax')) : undefined,
      sort: search.get('sort') || undefined,
      page: search.get('page') ? Number(search.get('page')) : undefined,
      pageSize: search.get('pageSize') ? Number(search.get('pageSize')) : undefined,
    } as const;
  }, [search]);

  const q = useQuery({
    queryKey: ['open-sessions', params],
    queryFn: () => fetchOpenSessions(auth as any, params as any),
    retry: 1,
  });
  useEffect(() => {
    if (q.isError) {
      notify.error((q.error as any)?.message || 'Unexpected error, please try again.');
    }
  }, [q.isError, q.error]);

  return (
    <div>
      <h2>Open Sessions</h2>
      <Filters />
      {q.isLoading && <div>Loading sessions...</div>}
      {q.isSuccess && q.data.length === 0 && <div>No open sessions match your filters.</div>}
      {q.isSuccess && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {q.data.map((item) => (
            <SessionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}


