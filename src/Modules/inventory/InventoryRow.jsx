import {
  Eye,
  PackagePlus,
  SlidersHorizontal,
} from "lucide-react";

import StockStatus from "./StockStatus";

import {
  formatQuantity,
  toEntryQuantity,
} from "../../lib/units";

export default function InventoryRow({
  item,
  status,
  onViewDetails,
  onStockMovement,
  onStockAdjustment,
}) {
  /*
   * Stock is counted in the stock unit (Piece). The equivalent
   * column shows the same stock in the Primary Unit (Sheet).
   */
  const showsConversion =
    item.conversionEnabled &&
    item.entryUnit &&
    item.entryUnit !== item.stockUnit;

  const equivalent =
    showsConversion
      ? `${formatQuantity(item.availableEntry)} ${item.entryUnit}`
      : "—";

  const minimumEquivalent =
    showsConversion &&
    Number(item.minimumStockLevel) > 0
      ? toEntryQuantity(
          item.minimumStockLevel,
          item
        )
      : null;

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-slate-800">
          {item.name}
        </p>

        <p className="mt-1 font-mono text-xs text-slate-400">
          {item.sku}
        </p>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {item.category}
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {item.size ||
          "—"}
      </td>

      <td className="px-4 py-4">
        <span className="text-sm font-semibold text-slate-900">
          {formatQuantity(
            item.available
          )}
        </span>

        <span className="ml-1 text-xs text-slate-400">
          {item.unit}
        </span>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {equivalent}
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {formatQuantity(
          item.minimumStockLevel
        )}{" "}
        {item.unit}

        {minimumEquivalent !==
          null && (
          <span className="ml-1 text-xs text-slate-400">
            (
            {formatQuantity(
              minimumEquivalent
            )}{" "}
            {item.entryUnit})
          </span>
        )}
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-slate-700">
          {item.assignedTo?.name ||
            "Not assigned"}
        </p>
      </td>

      <td className="px-4 py-4">
        <StockStatus
          status={
            status
          }
        />
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {item.location}
      </td>

      <td className="px-4 py-4">
        <div className="flex gap-1">
          <button
            title="Details"
            onClick={() =>
              onViewDetails(
                item
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            title="Stock Movement"
            onClick={() =>
              onStockMovement(
                item
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <PackagePlus className="h-4 w-4" />
          </button>

          <button
            title="Stock Adjustment"
            onClick={() =>
              onStockAdjustment(
                item
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}