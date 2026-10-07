import { RANGES } from '../lib/format';

export default function RangeTabs({ value, onChange }) {
  return (
    <div role="tablist" className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {Object.entries(RANGES).map(([key, r]) => (
        <button
          key={key}
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
            value === key ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}