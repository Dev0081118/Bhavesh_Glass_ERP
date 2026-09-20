const mongoose = require("mongoose");

const partySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["Customer", "Supplier", "Both"], required: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    gstNumber: { type: String, uppercase: true, trim: true },
    openingBalance: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
  },
  { timestamps: true }
);

partySchema.index({ name: "text", phone: "text", email: "text" });

module.exports = mongoose.model("Party", partySchema);
