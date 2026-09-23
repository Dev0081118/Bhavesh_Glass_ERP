import {
  Save,
  Truck,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

export default function QuickSupplierModal({
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

    phone:
      "",

    email:
      "",

    gstNumber:
      "",

    address:
      "",

    city:
      "",

    state:
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
    ) => {
      setForm(
        (current) => ({
          ...current,

          [field]:
            value,
        })
      );
    };

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
          "Supplier name is required."
        );

        return;
      }

      if (
        !form.phone.trim()
      ) {
        setError(
          "Supplier phone number is required."
        );

        return;
      }

      try {
        await onSave({
          name:
            form.name.trim(),

          phone:
            form.phone.trim(),

          email:
            form.email.trim(),

          gstNumber:
            form.gstNumber.trim(),

          address:
            form.address.trim(),

          city:
            form.city.trim(),

          state:
            form.state.trim(),
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
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Truck
                size={17}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Create Supplier
              </h2>

              <p className="text-xs text-slate-400">
                This supplier will be saved in Parties.
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
              label="Supplier Name *"
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
              label="Phone *"
              value={
                form.phone
              }
              onChange={(
                event
              ) =>
                change(
                  "phone",
                  event.target.value
                )
              }
              placeholder="+91..."
            />

            <Input
              label="Email"
              type="email"
              value={
                form.email
              }
              onChange={(
                event
              ) =>
                change(
                  "email",
                  event.target.value
                )
              }
            />

            <Input
              label="GST Number"
              value={
                form.gstNumber
              }
              onChange={(
                event
              ) =>
                change(
                  "gstNumber",
                  event.target.value
                )
              }
            />

            <Input
              label="City"
              value={
                form.city
              }
              onChange={(
                event
              ) =>
                change(
                  "city",
                  event.target.value
                )
              }
            />

            <Input
              label="State"
              value={
                form.state
              }
              onChange={(
                event
              ) =>
                change(
                  "state",
                  event.target.value
                )
              }
            />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Address
              </label>

              <textarea
                rows={3}
                value={
                  form.address
                }
                onChange={(
                  event
                ) =>
                  change(
                    "address",
                    event.target.value
                  )
                }
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400"
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
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
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
              : "Create Supplier"}
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
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-400"
      />
    </div>
  );
}