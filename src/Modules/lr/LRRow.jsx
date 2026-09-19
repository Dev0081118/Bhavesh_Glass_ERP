import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import LRStatus from "./LRStatus";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
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

function LRRow({
  lr,
  onView,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  return (
    <tr className="group transition hover:bg-slate-50/80">
      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onView(lr)}
          className="text-sm font-semibold text-slate-900 hover:underline"
        >
          {lr.lrNumber}
        </button>

        <p className="mt-0.5 text-xs text-slate-400">
          {lr.id}
        </p>
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
        {formatDate(lr.lrDate)}
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {lr.customerName}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {lr.customerId}
        </p>
      </td>

      <td className="px-5 py-4">
        <div>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {lr.dispatchId}
          </span>

          <p className="mt-1 text-xs text-slate-400">
            {lr.saleBillId}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {lr.transporter}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {lr.vehicleNumber}
        </p>
      </td>

      <td className="px-5 py-4 text-sm text-slate-700">
        {lr.packageCount}
      </td>

      <td className="px-5 py-4 text-sm text-slate-700">
        {lr.weight} kg
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-800">
          {formatCurrency(lr.freightAmount)}
        </p>

        <p
          className={`mt-0.5 text-xs ${
            lr.freightPaymentStatus === "Paid"
              ? "text-emerald-600"
              : "text-amber-600"
          }`}
        >
          {lr.freightPaymentStatus}
        </p>
      </td>

      <td className="px-5 py-4">
        <LRStatus status={lr.status} />
      </td>

      <td className="relative px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <MoreHorizontal size={18} />
        </button>

        {open && (
          <div className="absolute right-5 top-12 z-20 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onView(lr);
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              View
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit(lr);
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(lr);
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default LRRow;