const StockStatus = ({ status }) => {
  const styles = {
    "In Stock": "bg-emerald-50 text-emerald-700",
    "Low Stock": "bg-amber-50 text-amber-700",
    "Out of Stock": "bg-red-50 text-red-700",
  };

  const dots = {
    "In Stock": "bg-emerald-500",
    "Low Stock": "bg-amber-500",
    "Out of Stock": "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          dots[status] || "bg-slate-400"
        }`}
      />

      {status}
    </span>
  );
};

export default StockStatus;