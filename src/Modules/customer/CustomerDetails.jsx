import {
  Building2,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

export default function CustomerDetails({
  customer,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!customer) {
    return null;
  }

  const assigned =
    customer.assignedTo;

  const location = [
    customer.city,
    customer.state,
    customer.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Customer
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {customer.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                <UserRound
                  size={21}
                />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  {
                    customer.name
                  }
                </h3>

                <p className="text-sm text-slate-500">
                  {customer.companyName ||
                    "Individual Customer"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  customer.status ===
                  "Active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {
                  customer.status
                }
              </span>
            </div>
          </section>

          <Info
            icon={MessageCircle}
            label="WhatsApp"
            value={
              customer.phone
            }
          />

          <Info
            icon={Mail}
            label="Email"
            value={
              customer.email ||
              "—"
            }
          />

          <Info
            icon={Building2}
            label="Company"
            value={
              customer.companyName ||
              "—"
            }
          />

          <Info
            icon={MapPin}
            label="Location"
            value={
              location ||
              customer.address ||
              "—"
            }
          />

          <Info
            icon={UserRound}
            label="Assigned To"
            value={
              assigned?.name
                ? `${assigned.name} • ${assigned.role}${
                    assigned.department
                      ? ` • ${assigned.department}`
                      : ""
                  }`
                : "Unassigned"
            }
          />

          {customer.notes && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Notes
              </p>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {
                  customer.notes
                }
              </div>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-2 border-t border-slate-200 bg-white p-4">
          <button
            onClick={() =>
              onEdit(customer)
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            onClick={() =>
              onDelete(
                customer
              )
            }
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600"
          >
            <Trash2
              size={16}
            />

            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}