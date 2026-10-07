import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { bucketLabel, fmtNum } from '../lib/format';

function ChartTooltip({ active, payload, interval }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 shadow-xl">
      <div className="text-xs text-slate-400">{bucketLabel(p.t, interval, true)} UTC</div>
      <div className="text-lg font-semibold text-white">
        {fmtNum(p.clicks)} <span className="text-sm font-normal text-slate-400">clicks</span>
      </div>
    </div>
  );
}

export default function ClicksChart({ series, interval }) {
  const tick = { fill: '#94a3b8', fontSize: 12 };
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => bucketLabel(v, interval)}
            tickLine={false}
            axisLine={false}
            tick={tick}
            minTickGap={28}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={tick} width={48} tickFormatter={fmtNum} />
          <Tooltip content={<ChartTooltip interval={interval} />} cursor={{ stroke: '#818cf8', strokeOpacity: 0.4 }} />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#818cf8"
            strokeWidth={2.5}
            fill="url(#clicksFill)"
            activeDot={{ r: 5, strokeWidth: 0, fill: '#c7d2fe' }}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}