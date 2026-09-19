function LRStatus({ status }) {
  const styles = {
    Draft: "bg-slate-50 text-slate-600 border-slate-200",
    Booked: "bg-blue-50 text-blue-700 border-blue-100",
    Ready: "bg-indigo-50 text-indigo-700 border-indigo-100",
    "In Transit":
      "bg-amber-50 text-amber-700 border-amber-100",
    Delivered:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    Cancelled:
      "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-slate-50 text-slate-600 border-slate-100"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

      {status}
    </span>
  );
}

export default LRStatus;