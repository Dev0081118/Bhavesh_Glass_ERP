import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import PaymentStatus from "./PaymentStatus";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function PaymentRow({
  payment,
  onView,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-900">
          {payment.id}
        </p>

        {payment.referenceNumber && (
          <p className="mt-0.5 text-xs text-slate-400">
            Ref: {payment.referenceNumber}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {payment.saleBillId}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {payment.customerName}
        </p>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {payment.paymentDate}
      </td>

      <td className="px-5 py-4 text-right">
        <p className="text-sm font-semibold text-slate-900">
          {formatCurrency(payment.amount)}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm text-slate-600">
          {payment.paymentMode}
        </span>
      </td>

      <td className="px-5 py-4">
        <PaymentStatus status={payment.status} />
      </td>

      <td className="relative px-5 py-4 text-right">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
                  onView(payment);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye size={15} />
                View
              </button>

              <button
                onClick={() => {
                  onEdit(payment);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                onClick={() => {
                  onDelete(payment);
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