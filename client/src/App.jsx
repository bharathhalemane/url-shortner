import { useState } from 'react';
import { Link2 } from 'lucide-react';
import CreateLinkCard from './components/CreateLinkCard';
import LinkList from './components/LinkList';
import AnalyticsPanel from './components/AnalyticsPanel';
import { useMyLinks } from './hooks/useMyLinks';
import { useAnalytics } from './hooks/useAnalytics';
import { fetchAnalytics } from './api';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE_URL || 'http://localhost:3000';

export default function App() {
  const { links, add, remove } = useMyLinks();
  const [active, setActive] = useState(() => links[0]?.shortCode ?? null);
  const [rangeKey, setRangeKey] = useState('7d');
  const [includeBots, setIncludeBots] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const link = links.find((l) => l.shortCode === active) || null;
  const { data, loading, error, refresh } = useAnalytics(link?.shortCode ?? null, {
    rangeKey, includeBots, autoRefresh,
  });

  const handleCreated = (l) => {
    add(l);
    setActive(l.shortCode);
  };

  const handleRemove = (code) => {
    remove(code);
    if (code === active) setActive(links.find((l) => l.shortCode !== code)?.shortCode ?? null);
  };

  // Validate by asking the API (404 => "Short link not found"), then remember it
  const handleTrack = async (code) => {
    const to = new Date();
    await fetchAnalytics(code, { from: new Date(to - 864e5), to, interval: 'day', includeBots: false });
    add({ shortCode: code, shortUrl: `${SHORT_BASE}/${code}`, longUrl: '' });
    setActive(code);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
          <Link2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Linkpulse</h1>
          <p className="text-xs text-slate-500">Short links with live analytics</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          <CreateLinkCard onCreated={handleCreated} />
          <LinkList links={links} activeCode={active} onSelect={setActive} onRemove={handleRemove} onTrack={handleTrack} />
        </aside>

        <main className="lg:col-span-8">
          <AnalyticsPanel
            link={link}
            rangeKey={rangeKey} onRangeChange={setRangeKey}
            includeBots={includeBots} onBotsChange={setIncludeBots}
            autoRefresh={autoRefresh} onAutoRefreshChange={setAutoRefresh}
            data={data} loading={loading} error={error} onRefresh={refresh}
          />
        </main>
      </div>
    </div>
  );
}