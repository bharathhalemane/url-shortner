import { Activity, BarChart3, Compass, ExternalLink, Flame, Globe, MousePointerClick, RefreshCw, Share2, Smartphone,Clock, QrCode } from 'lucide-react';
import Card from './Card';
import CopyButton from './CopyButton';
import RangeTabs from './RangeTabs';
import StatCard from './StatCard';
import Skeleton from './Skeleton';
import ClicksChart from './ClicksChart';
import DonutBreakdown from './DonutBreakdown';
import BarList from './BarList';
import { RANGES, bucketLabel, capitalize, countryName, flag, fmtNum }from '../lib/format';
import { useState } from 'react';
import QrDialog from './QrDialog';

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-xs text-slate-400 transition hover:text-slate-200"
    >
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? 'left-[1.125rem]' : 'left-0.5'}`}
        />
      </span>
      {label}
    </button>
  );
}

function EmptyHero() {
  return (
    <Card className="grid min-h-[24rem] place-items-center text-center">
      <div>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-400/10 text-indigo-300">
          <BarChart3 className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-white">No link selected</h2>
        <p className="mt-1 max-w-xs text-sm text-slate-400">
          Shorten a URL on the left, then open it a few times to watch the clicks roll in.
        </p>
      </div>
    </Card>
  );
}

export default function AnalyticsPanel({
  link, rangeKey, onRangeChange, includeBots, onBotsChange, autoRefresh, onAutoRefreshChange,
  data, loading, error, onRefresh,
}) {
  const [showQr, setShowQr] = useState(false);
  if (!link) return <EmptyHero />;

  const interval = RANGES[rangeKey].interval;
  const initialLoad = loading && !data;
  const peak = data?.timeseries.reduce((m, p) => (!m || p.clicks > m.clicks ? p : m), null);
  const topCountry = data?.countries[0];
  const topRef = data?.referrers[0];

  const expired = link.expiresAt && new Date(link.expiresAt) < new Date();

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500">Analytics</p>
          <h2 className="truncate text-2xl font-semibold text-white">/{link.shortCode}</h2>
          <p className="truncate text-sm text-slate-500">{link.longUrl || link.shortUrl}</p>
          {link.expiresAt && (
            <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
              expired ? 'bg-rose-500/10 text-rose-300' : 'bg-amber-400/10 text-amber-300'
            }`}>
              <Clock className="h-3 w-3" />
              {expired ? 'Expired' : `Expires ${new Date(link.expiresAt).toLocaleString()}`}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <CopyButton text={link.shortUrl} />
          <button
            onClick={() => setShowQr(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
          >
            <QrCode className="h-3.5 w-3.5" /> QR
          </button>
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open
          </a>
        </div>
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <RangeTabs value={rangeKey} onChange={onRangeChange} />
        <Toggle checked={includeBots} onChange={onBotsChange} label="Include bots" />
        <Toggle checked={autoRefresh} onChange={onAutoRefreshChange} label="Auto-refresh" />
        <button
          onClick={onRefresh}
          aria-label="Refresh analytics"
          className="ml-auto rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={MousePointerClick} label="Total clicks" loading={initialLoad}
          value={fmtNum(data?.totalClicks ?? 0)} hint={`Last ${RANGES[rangeKey].label}${includeBots ? '' : ' · humans'}`} />
        <StatCard icon={Flame} label="Peak" loading={initialLoad}
          value={peak && peak.clicks > 0 ? fmtNum(peak.clicks) : '—'}
          hint={peak && peak.clicks > 0 ? bucketLabel(peak.t, interval, true) + ' UTC' : ''} />
        <StatCard icon={Globe} label="Top country" loading={initialLoad}
          value={topCountry ? `${flag(topCountry.key)} ${countryName(topCountry.key)}` : '—'}
          hint={topCountry ? `${fmtNum(topCountry.clicks)} clicks` : ''} />
        <StatCard icon={Share2} label="Top referrer" loading={initialLoad}
          value={topRef ? (topRef.key === 'direct' ? 'Direct' : topRef.key) : '—'}
          hint={topRef ? `${fmtNum(topRef.clicks)} clicks` : ''} />
      </div>

      {initialLoad ? (
        <>
          <Skeleton className="h-96" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" /><Skeleton className="h-64" />
          </div>
        </>
      ) : data && data.totalClicks === 0 ? (
        <Card className="py-10 text-center">
          <Activity className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          <p className="font-medium text-slate-200">No clicks in this range yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Open <a className="text-indigo-300 hover:underline" href={link.shortUrl} target="_blank" rel="noreferrer">{link.shortUrl}</a>{' '}
            and refresh. Clicks appear after a second or two.
          </p>
        </Card>
      ) : data ? (
        <>
          <Card title="Clicks over time" subtitle={`${interval === 'hour' ? 'Hourly' : 'Daily'} · times in UTC`} icon={Activity}>
            <ClicksChart series={data.timeseries} interval={interval} />
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Devices" icon={Smartphone}>
              <DonutBreakdown items={data.devices} labelFn={capitalize} />
            </Card>
            <Card title="Countries" icon={Globe}>
              <BarList
                items={data.countries}
                labelFn={countryName}
                iconFn={(k) => <span className="text-base leading-none">{flag(k)}</span>}
              />
            </Card>
            <Card title="Referrers" icon={Share2}>
              <BarList
                items={data.referrers}
                labelFn={(k) => (k === 'direct' ? 'Direct' : k)}
                barClass="bg-linear-to-r from-fuchsia-500 to-pink-400"
              />
            </Card>
            <Card title="Browsers" icon={Compass}>
              <BarList items={data.browsers} barClass="bg-linear-to-r from-cyan-500 to-emerald-400" />
            </Card>
          </div>
        </>
      ) : null}
      {showQr && <QrDialog link={link} onClose={() => setShowQr(false)} />}
    </div>
  );
}