const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    availableQuantity: { type: Number, default: 0, min: 0 },
    location: { type: String, required: true, trim: true, index: true },
    reorderLevel: { type: Number, default: 0, min: 0 },
    lastMovementAt: { type: Date },
  },
  { timestamps: true }
);

inventorySchema.index({ product: 1, location: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);
