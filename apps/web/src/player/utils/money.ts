export function formatEGP(piastersOrLE: number, mode: 'LE' | 'PIASTERS' = 'LE') {
  const value = mode === 'PIASTERS' ? Math.round(piastersOrLE / 100) : piastersOrLE;
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(
    value,
  );
}


