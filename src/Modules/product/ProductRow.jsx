import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import ProductStatus from "./ProductStatus";

import { getStockUnit } from "../../lib/units";

export default function ProductRow({
  product,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const frameSize =
    product.isFrame &&
    product.frameSize?.width &&
    product.frameSize?.height
      ? `${product.frameSize.width} × ${product.frameSize.height} ${product.frameSize.unit}`
      : "—";

  /*
   * Minimum stock is counted in the stock unit, so a product
   * with 1 Sheet = 50 Piece alerts on 10 Piece, not 10 Sheet.
   */
  const stockUnit =
    getStockUnit(product);

  const conversion =
    product.conversionEnabled &&
    product.conversions?.[0]
      ? `1 ${product.unit} = ${product.conversions[0].factor} ${product.conversions[0].unit}`
      : "—";

  const responsible =
    product.assignedTo?.name ||
    "Not assigned";

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-slate-900">
          {
            product.name
          }
        </p>

        <p className="mt-1 font-mono text-xs text-slate-400">
          {
            product.sku
          }
        </p>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {
          product.category
        }
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {product.type}
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {frameSize}
      </td>

      <td className="px-4 py-4 text-sm font-medium text-slate-700">
        {product.unit}
      </td>

      <td className="px-4 py-4 text-xs text-slate-500">
        {conversion}
      </td>

      <td className="px-4 py-4 text-sm text-slate-700">
        {product.minimumStockLevel ??
          0}{" "}
        {stockUnit}
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-slate-700">
          {responsible}
        </p>

        {product.assignedTo?.role && (
          <p className="text-xs text-slate-400">
            {
              product.assignedTo
                .role
            }
          </p>
        )}
      </td>

      <td className="px-4 py-4">
        <ProductStatus
          status={
            product.status
          }
          onClick={() =>
            onToggleStatus(
              product
            )
          }
        />
      </td>

      <td className="px-4 py-4">
        <div className="flex gap-1">
          <button
            onClick={() =>
              onView(
                product
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            onClick={() =>
              onEdit(
                product
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={() =>
              onDelete(
                product
              )
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}