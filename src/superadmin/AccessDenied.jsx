import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function AccessDenied({ onBack, message }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <ShieldAlert size={22} className="text-red-600" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-slate-900">Access restricted</h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {message || "Ask a Super Admin to enable this module for your profile."}
        </p>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>
        )}
      </div>
    </div>
  );
}
