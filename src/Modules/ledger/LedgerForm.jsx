import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

const transactionOptions = [
  "Sale",
  "Purchase",
  "Payment Received",
  "Payment Made",
  "Adjustment",
];

const referenceOptions = [
  "Sale Bill",
  "Purchase",
  "Payment",
  "Manual",
];

function LedgerForm({
  entry,
  customers,
  suppliers,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    transactionDate: "",
    partyType: "Customer",
    partyId: "",
    partyName: "",
    transactionType: "Sale",
    referenceType: "Sale Bill",
    referenceId: "",
    debit: "",
    credit: "",
    narration: "",
    status: "Posted",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (entry) {
      setForm({
        transactionDate: entry.transactionDate || "",
        partyType: entry.partyType || "Customer",
        partyId: entry.partyId || "",
        partyName: entry.partyName || "",
        transactionType: entry.transactionType || "Sale",
        referenceType: entry.referenceType || "Sale Bill",
        referenceId: entry.referenceId || "",
        debit: entry.debit || "",
        credit: entry.credit || "",
        narration: entry.narration || "",
        status: entry.status || "Posted",
      });
    } else {
      setForm({
        transactionDate: new Date().toISOString().split("T")[0],
        partyType: "Customer",
        partyId: "",
        partyName: "",
        transactionType: "Sale",
        referenceType: "Sale Bill",
        referenceId: "",
        debit: "",
        credit: "",
        narration: "",
        status: "Posted",
      });
    }
  }, [entry]);

  const parties = useMemo(() => {
    return form.partyType === "Customer" ? customers : suppliers;
  }, [form.partyType, customers, suppliers]);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };

  const handlePartyTypeChange = (value) => {
    setForm((current) => ({
      ...current,
      partyType: value,
      partyId: "",
      partyName: "",
    }));
  };

  const handlePartyChange = (partyId) => {
    const party = parties.find((item) => item.id === partyId);

    setForm((current) => ({
      ...current,
      partyId,
      partyName: party?.name || "",
    }));
  };

  const handleDebitChange = (value) => {
    setForm((current) => ({
      ...current,
      debit: value,
      credit: value ? "" : current.credit,
    }));
  };

  const handleCreditChange = (value) => {
    setForm((current) => ({
      ...current,
      credit: value,
      debit: value ? "" : current.debit,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.transactionDate) {
      nextErrors.transactionDate = "Transaction date is required.";
    }

    if (!form.partyId) {
      nextErrors.partyId = "Please select a party.";
    }

    if (!form.transactionType) {
      nextErrors.transactionType = "Transaction type is required.";
    }

    if (!form.referenceType) {
      nextErrors.referenceType = "Reference type is required.";
    }

    if (!form.referenceId.trim()) {
      nextErrors.referenceId = "Reference ID is required.";
    }

    const debit = Number(form.debit || 0);
    const credit = Number(form.credit || 0);

    if (debit <= 0 && credit <= 0) {
      nextErrors.amount = "Enter either a debit or credit amount.";
    }

    if (debit > 0 && credit > 0) {
      nextErrors.amount = "Only one of debit or credit can be entered.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const calculateBalance = () => {
    const debit = Number(form.debit || 0);
    const credit = Number(form.credit || 0);

    if (entry) {
      return Number(entry.balance || 0) - Number(entry.debit || 0) + Number(entry.credit || 0) + debit - credit;
    }

    return debit - credit;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const debit = Number(form.debit || 0);
    const credit = Number(form.credit || 0);

    const data = {
      ...form,
      debit,
      credit,
      balance: calculateBalance(),
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {entry ? "Edit Ledger Entry" : "Add Ledger Entry"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Record a financial transaction in the company ledger.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-5"
        >
          <div className="space-y-6">
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Transaction Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Transaction Date *
                  </label>

                  <input
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) =>
                      updateField("transactionDate", e.target.value)
                    }
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.transactionDate
                        ? "border-red-300"
                        : "border-slate-200 focus:border-slate-400"
                    }`}
                  />

                  {errors.transactionDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.transactionDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Party Type *
                  </label>

                  <select
                    value={form.partyType}
                    onChange={(e) =>
                      handlePartyTypeChange(e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Party *
                  </label>

                  <select
                    value={form.partyId}
                    onChange={(e) => handlePartyChange(e.target.value)}
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.partyId
                        ? "border-red-300"
                        : "border-slate-200 focus:border-slate-400"
                    }`}
                  >
                    <option value="">Select party</option>

                    {parties.map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.name} ({party.id})
                      </option>
                    ))}
                  </select>

                  {errors.partyId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.partyId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Transaction Type *
                  </label>

                  <select
                    value={form.transactionType}
                    onChange={(e) =>
                      updateField("transactionType", e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  >
                    {transactionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Reference
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Reference Type *
                  </label>

                  <select
                    value={form.referenceType}
                    onChange={(e) =>
                      updateField("referenceType", e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  >
                    {referenceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Reference ID *
                  </label>

                  <input
                    type="text"
                    value={form.referenceId}
                    onChange={(e) =>
                      updateField("referenceId", e.target.value)
                    }
                    placeholder="e.g. SB-001 / PAY-001"
                    className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
                      errors.referenceId
                        ? "border-red-300"
                        : "border-slate-200 focus:border-slate-400"
                    }`}
                  />

                  {errors.referenceId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.referenceId}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Amount
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Debit
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.debit}
                    onChange={(e) => handleDebitChange(e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Credit
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.credit}
                    onChange={(e) => handleCreditChange(e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {errors.amount && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.amount}
                </p>
              )}

              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                Enter an amount in either Debit or Credit. Both should not be
                entered for a single ledger entry.
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Additional Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="Posted">Posted</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Narration
                  </label>

                  <textarea
                    rows="3"
                    value={form.narration}
                    onChange={(e) =>
                      updateField("narration", e.target.value)
                    }
                    placeholder="Enter transaction description..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
            >
              {entry ? "Update Entry" : "Create Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LedgerForm;