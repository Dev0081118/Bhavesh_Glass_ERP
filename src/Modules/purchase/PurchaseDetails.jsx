import {
  CalendarDays,
  Edit3,
  FileText,
  Package,
  Phone,
  User,
  X,
} from "lucide-react";
import PurchaseStatus from "./PurchaseStatus";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function PurchaseDetails({
  purchase,
  products,
  suppliers,
  onClose,
  onEdit,
}) {
  const supplier = suppliers.find(
    (item) => item.id === purchase.supplierId
  );

  const subtotal = purchase.items.reduce(
    (sum, item) =>
      sum + Number(item.quantity) * Number(item.rate),
    0
  );

  const discount = Number(purchase.discount || 0);

  const taxableAmount = Math.max(subtotal - discount, 0);

  const tax =
    (taxableAmount * Number(purchase.gst || 0)) / 100;

  const grandTotal = taxableAmount + tax;

  const totalQuantity = purchase.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalReceived = purchase.items.reduce(
    (sum, item) =>
      sum + Number(item.receivedQuantity || 0),
    0
  );

  const receivingPercentage =
    totalQuantity > 0
      ? Math.round((totalReceived / totalQuantity) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm">
      <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {purchase.id}
              </h2>

              <PurchaseStatus status={purchase.status} />
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Purchase details and receiving information
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <CalendarDays
                  size={16}
                  className="text-slate-400"
                />

                <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-400">
                  Date
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {formatDate(purchase.purchaseDate)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <Package
                  size={16}
                  className="text-slate-400"
                />

                <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-400">
                  Items
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {purchase.items.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <FileText
                  size={16}
                  className="text-slate-400"
                />

                <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-400">
                  Payment
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {purchase.paymentStatus || "Pending"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <Package
                  size={16}
                  className="text-slate-400"
                />

                <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-400">
                  Received
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {receivingPercentage}%
                </p>
              </div>
            </div>

            {/* Supplier */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Supplier Information
                </h3>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {purchase.supplierName}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {purchase.supplierId}
                </p>

                {supplier && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <User
                        size={15}
                        className="mt-0.5 text-slate-400"
                      />

                      <div>
                        <p className="text-[10px] text-slate-400">
                          Contact Person
                        </p>

                        <p className="text-xs font-medium text-slate-700">
                          {supplier.contactPerson}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone
                        size={15}
                        className="mt-0.5 text-slate-400"
                      />

                      <div>
                        <p className="text-[10px] text-slate-400">
                          Phone
                        </p>

                        <p className="text-xs font-medium text-slate-700">
                          {supplier.phone}
                        </p>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-[10px] text-slate-400">
                        Address
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {supplier.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Items */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Purchase Items
              </h3>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Product
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Qty
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Rate
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Received
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {purchase.items.map((item) => {
                        const product = products.find(
                          (product) =>
                            product.id === item.productId
                        );

                        const amount =
                          Number(item.quantity) *
                          Number(item.rate);

                        return (
                          <tr
                            key={item.productId}
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-3">
                              <p className="text-xs font-medium text-slate-800">
                                {product?.name ||
                                  item.productId}
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {product?.sku ||
                                  item.productId}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-right text-xs text-slate-700">
                              {item.quantity}
                            </td>

                            <td className="px-4 py-3 text-right text-xs text-slate-700">
                              {formatCurrency(item.rate)}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <span className="text-xs font-medium text-emerald-600">
                                {item.receivedQuantity || 0}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {" "}
                                / {item.quantity}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">
                              {formatCurrency(amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Receiving */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Receiving Progress
              </h3>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      Received Quantity
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {totalReceived} / {totalQuantity}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-slate-900">
                    {receivingPercentage}%
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{
                      width: `${Math.min(
                        receivingPercentage,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Purchase Summary
              </h3>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-800">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Discount
                    </span>

                    <span className="font-medium text-red-600">
                      - {formatCurrency(discount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      GST ({purchase.gst}%)
                    </span>

                    <span className="font-medium text-slate-800">
                      {formatCurrency(tax)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        Grand Total
                      </span>

                      <span className="text-xl font-bold text-slate-900">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notes */}
            {purchase.notes && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Notes
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                  {purchase.notes}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>

          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Edit3 size={15} />
            Edit Purchase
          </button>
        </div>
      </div>
    </div>
  );
}