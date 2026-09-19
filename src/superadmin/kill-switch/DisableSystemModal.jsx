import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

const DisableSystemModal = ({
  open,
  action,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open, action]);

  if (!open) return null;

  const isDisable = action === "disable";

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDisable ? "bg-red-50" : "bg-emerald-50"
              }`}
            >
              {isDisable ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isDisable
                  ? "Disable Entire System"
                  : "Enable Entire System"}
              </h2>

              <p className="text-xs text-slate-500">
                Super Admin confirmation required
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            <div
              className={`rounded-2xl border p-4 ${
                isDisable
                  ? "border-red-100 bg-red-50"
                  : "border-emerald-100 bg-emerald-50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isDisable ? "text-red-800" : "text-emerald-800"
                }`}
              >
                {isDisable
                  ? "All users will immediately lose access to the ERP system."
                  : "All users will be allowed to access the ERP system again."}
              </p>
            </div>

            <div>
              <label
                htmlFor="kill-switch-reason"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Reason {isDisable && <span className="text-red-500">*</span>}
              </label>

              <textarea
                id="kill-switch-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={
                  isDisable
                    ? "Enter the reason for disabling the system..."
                    : "Optional reason for enabling the system..."
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              {isDisable && (
                <p className="mt-2 text-xs text-slate-400">
                  This reason can later be stored in the system audit log.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isDisable && !reason.trim()}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDisable
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isDisable ? "Disable System" : "Enable System"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisableSystemModal;