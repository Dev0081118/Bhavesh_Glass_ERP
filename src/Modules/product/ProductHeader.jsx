import { Download, Plus, Package } from "lucide-react";

export default function ProductHeader({ onAdd }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Package size={21} />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Products
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Manage your product master and pricing
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="
            flex items-center gap-2 rounded-xl border border-slate-200
            bg-white px-4 py-2.5 text-sm font-medium text-slate-600
            transition hover:bg-slate-50
          "
        >
          <Download size={16} />
          Export
        </button>

        <button
          onClick={onAdd}
          className="
            flex items-center gap-2 rounded-xl bg-slate-900
            px-4 py-2.5 text-sm font-medium text-white
            shadow-sm transition hover:bg-slate-800
          "
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>
    </div>
  );
}