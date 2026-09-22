import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

export default function DeleteCustomerModal({
  customer,
  deleting,
  onCancel,
  onConfirm,
}) {
  if (!customer) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={21} />
          </div>

          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">
          Delete Customer?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want
          to delete{" "}
          <span className="font-medium text-slate-700">
            {customer.name}
          </span>
          ?
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Customers with WhatsApp
          share history cannot be
          permanently deleted.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Trash2
              size={16}
            />

            {deleting
              ? "Deleting..."
              : "Delete Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}