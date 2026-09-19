import { Download, Plus, ShoppingCart } from "lucide-react";

export default function PurchaseHeader({ onAdd }) {
  const handleExport = () => {
    alert("Purchase export will be connected to backend later.");
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShoppingCart size={19} />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Purchase Management
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Manage suppliers, purchase orders and incoming stock.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Download size={16} />
          Export
        </button>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={17} />
          New Purchase
        </button>
      </div>
    </div>
  );
}