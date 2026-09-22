const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      default: "Main Warehouse",
      index: true,
    },

    lastMovementAt: {
      type: Date,
      default: null,
    },

    lastMovementType: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Inventory",
  inventorySchema
);