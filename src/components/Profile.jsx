import {
  useState,
} from "react";

import {
  ChevronDown,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  Mail,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import {
  changePassword,
} from "../lib/api";

import {
  useToast,
} from "./ToastProvider";

export default function Profile({
  onLogout,
  user,
  token,
}) {
  const {
    showToast,
  } = useToast();

  const [
    isOpen,
    setIsOpen,
  ] = useState(
    false
  );

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState(
    ""
  );

  const [
    newPassword,
    setNewPassword,
  ] = useState(
    ""
  );

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState(
    ""
  );

  const [
    showPasswords,
    setShowPasswords,
  ] = useState(
    false
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(
    false
  );

  const profile = {
    name:
      user?.name ||
      "User",

    role:
      user?.role ||
      "",

    email:
      user?.email ||
      "",

    phone:
      user?.phone ||
      "",
  };

  const resetFields =
    () => {
      setCurrentPassword(
        ""
      );

      setNewPassword(
        ""
      );

      setConfirmPassword(
        ""
      );

      setShowPasswords(
        false
      );
    };

  const closeProfile =
    () => {
      setIsOpen(
        false
      );

      resetFields();
    };

  const initials =
    String(
      profile.name ||
        "U"
    )
      .trim()
      .split(
        /\s+/
      )
      .map(
        (part) =>
          part[0]
      )
      .join(
        ""
      )
      .slice(
        0,
        2
      )
      .toUpperCase();

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        showToast(
          "error",
          "Password Required",
          "Complete all password fields."
        );

        return;
      }

      if (
        newPassword.length <
        8
      ) {
        showToast(
          "error",
          "Weak Password",
          "New password must contain at least 8 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        showToast(
          "error",
          "Password Mismatch",
          "New password and confirmation do not match."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        const result =
          await changePassword(
            token,
            currentPassword,
            newPassword,
            confirmPassword
          );

        showToast(
          "success",
          "Password Updated",
          result.message ||
            "Your password has been updated successfully."
        );

        resetFields();
      } catch (error) {
        showToast(
          "error",
          "Password Update Failed",
          error.message ||
            "Unable to update password."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (
              open
            ) =>
              !open
          )
        }
        aria-expanded={
          isOpen
        }
        aria-haspopup="dialog"
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {initials}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-[13px] font-semibold text-slate-900">
            {
              profile.name
            }
          </p>

          <p className="text-[11px] text-slate-400">
            {
              profile.role
            }
          </p>
        </div>

        <ChevronDown
          size={15}
          className={`hidden text-slate-400 transition sm:block ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-14 z-30 w-[min(380px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5"
          role="dialog"
          aria-label="Profile"
        >
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-base font-semibold text-slate-900">
                Profile
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Account information
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeProfile
              }
              aria-label="Close profile"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X
                size={
                  16
                }
              />
            </button>
          </div>

          <div className="space-y-3 border-b border-slate-100 py-4">
            <ProfileRow
              icon={
                UserRound
              }
              label="Name"
              value={
                profile.name
              }
            />

            <ProfileRow
              icon={
                Phone
              }
              label="Phone number"
              value={
                profile.phone ||
                "—"
              }
            />

            <ProfileRow
              icon={
                Mail
              }
              label="Email"
              value={
                profile.email ||
                "—"
              }
            />
          </div>

          <form
            className="space-y-3 pt-4"
            onSubmit={
              handleSubmit
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LockKeyhole
                  size={
                    16
                  }
                  className="text-slate-500"
                />

                <h2 className="text-sm font-semibold text-slate-900">
                  Change
                  password
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPasswords(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={
                  showPasswords
                    ? "Hide passwords"
                    : "Show passwords"
                }
              >
                {showPasswords ? (
                  <EyeOff
                    size={
                      16
                    }
                  />
                ) : (
                  <Eye
                    size={
                      16
                    }
                  />
                )}
              </button>
            </div>

            <PasswordField
              id="current-password"
              label="Current password"
              value={
                currentPassword
              }
              onChange={
                setCurrentPassword
              }
              visible={
                showPasswords
              }
            />

            <PasswordField
              id="new-password"
              label="New password"
              value={
                newPassword
              }
              onChange={
                setNewPassword
              }
              visible={
                showPasswords
              }
            />

            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={
                confirmPassword
              }
              onChange={
                setConfirmPassword
              }
              visible={
                showPasswords
              }
            />

            <button
              type="submit"
              disabled={
                submitting
              }
              className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Updating..."
                : "Update password"}
            </button>
          </form>

          <button
            type="button"
            onClick={
              onLogout
            }
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut
              size={
                15
              }
            />

            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        size={
          16
        }
        className="shrink-0 text-slate-400"
      />

      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">
          {label}
        </p>

        <p className="truncate text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
}) {
  return (
    <div>
      <label
        htmlFor={
          id
        }
        className="mb-1.5 block text-xs font-medium text-slate-600"
      >
        {label}
      </label>

      <input
        id={
          id
        }
        type={
          visible
            ? "text"
            : "password"
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event
              .target
              .value
          )
        }
        autoComplete="new-password"
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
      />
    </div>
  );
}