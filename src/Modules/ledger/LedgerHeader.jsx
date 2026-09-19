import { Download, Plus } from "lucide-react";

function LedgerHeader({ onAdd }) {
  const handleExport = () => {
    // UI-only for now.
    // Backend/export functionality can be connected later.
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Ledger
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track customer receivables, supplier payables and financial
          transactions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Download size={16} />
          Export
        </button>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={17} />
          Add Entry
        </button>
      </div>
    </div>
  );
}

export default LedgerHeader;