export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white ${className}`}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
            )}

            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>

          {action}
        </header>
      )}

      <div className={`flex-1 px-5 py-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
