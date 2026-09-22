import {
  PackagePlus,
} from "lucide-react";

import InventoryRow from "./InventoryRow";

export default function InventoryTable({
  inventory,
  getStatus,
  onViewDetails,
  onStockMovement,
  onStockAdjustment,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Inventory
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          {inventory.length} inventory records
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {[
                "Product",
                "Category",
                "Frame Size",
                "Available",
                "Equivalent",
                "Minimum",
                "Responsible",
                "Status",
                "Location",
                "Actions",
              ].map(
                (
                  heading
                ) => (
                  <th
                    key={
                      heading
                    }
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {
                      heading
                    }
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {inventory.length ===
            0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-20 text-center"
                >
                  <PackagePlus className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm text-slate-500">
                    No inventory records found.
                  </p>
                </td>
              </tr>
            ) : (
              inventory.map(
                (item) => (
                  <InventoryRow
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    status={getStatus(
                      item
                    )}
                    onViewDetails={
                      onViewDetails
                    }
                    onStockMovement={
                      onStockMovement
                    }
                    onStockAdjustment={
                      onStockAdjustment
                    }
                  />
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}