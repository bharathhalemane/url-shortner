export const RANGES = {
  '24h': { label: '24h', ms: 24 * 3600e3, interval: 'hour' },
  '7d': { label: '7d', ms: 7 * 864e5, interval: 'day' },
  '30d': { label: '30d', ms: 30 * 864e5, interval: 'day' },
  '90d': { label: '90d', ms: 90 * 864e5, interval: 'day' },
};

// Stable timestamps => stable server cache keys
export function floorMinute(d) {
  const x = new Date(d);
  x.setSeconds(0, 0);
  return x;
}

export const fmtNum = (n) =>
  new Intl.NumberFormat('en', { notation: n >= 100000 ? 'compact' : 'standard' }).format(n);

// Buckets are UTC on the server, so label them in UTC too
export function bucketLabel(iso, interval, long = false) {
  const opts =
    interval === 'hour'
      ? long
        ? { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
        : { hour: 'numeric' }
      : { month: 'short', day: 'numeric' };
  return new Date(iso).toLocaleString('en', { ...opts, timeZone: 'UTC' });
}

const regions = new Intl.DisplayNames(['en'], { type: 'region' });
export function countryName(code) {
  if (code === 'XX') return 'Unknown';
  try {
    return regions.of(code) || code;
  } catch {
    return code;
  }
}

export function ceilMinute(d) {
  const x = new Date(d);
  x.setSeconds(60, 0); // rolls over to the start of the next minute
  return x;
}

export function flag(code) {
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX') return '🌐';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);