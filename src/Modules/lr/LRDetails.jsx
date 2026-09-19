import {
  Calendar,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  X,
} from "lucide-react";
import LRStatus from "./LRStatus";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function DetailItem({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon size={13} className="text-slate-400" />
        )}

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function LRDetails({
  lr,
  onClose,
  onEdit,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Lorry Receipt
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {lr.lrNumber}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-400">
                LR Status
              </p>

              <div className="mt-2">
                <LRStatus status={lr.status} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                LR Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDate(lr.lrDate)}
              </p>
            </div>
          </div>

          {/* References */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              References
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 p-5">
              <DetailItem
                label="LR ID"
                value={lr.id}
              />

              <DetailItem
                label="Dispatch ID"
                value={lr.dispatchId}
              />

              <DetailItem
                label="Sale Bill ID"
                value={lr.saleBillId}
              />

              <DetailItem
                label="Customer ID"
                value={lr.customerId}
              />
            </div>
          </div>

          {/* Customer */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Customer
            </h3>

            <div className="mt-3 rounded-2xl border border-slate-200 p-5">
              <DetailItem
                label="Customer"
                value={lr.customerName}
              />

              <div className="mt-5 grid grid-cols-2 gap-5">
                <DetailItem
                  label="Phone"
                  value={lr.customerPhone}
                  icon={Phone}
                />

                <DetailItem
                  label="Customer ID"
                  value={lr.customerId}
                />
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Route
            </h3>

            <div className="mt-3 rounded-2xl border border-slate-200 p-5">
              <div className="relative space-y-6 pl-7">
                <div className="absolute bottom-5 left-[7px] top-5 border-l border-dashed border-slate-300" />

                <div className="relative">
                  <div className="absolute -left-7 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 ring-4 ring-white" />

                  <p className="text-xs font-medium text-slate-400">
                    From
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {lr.fromLocation}
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-7 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-900 bg-white ring-4 ring-white" />

                  <p className="text-xs font-medium text-slate-400">
                    To
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {lr.toLocation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Transport
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 p-5">
              <DetailItem
                label="Transporter"
                value={lr.transporter}
                icon={Truck}
              />

              <DetailItem
                label="Vehicle Number"
                value={lr.vehicleNumber}
              />

              <DetailItem
                label="Driver"
                value={lr.driverName}
                icon={User}
              />

              <DetailItem
                label="Driver Phone"
                value={lr.driverPhone}
                icon={Phone}
              />
            </div>
          </div>

          {/* Shipment */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Shipment
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 p-5">
              <DetailItem
                label="Packages"
                value={lr.packageCount}
                icon={Package}
              />

              <DetailItem
                label="Weight"
                value={`${lr.weight} kg`}
              />

              <DetailItem
                label="Freight"
                value={formatCurrency(lr.freightAmount)}
              />

              <DetailItem
                label="Freight Status"
                value={lr.freightPaymentStatus}
              />
            </div>
          </div>

          {/* Delivery */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Delivery
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 p-5">
              <DetailItem
                label="Expected Delivery"
                value={formatDate(
                  lr.expectedDeliveryDate
                )}
                icon={Calendar}
              />

              <DetailItem
                label="Actual Delivery"
                value={
                  lr.actualDeliveryDate
                    ? formatDate(
                        lr.actualDeliveryDate
                      )
                    : "Not delivered"
                }
                icon={Calendar}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Notes
            </h3>

            <div className="mt-3 rounded-2xl border border-slate-200 p-5">
              <p className="text-sm leading-6 text-slate-600">
                {lr.notes || "No notes added."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => onEdit(lr)}
              className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Edit LR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LRDetails;