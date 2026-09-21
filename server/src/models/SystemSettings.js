const mongoose = require("mongoose");

/*
 * Default billing terms used when the global settings document
 * is created for the first time (or when no terms were saved yet).
 */
const DEFAULT_TERMS_AND_CONDITIONS = [
  "Goods once sold will not be taken back or exchanged.",
  "All disputes are subject to local jurisdiction.",
].join("\n");

const companyStampSchema = new mongoose.Schema(
  {
    dataUrl: { type: String, default: "" },
    fileName: { type: String, default: "", trim: true },
    mimeType: { type: String, default: "" },
    uploadedAt: { type: Date, default: null },
  },
  { _id: false }
);

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },

    /*
     * Global appearance setting.
     * Mirrored on the client in localStorage ("erp-theme").
     */
    theme: { type: String, enum: ["light", "dark"], default: "light" },

    /* Company stamp / signature stored as a Base64 data URL. */
    companyStamp: { type: companyStampSchema, default: () => ({}) },

    /* Default billing terms & conditions (line breaks preserved). */
    termsAndConditions: {
      type: String,
      default: DEFAULT_TERMS_AND_CONDITIONS,
      maxlength: 5000,
    },

    isSystemActive: { type: Boolean, default: true },
    reason: { type: String, default: "System is currently operational.", trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
module.exports.DEFAULT_TERMS_AND_CONDITIONS = DEFAULT_TERMS_AND_CONDITIONS;
