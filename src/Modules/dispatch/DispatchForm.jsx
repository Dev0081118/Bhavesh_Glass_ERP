import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const statuses = [
  "Draft",
  "Ready to Dispatch",
  "Dispatched",
  "In Transit",
  "Delivered",
  "Cancelled",
];

const warehouses = [
  "Main Warehouse",
  "Production Store",
  "Dispatch Store",
];

const createItem = () => ({
  id: `DSP-ITEM-${Date.now()}-${Math.random()}`,
  productId: "",
  name: "",
  sku: "",
  quantity: "",
  unit: "Piece",
});

export default function DispatchForm({
  dispatch,
  products,
  customers,
  managers,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    saleBillId: "",
    customerId: "",
    dispatchDate: "",
    expectedDeliveryDate: "",
    warehouse: "Main Warehouse",
    transporter: "",
    vehicleNumber: "",
    lrId: "",
    managerId: "",
    status: "Draft",
    notes: "",
    items: [createItem()],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (dispatch) {
      setForm({
        saleBillId: dispatch.saleBillId || "",
        customerId: dispatch.customerId || "",
        dispatchDate: dispatch.dispatchDate || "",
        expectedDeliveryDate:
          dispatch.expectedDeliveryDate || "",
        warehouse:
          dispatch.warehouse || "Main Warehouse",
        transporter: dispatch.transporter || "",
        vehicleNumber: dispatch.vehicleNumber || "",
        lrId: dispatch.lrId || "",
        managerId: dispatch.managerId || "",
        status: dispatch.status || "Draft",
        notes: dispatch.notes || "",
        items:
          dispatch.items?.length > 0
            ? dispatch.items.map((item) => ({
                ...item,
              }))
            : [createItem()],
      });
    }
  }, [dispatch]);

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

  const updateItem = (id, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const selectProduct = (id, productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id
          ? {
              ...item,
              productId,
              name: product?.name || "",
              sku: product?.sku || "",
              unit: product?.unit || "Piece",
            }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, createItem()],
    }));
  };

  const removeItem = (id) => {
    setForm((current) => {
      const items = current.items.filter(
        (item) => item.id !== id
      );

      return {
        ...current,
        items:
          items.length > 0 ? items : [createItem()],
      };
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.saleBillId.trim()) {
      nextErrors.saleBillId =
        "Enter the sale bill reference.";
    }

    if (!form.customerId) {
      nextErrors.customerId = "Select a customer.";
    }

    if (!form.expectedDeliveryDate) {
      nextErrors.expectedDeliveryDate =
        "Select expected delivery date.";
    }

    if (!form.managerId) {
      nextErrors.managerId =
        "Select a dispatch manager.";
    }

    const validItems = form.items.filter(
      (item) => item.productId
    );

    if (validItems.length === 0) {
      nextErrors.items =
        "Add at least one product.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const customer = customers.find(
      (item) => item.id === form.customerId
    );

    const manager = managers.find(
      (item) => item.id === form.managerId
    );

    const cleanedItems = form.items
      .filter((item) => item.productId)
      .map((item) => ({
        ...item,
        quantity: Number(item.quantity || 0),
      }));

    onSave({
      ...form,

      customerName: customer?.name || "",
      customerPhone: customer?.phone || "",
      customerCity: customer?.city || "",

      managerName: manager?.name || "",

      items: cleanedItems,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {dispatch
                ? "Edit Dispatch"
                : "New Dispatch"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Create and manage outgoing shipment details.
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
            {/* Basic Information */}
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Dispatch Information
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Define the sales reference, customer and dispatch status.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label="Sale Bill Reference"
                  required
                  error={errors.saleBillId}
                >
                  <input
                    type="text"
                    value={form.saleBillId}
                    onChange={(e) =>
                      updateField(
                        "saleBillId",
                        e.target.value
                      )
                    }
                    placeholder="SB-001"
                    className={inputClass(
                      errors.saleBillId
                    )}
                  />
                </Field>

                <Field
                  label="Customer"
                  required
                  error={errors.customerId}
                >
                  <select
                    value={form.customerId}
                    onChange={(e) =>
                      updateField(
                        "customerId",
                        e.target.value
                      )
                    }
                    className={inputClass(
                      errors.customerId
                    )}
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value
                      )
                    }
                    className={inputClass()}
                  >
                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Dispatch Manager" required error={errors.managerId}>
                  <select
                    value={form.managerId}
                    onChange={(e) =>
                      updateField(
                        "managerId",
                        e.target.value
                      )
                    }
                    className={inputClass(
                      errors.managerId
                    )}
                  >
                    <option value="">
                      Select manager
                    </option>

                    {managers.map((manager) => (
                      <option
                        key={manager.id}
                        value={manager.id}
                      >
                        {manager.name}
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
                  Delivery Timeline
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Dispatch Date">
                  <input
                    type="date"
                    value={form.dispatchDate}
                    onChange={(e) =>
                      updateField(
                        "dispatchDate",
                        e.target.value
                      )
                    }
                    className={inputClass()}
                  />
                </Field>

                <Field
                  label="Expected Delivery Date"
                  required
                  error={errors.expectedDeliveryDate}
                >
                  <input
                    type="date"
                    value={form.expectedDeliveryDate}
                    onChange={(e) =>
                      updateField(
                        "expectedDeliveryDate",
                        e.target.value
                      )
                    }
                    className={inputClass(
                      errors.expectedDeliveryDate
                    )}
                  />
                </Field>
              </div>
            </section>

            {/* Products */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Products
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Select the products and quantities being dispatched.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={15} />
                  Add Product
                </button>
              </div>

              {errors.items && (
                <p className="mb-3 text-xs text-red-500">
                  {errors.items}
                </p>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Available
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Dispatch Qty
                      </th>

                      <th className="px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {form.items.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId
                      );

                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <select
                              value={item.productId}
                              onChange={(e) =>
                                selectProduct(
                                  item.id,
                                  e.target.value
                                )
                              }
                              className={inputClass()}
                            >
                              <option value="">
                                Select product
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
                            <span className="text-xs text-slate-500">
                              {item.sku || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">
                              {product?.stock ??
                                "—"}
                            </span>

                            {product && (
                              <span className="ml-1 text-xs text-slate-400">
                                {product.unit}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className={inputClass()}
                            />
                          </td>

                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                removeItem(item.id)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Transport */}
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Transport Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Warehouse">
                  <select
                    value={form.warehouse}
                    onChange={(e) =>
                      updateField(
                        "warehouse",
                        e.target.value
                      )
                    }
                    className={inputClass()}
                  >
                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse}
                        value={warehouse}
                      >
                        {warehouse}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Transporter">
                  <input
                    type="text"
                    value={form.transporter}
                    onChange={(e) =>
                      updateField(
                        "transporter",
                        e.target.value
                      )
                    }
                    placeholder="Transport company"
                    className={inputClass()}
                  />
                </Field>

                <Field label="Vehicle Number">
                  <input
                    type="text"
                    value={form.vehicleNumber}
                    onChange={(e) =>
                      updateField(
                        "vehicleNumber",
                        e.target.value
                      )
                    }
                    placeholder="GJ03AB1234"
                    className={inputClass()}
                  />
                </Field>

                <Field label="LR Reference">
                  <input
                    type="text"
                    value={form.lrId}
                    onChange={(e) =>
                      updateField(
                        "lrId",
                        e.target.value
                      )
                    }
                    placeholder="LR-001"
                    className={inputClass()}
                  />
                </Field>
              </div>
            </section>

            {/* Notes */}
            <section>
              <Field label="Notes">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) =>
                    updateField(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Add dispatch notes..."
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
              {dispatch
                ? "Save Changes"
                : "Create Dispatch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
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
    error
      ? "border-red-300"
      : "border-slate-200"
  } bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100`;
}