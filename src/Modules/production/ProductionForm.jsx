import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const statuses = [
  "Draft",
  "Planned",
  "In Progress",
  "On Hold",
  "Partially Completed",
  "Completed",
  "Cancelled",
];

const locations = [
  "Production Unit 1",
  "Production Unit 2",
  "Main Warehouse",
];

const createMaterial = () => ({
  id: `RM-${Date.now()}-${Math.random()}`,
  productId: "",
  name: "",
  requiredQuantity: "",
  consumedQuantity: "",
  unit: "Piece",
});

export default function ProductionForm({
  production,
  products,
  managers,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    productId: "",
    plannedQuantity: "",
    completedQuantity: "",
    wastage: "",
    startDate: "",
    expectedDate: "",
    actualCompletionDate: "",
    managerId: "",
    location: "Production Unit 1",
    status: "Draft",
    notes: "",
    rawMaterials: [createMaterial()],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (production) {
      setForm({
        productId: production.productId || "",
        plannedQuantity: production.plannedQuantity ?? "",
        completedQuantity: production.completedQuantity ?? "",
        wastage: production.wastage ?? "",
        startDate: production.startDate || "",
        expectedDate: production.expectedDate || "",
        actualCompletionDate:
          production.actualCompletionDate || "",
        managerId: production.managerId || "",
        location: production.location || "Production Unit 1",
        status: production.status || "Draft",
        notes: production.notes || "",
        rawMaterials:
          production.rawMaterials?.length > 0
            ? production.rawMaterials.map((material) => ({
                ...material,
              }))
            : [createMaterial()],
      });
    }
  }, [production]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const updateMaterial = (id, field, value) => {
    setForm((current) => ({
      ...current,
      rawMaterials: current.rawMaterials.map((material) =>
        material.id === id
          ? {
              ...material,
              [field]: value,
            }
          : material
      ),
    }));
  };

  const addMaterial = () => {
    setForm((current) => ({
      ...current,
      rawMaterials: [...current.rawMaterials, createMaterial()],
    }));
  };

  const removeMaterial = (id) => {
    setForm((current) => {
      const materials = current.rawMaterials.filter(
        (material) => material.id !== id
      );

      return {
        ...current,
        rawMaterials:
          materials.length > 0 ? materials : [createMaterial()],
      };
    });
  };

  const handleMaterialProductChange = (id, productId) => {
    const selected = products.find(
      (product) => product.id === productId
    );

    setForm((current) => ({
      ...current,
      rawMaterials: current.rawMaterials.map((material) =>
        material.id === id
          ? {
              ...material,
              productId,
              name: selected?.name || "",
              unit: selected?.unit || "Piece",
            }
          : material
      ),
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.productId) {
      nextErrors.productId = "Select a finished product.";
    }

    if (
      !form.plannedQuantity ||
      Number(form.plannedQuantity) <= 0
    ) {
      nextErrors.plannedQuantity =
        "Enter a valid planned quantity.";
    }

    if (Number(form.completedQuantity || 0) > Number(form.plannedQuantity || 0)) {
      nextErrors.completedQuantity =
        "Completed quantity cannot exceed planned quantity.";
    }

    if (!form.startDate) {
      nextErrors.startDate = "Select a start date.";
    }

    if (!form.expectedDate) {
      nextErrors.expectedDate = "Select an expected completion date.";
    }

    if (!form.managerId) {
      nextErrors.managerId = "Select a production manager.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const selectedProduct = products.find(
      (product) => product.id === form.productId
    );

    const selectedManager = managers.find(
      (manager) => manager.id === form.managerId
    );

    const cleanedMaterials = form.rawMaterials
      .filter((material) => material.productId)
      .map((material) => ({
        ...material,
        requiredQuantity: Number(material.requiredQuantity || 0),
        consumedQuantity: Number(material.consumedQuantity || 0),
      }));

    onSave({
      ...form,

      productName: selectedProduct?.name || "",
      sku: selectedProduct?.sku || "",
      unit: selectedProduct?.unit || "Piece",

      plannedQuantity: Number(form.plannedQuantity || 0),
      completedQuantity: Number(form.completedQuantity || 0),
      wastage: Number(form.wastage || 0),

      managerName: selectedManager?.name || "",

      rawMaterials: cleanedMaterials,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {production
                ? "Edit Production Order"
                : "New Production Order"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Create and manage manufacturing production details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >
          <div className="space-y-8 p-6">
            {/* Production Information */}
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Production Information
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Define the finished product and production quantity.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Finished Product" required error={errors.productId}>
                  <select
                    value={form.productId}
                    onChange={(e) =>
                      updateField("productId", e.target.value)
                    }
                    className={inputClass(errors.productId)}
                  >
                    <option value="">Select product</option>

                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value)
                    }
                    className={inputClass()}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Planned Quantity"
                  required
                  error={errors.plannedQuantity}
                >
                  <input
                    type="number"
                    min="0"
                    value={form.plannedQuantity}
                    onChange={(e) =>
                      updateField(
                        "plannedQuantity",
                        e.target.value
                      )
                    }
                    placeholder="100"
                    className={inputClass(errors.plannedQuantity)}
                  />
                </Field>

                <Field
                  label="Completed Quantity"
                  error={errors.completedQuantity}
                >
                  <input
                    type="number"
                    min="0"
                    value={form.completedQuantity}
                    onChange={(e) =>
                      updateField(
                        "completedQuantity",
                        e.target.value
                      )
                    }
                    placeholder="0"
                    className={inputClass(errors.completedQuantity)}
                  />
                </Field>

                <Field label="Wastage">
                  <input
                    type="number"
                    min="0"
                    value={form.wastage}
                    onChange={(e) =>
                      updateField("wastage", e.target.value)
                    }
                    placeholder="0"
                    className={inputClass()}
                  />
                </Field>

                <Field label="Production Manager" required error={errors.managerId}>
                  <select
                    value={form.managerId}
                    onChange={(e) =>
                      updateField("managerId", e.target.value)
                    }
                    className={inputClass(errors.managerId)}
                  >
                    <option value="">Select manager</option>

                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Production Location">
                  <select
                    value={form.location}
                    onChange={(e) =>
                      updateField("location", e.target.value)
                    }
                    className={inputClass()}
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            {/* Dates */}
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Production Timeline
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <Field
                  label="Start Date"
                  required
                  error={errors.startDate}
                >
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      updateField("startDate", e.target.value)
                    }
                    className={inputClass(errors.startDate)}
                  />
                </Field>

                <Field
                  label="Expected Completion"
                  required
                  error={errors.expectedDate}
                >
                  <input
                    type="date"
                    value={form.expectedDate}
                    onChange={(e) =>
                      updateField("expectedDate", e.target.value)
                    }
                    className={inputClass(errors.expectedDate)}
                  />
                </Field>

                <Field label="Actual Completion">
                  <input
                    type="date"
                    value={form.actualCompletionDate}
                    onChange={(e) =>
                      updateField(
                        "actualCompletionDate",
                        e.target.value
                      )
                    }
                    className={inputClass()}
                  />
                </Field>
              </div>
            </section>

            {/* Raw Materials */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Raw Material Consumption
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Define required and consumed raw materials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addMaterial}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={15} />
                  Add Material
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Raw Material
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Required
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Consumed
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Unit
                      </th>

                      <th className="w-12 px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {form.rawMaterials.map((material) => (
                      <tr key={material.id}>
                        <td className="px-4 py-3">
                          <select
                            value={material.productId}
                            onChange={(e) =>
                              handleMaterialProductChange(
                                material.id,
                                e.target.value
                              )
                            }
                            className={inputClass()}
                          >
                            <option value="">
                              Select material
                            </option>

                            {products.map((product) => (
                              <option
                                key={product.id}
                                value={product.id}
                              >
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={material.requiredQuantity}
                            onChange={(e) =>
                              updateMaterial(
                                material.id,
                                "requiredQuantity",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className={inputClass()}
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={material.consumedQuantity}
                            onChange={(e) =>
                              updateMaterial(
                                material.id,
                                "consumedQuantity",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className={inputClass()}
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={material.unit}
                            onChange={(e) =>
                              updateMaterial(
                                material.id,
                                "unit",
                                e.target.value
                              )
                            }
                            className={inputClass()}
                          />
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              removeMaterial(material.id)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Notes */}
            <section>
              <Field label="Notes">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) =>
                    updateField("notes", e.target.value)
                  }
                  placeholder="Add production notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </Field>
            </section>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              {production ? "Save Changes" : "Create Production"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(error) {
  return `h-10 w-full rounded-xl border ${
    error ? "border-red-300" : "border-slate-200"
  } bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100`;
}