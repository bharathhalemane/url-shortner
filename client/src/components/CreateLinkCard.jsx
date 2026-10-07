import { useState } from 'react';
import { ChevronDown, Link2, Loader2, Sparkles } from 'lucide-react';
import Card from './Card';
import CopyButton from './CopyButton';
import { createLink } from '../api';

const EXPIRY_OPTIONS = [
  { label: 'Never', value: '' },
  { label: '1 hour', value: '3600' },
  { label: '1 day', value: '86400' },
  { label: '7 days', value: '604800' },
  { label: '30 days', value: '2592000' },
];

const inputCls =
  'w-full rounded-xl border border-white/10 bg-slate-900/60 py-2.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20';

export default function CreateLinkCard({ onCreated }) {
  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [expiresIn, setExpiresIn] = useState('')

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const link = await createLink({
        longUrl: longUrl.trim(),
        ...(alias.trim() && { alias: alias.trim() }),
        ...(expiresIn && { expiresI: Number(expiresIn)})
      });
      setResult(link);
      onCreated(link);
      setLongUrl('');
      setAlias('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Create a short link" icon={Sparkles}>
      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            required
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/a/very/long/url"
            className={`${inputCls} pl-9 pr-3`}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAlias((v) => !v)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition ${showAlias ? 'rotate-180' : ''}`} />
          Custom alias (optional)
        </button>
        {showAlias && (
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            pattern="[A-Za-z0-9_\-]{3,30}"
            title="3-30 characters: letters, digits, _ or -"
            placeholder="my-launch"
            className={`${inputCls} px-3`}
          />
        )}

        <label className="flex items-center justify-between text-xs text-slate-400">
          Link expires
          <select
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-400/60"
          >
            {EXPIRY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
            ))}
          </select>
        </label>

        <button
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Shorten
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {error}
        </p>
      )}
      {result && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-medium text-emerald-300 hover:underline"
          >
            {result.shortUrl}
          </a>
          <CopyButton text={result.shortUrl} />
        </div>
      )}
    </Card>
  );
}