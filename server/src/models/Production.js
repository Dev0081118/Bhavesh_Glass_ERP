const mongoose = require("mongoose");

const rawMaterialSchema =
  new mongoose.Schema(
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      requiredQuantity: {
        type: Number,
        required: true,
        min: 0,
      },

      consumedQuantity: {
        type: Number,
        default: 0,
        min: 0,
      },

      unit: {
        type: String,
        trim: true,
        default: "Piece",
      },
    },
    {
      _id: false,
    }
  );

const productionSchema =
  new mongoose.Schema(
    {
      productionNumber: {
        type: String,
        trim: true,
        index: true,
      },

      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
      },

      plannedQuantity: {
        type: Number,
        required: true,
        min: 1,
      },

      completedQuantity: {
        type: Number,
        default: 0,
        min: 0,
      },

      /*
       * Informational finished-product loss.
       * Raw-material waste must already be included
       * inside consumedQuantity.
       */
      wastage: {
        type: Number,
        default: 0,
        min: 0,
      },

      startDate: {
        type: Date,
        required: true,
      },

      expectedDate: {
        type: Date,
        required: true,
      },

      actualCompletionDate: {
        type: Date,
        default: null,
      },

      /*
       * Kept as manager for backwards compatibility.
       * UI treats this as Responsible Person and may
       * assign Production employees/admins too.
       */
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      location: {
        type: String,
        required: true,
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "Draft",
          "Planned",
          "In Progress",
          "On Hold",
          "Partially Completed",
          "Completed",
          "Cancelled",
        ],
        default: "Draft",
        index: true,
      },

      notes: {
        type: String,
        trim: true,
        default: "",
      },

      rawMaterials: {
        type: [rawMaterialSchema],
        default: [],
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

productionSchema.index({
  product: 1,
  createdAt: -1,
});

module.exports =
  mongoose.model(
    "Production",
    productionSchema
  );