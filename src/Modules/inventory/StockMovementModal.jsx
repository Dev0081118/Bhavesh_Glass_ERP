import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  PackagePlus,
  X,
} from "lucide-react";

const StockMovementModal = ({
  open,
  inventory,
  selectedInventory,
  onClose,
  onSubmit,
}) => {
  const [inventoryId, setInventoryId] = useState("");
  const [type, setType] = useState("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;

    setInventoryId(selectedInventory?.id || inventory[0]?.id || "");
    setType("in");
    setQuantity("");
    setReason("");
  }, [open, selectedInventory, inventory]);

  if (!open) return null;

  const selectedItem = inventory.find(
    (item) => item.id === inventoryId
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const parsedQuantity = Number(quantity);

    if (!inventoryId || parsedQuantity <= 0) return;

    if (
      type === "out" &&
      selectedItem &&
      parsedQuantity > selectedItem.available
    ) {
      return;
    }

    onSubmit({
      inventoryId,
      type,
      quantity: parsedQuantity,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <PackagePlus className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Stock Movement
              </h2>

              <p className="text-xs text-slate-500">
                Add or remove inventory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Inventory Item
              </label>

              <select
                value={inventoryId}
                onChange={(event) =>
                  setInventoryId(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.sku}
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Current Available Stock
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {selectedItem.available} {selectedItem.unit}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Movement Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("in")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    type === "in"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  Stock In
                </button>

                <button
                  type="button"
                  onClick={() => setType("out")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    type === "out"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <ArrowUpFromLine className="h-4 w-4" />
                  Stock Out
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                placeholder="Enter quantity"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              {type === "out" &&
                selectedItem &&
                Number(quantity) > selectedItem.available && (
                  <p className="mt-2 text-xs text-red-600">
                    Quantity cannot exceed available stock.
                  </p>
                )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reason
              </label>

              <textarea
                rows="3"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="e.g. Purchase received, customer order, damaged stock..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                !quantity ||
                Number(quantity) <= 0 ||
                (type === "out" &&
                  selectedItem &&
                  Number(quantity) > selectedItem.available)
              }
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save Movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;