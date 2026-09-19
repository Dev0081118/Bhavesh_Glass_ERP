const statusStyles = {
  Draft: "bg-slate-100 text-slate-600",
  Pending: "bg-amber-50 text-amber-700",
  Ordered: "bg-blue-50 text-blue-700",
  "Partially Received": "bg-purple-50 text-purple-700",
  Received: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function PurchaseStatus({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          status === "Received"
            ? "bg-emerald-500"
            : status === "Cancelled"
            ? "bg-red-500"
            : status === "Ordered"
            ? "bg-blue-500"
            : status === "Partially Received"
            ? "bg-purple-500"
            : status === "Pending"
            ? "bg-amber-500"
            : "bg-slate-400"
        }`}
      />

      {status}
    </span>
  );
}