import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import LedgerStatus from "./LedgerStatus";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LedgerRow({ entry, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <tr className="group transition hover:bg-slate-50/80">
      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onView(entry)}
          className="text-sm font-semibold text-slate-900 hover:underline"
        >
          {entry.id}
        </button>
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
        {formatDate(entry.transactionDate)}
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {entry.partyName}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {entry.partyId} · {entry.partyType}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {entry.transactionType}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {entry.referenceType}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {entry.referenceId}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        {entry.debit > 0 ? (
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(entry.debit)}
          </span>
        ) : (
          <span className="text-sm text-slate-300">—</span>
        )}
      </td>

      <td className="px-5 py-4 text-right">
        {entry.credit > 0 ? (
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(entry.credit)}
          </span>
        ) : (
          <span className="text-sm text-slate-300">—</span>
        )}
      </td>

      <td className="px-5 py-4 text-right">
        <span className="text-sm font-semibold text-slate-900">
          {formatCurrency(entry.balance)}
        </span>
      </td>

      <td className="px-5 py-4">
        <LedgerStatus status={entry.status} />
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
                onView(entry);
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              View
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit(entry);
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(entry);
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

export default LedgerRow;