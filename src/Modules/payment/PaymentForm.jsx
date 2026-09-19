import { useEffect, useState } from "react";
import {
  CalendarDays,
  Save,
  X,
} from "lucide-react";

export default function PaymentForm({
  payment,
  saleBills,
  customers,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    saleBillId: "",
    customerId: "",
    paymentDate: new Date()
      .toISOString()
      .split("T")[0],
    amount: "",
    paymentMode: "UPI",
    referenceNumber: "",
    status: "Completed",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!payment) return;

    setForm({
      saleBillId: payment.saleBillId || "",
      customerId: payment.customerId || "",
      paymentDate: payment.paymentDate || "",
      amount: payment.amount || "",
      paymentMode: payment.paymentMode || "UPI",
      referenceNumber: payment.referenceNumber || "",
      status: payment.status || "Completed",
      notes: payment.notes || "",
    });
  }, [payment]);

  const selectedBill = saleBills.find(
    (bill) => bill.id === form.saleBillId
  );

  const selectedCustomer = customers.find(
    (customer) => customer.id === form.customerId
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

  const handleBillChange = (saleBillId) => {
    const bill = saleBills.find(
      (item) => item.id === saleBillId
    );

    setForm((prev) => ({
      ...prev,
      saleBillId,
      customerId: bill?.customerId || "",
    }));

    setErrors((prev) => ({
      ...prev,
      saleBillId: "",
      customerId: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.saleBillId) {
      newErrors.saleBillId = "Sale bill is required.";
    }

    if (!form.paymentDate) {
      newErrors.paymentDate =
        "Payment date is required.";
    }

    if (
      form.status !== "Cancelled" &&
      Number(form.amount) <= 0
    ) {
      newErrors.amount =
        "Payment amount must be greater than zero.";
    }

    if (
      selectedBill &&
      form.status !== "Cancelled" &&
      Number(form.amount) >
        Number(selectedBill.outstanding || 0)
    ) {
      newErrors.amount =
        "Payment cannot exceed the current outstanding amount.";
    }

    if (
      ["UPI", "Bank Transfer", "Cheque"].includes(
        form.paymentMode
      ) &&
      form.status === "Completed" &&
      !form.referenceNumber.trim()
    ) {
      newErrors.referenceNumber =
        "Reference number is required for this payment mode.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      saleBillId: form.saleBillId,
      customerId: form.customerId,
      customerName: selectedCustomer?.name || "",
      paymentDate: form.paymentDate,
      amount: Number(form.amount || 0),
      paymentMode: form.paymentMode,
      referenceNumber:
        form.referenceNumber.trim(),
      status: form.status,
      notes: form.notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {payment
                ? "Edit Payment"
                : "Record Payment"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record a payment received against a sale bill.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Payment Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Sale Bill"
                  required
                  error={errors.saleBillId}
                >
                  <select
                    value={form.saleBillId}
                    onChange={(e) =>
                      handleBillChange(e.target.value)
                    }
                    className={inputClass(
                      errors.saleBillId
                    )}
                  >
                    <option value="">
                      Select sale bill
                    </option>

                    {saleBills.map((bill) => (
                      <option
                        key={bill.id}
                        value={bill.id}
                      >
                        {bill.id} — {bill.customerName}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Customer">
                  <input
                    value={selectedCustomer?.name || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                  />
                </Field>

                <Field
                  label="Payment Date"
                  required
                  error={errors.paymentDate}
                >
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={form.paymentDate}
                      onChange={(e) =>
                        updateForm(
                          "paymentDate",
                          e.target.value
                        )
                      }
                      className={`${inputClass(
                        errors.paymentDate
                      )} pl-10`}
                    />
                  </div>
                </Field>

                <Field
                  label="Amount"
                  required
                  error={errors.amount}
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      updateForm(
                        "amount",
                        e.target.value
                      )
                    }
                    placeholder="Enter amount"
                    className={inputClass(errors.amount)}
                  />

                  {selectedBill && (
                    <p className="mt-1 text-xs text-slate-400">
                      Outstanding: ₹
                      {Number(
                        selectedBill.outstanding || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  )}
                </Field>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Payment Method
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Payment Mode">
                  <select
                    value={form.paymentMode}
                    onChange={(e) =>
                      updateForm(
                        "paymentMode",
                        e.target.value
                      )
                    }
                    className={inputClass()}
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>Card</option>
                  </select>
                </Field>

                <Field
                  label="Reference Number"
                  error={errors.referenceNumber}
                >
                  <input
                    value={form.referenceNumber}
                    onChange={(e) =>
                      updateForm(
                        "referenceNumber",
                        e.target.value
                      )
                    }
                    placeholder="UTR / Transaction / Cheque number"
                    className={inputClass(
                      errors.referenceNumber
                    )}
                  />
                </Field>

                <Field label="Payment Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateForm(
                        "status",
                        e.target.value
                      )
                    }
                    className={inputClass()}
                  >
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Failed</option>
                    <option>Cancelled</option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) =>
                  updateForm("notes", e.target.value)
                }
                placeholder="Add payment notes..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </section>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
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

              {payment
                ? "Update Payment"
                : "Record Payment"}
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

function inputClass(error) {
  return `w-full rounded-xl border ${
    error
      ? "border-red-300"
      : "border-slate-200"
  } bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400`;
}