import { useCallback, useEffect, useState } from 'react';

const KEY = 'linkpulse.links';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function useMyLinks() {
  const [links, setLinks] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(links));
    } catch {
      /* storage unavailable: list just won't persist */
    }
  }, [links]);

  const add = useCallback((l) => {
    setLinks((prev) =>
      [
        { shortCode: l.shortCode, shortUrl: l.shortUrl, longUrl: l.longUrl || '', expiresAt: l.expiresAt || null, createdAt: Date.now() },
        ...prev.filter((x) => x.shortCode !== l.shortCode),
      ].slice(0, 50)
    );
  }, []);

  const remove = useCallback((code) => {
    setLinks((prev) => prev.filter((x) => x.shortCode !== code));
  }, []);

  return { links, add, remove };
}