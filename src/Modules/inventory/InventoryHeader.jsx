import { Boxes, MinusCircle, PlusCircle } from "lucide-react";

const InventoryHeader = ({
  onStockMovement,
  onStockAdjustment,
}) => {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
            <Boxes className="h-5 w-5 text-indigo-600" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Inventory Management
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Inventory
        </h1>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Manage stock levels, availability, locations and
          inventory movements across the company.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onStockAdjustment}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <MinusCircle className="h-4 w-4" />
          Stock Adjustment
        </button>

        <button
          type="button"
          onClick={onStockMovement}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <PlusCircle className="h-4 w-4" />
          Stock Movement
        </button>
      </div>
    </div>
  );
};

export default InventoryHeader;