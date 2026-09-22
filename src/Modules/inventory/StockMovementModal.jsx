import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
} from "lucide-react";

import {
  formatQuantity,
  toStockQuantity,
} from "../../lib/units";

export default function StockMovementModal({
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
    type,
    setType,
  ] = useState("in");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    unit,
    setUnit,
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

    setUnit(
      selected?.unit ||
      ""
    );

    setType("in");
    setQuantity("");
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

  /*
   * The stock unit (Piece) is what Inventory counts in, and the
   * entry / convertible units stay available for data entry.
   */
  const availableUnits = [
    selected?.unit,

    selected?.entryUnit,

    ...(selected?.conversions ||
      []).map(
      (item) =>
        item.unit
    ),
  ].filter(
    (currentUnit, index, list) =>
      Boolean(currentUnit) &&
      list.indexOf(currentUnit) ===
        index
  );

  const equivalentStock =
    selected
      ? toStockQuantity(
          quantity,
          selected,
          unit
        )
      : Number(quantity || 0);

  const invalidOut =
    type === "out" &&
    selected &&
    equivalentStock >
      selected.available;

  const submit = (
    event
  ) => {
    event.preventDefault();

    if (
      !inventoryId ||
      Number(quantity) <= 0 ||
      invalidOut
    ) {
      return;
    }

    onSubmit({
      inventoryId,
      type,
      quantity:
        Number(quantity),
      unit,
      reason:
        reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Stock Movement
            </h2>

            <p className="text-xs text-slate-500">
              Manually add or remove stock
            </p>
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

                  setUnit(
                    item?.unit ||
                      ""
                  );
                }}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
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
                      }{" "}
                      —{" "}
                      {
                        item.sku
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {selected && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Current Stock
                </p>

                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {
                    selected.available
                  }{" "}
                  {
                    selected.unit
                  }
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setType(
                    "in"
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold ${
                  type === "in"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <ArrowDownToLine className="h-4 w-4" />
                Stock In
              </button>

              <button
                type="button"
                onClick={() =>
                  setType(
                    "out"
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold ${
                  type === "out"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <ArrowUpFromLine className="h-4 w-4" />
                Stock Out
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Quantity{unit ? ` (${unit})` : ""}
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
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Unit
                </label>

                <select
                  value={
                    unit
                  }
                  onChange={(
                    event
                  ) =>
                    setUnit(
                      event.target
                        .value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3"
                >
                  {availableUnits.map(
                    (
                      currentUnit
                    ) => (
                      <option
                        key={
                          currentUnit
                        }
                        value={
                          currentUnit
                        }
                      >
                        {
                          currentUnit
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {selected &&
              unit !==
                selected.unit &&
              quantity && (
                <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                  Stock movement will be recorded as{" "}
                  {formatQuantity(
                    equivalentStock
                  )}{" "}
                  {selected.unit}
                </p>
              )}

            {invalidOut && (
              <p className="text-xs text-red-600">
                This quantity exceeds available stock.
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Reason
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
                placeholder="Purchase correction, damaged stock, received manually..."
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
              disabled={
                !quantity ||
                Number(
                  quantity
                ) <= 0 ||
                invalidOut
              }
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Save Movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}