import { useEffect, useState } from "react";
import {
  ClipboardPenLine,
  X,
} from "lucide-react";

const StockAdjustmentModal = ({
  open,
  inventory,
  selectedInventory,
  onClose,
  onSubmit,
}) => {
  const [inventoryId, setInventoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;

    const item =
      selectedInventory || inventory[0];

    setInventoryId(item?.id || "");
    setQuantity(
      item ? String(item.available) : ""
    );
    setReason("");
  }, [open, selectedInventory, inventory]);

  if (!open) return null;

  const selectedItem = inventory.find(
    (item) => item.id === inventoryId
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const parsedQuantity = Number(quantity);

    if (!inventoryId || parsedQuantity < 0) return;

    onSubmit({
      inventoryId,
      quantity: parsedQuantity,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <ClipboardPenLine className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Stock Adjustment
              </h2>

              <p className="text-xs text-slate-500">
                Correct the actual physical stock
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
                onChange={(event) => {
                  const id = event.target.value;

                  setInventoryId(id);

                  const item = inventory.find(
                    (entry) => entry.id === id
                  );

                  setQuantity(
                    item ? String(item.available) : ""
                  );
                }}
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
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Current System Stock
                  </p>

                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {selectedItem.available}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs text-amber-600">
                    New Physical Stock
                  </p>

                  <p className="mt-1 text-lg font-semibold text-amber-800">
                    {quantity || 0}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Actual Stock Quantity
              </label>

              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Adjustment Reason
              </label>

              <textarea
                rows="3"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="e.g. Physical stock count, damaged item, missing item..."
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
                !quantity || Number(quantity) < 0
              }
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;