const mongoose = require("mongoose");

const lrSchema = new mongoose.Schema(
  {
    lrDate: { type: Date, required: true },
    dispatch: { type: mongoose.Schema.Types.ObjectId, ref: "Dispatch", required: true, index: true },
    saleBill: { type: mongoose.Schema.Types.ObjectId, ref: "SaleBill", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    fromLocation: { type: String, required: true, trim: true },
    toLocation: { type: String, required: true, trim: true },
    transporter: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    driverName: { type: String, required: true, trim: true },
    driverPhone: { type: String, trim: true },
    packageCount: { type: Number, required: true, min: 1 },
    weight: { type: Number, required: true, min: 0 },
    freightAmount: { type: Number, required: true, min: 0 },
    freightPaymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    expectedDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    status: { type: String, enum: ["Draft", "In Transit", "Delivered", "Cancelled"], default: "Draft", index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LR", lrSchema);
