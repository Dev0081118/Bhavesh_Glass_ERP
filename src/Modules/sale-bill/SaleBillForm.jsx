import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

const emptyItem = {
  id: "",
  productId: "",
  name: "",
  sku: "",
  quantity: 1,
  unit: "Piece",
  rate: 0,
  discount: 0,
  gst: 18,
};

const calculateTotals = (items = []) => {
  let subtotal = 0;
  let discount = 0;
  let gstAmount = 0;

  items.forEach((item) => {
    const lineSubtotal =
      Number(item.quantity || 0) * Number(item.rate || 0);

    const lineDiscount =
      lineSubtotal * (Number(item.discount || 0) / 100);

    const taxable = lineSubtotal - lineDiscount;

    const lineGst =
      taxable * (Number(item.gst || 0) / 100);

    subtotal += lineSubtotal;
    discount += lineDiscount;
    gstAmount += lineGst;
  });

  const taxableAmount = subtotal - discount;
  const grandTotal = taxableAmount + gstAmount;

  return {
    subtotal,
    discount,
    taxableAmount,
    gstAmount,
    grandTotal,
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function SaleBillForm({
  bill,
  products,
  customers,
  managers,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    customerId: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    managerId: "",
    status: "Draft",
    paymentStatus: "Unpaid",
    paidAmount: 0,
    notes: "",
    items: [{ ...emptyItem, id: crypto.randomUUID() }],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!bill) return;

    setForm({
      customerId: bill.customerId || "",
      billDate: bill.billDate || "",
      dueDate: bill.dueDate || "",
      managerId: bill.managerId || "",
      status: bill.status || "Draft",
      paymentStatus: bill.paymentStatus || "Unpaid",
      paidAmount: bill.paidAmount || 0,
      notes: bill.notes || "",
      items:
        bill.items?.length > 0
          ? bill.items.map((item) => ({
              ...item,
              id: item.id || crypto.randomUUID(),
            }))
          : [{ ...emptyItem, id: crypto.randomUUID() }],
    });
  }, [bill]);

  const totals = useMemo(
    () => calculateTotals(form.items),
    [form.items]
  );

  const selectedCustomer = customers.find(
    (customer) => customer.id === form.customerId
  );

  const selectedManager = managers.find(
    (manager) => manager.id === form.managerId
  );

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const updateItem = (itemId, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [key]: value,
            }
          : item
      ),
    }));
  };

  const handleProductChange = (itemId, productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) {
      updateItem(itemId, "productId", "");
      return;
    }

    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              productId: product.id,
              name: product.name,
              sku: product.sku,
              unit: product.unit,
              rate: product.sellingPrice,
              gst: product.gst,
            }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...emptyItem,
          id: crypto.randomUUID(),
        },
      ],
    }));
  };

  const removeItem = (itemId) => {
    if (form.items.length === 1) return;

    setForm((prev) => ({
      ...prev,
      items: prev.items.filter(
        (item) => item.id !== itemId
      ),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.customerId) {
      newErrors.customerId = "Customer is required.";
    }

    if (!form.billDate) {
      newErrors.billDate = "Bill date is required.";
    }

    if (!form.dueDate) {
      newErrors.dueDate = "Due date is required.";
    }

    if (!form.managerId) {
      newErrors.managerId = "Salesperson is required.";
    }

    if (!form.items.length) {
      newErrors.items = "At least one product is required.";
    }

    const invalidItem = form.items.find(
      (item) =>
        !item.productId ||
        Number(item.quantity) <= 0 ||
        Number(item.rate) < 0
    );

    if (invalidItem) {
      newErrors.items =
        "Each product must have a valid product, quantity and rate.";
    }

    if (
      Number(form.paidAmount) < 0 ||
      Number(form.paidAmount) > totals.grandTotal
    ) {
      newErrors.paidAmount =
        "Paid amount cannot exceed the bill total.";
    }

    if (
      form.paymentStatus === "Paid" &&
      Math.abs(
        Number(form.paidAmount) - totals.grandTotal
      ) > 0.01
    ) {
      newErrors.paidAmount =
        "Paid amount must equal the bill total for Paid status.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      customerId: form.customerId,
      customerName: selectedCustomer?.name || "",
      customerPhone: selectedCustomer?.phone || "",
      customerCity: selectedCustomer?.city || "",
      customerAddress: selectedCustomer?.address || "",
      billDate: form.billDate,
      dueDate: form.dueDate,
      managerId: form.managerId,
      managerName: selectedManager?.name || "",
      status: form.status,
      paymentStatus: form.paymentStatus,
      paidAmount: Number(form.paidAmount || 0),
      notes: form.notes,
      items: form.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount),
        gst: Number(item.gst),
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {bill ? "Edit Sale Bill" : "Create Sale Bill"}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Add customer, products, pricing and payment details.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {/* Bill Information */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Bill Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Bill Date" required error={errors.billDate}>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={form.billDate}
                      onChange={(e) =>
                        updateForm("billDate", e.target.value)
                      }
                      className={inputClass(errors.billDate, true)}
                    />
                  </div>
                </Field>

                <Field label="Due Date" required error={errors.dueDate}>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        updateForm("dueDate", e.target.value)
                      }
                      className={inputClass(errors.dueDate, true)}
                    />
                  </div>
                </Field>

                <Field label="Bill Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateForm("status", e.target.value)
                    }
                    className={inputClass()}
                  >
                    <option>Draft</option>
                    <option>Confirmed</option>
                    <option>Partially Dispatched</option>
                    <option>Dispatched</option>
                    <option>Cancelled</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Customer */}
            <section className="border-t border-slate-100 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Customer & Salesperson
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field
                  label="Customer"
                  required
                  error={errors.customerId}
                >
                  <select
                    value={form.customerId}
                    onChange={(e) =>
                      updateForm(
                        "customerId",
                        e.target.value
                      )
                    }
                    className={inputClass(errors.customerId)}
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

                <Field
                  label="Salesperson / Manager"
                  required
                  error={errors.managerId}
                >
                  <select
                    value={form.managerId}
                    onChange={(e) =>
                      updateForm(
                        "managerId",
                        e.target.value
                      )
                    }
                    className={inputClass(errors.managerId)}
                  >
                    <option value="">
                      Select salesperson
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

                <Field label="Customer Phone">
                  <input
                    value={selectedCustomer?.phone || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 outline-none"
                  />
                </Field>
              </div>

              {selectedCustomer && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">
                    {selectedCustomer.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedCustomer.address},{" "}
                    {selectedCustomer.city}
                  </p>
                </div>
              )}
            </section>

            {/* Products */}
            <section className="border-t border-slate-100 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Products
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Add products and configure quantity, rate,
                    discount and GST.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>

              {errors.items && (
                <p className="mb-3 text-xs font-medium text-red-600">
                  {errors.items}
                </p>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                        Product
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                        Qty
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                        Rate
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                        Discount %
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                        GST %
                      </th>

                      <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500">
                        Total
                      </th>

                      <th className="px-3 py-3" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {form.items.map((item) => {
                      const lineSubtotal =
                        Number(item.quantity || 0) *
                        Number(item.rate || 0);

                      const lineDiscount =
                        lineSubtotal *
                        (Number(item.discount || 0) / 100);

                      const taxable =
                        lineSubtotal - lineDiscount;

                      const lineGst =
                        taxable *
                        (Number(item.gst || 0) / 100);

                      const lineTotal = taxable + lineGst;

                      return (
                        <tr key={item.id}>
                          <td className="px-3 py-3">
                            <select
                              value={item.productId}
                              onChange={(e) =>
                                handleProductChange(
                                  item.id,
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                            >
                              <option value="">
                                Select product
                              </option>

                              {products.map((product) => (
                                <option
                                  key={product.id}
                                  value={product.id}
                                >
                                  {product.name} —{" "}
                                  {product.sku}
                                </option>
                              ))}
                            </select>

                            {item.sku && (
                              <p className="mt-1 text-xs text-slate-400">
                                {item.sku}
                              </p>
                            )}
                          </td>

                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                          </td>

                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min="0"
                              value={item.rate}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "rate",
                                  e.target.value
                                )
                              }
                              className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                          </td>

                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "discount",
                                  e.target.value
                                )
                              }
                              className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                          </td>

                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.gst}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "gst",
                                  e.target.value
                                )
                              }
                              className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                          </td>

                          <td className="px-3 py-3 text-right">
                            <p className="text-sm font-semibold text-slate-800">
                              {formatCurrency(lineTotal)}
                            </p>
                          </td>

                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                removeItem(item.id)
                              }
                              disabled={
                                form.items.length === 1
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Payment and totals */}
            <section className="border-t border-slate-100 pt-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">
                    Payment
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Payment Status">
                      <select
                        value={form.paymentStatus}
                        onChange={(e) =>
                          updateForm(
                            "paymentStatus",
                            e.target.value
                          )
                        }
                        className={inputClass()}
                      >
                        <option>Unpaid</option>
                        <option>Partial</option>
                        <option>Paid</option>
                        <option>Overdue</option>
                      </select>
                    </Field>

                    <Field
                      label="Paid Amount"
                      error={errors.paidAmount}
                    >
                      <input
                        type="number"
                        min="0"
                        value={form.paidAmount}
                        onChange={(e) =>
                          updateForm(
                            "paidAmount",
                            e.target.value
                          )
                        }
                        className={inputClass(
                          errors.paidAmount
                        )}
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Notes
                    </label>

                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(e) =>
                        updateForm("notes", e.target.value)
                      }
                      placeholder="Add any notes..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">
                    Bill Summary
                  </h3>

                  <div className="space-y-3 text-sm">
                    <SummaryRow
                      label="Subtotal"
                      value={formatCurrency(
                        totals.subtotal
                      )}
                    />

                    <SummaryRow
                      label="Discount"
                      value={`- ${formatCurrency(
                        totals.discount
                      )}`}
                    />

                    <SummaryRow
                      label="Taxable Amount"
                      value={formatCurrency(
                        totals.taxableAmount
                      )}
                    />

                    <SummaryRow
                      label="GST"
                      value={formatCurrency(
                        totals.gstAmount
                      )}
                    />

                    <div className="border-t border-slate-200 pt-3">
                      <SummaryRow
                        label="Grand Total"
                        value={formatCurrency(
                          totals.grandTotal
                        )}
                        strong
                      />
                    </div>

                    <SummaryRow
                      label="Paid"
                      value={formatCurrency(
                        form.paidAmount
                      )}
                    />

                    <SummaryRow
                      label="Outstanding"
                      value={formatCurrency(
                        Math.max(
                          totals.grandTotal -
                            Number(form.paidAmount || 0),
                          0
                        )
                      )}
                      strong
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Save size={16} />
              {bill ? "Update Sale Bill" : "Create Sale Bill"}
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
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div
      className={`flex items-center justify-between ${
        strong
          ? "text-base font-semibold text-slate-900"
          : "text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function inputClass(error, withIcon = false) {
  return `w-full rounded-xl border ${
    error ? "border-red-300" : "border-slate-200"
  } bg-white ${
    withIcon ? "py-2.5 pl-10 pr-3" : "px-3 py-2.5"
  } text-sm text-slate-700 outline-none transition focus:border-slate-400`;
}