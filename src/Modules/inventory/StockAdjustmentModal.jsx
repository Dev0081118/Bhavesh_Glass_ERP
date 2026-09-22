import {
  useEffect,
  useState,
} from "react";

import {
  ClipboardPenLine,
  X,
} from "lucide-react";

import {
  formatQuantity,
  toEntryQuantity,
} from "../../lib/units";

export default function StockAdjustmentModal({
  open,
  inventory,
  selectedInventory,
  onClose,
  onSubmit,
}) {
  const [
    inventoryId,
    setInventoryId,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  useEffect(() => {
    if (!open) return;

    const selected =
      selectedInventory ||
      inventory[0];

    setInventoryId(
      selected?.id || ""
    );

    setQuantity(
      selected
        ? String(
            selected.available
          )
        : ""
    );

    setReason("");
  }, [
    open,
    selectedInventory,
    inventory,
  ]);

  if (!open) return null;

  const selected =
    inventory.find(
      (item) =>
        item.id ===
        inventoryId
    );

  const submit = (
    event
  ) => {
    event.preventDefault();

    if (
      !inventoryId ||
      Number(quantity) <
        0
    ) {
      return;
    }

    onSubmit({
      inventoryId,

      quantity:
        Number(quantity),

      reason:
        reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <ClipboardPenLine className="h-5 w-5 text-amber-600" />

            <div>
              <h2 className="font-semibold text-slate-900">
                Physical Stock Adjustment
              </h2>

              <p className="text-xs text-slate-500">
                Correct inventory after physical counting
              </p>
            </div>
          </div>

          <button
            onClick={
              onClose
            }
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="p-6"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Product
              </label>

              <select
                value={
                  inventoryId
                }
                onChange={(
                  event
                ) => {
                  const id =
                    event.target
                      .value;

                  setInventoryId(
                    id
                  );

                  const item =
                    inventory.find(
                      (
                        row
                      ) =>
                        row.id ===
                        id
                    );

                  setQuantity(
                    item
                      ? String(
                          item.available
                        )
                      : ""
                  );
                }}
                className="h-11 w-full rounded-xl border border-slate-200 px-3"
              >
                {inventory.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {selected && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    System Stock
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {
                      selected.available
                    }{" "}
                    {
                      selected.unit
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs text-amber-600">
                    New Physical Stock
                  </p>

                  <p className="mt-1 font-semibold text-amber-800">
                    {quantity ||
                      0}{" "}
                    {
                      selected.unit
                    }
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Actual Stock Quantity
                {selected
                  ? ` (${selected.unit})`
                  : ""}
              </label>

              <input
                type="number"
                min="0"
                step="any"
                value={
                  quantity
                }
                onChange={(
                  event
                ) =>
                  setQuantity(
                    event.target
                      .value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-3"
              />

              {selected &&
                selected.entryUnit &&
                selected.entryUnit !==
                  selected.unit && (
                  <p className="mt-2 text-xs text-slate-500">
                    Equal to{" "}
                    {formatQuantity(
                      toEntryQuantity(
                        quantity,
                        selected
                      )
                    )}{" "}
                    {selected.entryUnit}
                  </p>
                )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Adjustment Reason
              </label>

              <textarea
                rows={3}
                value={
                  reason
                }
                onChange={(
                  event
                ) =>
                  setReason(
                    event.target
                      .value
                  )
                }
                placeholder="Physical count, damaged stock, missing stock..."
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}