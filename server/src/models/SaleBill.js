const mongoose = require("mongoose");

const saleBillItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, default: "Piece", trim: true },
    rate: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    gst: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const saleBillSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    billDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Draft", "Confirmed", "Partially Paid", "Paid", "Cancelled"], default: "Draft", index: true },
    paymentStatus: { type: String, enum: ["Unpaid", "Partially Paid", "Paid"], default: "Unpaid", index: true },
    paidAmount: { type: Number, default: 0, min: 0 },
    items: { type: [saleBillItemSchema], required: true, validate: (items) => items.length > 0 },
    notes: { type: String, trim: true },
    subtotal: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxableAmount: { type: Number, default: 0, min: 0 },
    gstAmount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaleBill", saleBillSchema);
