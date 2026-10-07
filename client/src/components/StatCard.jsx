import Skeleton from './Skeleton';

export default function StatCard({ icon: Icon, label, value, hint, loading }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-indigo-400/30 hover:bg-white/[0.06]">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-400/10 text-indigo-300">
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <>
          <div className="truncate text-2xl font-semibold tabular-nums text-white">{value}</div>
          <div className="mt-0.5 truncate text-xs text-slate-500">{hint || '\u00A0'}</div>
        </>
      )}
    </div>
  );
}