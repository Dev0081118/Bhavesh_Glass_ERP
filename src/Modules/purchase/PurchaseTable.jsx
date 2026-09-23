import {
  ClipboardList,
} from "lucide-react";

import PurchaseRow from "./PurchaseRow";

export default function PurchaseTable({
  purchases,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Purchase Records
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {purchases.length} records
          </p>
        </div>

        <ClipboardList
          size={18}
          className="text-slate-400"
        />
      </div>

      {purchases.length ===
      0 ? (
        <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">
          No purchases found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px]">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Purchase",
                  "Supplier",
                  "Items",
                  "Date",
                  "Receipt",
                  "Amount",
                  "Assigned To",
                  "Status",
                  "Payment",
                  "",
                ].map(
                  (
                    heading
                  ) => (
                    <th
                      key={
                        heading
                      }
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {
                        heading
                      }
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {purchases.map(
                (
                  purchase
                ) => (
                  <PurchaseRow
                    key={
                      purchase.id
                    }

                    purchase={
                      purchase
                    }

                    onView={
                      onView
                    }

                    onEdit={
                      onEdit
                    }

                    onDelete={
                      onDelete
                    }
                  />
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}