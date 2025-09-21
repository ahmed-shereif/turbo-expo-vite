import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TextField, BrandButton } from '@repo/ui'

type Facilities = {
  lighting: boolean;
  locker: boolean;
  parking: boolean;
  balls: boolean;
};

export default function Filters() {
  const [search, setSearch] = useSearchParams();
  const [area, setArea] = useState(search.get('area') ?? '');
  const [dateFrom, setDateFrom] = useState(search.get('dateFrom') ?? '');
  const [dateTo, setDateTo] = useState(search.get('dateTo') ?? '');
  const [eligible, setEligible] = useState(search.get('minRankEligible') === 'true');
  const [priceMin, setPriceMin] = useState(search.get('priceMin') ?? '');
  const [priceMax, setPriceMax] = useState(search.get('priceMax') ?? '');
  const [sort, setSort] = useState(search.get('sort') ?? 'startAt');
  const [fac, setFac] = useState<Facilities>({
    lighting: search.getAll('facilities[]').includes('lighting'),
    locker: search.getAll('facilities[]').includes('locker'),
    parking: search.getAll('facilities[]').includes('parking'),
    balls: search.getAll('facilities[]').includes('balls'),
  });

  useEffect(() => {
    // keep local state in sync if URL changes externally
    setArea(search.get('area') ?? '');
  }, [search]);

  const apply = () => {
    const q = new URLSearchParams();
    if (area) q.set('area', area);
    if (dateFrom) q.set('dateFrom', dateFrom);
    if (dateTo) q.set('dateTo', dateTo);
    if (eligible) q.set('minRankEligible', 'true');
    if (priceMin) q.set('priceMin', priceMin);
    if (priceMax) q.set('priceMax', priceMax);
    if (sort) q.set('sort', sort);
    Object.entries(fac).forEach(([k, v]) => {
      if (v) q.append('facilities[]', k);
    });
    setSearch(q, { replace: true });
  };

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        <div>
          <label>Area</label>
          <TextField value={area} onChange={(e: any) => setArea(e.target.value)} placeholder="Area" fullWidth />
        </div>
        <div>
          <label>Date From</label>
          <TextField type="datetime-local" value={dateFrom} onChange={(e: any) => setDateFrom(e.target.value)} fullWidth />
        </div>
        <div>
          <label>Date To</label>
          <TextField type="datetime-local" value={dateTo} onChange={(e: any) => setDateTo(e.target.value)} fullWidth />
        </div>
        <div>
          <label>Eligible only</label>
          <input type="checkbox" checked={eligible} onChange={(e) => setEligible(e.target.checked)} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label>Facilities</label>
          <div>
            {(['lighting', 'locker', 'parking', 'balls'] as const).map((k) => (
              <label key={k} style={{ marginRight: 12 }}>
                <input
                  type="checkbox"
                  checked={fac[k]}
                  onChange={(e) => setFac((f) => ({ ...f, [k]: e.target.checked }))}
                />
                {k}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label>Price Min</label>
          <TextField type="number" value={priceMin} onChange={(e: any) => setPriceMin(e.target.value)} fullWidth />
        </div>
        <div>
          <label>Price Max</label>
          <TextField type="number" value={priceMax} onChange={(e: any) => setPriceMax(e.target.value)} fullWidth />
        </div>
        <div>
          <label>Sort</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="startAt">startAt</option>
            <option value="price">price</option>
            <option value="rating">rating</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <BrandButton icon="Search" onPress={apply}>Apply</BrandButton>
      </div>
    </div>
  );
}


