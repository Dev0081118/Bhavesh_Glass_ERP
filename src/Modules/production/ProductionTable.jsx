import { ClipboardList } from "lucide-react";
import ProductionRow from "./ProductionRow";

export default function ProductionTable({
  productions,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Production Orders
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {productions.length} production order
            {productions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {productions.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ClipboardList size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No production orders found
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try changing your filters or create a new production order.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Production
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Product
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Planned
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Completed
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Progress
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Start Date
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {productions.map((production) => (
                <ProductionRow
                  key={production.id}
                  production={production}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}