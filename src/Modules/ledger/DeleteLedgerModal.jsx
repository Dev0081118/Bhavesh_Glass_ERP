import { AlertTriangle, X } from "lucide-react";

function DeleteLedgerModal({ entry, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle size={20} className="text-red-600" />
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">
          Delete Ledger Entry?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete ledger entry{" "}
          <span className="font-semibold text-slate-700">
            {entry.id}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Party</p>

          <p className="mt-1 text-sm font-medium text-slate-800">
            {entry.partyName}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {entry.transactionType} · {entry.referenceId}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteLedgerModal;