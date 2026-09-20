const mongoose = require("mongoose");

const dispatchItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, default: "Piece", trim: true },
  },
  { _id: false }
);

const dispatchSchema = new mongoose.Schema(
  {
    saleBill: { type: mongoose.Schema.Types.ObjectId, ref: "SaleBill", required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    dispatchDate: { type: Date },
    expectedDeliveryDate: { type: Date, required: true },
    warehouse: { type: String, required: true, trim: true },
    transporter: { type: String, trim: true },
    vehicleNumber: { type: String, uppercase: true, trim: true },
    lr: { type: mongoose.Schema.Types.ObjectId, ref: "LR", default: null },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Draft", "Ready to Dispatch", "Dispatched", "In Transit", "Delivered", "Cancelled"], default: "Draft", index: true },
    notes: { type: String, trim: true },
    items: { type: [dispatchItemSchema], required: true, validate: (items) => items.length > 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dispatch", dispatchSchema);
