import {
  X,
  Pencil,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Building2,
  UserRound,
  CreditCard,
} from "lucide-react";

export default function StaffProfile({
  staff,
  onClose,
  onEdit,
}) {
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* OVERLAY */}

      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />

      {/* DRAWER */}

      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs text-slate-400">
              Staff Profile
            </p>

            <h2 className="mt-1 text-base font-semibold text-slate-900">
              Employee Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto">
          {/* PROFILE */}

          <div className="border-b border-slate-100 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
                {getInitials(staff.name)}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {staff.name}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {staff.role}

                  {staff.department
                    ? ` • ${staff.department}`
                    : ""}
                </p>

                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      staff.status === "Active"
                        ? "bg-emerald-500"
                        : "bg-red-400"
                    }`}
                  />

                  <span className="text-[11px] text-slate-500">
                    {staff.status ||
                      "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INFORMATION */}

          <div className="space-y-7 px-6 py-6">
            {/* CONTACT */}

            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Contact Information
              </p>

              <div className="mt-4 space-y-4">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={staff.email}
                />

                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={staff.phone}
                  extra={
                    staff.alternatePhone
                      ? `Alt: ${staff.alternatePhone}`
                      : null
                  }
                />

                <InfoRow
                  icon={CalendarDays}
                  label="Date of Birth"
                  value={
                    staff.dob
                      ? new Date(
                          staff.dob
                        ).toLocaleDateString()
                      : "Not provided"
                  }
                />

                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={
                    staff.address ||
                    "Not provided"
                  }
                />
              </div>
            </section>

            {/* ORGANIZATION */}

            <section className="border-t border-slate-100 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Organization
              </p>

              <div className="mt-4 space-y-4">
                <InfoRow
                  icon={ShieldCheck}
                  label="Role"
                  value={staff.role}
                />

                <InfoRow
                  icon={Building2}
                  label="Department"
                  value={
                    staff.department ||
                    "Not assigned"
                  }
                />

                {staff.role ===
                  "Employee" && (
                  <InfoRow
                    icon={UserRound}
                    label="Manager"
                    value={
                      staff.managerName ||
                      "Not assigned"
                    }
                  />
                )}
              </div>
            </section>

            {/* IDENTITY */}

            <section className="border-t border-slate-100 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Identity
              </p>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <CreditCard
                    size={16}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Aadhaar
                    </p>

                    <p className="mt-1 text-sm font-medium tracking-wide text-slate-700">
                      {staff.aadhaar ||
                        "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER */}

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onEdit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Pencil size={15} />
            Edit Staff
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  extra,
}) {
  return (
    <div className="flex gap-3">
      <Icon
        size={16}
        className="mt-0.5 shrink-0 text-slate-400"
      />

      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm text-slate-700">
          {value || "Not provided"}
        </p>

        {extra && (
          <p className="mt-1 text-xs text-slate-400">
            {extra}
          </p>
        )}
      </div>
    </div>
  );
}