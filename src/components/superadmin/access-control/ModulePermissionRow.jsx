import {
  LayoutDashboard,
  CreditCard,
  Truck,
  BookOpen,
  Package,
  ReceiptText,
  MessageCircle,
  Boxes,
  ShoppingCart,
  Factory,
  Send,
  BarChart3,
  Check,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  payment: CreditCard,
  lr: Truck,
  ledger: BookOpen,
  product: Package,
  sale_bill: ReceiptText,
  whatsapp_ai: MessageCircle,
  inventory: Boxes,
  purchase: ShoppingCart,
  production: Factory,
  dispatch: Send,
  reports: BarChart3,
};

const normalizeKey = (value) =>
  String(value)
    .toLowerCase()
    .replace(/\s+/g, "_");

export default function ModulePermissionRow({
  moduleName,
  enabled,
  onChange,
}) {
  const Icon =
    iconMap[normalizeKey(moduleName)] ||
    Package;

  return (
    <div
      className={`group flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${
        enabled
          ? "border-slate-200 bg-white"
          : "border-slate-100 bg-slate-50/70"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            enabled
              ? "bg-slate-100 text-slate-700"
              : "bg-white text-slate-400"
          }`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">

          <p
            className={`text-sm font-semibold ${
              enabled
                ? "text-slate-800"
                : "text-slate-500"
            }`}
          >
            {moduleName}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {enabled
              ? "Access permitted"
              : "Access restricted"}
          </p>

        </div>
      </div>

      {/* Toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${moduleName} permission`}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition ${
          enabled
            ? "bg-slate-900"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
            enabled
              ? "translate-x-5"
              : "translate-x-0"
          }`}
        >
          {enabled && (
            <Check
              size={11}
              strokeWidth={3}
              className="text-slate-900"
            />
          )}
        </span>
      </button>
    </div>
  );
}