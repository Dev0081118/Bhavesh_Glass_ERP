import {
  useMemo,
  useState,
} from "react";

import {
  Factory,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import SearchCreateCombobox from "../../components/SearchCreateCombobox";
import QuickFinishedProductModal from "./QuickFinishedProductModal";

const statuses = [
  "Draft",
  "Planned",
  "In Progress",
  "On Hold",
  "Partially Completed",
  "Completed",
  "Cancelled",
];

const materialTypes =
  new Set([
    "Raw Material",
    "Accessory",
    "Printing Material",
    "Packaging Material",
  ]);

const dateInput =
  (value) =>
    value
      ? String(
          value
        ).slice(
          0,
          10
        )
      : "";

const createMaterial =
  () => ({
    productId:
      "",

    requiredQuantity:
      0,

    consumedQuantity:
      0,

    unit:
      "",
  });

export default function ProductionForm({
  production,

  products = [],

  staff = [],

  loading = false,

  onCreateFinishedProduct,

  onClose,

  onSave,
}) {
  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    quickProductOpen,
    setQuickProductOpen,
  ] = useState(false);

  const [
    quickProductName,
    setQuickProductName,
  ] = useState("");

  const [
    quickProductSaving,
    setQuickProductSaving,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState({
    productId:
      production
        ?.productId ||
      production?.product
        ?._id ||
      "",

    plannedQuantity:
      production
        ?.plannedQuantity ||
      "",

    completedQuantity:
      production
        ?.completedQuantity ||
      0,

    wastage:
      production?.wastage ||
      0,

    startDate:
      dateInput(
        production
          ?.startDate
      ) ||
      new Date()
        .toISOString()
        .slice(
          0,
          10
        ),

    expectedDate:
      dateInput(
        production
          ?.expectedDate
      ),

    actualCompletionDate:
      dateInput(
        production
          ?.actualCompletionDate
      ),

    managerId:
      production
        ?.managerId ||
      production?.manager
        ?._id ||
      "",

    location:
      production?.location ||
      "Production Unit 1",

    status:
      production?.status ||
      "Draft",

    notes:
      production?.notes ||
      "",

    rawMaterials:
      production
        ?.rawMaterials
        ?.length
        ? production.rawMaterials.map(
            (material) => ({
              productId:
                material.productId ||
                material.product
                  ?._id ||
                material.product,

              requiredQuantity:
                Number(
                  material.requiredQuantity ||
                    0
                ),

              consumedQuantity:
                Number(
                  material.consumedQuantity ||
                    0
                ),

              unit:
                material.unit ||
                "",
            })
          )
        : [
            createMaterial(),
          ],
  });

  const finishedProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.type ===
            "Finished Product"
        ),
      [
        products,
      ]
    );

  const materials =
    useMemo(
      () =>
        products.filter(
          (product) =>
            materialTypes.has(
              product.type
            )
        ),
      [
        products,
      ]
    );

  const setField =
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

  const updateMaterial =
    (
      index,
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          rawMaterials:
            current.rawMaterials.map(
              (
                material,
                materialIndex
              ) => {
                if (
                  materialIndex !==
                  index
                ) {
                  return material;
                }

                if (
                  field ===
                  "productId"
                ) {
                  const product =
                    materials.find(
                      (item) =>
                        String(
                          item.id ||
                            item._id
                        ) ===
                        String(
                          value
                        )
                    );

                  return {
                    ...material,

                    productId:
                      value,

                    unit:
                      product
                        ?.stockUnit ||
                      product?.unit ||
                      "",
                  };
                }

                return {
                  ...material,

                  [field]:
                    value,
                };
              }
            ),
        })
      );
    };

  const maxProducible =
    useMemo(
      () => {
        const planned =
          Number(
            form.plannedQuantity ||
              0
          );

        if (
          planned <= 0
        ) {
          return 0;
        }

        const limits =
          form.rawMaterials
            .filter(
              (material) =>
                material.productId &&
                Number(
                  material.requiredQuantity ||
                    0
                ) >
                  0
            )
            .map(
              (material) => {
                const product =
                  materials.find(
                    (item) =>
                      String(
                        item.id ||
                          item._id
                      ) ===
                      String(
                        material.productId
                      )
                  );

                if (!product) {
                  return 0;
                }

                const requiredPerUnit =
                  Number(
                    material.requiredQuantity
                  ) /
                  planned;

                if (
                  requiredPerUnit <=
                  0
                ) {
                  return Infinity;
                }

                return Math.floor(
                  Number(
                    product.availableQuantity ??
                      product.available ??
                      0
                  ) /
                    requiredPerUnit
                );
              }
            );

        if (
          limits.length ===
          0
        ) {
          return 0;
        }

        return Math.max(
          0,
          Math.min(
            ...limits
          )
        );
      },
      [
        form,
        materials,
      ]
    );

  const submit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");

      if (
        !form.productId
      ) {
        setError(
          "Please select or create a finished product."
        );

        return;
      }

      if (
        !form.managerId
      ) {
        setError(
          "Responsible person is required."
        );

        return;
      }

      if (
        Number(
          form.completedQuantity ||
            0
        ) >
        Number(
          form.plannedQuantity ||
            0
        )
      ) {
        setError(
          "Completed quantity cannot exceed planned quantity."
        );

        return;
      }

      const selectedMaterials =
        form.rawMaterials.filter(
          (material) =>
            material.productId
        );

      const ids =
        selectedMaterials.map(
          (material) =>
            String(
              material.productId
            )
        );

      if (
        new Set(
          ids
        ).size !==
        ids.length
      ) {
        setError(
          "The same raw material cannot be added twice."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        await onSave({
          ...form,

          productId:
            form.productId,

          managerId:
            form.managerId,

          plannedQuantity:
            Number(
              form.plannedQuantity ||
                0
            ),

          completedQuantity:
            Number(
              form.completedQuantity ||
                0
            ),

          wastage:
            Number(
              form.wastage ||
                0
            ),

          rawMaterials:
            selectedMaterials.map(
              (material) => ({
                productId:
                  material.productId,

                requiredQuantity:
                  Number(
                    material.requiredQuantity ||
                      0
                  ),

                consumedQuantity:
                  Number(
                    material.consumedQuantity ||
                      0
                  ),

                unit:
                  material.unit,
              })
            ),
        });
      } catch (
        saveError
      ) {
        setError(
          saveError.message
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
        <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Factory
                  size={18}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {production
                    ? "Edit Production"
                    : "New Production"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Consume raw materials and create finished stock.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
            >
              <X
                size={19}
              />
            </button>
          </div>

          <form
            onSubmit={
              submit
            }
            className="flex-1 overflow-y-auto"
          >
            <div className="space-y-8 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <section>
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  Production Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Finished Product *">
                    <SearchCreateCombobox
                      value={
                        form.productId
                      }

                      items={
                        finishedProducts
                      }

                      placeholder="Type finished product..."

                      emptyText="No finished products found."

                      createLabel="Create finished product"

                      onChange={(
                        id
                      ) =>
                        setField(
                          "productId",
                          id
                        )
                      }

                      onCreate={(
                        name
                      ) => {
                        setQuickProductName(
                          name
                        );

                        setQuickProductOpen(
                          true
                        );
                      }}

                      renderSecondary={(
                        product
                      ) => (
                        <>
                          {product.sku}
                          {" • "}
                          {product.category}
                          {" • Stock: "}
                          {Number(
                            product.availableQuantity ??
                              product.available ??
                              0
                          ).toLocaleString()}
                          {" "}
                          {product.stockUnit ||
                            product.unit}
                        </>
                      )}
                    />
                  </Field>

                  <Field label="Responsible Person *">
                    <select
                      required
                      value={
                        form.managerId
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "managerId",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="">
                        Select person
                      </option>

                      {staff.map(
                        (person) => (
                          <option
                            key={
                              person.id ||
                              person._id
                            }
                            value={
                              person.id ||
                              person._id
                            }
                          >
                            {person.name}
                            {" — "}
                            {person.role}
                            {person.department
                              ? ` • ${person.department}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </Field>

                  <Field label="Status">
                    <select
                      value={
                        form.status
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "status",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      {statuses.map(
                        (status) => (
                          <option
                            key={
                              status
                            }
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </Field>

                  <Field label="Location">
                    <input
                      value={
                        form.location
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "location",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Planned Quantity">
                    <NumberInput
                      value={
                        form.plannedQuantity
                      }
                      onChange={(
                        value
                      ) =>
                        setField(
                          "plannedQuantity",
                          value
                        )
                      }
                    />
                  </Field>

                  <Field label="Completed Quantity">
                    <NumberInput
                      value={
                        form.completedQuantity
                      }
                      onChange={(
                        value
                      ) =>
                        setField(
                          "completedQuantity",
                          value
                        )
                      }
                    />
                  </Field>

                  <Field label="Wastage / Rejected">
                    <NumberInput
                      value={
                        form.wastage
                      }
                      onChange={(
                        value
                      ) =>
                        setField(
                          "wastage",
                          value
                        )
                      }
                    />
                  </Field>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Maximum Producible
                    </p>

                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {maxProducible.toLocaleString()}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Based on current raw-material inventory
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Start Date">
                    <input
                      required
                      type="date"
                      value={
                        form.startDate
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "startDate",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Expected Completion">
                    <input
                      required
                      type="date"
                      value={
                        form.expectedDate
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "expectedDate",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Actual Completion">
                    <input
                      type="date"
                      value={
                        form.actualCompletionDate
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "actualCompletionDate",
                          event.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Raw Materials
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Consumed quantities are deducted from Inventory.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setForm(
                        (current) => ({
                          ...current,

                          rawMaterials: [
                            ...current.rawMaterials,
                            createMaterial(),
                          ],
                        })
                      )
                    }
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                  >
                    <Plus
                      size={15}
                    />
                    Add Material
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[950px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <Th>
                          Material
                        </Th>

                        <Th>
                          Available
                        </Th>

                        <Th>
                          Required
                        </Th>

                        <Th>
                          Consumed
                        </Th>

                        <Th>
                          Shortage
                        </Th>

                        <Th />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {form.rawMaterials.map(
                        (
                          material,
                          index
                        ) => {
                          const product =
                            materials.find(
                              (item) =>
                                String(
                                  item.id ||
                                    item._id
                                ) ===
                                String(
                                  material.productId
                                )
                            );

                          const available =
                            Number(
                              product?.availableQuantity ??
                                product?.available ??
                                0
                            );

                          const required =
                            Number(
                              material.requiredQuantity ||
                                0
                            );

                          const shortage =
                            Math.max(
                              required -
                                available,
                              0
                            );

                          return (
                            <tr
                              key={
                                index
                              }
                            >
                              <td className="min-w-[260px] px-3 py-3">
                                <select
                                  value={
                                    material.productId
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateMaterial(
                                      index,
                                      "productId",
                                      event.target.value
                                    )
                                  }
                                  className={
                                    inputClass
                                  }
                                >
                                  <option value="">
                                    Select material
                                  </option>

                                  {materials.map(
                                    (item) => (
                                      <option
                                        key={
                                          item.id ||
                                          item._id
                                        }
                                        value={
                                          item.id ||
                                          item._id
                                        }
                                      >
                                        {item.name} ({item.sku})
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-700">
                                {available.toLocaleString()}
                                {" "}
                                {product?.stockUnit ||
                                  product?.unit ||
                                  ""}
                              </td>

                              <td className="px-3 py-3">
                                <NumberInput
                                  value={
                                    material.requiredQuantity
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateMaterial(
                                      index,
                                      "requiredQuantity",
                                      value
                                    )
                                  }
                                />
                              </td>

                              <td className="px-3 py-3">
                                <NumberInput
                                  value={
                                    material.consumedQuantity
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateMaterial(
                                      index,
                                      "consumedQuantity",
                                      value
                                    )
                                  }
                                />
                              </td>

                              <td className="px-3 py-3">
                                <span
                                  className={
                                    shortage >
                                    0
                                      ? "font-semibold text-red-600"
                                      : "font-medium text-emerald-600"
                                  }
                                >
                                  {shortage >
                                  0
                                    ? `${shortage} short`
                                    : "Available"}
                                </span>
                              </td>

                              <td className="px-3 py-3">
                                <button
                                  type="button"
                                  disabled={
                                    form.rawMaterials.length ===
                                    1
                                  }
                                  onClick={() =>
                                    setForm(
                                      (current) => ({
                                        ...current,

                                        rawMaterials:
                                          current.rawMaterials.filter(
                                            (
                                              _,
                                              materialIndex
                                            ) =>
                                              materialIndex !==
                                              index
                                          ),
                                      })
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                >
                                  <Trash2
                                    size={15}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <Field label="Notes">
                <textarea
                  rows={4}
                  value={
                    form.notes
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "notes",
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={
                  onClose
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  loading
                }
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : production
                    ? "Update Production"
                    : "Create Production"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {quickProductOpen && (
        <QuickFinishedProductModal
          initialName={
            quickProductName
          }

          saving={
            quickProductSaving
          }

          onClose={() => {
            setQuickProductOpen(
              false
            );

            setQuickProductName(
              ""
            );
          }}

          onSave={async (
            payload
          ) => {
            try {
              setQuickProductSaving(
                true
              );

              const product =
                await onCreateFinishedProduct(
                  payload
                );

              setField(
                "productId",
                product.id ||
                  product._id
              );

              setQuickProductOpen(
                false
              );

              setQuickProductName(
                ""
              );
            } finally {
              setQuickProductSaving(
                false
              );
            }
          }}
        />
      )}
    </>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      {children}
    </div>
  );
}

function Th({
  children,
}) {
  return (
    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  );
}

function NumberInput({
  value,
  onChange,
}) {
  return (
    <input
      type="number"
      min="0"
      step="0.01"
      value={
        value
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target.value
        )
      }
      className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
    />
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-400";