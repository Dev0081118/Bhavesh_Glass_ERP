import { Truck } from "lucide-react";
import LRRow from "./LRRow";

function LRTable({
  lrs,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Lorry Receipts
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {lrs.length} record{lrs.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            <Truck size={17} className="text-slate-600" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">LR</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Dispatch</th>
              <th className="px-5 py-3">Transport</th>
              <th className="px-5 py-3">Packages</th>
              <th className="px-5 py-3">Weight</th>
              <th className="px-5 py-3">Freight</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {lrs.length > 0 ? (
              lrs.map((lr) => (
                <LRRow
                  key={lr.id}
                  lr={lr}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="px-5 py-16 text-center"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                      <Truck
                        size={21}
                        className="text-slate-400"
                      />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-800">
                      No LR records found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your filters or create a new LR.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LRTable;