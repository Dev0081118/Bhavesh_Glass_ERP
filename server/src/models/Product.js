const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, uppercase: true, trim: true, unique: true, index: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true },
    type: { type: String, enum: ["Finished Product", "Raw Material", "Accessory", "Printing Material", "Packaging Material", "Machine"], required: true },
    size: { type: String, trim: true },
    material: { type: String, trim: true },
    unit: { type: String, enum: ["Piece", "Sheet", "Pack", "Box", "Kg", "Meter"], default: "Piece" },
    purchasePrice: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, default: 0, min: 0 },
    wholesalePrice: { type: Number, default: 0, min: 0 },
    gst: { type: Number, default: 0, min: 0, max: 100 },
    hsnCode: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    location: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
