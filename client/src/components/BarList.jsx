import { fmtNum } from '../lib/format';

export default function BarList({ items, labelFn = (k) => k, iconFn, barClass = 'bg-linear-to-r from-indigo-500 to-violet-400' }) {
  const max = Math.max(...items.map((i) => i.clicks), 1);
  const total = items.reduce((s, i) => s + i.clicks, 0) || 1;

  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.key} className="group">
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 truncate text-slate-200">
              {iconFn?.(it.key)}
              <span className="truncate">{labelFn(it.key)}</span>
            </span>
            <span className="shrink-0 tabular-nums text-slate-400">
              <span className="text-slate-100">{fmtNum(it.clicks)}</span> · {Math.round((it.clicks / total) * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full transition-all duration-700 group-hover:brightness-125 ${barClass}`}
              style={{ width: `${(it.clicks / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}