export function formatLocal(dtIso: string) {
  const d = new Date(dtIso);
  return d.toLocaleString();
}


