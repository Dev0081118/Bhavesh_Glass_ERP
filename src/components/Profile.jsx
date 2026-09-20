import { useState } from "react";
import {
  ChevronDown,
  LockKeyhole,
  LogOut,
  Mail,
  Phone,
  UserRound,
  X,
} from "lucide-react";

const profile = {
  name: "Super Admin",
  role: "Administrator",
  email: "superadmin123@example.com",
  phone: "+91 98765 43210",
};

export default function Profile({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const closeProfile = () => {
    setIsOpen(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          SA
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-[13px] font-semibold text-slate-900">{profile.name}</p>
          <p className="text-[11px] text-slate-400">{profile.role}</p>
        </div>

        <ChevronDown
          size={15}
          className={`hidden text-slate-400 transition sm:block ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-14 z-30 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
          role="dialog"
          aria-label="Profile"
        >
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-base font-semibold text-slate-900">Profile</p>
              <p className="mt-1 text-xs text-slate-400">Account information</p>
            </div>
            <button
              type="button"
              onClick={closeProfile}
              aria-label="Close profile"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 border-b border-slate-100 py-4">
            <div className="flex items-center gap-3">
              <UserRound size={16} className="shrink-0 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-400">Name</p>
                <p className="text-sm font-medium text-slate-800">{profile.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="shrink-0 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-400">Phone number</p>
                <p className="text-sm font-medium text-slate-800">{profile.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400">Email</p>
                <p className="truncate text-sm font-medium text-slate-800">{profile.email}</p>
              </div>
            </div>
          </div>

          <form className="space-y-3 pt-4" onSubmit={(event) => event.preventDefault()}>
            <div className="flex items-center gap-2">
              <LockKeyhole size={16} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Reset password</h2>
            </div>

            <div>
              <label htmlFor="current-password" className="mb-1.5 block text-xs font-medium text-slate-600">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter current password"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-xs font-medium text-slate-600">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              Update password
            </button>
          </form>

          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
