const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
