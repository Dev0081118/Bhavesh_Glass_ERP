export default function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="h-9 w-72 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-80 animate-pulse rounded-full bg-slate-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[164px] animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="h-[320px] animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-2" />
        <div className="h-[320px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
