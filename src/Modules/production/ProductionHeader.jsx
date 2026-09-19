import { Download, Plus, Factory } from "lucide-react";

export default function ProductionHeader({ onAdd }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Factory size={20} />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Production
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Manage production orders, materials and manufacturing progress.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Download size={16} />
          Export
        </button>

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={17} />
          New Production
        </button>
      </div>
    </div>
  );
}