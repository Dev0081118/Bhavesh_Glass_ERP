import { useState } from "react";
import { Image as ImageIcon, Upload, Trash2, Loader2 } from "lucide-react";

const StampCard = ({
  stamp,
  onPickFile,
  fileInputRef,
  onFileChange,
  onRemove,
  uploading,
}) => {
  const [removeMode, setRemoveMode] = useState(false);
  const hasStamp = Boolean(stamp?.dataUrl);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <ImageIcon size={18} className="text-slate-500" />
            Company Stamp / Signature
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            PNG, JPG or WEBP up to 2&nbsp;MB. Copied onto every new bill.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Preview area */}
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          {hasStamp ? (
            <img
              src={stamp.dataUrl}
              alt="Company stamp preview"
              className="max-h-40 w-auto max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <ImageIcon size={34} strokeWidth={1.5} />
              <span className="text-xs font-medium">No stamp uploaded</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-4">
          <div className="text-sm">
            <p className="font-medium text-slate-950">Current file:</p>
            <p className="mt-0.5 break-all text-slate-500">
              {hasStamp
                ? stamp?.fileName || "company-stamp"
                : "No file uploaded yet."}
            </p>
            {hasStamp && stamp?.uploadedAt && (
              <p className="mt-0.5 text-xs text-slate-400">
                Uploaded {new Date(stamp.uploadedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPickFile}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {hasStamp ? "Replace Image" : "Upload Image"}
            </button>

            {hasStamp && !removeMode && (
              <button
                type="button"
                onClick={() => setRemoveMode(true)}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}

            {removeMode && (
              <span className="inline-flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
                Remove this stamp?
                <button
                  type="button"
                  onClick={() => {
                    setRemoveMode(false);
                    onRemove();
                  }}
                  className="font-semibold text-red-700 hover:underline"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setRemoveMode(false)}
                  className="font-semibold text-slate-950 hover:underline"
                >
                  No
                </button>
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>
    </section>
  );
};

export default StampCard;