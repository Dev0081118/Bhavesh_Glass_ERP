import {
  AlertTriangle,
  X,
  Trash2,
} from "lucide-react";

export default function DeleteStaffModal({
  staff,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="
      fixed inset-0 z-[60]
      flex items-center justify-center
      p-4
    ">

      {/* OVERLAY */}

      <div
        onClick={onCancel}
        className="
          absolute inset-0
          bg-slate-900/40
          backdrop-blur-sm
        "
      />

      {/* MODAL */}

      <div className="
        relative w-full max-w-sm
        overflow-hidden
        rounded-3xl
        border border-slate-200
        bg-white shadow-2xl
      ">

        {/* CLOSE */}

        <button
          onClick={onCancel}
          className="
            absolute right-4 top-4
            flex h-8 w-8
            items-center justify-center
            rounded-lg text-slate-400
            hover:bg-slate-100
          "
        >
          <X size={16} />
        </button>

        <div className="p-6">

          {/* ICON */}

          <div className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl bg-red-50
            text-red-500
          ">
            <AlertTriangle size={20} />
          </div>

          <h2 className="
            mt-5 text-base
            font-semibold text-slate-900
          ">
            Delete staff member?
          </h2>

          <p className="
            mt-2 text-sm
            leading-6 text-slate-500
          ">
            You're about to delete{" "}
            <span className="
              font-medium text-slate-700
            ">
              {staff.name}
            </span>
            . This action cannot be undone.
          </p>

          {/* STAFF */}

          <div className="
            mt-5 rounded-xl
            bg-slate-50 p-3
          ">

            <p className="
              text-xs font-medium
              text-slate-700
            ">
              {staff.name}
            </p>

            <p className="
              mt-0.5 text-[11px]
              text-slate-400
            ">
              {staff.role}

              {staff.department
                ? ` • ${staff.department}`
                : ""}
            </p>

          </div>

        </div>

        {/* FOOTER */}

        <div className="
          flex gap-3
          border-t border-slate-100
          bg-slate-50/50 p-4
        ">

          <button
            onClick={onCancel}
            className="
              flex-1 rounded-xl
              border border-slate-200
              bg-white px-4 py-2.5
              text-xs font-medium
              text-slate-600
              hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="
              flex-1 inline-flex
              items-center justify-center
              gap-2 rounded-xl
              bg-red-500 px-4 py-2.5
              text-xs font-medium
              text-white
              hover:bg-red-600
            "
          >
            <Trash2 size={14} />
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}