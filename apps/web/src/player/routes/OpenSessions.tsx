import { useMemo, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchOpenSessions } from '@repo/player-api';
import { auth } from '../../lib/authClient';
import { notify } from '../../lib/notify';
import Filters from '../components/Filters';
import SessionCard from '../components/SessionCard';
import { Screen, BrandCard, Skeleton, BrandButton } from '@repo/ui';
import { Icon } from '@repo/ui';

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

  // Responsive grid system
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [numCols, setNumCols] = useState(1);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  useEffect(() => {
    const updateCols = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width >= 1200) setNumCols(3);
        else if (width >= 768) setNumCols(2);
        else setNumCols(1);
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
    estimateSize: () => 240,
    overscan: 5,
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: '#1a1a1a'
          }}>Open Sessions</h1>
          <p style={{ 
            margin: '0.25rem 0 0 0', 
            color: '#6b7280', 
            fontSize: '0.875rem' 
          }}>
            {items.length > 0 ? `${items.length} sessions available` : 'Find and join tennis sessions'}
          </p>
        </div>
        <BrandButton 
          variant="outline" 
          icon={isFiltersExpanded ? "ChevronUp" : "Filter"}
          onPress={() => setIsFiltersExpanded(!isFiltersExpanded)}
        >
          {isFiltersExpanded ? 'Hide' : 'Filters'}
        </BrandButton>
      </div>

      {isFiltersExpanded && (
        <BrandCard style={{ marginBottom: '1.5rem' }}>
          <Filters />
        </BrandCard>
      )}

      {q.isPending && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${numCols}, 1fr)`, 
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {Array.from({ length: numCols * 2 }).map((_, i) => (
            <BrandCard key={i}>
              <div style={{ padding: '0.5rem' }}>
                <Skeleton height={20} style={{ marginBottom: '0.75rem' }} />
                <Skeleton height={16} style={{ marginBottom: '0.5rem' }} />
                <Skeleton height={16} style={{ marginBottom: '0.5rem' }} />
                <Skeleton height={14} />
              </div>
            </BrandCard>
          ))}
        </div>
      )}

      {q.isSuccess && items.length === 0 && (
        <BrandCard>
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: '#6b7280'
          }}>
            <Icon name="Calendar" size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No sessions found</h3>
            <p style={{ margin: 0 }}>Try adjusting your filters to find more sessions.</p>
          </div>
        </BrandCard>
      )}

      {items.length > 0 && (
        <div
          ref={parentRef}
          style={{
            height: 'calc(100vh - 200px)',
            overflow: 'auto',
            position: 'relative',
            background: 'transparent',
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
                    paddingBottom: '1.5rem',
                  }}
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${numCols}, 1fr)`, 
                    gap: '1.5rem'
                  }}>
                    {rowItems.map((it, i) => (
                      <SessionCard key={`item-${firstIndex + i}`} item={it} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {(q.isFetchingNextPage || q.isLoading) && (
            <div style={{ 
              padding: '1.5rem', 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              borderRadius: '0.5rem',
              margin: '1rem 0'
            }}>
              <Icon name="Loader2" size={20} color="#6b7280" style={{ marginRight: '0.5rem' }} />
              Loading more sessions...
            </div>
          )}
          
          {!q.hasNextPage && items.length > 0 && (
            <div style={{ 
              padding: '1.5rem', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              <Icon name="CheckCircle" size={16} color="#10b981" style={{ marginRight: '0.5rem' }} />
              All sessions loaded
            </div>
          )}
        </div>
      )}
    </Screen>
  );
}


