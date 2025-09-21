import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TextField, BrandButton, Icon } from '@repo/ui'

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

  const clear = () => {
    setArea('');
    setDateFrom('');
    setDateTo('');
    setEligible(false);
    setPriceMin('');
    setPriceMax('');
    setSort('startAt');
    setFac({ lighting: false, locker: false, parking: false, balls: false });
    setSearch(new URLSearchParams(), { replace: true });
  };

  const facilityIcons = {
    lighting: 'Lightbulb',
    locker: 'Lock',
    parking: 'Car',
    balls: 'Circle'
  } as const;

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>Location</label>
          <TextField 
            value={area} 
            onChange={(e: any) => setArea(e.target.value)} 
            placeholder="Enter area" 
            fullWidth 
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>Start Date</label>
          <TextField 
            type="datetime-local" 
            value={dateFrom} 
            onChange={(e: any) => setDateFrom(e.target.value)} 
            fullWidth 
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>End Date</label>
          <TextField 
            type="datetime-local" 
            value={dateTo} 
            onChange={(e: any) => setDateTo(e.target.value)} 
            fullWidth 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>Min Price</label>
            <TextField 
              type="number" 
              value={priceMin} 
              onChange={(e: any) => setPriceMin(e.target.value)} 
              placeholder="0" 
              fullWidth 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>Max Price</label>
            <TextField 
              type="number" 
              value={priceMax} 
              onChange={(e: any) => setPriceMax(e.target.value)} 
              placeholder="1000" 
              fullWidth 
            />
          </div>
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>Sort By</label>
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          >
            <option value="startAt">Start Time</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer'
          }}>
            <input 
              type="checkbox" 
              checked={eligible} 
              onChange={(e) => setEligible(e.target.checked)}
              style={{ marginRight: '0.25rem' }}
            />
            <Icon name="Shield" size={16} color="#10b981" />
            Eligible sessions only
          </label>
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.75rem',
            color: '#374151'
          }}>Facilities</label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.75rem'
          }}>
            {(['lighting', 'locker', 'parking', 'balls'] as const).map((k) => (
              <label key={k} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                border: fac[k] ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: fac[k] ? '#eff6ff' : 'white',
                transition: 'all 0.2s'
              }}>  
                <input
                  type="checkbox"
                  checked={fac[k]}
                  onChange={(e) => setFac((f) => ({ ...f, [k]: e.target.checked }))}
                  style={{ display: 'none' }}
                />
                <Icon name={facilityIcons[k]} size={16} color={fac[k] ? '#3b82f6' : '#6b7280'} />
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        justifyContent: 'flex-end',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <BrandButton 
          variant="ghost" 
          icon="X" 
          onPress={clear}
          style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
        >
          Clear
        </BrandButton>
        <BrandButton 
          icon="Search" 
          onPress={apply}
          style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
        >
          Apply
        </BrandButton>
      </div>
    </div>
  );
}


