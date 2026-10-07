async function request(path, opts = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const createLink = (body) =>
  request('/api/urls', { method: 'POST', body: JSON.stringify(body) });

export function fetchAnalytics(code, { from, to, interval, includeBots }, signal) {
  const q = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
    interval,
    includeBots: String(includeBots),
  });
  return request(`/api/urls/${encodeURIComponent(code)}/analytics?${q}`, { signal });
}