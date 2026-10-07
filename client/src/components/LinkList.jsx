import { useState } from 'react';
import { Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import Card from './Card';

export default function LinkList({ links, activeCode, onSelect, onRemove, onTrack }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function track(e) {
    e.preventDefault();
    const c = code.trim();
    if (!c) return;
    setBusy(true);
    setErr('');
    try {
      await onTrack(c);
      setCode('');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Your links" subtitle="Saved in this browser only" icon={LinkIcon}>
      {links.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">Create a link to see its analytics here.</p>
      ) : (
        <ul className="-mx-2 max-h-80 space-y-1 overflow-y-auto px-2">
          {links.map((l) => {
            const active = l.shortCode === activeCode;
            return (
              <li key={l.shortCode}>
                <div
                  className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 transition ${
                    active ? 'bg-indigo-400/10 ring-1 ring-indigo-400/30' : 'hover:bg-white/5'
                  }`}
                >
                  <button onClick={() => onSelect(l.shortCode)} className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-medium text-slate-100">/{l.shortCode}</div>
                    <div className="truncate text-xs text-slate-500">{l.longUrl || 'Tracked by code'}</div>
                  </button>
                  <button
                    onClick={() => onRemove(l.shortCode)}
                    aria-label={`Remove ${l.shortCode} from this list`}
                    title="Remove from this list (the link keeps working)"
                    className="rounded-lg p-1.5 text-slate-500 opacity-0 transition hover:bg-white/10 hover:text-rose-300 focus:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={track} className="mt-4 flex gap-2 border-t border-white/10 pt-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Track existing code…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-400/60"
        />
        <button
          disabled={busy}
          aria-label="Track code"
          className="rounded-lg bg-white/10 px-3 text-slate-200 transition hover:bg-white/15 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
      {err && <p className="mt-2 text-xs text-rose-300">{err}</p>}
    </Card>
  );
}