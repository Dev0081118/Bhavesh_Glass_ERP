import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
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
    month: "long",
    year: "numeric",
  });
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function LedgerDetails({ entry, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Ledger Entry
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {entry.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-400">Status</p>

              <div className="mt-2">
                <LedgerStatus status={entry.status} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">Transaction Date</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDate(entry.transactionDate)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Party Information
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 p-5">
              <DetailItem label="Party ID" value={entry.partyId} />
              <DetailItem label="Party Type" value={entry.partyType} />
              <DetailItem label="Party Name" value={entry.partyName} />
              <DetailItem
                label="Transaction Type"
                value={entry.transactionType}
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Reference
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 p-5">
              <DetailItem
                label="Reference Type"
                value={entry.referenceType}
              />

              <DetailItem
                label="Reference ID"
                value={entry.referenceId}
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Financial Details
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <ArrowDownLeft size={16} />
                  <span className="text-xs font-medium">Debit</span>
                </div>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(entry.debit)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <ArrowUpRight size={16} />
                  <span className="text-xs font-medium">Credit</span>
                </div>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(entry.credit)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Balance
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(entry.balance)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Narration
            </h3>

            <div className="mt-3 rounded-2xl border border-slate-200 p-5">
              <p className="text-sm leading-6 text-slate-600">
                {entry.narration || "No narration provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Edit Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LedgerDetails;