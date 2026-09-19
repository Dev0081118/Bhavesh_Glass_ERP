import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import PurchaseStatus from "./PurchaseStatus";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function PurchaseRow({
  purchase,
  products,
  onView,
  onEdit,
  onDelete,
}) {
  const subtotal = purchase.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity) * Number(item.rate),
    0
  );

  const discount = Number(purchase.discount || 0);

  const taxableAmount = Math.max(subtotal - discount, 0);

  const tax =
    (taxableAmount * Number(purchase.gst || 0)) / 100;

  const total = taxableAmount + tax;

  const itemNames = purchase.items
    .map((item) => {
      const product = products.find(
        (product) => product.id === item.productId
      );

      return product?.name || item.productId;
    })
    .slice(0, 2);

  return (
    <tr className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <button
          onClick={() => onView(purchase)}
          className="text-left"
        >
          <p className="text-sm font-semibold text-slate-900 hover:text-blue-600">
            {purchase.id}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {purchase.items.length} line
            {purchase.items.length !== 1 ? "s" : ""}
          </p>
        </button>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {purchase.supplierName}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {purchase.supplierId}
        </p>
      </td>

      <td className="px-5 py-4">
        <div className="max-w-[230px]">
          {itemNames.map((name, index) => (
            <p
              key={`${name}-${index}`}
              className="truncate text-xs text-slate-600"
            >
              {name}
            </p>
          ))}

          {purchase.items.length > 2 && (
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              +{purchase.items.length - 2} more
            </p>
          )}
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {formatDate(purchase.purchaseDate)}
      </td>

      <td className="px-5 py-4 text-right">
        <p className="text-sm font-semibold text-slate-900">
          {formatCurrency(total)}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          GST {purchase.gst}%
        </p>
      </td>

      <td className="px-5 py-4">
        <PurchaseStatus status={purchase.status} />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(purchase)}
            title="View"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => onEdit(purchase)}
            title="Edit"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Pencil size={15} />
          </button>

          <button
            onClick={() => onDelete(purchase)}
            title="Delete"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>

          <button
            title="More"
            className="rounded-lg p-2 text-slate-300"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}