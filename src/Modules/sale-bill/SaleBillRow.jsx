import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import SaleBillStatus from "./SaleBillStatus";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function SaleBillRow({
  bill,
  onView,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const totalQuantity = bill.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {bill.id}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            Due: {bill.dueDate || "-"}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {bill.customerName}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {bill.customerCity}
          </p>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {bill.billDate}
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {bill.items.length} product
            {bill.items.length !== 1 ? "s" : ""}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            Qty: {totalQuantity}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-900">
          {formatCurrency(bill.grandTotal)}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          GST: {formatCurrency(bill.gstAmount)}
        </p>
      </td>

      <td className="px-5 py-4">
        <SaleBillStatus
          status={bill.paymentStatus}
          type="payment"
        />
      </td>

      <td className="px-5 py-4">
        <SaleBillStatus status={bill.status} />
      </td>

      <td className="relative px-5 py-4 text-right">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />

            <div className="absolute right-5 top-12 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
              <button
                onClick={() => {
                  onView(bill);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye size={15} />
                View
              </button>

              <button
                onClick={() => {
                  onEdit(bill);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                onClick={() => {
                  onDelete(bill);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}