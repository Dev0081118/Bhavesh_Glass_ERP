import {
  Download,
  FilePlus2,
} from "lucide-react";

export default function SaleBillHeader({ onAdd, onExport }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Sale Bills
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create, manage and track customer sale bills.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Download size={17} />
          Export
        </button>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <FilePlus2 size={17} />
          Create Sale Bill
        </button>
      </div>
    </div>
  );
}