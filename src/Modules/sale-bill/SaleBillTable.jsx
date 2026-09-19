import { FileText } from "lucide-react";
import SaleBillRow from "./SaleBillRow";

export default function SaleBillTable({
  bills,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-slate-500" />

          <h2 className="text-sm font-semibold text-slate-800">
            Sale Bill List
          </h2>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {bills.length}
          </span>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <FileText size={22} className="text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No sale bills found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters or create a new sale bill.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sale Bill
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Items
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bills.map((bill) => (
                <SaleBillRow
                  key={bill.id}
                  bill={bill}
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