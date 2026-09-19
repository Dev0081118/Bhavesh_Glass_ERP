import {
  PackagePlus,
  SlidersHorizontal,
} from "lucide-react";

import InventoryRow from "./InventoryRow";

const InventoryTable = ({
  inventory,
  getStatus,
  onViewDetails,
  onStockMovement,
  onStockAdjustment,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Inventory Items
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            {inventory.length} item
            {inventory.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <button
          type="button"
          className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 sm:flex"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Columns
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {[
                "Product",
                "SKU",
                "Category",
                "Size",
                "Available",
                "Reserved",
                "Reorder",
                "Status",
                "Location",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
                    ["Available", "Reserved", "Reorder", "Actions"].includes(
                      heading
                    )
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-5 py-16 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                    <PackagePlus className="h-5 w-5 text-slate-400" />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No inventory found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing your filters or search.
                  </p>
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  status={getStatus(item)}
                  onViewDetails={onViewDetails}
                  onStockMovement={onStockMovement}
                  onStockAdjustment={onStockAdjustment}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;