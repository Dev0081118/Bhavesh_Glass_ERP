export default function ProductStatus({
  status,
  onClick,
}) {
  const active = status === "Active";

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full
        px-2.5 py-1 text-xs font-medium transition
        ${
          active
            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${active ? "bg-emerald-500" : "bg-slate-400"}
        `}
      />

      {status}
    </button>
  );
}