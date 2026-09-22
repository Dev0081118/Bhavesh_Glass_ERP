import {
  useEffect,
  useState,
} from "react";

import {
  Save,
  X,
  UserRound,
} from "lucide-react";

const defaultForm = {
  name: "",
  companyName: "",
  phone: "",
  alternatePhone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  gstNumber: "",
  assignedTo: "",
  notes: "",
  status: "Active",
};

export default function CustomerForm({
  customer,
  staff = [],
  saving = false,
  onClose,
  onSave,
}) {
  const [
    form,
    setForm,
  ] = useState(
    defaultForm
  );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!customer) {
      setForm(
        defaultForm
      );

      return;
    }

    setForm({
      ...defaultForm,

      name:
        customer.name || "",

      companyName:
        customer.companyName ||
        "",

      phone:
        customer.phone || "",

      alternatePhone:
        customer.alternatePhone ||
        "",

      email:
        customer.email || "",

      address:
        customer.address || "",

      city:
        customer.city || "",

      state:
        customer.state || "",

      pincode:
        customer.pincode || "",

      gstNumber:
        customer.gstNumber || "",

      assignedTo:
        customer.assignedTo
          ?._id ||
        customer.assignedTo ||
        "",

      notes:
        customer.notes || "",

      status:
        customer.status ||
        "Active",
    });
  }, [customer]);

  const change = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (
      !form.name.trim()
    ) {
      setError(
        "Customer name is required."
      );

      return;
    }

    if (
      !form.phone.trim()
    ) {
      setError(
        "WhatsApp number is required."
      );

      return;
    }

    onSave({
      name:
        form.name.trim(),

      companyName:
        form.companyName.trim(),

      phone:
        form.phone.trim(),

      alternatePhone:
        form.alternatePhone.trim(),

      email:
        form.email.trim(),

      address:
        form.address.trim(),

      city:
        form.city.trim(),

      state:
        form.state.trim(),

      pincode:
        form.pincode.trim(),

      gstNumber:
        form.gstNumber.trim(),

      assignedTo:
        form.assignedTo ||
        null,

      notes:
        form.notes.trim(),

      status:
        form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {customer
                  ? "Edit Customer"
                  : "Add Customer"}
              </h2>

              <p className="text-sm text-slate-500">
                Customer information and assignment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6 p-5"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Section title="Basic Information">
            <Input
              label="Customer Name *"
              name="name"
              value={form.name}
              onChange={change}
            />

            <Input
              label="Company Name"
              name="companyName"
              value={
                form.companyName
              }
              onChange={change}
            />

            <Input
              label="WhatsApp Number *"
              name="phone"
              value={form.phone}
              onChange={change}
              placeholder="+91 99040 99441"
            />

            <Input
              label="Alternate Phone"
              name="alternatePhone"
              value={
                form.alternatePhone
              }
              onChange={change}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={change}
            />

            <Input
              label="GST Number"
              name="gstNumber"
              value={
                form.gstNumber
              }
              onChange={change}
            />
          </Section>

          <Section title="Address">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                value={
                  form.address
                }
                onChange={
                  change
                }
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={change}
            />

            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={change}
            />

            <Input
              label="Pincode"
              name="pincode"
              value={
                form.pincode
              }
              onChange={change}
            />
          </Section>

          <Section title="Assignment">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Assign To
              </label>

              <select
                name="assignedTo"
                value={
                  form.assignedTo
                }
                onChange={
                  change
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none"
              >
                <option value="">
                  Unassigned
                </option>

                {staff.map(
                  (person) => (
                    <option
                      key={
                        person._id ||
                        person.id
                      }
                      value={
                        person._id ||
                        person.id
                      }
                    >
                      {
                        person.name
                      }{" "}
                      —{" "}
                      {
                        person.role
                      }{" "}
                      {person.department
                        ? `• ${person.department}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="status"
                value={
                  form.status
                }
                onChange={
                  change
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none"
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={change}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>
          </Section>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              <Save size={16} />

              {saving
                ? "Saving..."
                : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Input({
  label,
  ...props
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </div>
  );
}