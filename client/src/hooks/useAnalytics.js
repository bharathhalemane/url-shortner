import { useCallback, useEffect, useState } from 'react';
import { fetchAnalytics } from '../api';
import { RANGES, ceilMinute } from '../lib/format';

const REFRESH_MS = 30_000; // matches the server-side cache TTL

export function useAnalytics(code, { rangeKey, includeBots, autoRefresh }) {
  const [state, setState] = useState({ forCode: null, data: null, loading: false, error: '' });
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!code) return;
    const ctrl = new AbortController();
    const { ms, interval } = RANGES[rangeKey];
    const to = ceilMinute(new Date());
    const from = new Date(to.getTime() - ms);

    // Keep old data while refreshing the same link; drop it when the link changes
    // setState((s) => ({ ...s, data: s.forCode === code ? s.data : null, loading: true, error: '' }));

    fetchAnalytics(code, { from, to, interval, includeBots }, ctrl.signal)
      .then((data) => setState({ forCode: code, data, loading: false, error: '' }))
      .catch((err) => {
        if (err.name === 'AbortError') return; // superseded by a newer request
        setState((s) => ({ ...s, loading: false, error: err.message }));
      });

    return () => ctrl.abort();
  }, [code, rangeKey, includeBots, tick]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh]);
  
  return { data: state.forCode === code ? state.data : null, loading: state.loading, error: state.error, refresh };
}