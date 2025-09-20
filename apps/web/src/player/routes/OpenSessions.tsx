import { useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
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
      // page is managed by useInfiniteQuery; we only pick up pageSize if provided
      pageSize: search.get('pageSize') ? Number(search.get('pageSize')) : undefined,
    } as const;
  }, [search]);

  const pageSize = params.pageSize && Number.isFinite(params.pageSize) ? (params.pageSize as number) : 20;

  const q = useInfiniteQuery({
    queryKey: ['open-sessions', { ...params, pageSize }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchOpenSessions(auth as any, { ...(params as any), page: pageParam, pageSize }),
    getNextPageParam: (lastPage, allPages) => (Array.isArray(lastPage) && lastPage.length === pageSize ? allPages.length + 1 : undefined),
    retry: 1,
    throwOnError: (e: any) => (e as any)?.status >= 500,
  });

  const items = ((q.data?.pages as any[] | undefined) || []).flat() as any[];

  useEffect(() => {
    if (q.isError) {
      const e = q.error as any;
      if ((e?.status ?? 0) >= 500) return;
      notify.error(e?.message || 'Unexpected error, please try again.');
    }
  }, [q.isError, q.error]);

  // Virtualized 2-column grid by virtualizing rows, each row has up to 2 items
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowCount = Math.ceil(items.length / 2);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 190,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const lastVirtualRow = virtualRows[virtualRows.length - 1];

  useEffect(() => {
    if (!lastVirtualRow) return;
    if (q.hasNextPage && !q.isFetchingNextPage) {
      if (lastVirtualRow.index >= rowCount - 3) {
        q.fetchNextPage();
      }
    }
  }, [lastVirtualRow, q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage, rowCount]);

  return (
    <div>
      <h2>Open Sessions</h2>
      <Filters />
      {q.isPending && <div>Loading sessions...</div>}
      {q.isSuccess && items.length === 0 && <div>No open sessions match your filters.</div>}
      {items.length > 0 && (
        <div
          ref={parentRef}
          style={{
            height: 'calc(100vh - 180px)',
            overflow: 'auto',
            position: 'relative',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualRows.map((virtualRow) => {
              const rowIndex = virtualRow.index;
              const firstIndex = rowIndex * 2;
              const first = items[firstIndex];
              const second = items[firstIndex + 1];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    height: virtualRow.size,
                    paddingBottom: 12,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {first && <SessionCard key={`item-${firstIndex}`} item={first} />}
                    {second && <SessionCard key={`item-${firstIndex + 1}`} item={second} />}
                  </div>
                </div>
              );
            })}
          </div>
          {(q.isFetchingNextPage || q.isLoading) && (
            <div style={{ padding: 12, textAlign: 'center' }}>Loading more…</div>
          )}
          {!q.hasNextPage && items.length > 0 && (
            <div style={{ padding: 12, textAlign: 'center', color: '#666' }}>You have reached the end.</div>
          )}
        </div>
      )}
    </div>
  );
}


