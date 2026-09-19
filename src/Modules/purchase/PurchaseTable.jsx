import { ClipboardList } from "lucide-react";
import PurchaseRow from "./PurchaseRow";

export default function PurchaseTable({
  purchases,
  products,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Purchase Records
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {purchases.length} record
              {purchases.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <ClipboardList size={18} className="text-slate-400" />
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ClipboardList size={21} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">
            No purchases found
          </h3>

          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Try changing your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Purchase
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Supplier
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Items
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Date
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Total
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase) => (
                <PurchaseRow
                  key={purchase.id}
                  purchase={purchase}
                  products={products}
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