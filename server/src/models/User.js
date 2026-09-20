const mongoose = require("mongoose");

const defaultModules = [
  "dashboard",
  "inventory",
  "product",
  "purchase",
  "production",
  "dispatch",
  "sale_bill",
  "payment",
  "ledger",
  "lr",
  "whatsapp_ai",
  "reports",
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    dob: { type: Date },
    address: { type: String, trim: true },
    aadhaar: { type: String, trim: true, select: false },
    role: { type: String, enum: ["Super Admin", "Admin", "Manager", "Employee"], default: "Employee", index: true },
    department: { type: String, enum: ["Account", "Sales", "Purchase", "Production", "Dispatch"] },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
    lastLoginAt: { type: Date },
    access: {
      modules: {
        type: Map,
        of: Boolean,
        default: () => new Map([["dashboard", true]]),
      },
      profile: {
        view: { type: Boolean, default: true },
        edit: { type: Boolean, default: false },
        resetPassword: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

userSchema.statics.defaultAccessForRole = (role) => {
  if (role === "Super Admin") {
    return {
      modules: Object.fromEntries(defaultModules.map((module) => [module, true])),
      profile: { view: true, edit: true, resetPassword: true },
    };
  }

  return {
    modules: Object.fromEntries(defaultModules.map((module) => [module, module === "dashboard"])),
    profile: { view: true, edit: false, resetPassword: false },
  };
};

module.exports = mongoose.model("User", userSchema);
