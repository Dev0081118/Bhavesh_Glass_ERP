const mongoose = require("mongoose");

const rawMaterialSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    requiredQuantity: { type: Number, required: true, min: 0 },
    consumedQuantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "Piece", trim: true },
  },
  { _id: false }
);

const productionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    plannedQuantity: { type: Number, required: true, min: 1 },
    completedQuantity: { type: Number, default: 0, min: 0 },
    wastage: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    expectedDate: { type: Date, required: true },
    actualCompletionDate: { type: Date },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Draft", "Planned", "In Progress", "On Hold", "Partially Completed", "Completed", "Cancelled"], default: "Draft", index: true },
    notes: { type: String, trim: true },
    rawMaterials: { type: [rawMaterialSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Production", productionSchema);
