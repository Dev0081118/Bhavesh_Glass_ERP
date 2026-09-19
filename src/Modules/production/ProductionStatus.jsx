const statusStyles = {
  Draft: "bg-slate-100 text-slate-600",
  Planned: "bg-blue-50 text-blue-700",
  "In Progress": "bg-amber-50 text-amber-700",
  "On Hold": "bg-orange-50 text-orange-700",
  "Partially Completed": "bg-violet-50 text-violet-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function ProductionStatus({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}