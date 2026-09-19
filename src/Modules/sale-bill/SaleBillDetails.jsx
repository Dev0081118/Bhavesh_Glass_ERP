import {
  CalendarDays,
  Edit3,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import SaleBillStatus from "./SaleBillStatus";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function SaleBillDetails({
  bill,
  onClose,
  onEdit,
}) {
  const outstanding = Math.max(
    Number(bill.grandTotal || 0) -
      Number(bill.paidAmount || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {bill.id}
              </h2>

              <SaleBillStatus status={bill.status} />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Sale bill details
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
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Customer */}
            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-4 flex items-center gap-2">
                <User size={17} className="text-slate-500" />

                <h3 className="text-sm font-semibold text-slate-900">
                  Customer
                </h3>
              </div>

              <p className="text-base font-semibold text-slate-900">
                {bill.customerName}
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Phone size={15} />
                  {bill.customerPhone || "-"}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={15} />
                  {bill.customerAddress || "-"},{" "}
                  {bill.customerCity || "-"}
                </div>
              </div>
            </section>

            {/* Bill Info */}
            <section>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoCard
                  label="Bill Date"
                  value={bill.billDate}
                  icon={CalendarDays}
                />

                <InfoCard
                  label="Due Date"
                  value={bill.dueDate}
                  icon={CalendarDays}
                />

                <InfoCard
                  label="Salesperson"
                  value={bill.managerName}
                  icon={User}
                />
              </div>
            </section>

            {/* Products */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Products
              </h3>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                          Product
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                          Qty
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                          Rate
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                          GST
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {bill.items.map((item) => {
                        const subtotal =
                          Number(item.quantity || 0) *
                          Number(item.rate || 0);

                        const discount =
                          subtotal *
                          (Number(item.discount || 0) / 100);

                        const taxable =
                          subtotal - discount;

                        const gst =
                          taxable *
                          (Number(item.gst || 0) / 100);

                        const total = taxable + gst;

                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-slate-800">
                                {item.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {item.sku}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                              {item.quantity}
                            </td>

                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                              {formatCurrency(item.rate)}
                            </td>

                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                              {item.gst}%
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                              {formatCurrency(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Summary */}
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Bill Summary
              </h3>

              <div className="space-y-3 text-sm">
                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(bill.subtotal)}
                />

                <SummaryRow
                  label="Discount"
                  value={`- ${formatCurrency(
                    bill.discount
                  )}`}
                />

                <SummaryRow
                  label="Taxable Amount"
                  value={formatCurrency(
                    bill.taxableAmount
                  )}
                />

                <SummaryRow
                  label="GST"
                  value={formatCurrency(bill.gstAmount)}
                />

                <div className="border-t border-slate-200 pt-3">
                  <SummaryRow
                    label="Grand Total"
                    value={formatCurrency(
                      bill.grandTotal
                    )}
                    strong
                  />
                </div>

                <SummaryRow
                  label="Payment Status"
                  value={
                    <SaleBillStatus
                      status={bill.paymentStatus}
                      type="payment"
                    />
                  }
                />

                <SummaryRow
                  label="Paid Amount"
                  value={formatCurrency(
                    bill.paidAmount
                  )}
                />

                <SummaryRow
                  label="Outstanding"
                  value={formatCurrency(outstanding)}
                  strong
                />
              </div>
            </section>

            {bill.notes && (
              <section className="rounded-2xl border border-slate-200 p-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  Notes
                </h3>

                <p className="text-sm leading-6 text-slate-600">
                  {bill.notes}
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Icon size={14} />
        {label}
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
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