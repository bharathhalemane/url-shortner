import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { fmtNum } from '../lib/format';

const COLORS = ['#818cf8', '#e879f9', '#22d3ee', '#34d399', '#fbbf24', '#fb7185'];

export default function DonutBreakdown({ items, labelFn = (k) => k }) {
  const [hover, setHover] = useState(null);
  const total = items.reduce((s, i) => s + i.clicks, 0);
  const active = hover !== null ? items[hover] : null;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={items}
              dataKey="clicks"
              nameKey="key"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
              onMouseEnter={(_, i) => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {items.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={hover === null || hover === i ? 1 : 0.3} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold text-white">
            {active ? `${Math.round((active.clicks / total) * 100)}%` : fmtNum(total)}
          </div>
          <div className="text-xs text-slate-400">{active ? labelFn(active.key) : 'total'}</div>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {items.map((it, i) => (
          <li
            key={it.key}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition ${
              hover === i ? 'bg-white/10' : ''
            }`}
          >
            <span className="flex items-center gap-2 text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {labelFn(it.key)}
            </span>
            <span className="tabular-nums text-slate-400">
              <span className="text-slate-100">{fmtNum(it.clicks)}</span> · {Math.round((it.clicks / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}