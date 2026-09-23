import {
  Boxes,
  Save,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

const units = [
  "Piece",
  "Sheet",
  "Pack",
  "Box",
  "Kg",
  "Gram",
  "Meter",
  "Feet",
  "Roll",
];

export default function QuickFinishedProductModal({
  initialName = "",
  saving = false,
  onClose,
  onSave,
}) {
  const [
    form,
    setForm,
  ] = useState({
    name:
      initialName,

    sku:
      "",

    category:
      "Photo Frame",

    unit:
      "Piece",

    minimumStockLevel:
      0,

    location:
      "Main Warehouse",

    sellingPrice:
      0,

    gst:
      18,

    description:
      "",
  });

  const [
    error,
    setError,
  ] = useState("");

  const change =
    (
      field,
      value
    ) =>
      setForm(
        (current) => ({
          ...current,

          [field]:
            value,
        })
      );

  const submit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");

      if (
        !form.name.trim()
      ) {
        setError(
          "Product name is required."
        );

        return;
      }

      if (
        !form.sku.trim()
      ) {
        setError(
          "SKU is required."
        );

        return;
      }

      if (
        !form.category.trim()
      ) {
        setError(
          "Category is required."
        );

        return;
      }

      try {
        await onSave({
          ...form,

          name:
            form.name.trim(),

          sku:
            form.sku
              .trim()
              .toUpperCase(),

          category:
            form.category.trim(),

          minimumStockLevel:
            Number(
              form.minimumStockLevel ||
                0
            ),

          sellingPrice:
            Number(
              form.sellingPrice ||
                0
            ),

          gst:
            Number(
              form.gst ||
                0
            ),
        });
      } catch (saveError) {
        setError(
          saveError.message
        );
      }
    };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={
          submit
        }
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Boxes
                size={17}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Create Finished Product
              </h2>

              <p className="text-xs text-slate-400">
                Product + Inventory record will be created automatically.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X
              size={17}
            />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Product Name *"
              value={
                form.name
              }
              onChange={(
                event
              ) =>
                change(
                  "name",
                  event.target.value
                )
              }
            />

            <Input
              label="SKU *"
              value={
                form.sku
              }
              onChange={(
                event
              ) =>
                change(
                  "sku",
                  event.target.value
                )
              }
              placeholder="BG-FRM-001"
            />

            <Input
              label="Category *"
              value={
                form.category
              }
              onChange={(
                event
              ) =>
                change(
                  "category",
                  event.target.value
                )
              }
            />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Unit *
              </label>

              <select
                value={
                  form.unit
                }
                onChange={(
                  event
                ) =>
                  change(
                    "unit",
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none"
              >
                {units.map(
                  (unit) => (
                    <option
                      key={
                        unit
                      }
                      value={
                        unit
                      }
                    >
                      {unit}
                    </option>
                  )
                )}
              </select>
            </div>

            <Input
              label="Minimum Stock"
              type="number"
              min="0"
              value={
                form.minimumStockLevel
              }
              onChange={(
                event
              ) =>
                change(
                  "minimumStockLevel",
                  event.target.value
                )
              }
            />

            <Input
              label="Location"
              value={
                form.location
              }
              onChange={(
                event
              ) =>
                change(
                  "location",
                  event.target.value
                )
              }
            />

            <Input
              label="Selling Price"
              type="number"
              min="0"
              value={
                form.sellingPrice
              }
              onChange={(
                event
              ) =>
                change(
                  "sellingPrice",
                  event.target.value
                )
              }
            />

            <Input
              label="GST %"
              type="number"
              min="0"
              max="100"
              value={
                form.gst
              }
              onChange={(
                event
              ) =>
                change(
                  "gst",
                  event.target.value
                )
              }
            />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                rows={3}
                value={
                  form.description
                }
                onChange={(
                  event
                ) =>
                  change(
                    "description",
                    event.target.value
                  )
                }
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving
            }
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Save
              size={15}
            />

            {saving
              ? "Creating..."
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  ...props
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <input
        {...props}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none"
      />
    </div>
  );
}