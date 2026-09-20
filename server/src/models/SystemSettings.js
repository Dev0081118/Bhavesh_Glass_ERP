const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    isSystemActive: { type: Boolean, default: true },
    reason: { type: String, default: "System is currently operational.", trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
