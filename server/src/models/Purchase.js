const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    rate: { type: Number, required: true, min: 0 },
    receivedQuantity: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    purchaseDate: { type: Date, required: true },
    status: { type: String, enum: ["Draft", "Pending", "Ordered", "Partially Received", "Received", "Cancelled"], default: "Draft", index: true },
    items: { type: [purchaseItemSchema], required: true, validate: (items) => items.length > 0 },
    gst: { type: Number, default: 0, min: 0, max: 100 },
    discount: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
    paymentStatus: { type: String, enum: ["Pending", "Partially Paid", "Paid"], default: "Pending", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
