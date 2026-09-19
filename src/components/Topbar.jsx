import {
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <div className="flex items-center">
        <div className="relative hidden w-[280px] md:block">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="
              h-10 w-full rounded-xl border border-slate-200
              bg-slate-50 pl-10 pr-4 text-sm text-slate-700
              outline-none transition
              placeholder:text-slate-400
              focus:border-slate-300 focus:bg-white
            "
          />

          <span
            className="
              absolute right-3 top-1/2 hidden -translate-y-1/2
              rounded-md border border-slate-200 bg-white
              px-1.5 py-0.5 text-[10px] text-slate-400 lg:block
            "
          >
            ⌘ K
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          className="
            relative flex h-10 w-10 items-center justify-center
            rounded-xl text-slate-500 transition
            hover:bg-slate-100 hover:text-slate-900
          "
        >
          <Bell size={18} strokeWidth={1.8} />

          <span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="h-7 w-px bg-slate-200" />

        {/* Profile */}
        <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            SA
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-[13px] font-semibold text-slate-900">
              Super Admin
            </p>
            <p className="text-[11px] text-slate-400">
              Administrator
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-slate-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}