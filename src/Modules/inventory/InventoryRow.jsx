import {
  Eye,
  MoreHorizontal,
  PackagePlus,
} from "lucide-react";
import StockStatus from "./StockStatus";

const InventoryRow = ({
  item,
  status,
  onViewDetails,
  onStockMovement,
  onStockAdjustment,
}) => {
  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {item.name}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {item.id}
          </p>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
          {item.sku}
        </span>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {item.category}
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {item.size}
      </td>

      <td className="px-4 py-4 text-right">
        <span className="text-sm font-semibold text-slate-900">
          {item.available.toLocaleString()}
        </span>

        <span className="ml-1 text-xs text-slate-400">
          {item.unit}
        </span>
      </td>

      <td className="px-4 py-4 text-right text-sm text-slate-600">
        {item.reserved}
      </td>

      <td className="px-4 py-4 text-right text-sm text-slate-600">
        {item.reorderLevel}
      </td>

      <td className="px-4 py-4">
        <StockStatus status={status} />
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {item.location}
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onViewDetails(item)}
            title="View details"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onStockMovement(item)}
            title="Stock movement"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            <PackagePlus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onStockAdjustment(item)}
            title="Adjust stock"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default InventoryRow;