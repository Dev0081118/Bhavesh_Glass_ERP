import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-6" : "py-10"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <Icon size={18} className="text-slate-400" />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>

      {description && (
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">{description}</p>
      )}

      {action}
    </div>
  );
}
