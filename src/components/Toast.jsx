import { useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  X,
} from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      wrapper: "border-emerald-200 bg-white",
      iconColor: "text-emerald-500",
    },
    error: {
      icon: XCircle,
      wrapper: "border-red-200 bg-white",
      iconColor: "text-red-500",
    },
    info: {
      icon: Info,
      wrapper: "border-slate-200 bg-white",
      iconColor: "text-slate-500",
    },
  };

  const current = config[toast.type] || config.info;
  const Icon = current.icon;

  return (
    <div className="fixed right-5 top-5 z-[100] w-[min(380px,calc(100vw-40px))]">
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${current.wrapper}`}
      >
        <Icon
          size={20}
          className={`mt-0.5 shrink-0 ${current.iconColor}`}
        />

        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-semibold text-slate-900">
              {toast.title}
            </p>
          )}

          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}