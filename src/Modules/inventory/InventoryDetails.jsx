import {
  Boxes,
  Clock3,
  MapPin,
  Package,
  ShieldCheck,
  X,
} from "lucide-react";
import StockStatus from "./StockStatus";

const InventoryDetails = ({
  open,
  inventory,
  getStatus,
  onClose,
}) => {
  if (!open || !inventory) return null;

  const status = getStatus(inventory);

  const totalStock =
    inventory.available + inventory.reserved;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Inventory Details
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {inventory.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Boxes className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {inventory.name}
                  </p>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {inventory.sku}
                  </p>
                </div>
              </div>

              <StockStatus status={status} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400">
                Available
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {inventory.available}
              </p>

              <p className="text-xs text-slate-400">
                {inventory.unit}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400">
                Reserved
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {inventory.reserved}
              </p>

              <p className="text-xs text-slate-400">
                {inventory.unit}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400">
                Total Stock
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {totalStock}
              </p>

              <p className="text-xs text-slate-400">
                Available + Reserved
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400">
                Reorder Level
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {inventory.reorderLevel}
              </p>

              <p className="text-xs text-slate-400">
                Minimum level
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Product Information
            </h3>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <DetailRow
                icon={Package}
                label="Product ID"
                value={inventory.productId}
              />

              <DetailRow
                icon={Boxes}
                label="Category"
                value={inventory.category}
              />

              <DetailRow
                icon={Package}
                label="Size"
                value={inventory.size}
              />

              <DetailRow
                icon={MapPin}
                label="Location"
                value={inventory.location}
              />

              <DetailRow
                icon={ShieldCheck}
                label="Unit"
                value={inventory.unit}
              />

              <DetailRow
                icon={Clock3}
                label="Inventory ID"
                value={inventory.id}
                last
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Backend Ready
            </p>

            <p className="mt-1 text-sm leading-6 text-indigo-800">
              This inventory record is structured around productId,
              SKU, location and stock quantities so it can later
              connect directly to the Product, Purchase, Sales and
              Dispatch modules.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
  last = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-slate-400" />

        <span className="text-sm text-slate-500">
          {label}
        </span>
      </div>

      <span className="text-right text-sm font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
};

export default InventoryDetails;