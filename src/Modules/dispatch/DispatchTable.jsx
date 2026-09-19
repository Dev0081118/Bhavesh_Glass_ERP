import { PackageOpen } from "lucide-react";
import DispatchRow from "./DispatchRow";

export default function DispatchTable({
  dispatches,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Dispatch Orders
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          {dispatches.length} dispatch
          {dispatches.length !== 1 ? "es" : ""}
        </p>
      </div>

      {dispatches.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <PackageOpen size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No dispatch orders found
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try changing your filters or create a new dispatch.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Dispatch
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Items
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Dispatch Date
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Transport
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  LR
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
              {dispatches.map((dispatch) => (
                <DispatchRow
                  key={dispatch.id}
                  dispatch={dispatch}
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