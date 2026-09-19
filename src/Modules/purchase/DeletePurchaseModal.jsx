import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeletePurchaseModal({
  purchase,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Delete Purchase?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-700">
              {purchase.id}
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="text-xs text-red-700">
            Supplier:{" "}
            <span className="font-semibold">
              {purchase.supplierName}
            </span>
          </p>

          <p className="mt-1 text-xs text-red-700">
            Items:{" "}
            <span className="font-semibold">
              {purchase.items.length}
            </span>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Trash2 size={15} />
            Delete Purchase
          </button>
        </div>
      </div>
    </div>
  );
}