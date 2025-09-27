import { useMemo, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchOpenSessions } from '@repo/player-api';
import { auth } from '../../lib/authClient';
import { notify } from '../../lib/notify';
import Filters from '../components/Filters';
import SessionCard from '../components/SessionCard';
import { Screen, BrandCard, Skeleton, SafeText } from '@repo/ui'
import { View } from 'tamagui';

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

  const [numCols, setNumCols] = useState(2);

  useEffect(() => {
    const updateCols = () => {
      if (typeof window !== 'undefined') {
        setNumCols(window.innerWidth < 768 ? 1 : 2);
      }
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const rowCount = Math.ceil(items.length / numCols);
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
    <Screen>
      <h2>Open Sessions</h2>
      <BrandCard>
        <Filters />
      </BrandCard>
      {q.isPending && (
        <BrandCard>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton height={18} />
                <Skeleton height={14} style={{ marginTop: 8 }} />
                <Skeleton height={14} style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
        </BrandCard>
      )}
      {q.isSuccess && items.length === 0 && <div>No open sessions match your filters.</div>}
      {items.length > 0 && (
        <BrandCard>
          <div
            ref={parentRef}
            style={{
              height: 'calc(100vh - 260px)',
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
              const firstIndex = rowIndex * numCols;
              const rowItems = Array.from({ length: numCols }, (_, i) => items[firstIndex + i]).filter(Boolean);
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
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)`, gap: 12 }}>
                    {rowItems.map((it, i) => (
                      <SessionCard key={`item-${firstIndex + i}`} item={it} />
                    ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {(q.isFetchingNextPage || q.isLoading) && (
              <View padding="$3"><SafeText textAlign="center">Loading more…</SafeText></View>
            )}
            {!q.hasNextPage && items.length > 0 && (
              <View padding="$3"><SafeText textAlign="center" color="$gray11">You have reached the end.</SafeText></View>
            )}
          </div>
        </BrandCard>
      )}
    </Screen>
  );
}


