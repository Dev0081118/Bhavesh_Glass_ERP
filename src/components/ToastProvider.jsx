import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CheckCircle2,
  X,
  XCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback(
    (type = "success", title = "Success", message = "") => {
      const id = ++toastId;

      setToasts((current) => [
        ...current,
        {
          id,
          type,
          title,
          message,
        },
      ]);

      // Auto remove after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);

      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        removeToast,
      }}
    >
      {children}

      {/* GLOBAL TOAST CONTAINER */}
      <div
        className="
          pointer-events-none
          fixed
          right-4
          top-4
          z-[9999]
          flex
          w-[calc(100%-2rem)]
          max-w-sm
          flex-col
          gap-3
        "
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const config = {
    success: {
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      iconBg: "bg-emerald-50",
      titleClass: "text-slate-900",
      border: "border-emerald-100",
    },

    error: {
      icon: XCircle,
      iconClass: "text-red-600",
      iconBg: "bg-red-50",
      titleClass: "text-slate-900",
      border: "border-red-100",
    },

    warning: {
      icon: AlertTriangle,
      iconClass: "text-amber-600",
      iconBg: "bg-amber-50",
      titleClass: "text-slate-900",
      border: "border-amber-100",
    },

    info: {
      icon: Info,
      iconClass: "text-blue-600",
      iconBg: "bg-blue-50",
      titleClass: "text-slate-900",
      border: "border-blue-100",
    },
  };

  const current = config[toast.type] || config.success;
  const Icon = current.icon;

  return (
    <div
      className={`
        pointer-events-auto
        w-full
        overflow-hidden
        rounded-2xl
        border
        ${current.border}
        bg-white
        shadow-xl
        shadow-slate-900/10
        animate-[toastIn_0.25s_ease-out]
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* ICON */}
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${current.iconBg}
          `}
        >
          <Icon
            size={18}
            className={current.iconClass}
          />
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <p
            className={`
              text-sm
              font-semibold
              ${current.titleClass}
            `}
          >
            {toast.title}
          </p>

          {toast.message && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {toast.message}
            </p>
          )}
        </div>

        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="
            shrink-0
            rounded-lg
            p-1
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-600
          "
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
}