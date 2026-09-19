const saleStatusStyles = {
  Draft: "bg-slate-100 text-slate-600",
  Confirmed: "bg-blue-50 text-blue-700",
  "Partially Dispatched": "bg-amber-50 text-amber-700",
  Dispatched: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const paymentStatusStyles = {
  Unpaid: "bg-red-50 text-red-700",
  Partial: "bg-amber-50 text-amber-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-red-100 text-red-800",
};

export default function SaleBillStatus({
  status,
  type = "sale",
}) {
  const styles =
    type === "payment"
      ? paymentStatusStyles
      : saleStatusStyles;

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}