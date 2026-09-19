import {
  CalendarDays,
  CreditCard,
  Edit3,
  FileText,
  Hash,
  User,
  X,
} from "lucide-react";
import PaymentStatus from "./PaymentStatus";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function PaymentDetails({
  payment,
  onClose,
  onEdit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {payment.id}
              </h2>

              <PaymentStatus
                status={payment.status}
              />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Payment details
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Edit3 size={15} />
              Edit
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                Payment Amount
              </p>

              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatCurrency(payment.amount)}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoCard
                label="Sale Bill"
                value={payment.saleBillId}
                icon={FileText}
              />

              <InfoCard
                label="Customer"
                value={payment.customerName}
                icon={User}
              />

              <InfoCard
                label="Payment Date"
                value={payment.paymentDate}
                icon={CalendarDays}
              />

              <InfoCard
                label="Payment Mode"
                value={payment.paymentMode}
                icon={CreditCard}
              />

              <InfoCard
                label="Reference Number"
                value={payment.referenceNumber || "-"}
                icon={Hash}
              />

              <InfoCard
                label="Status"
                value={
                  <PaymentStatus
                    status={payment.status}
                  />
                }
              />
            </div>

            {payment.notes && (
              <section className="rounded-2xl border border-slate-200 p-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  Notes
                </h3>

                <p className="text-sm leading-6 text-slate-600">
                  {payment.notes}
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Icon size={14} />
        {label}
      </div>

      <div className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </div>
    </div>
  );
}