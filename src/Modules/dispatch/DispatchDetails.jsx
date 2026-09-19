import {
  Calendar,
  MapPin,
  Package,
  Truck,
  User,
  X,
} from "lucide-react";
import DispatchStatus from "./DispatchStatus";

export default function DispatchDetails({
  dispatch,
  onClose,
  onEdit,
}) {
  const totalQuantity = (dispatch.items || []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-[1px]">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Dispatch Order
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {dispatch.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                    <Truck size={20} />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {dispatch.customerName}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {dispatch.customerCity}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Sale Bill: {dispatch.saleBillId}
                    </p>
                  </div>
                </div>

                <DispatchStatus
                  status={dispatch.status}
                />
              </div>
            </div>

            {/* Shipment summary */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Shipment Summary
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  icon={Package}
                  label="Total Quantity"
                  value={totalQuantity.toLocaleString()}
                />

                <InfoCard
                  icon={Package}
                  label="Products"
                  value={`${dispatch.items?.length || 0}`}
                />

                <InfoCard
                  icon={Calendar}
                  label="Dispatch Date"
                  value={dispatch.dispatchDate || "Not dispatched"}
                />

                <InfoCard
                  icon={Calendar}
                  label="Expected Delivery"
                  value={
                    dispatch.expectedDeliveryDate ||
                    "—"
                  }
                />
              </div>
            </section>

            {/* Products */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Products
                </h3>

                <span className="text-xs text-slate-400">
                  {dispatch.items?.length || 0} items
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Product
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Quantity
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {(dispatch.items || []).map(
                      (item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-800">
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {item.sku}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-slate-800">
                              {Number(
                                item.quantity || 0
                              ).toLocaleString()}
                            </span>

                            <span className="ml-1 text-xs text-slate-400">
                              {item.unit}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Transport */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Transport
              </h3>

              <div className="space-y-3">
                <InfoCard
                  icon={Truck}
                  label="Transporter"
                  value={
                    dispatch.transporter || "Not assigned"
                  }
                />

                <InfoCard
                  icon={Truck}
                  label="Vehicle Number"
                  value={
                    dispatch.vehicleNumber ||
                    "Not assigned"
                  }
                />

                <InfoCard
                  icon={MapPin}
                  label="Warehouse"
                  value={dispatch.warehouse || "—"}
                />

                <InfoCard
                  icon={Package}
                  label="LR Reference"
                  value={dispatch.lrId || "Not assigned"}
                />
              </div>
            </section>

            {/* Manager */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Assignment
              </h3>

              <InfoCard
                icon={User}
                label="Dispatch Manager"
                value={dispatch.managerName || "—"}
              />
            </section>

            {/* Notes */}
            {dispatch.notes && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Notes
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-6 text-slate-600">
                  {dispatch.notes}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Edit Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} />

        <span className="text-[11px]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}