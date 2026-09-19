import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import ProductStatus from "./ProductStatus";

export default function ProductRow({
  product,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <span className="text-xs font-semibold">
              {product.name
                .split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {product.name}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {product.sku} · {product.id}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-slate-700">
          {product.category}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {product.subCategory}
        </p>
      </td>

      <td className="px-4 py-4">
        <span className="text-sm text-slate-600">
          {product.type}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {product.size}
        </span>
      </td>

      <td className="px-4 py-4 text-right">
        <span className="text-sm font-medium text-slate-900">
          ₹{product.sellingPrice.toLocaleString("en-IN")}
        </span>
      </td>

      <td className="px-4 py-4 text-right">
        <span className="text-sm font-medium text-slate-700">
          {product.stock.toLocaleString("en-IN")}
        </span>

        <p className="mt-0.5 text-xs text-slate-400">
          {product.unit}
        </p>
      </td>

      <td className="px-4 py-4">
        <ProductStatus
          status={product.status}
          onClick={() => onToggleStatus(product)}
        />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(product)}
            title="View"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => onEdit(product)}
            title="Edit"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(product)}
            title="Delete"
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>

          <button
            title="More"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}