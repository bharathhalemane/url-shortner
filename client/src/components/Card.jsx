export default function Card({ title, subtitle, icon: Icon, action, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white[0.04] p-5 backdrop-blur ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              {Icon && <Icon className="h-4 w-4 text-indigo-300" />}
              {title}
            </h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}