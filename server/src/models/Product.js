const mongoose = require("mongoose");

const conversionSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
      trim: true,
    },

    factor: {
      type: Number,
      required: true,
      min: 0.000001,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video", "document"],
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    dataUrl: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subCategory: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "Finished Product",
        "Raw Material",
        "Accessory",
        "Printing Material",
        "Packaging Material",
        "Machine",
      ],
      required: true,
    },

    material: {
      type: String,
      trim: true,
      default: "",
    },

    unit: {
      type: String,
      enum: [
        "Piece",
        "Sheet",
        "Pack",
        "Box",
        "Kg",
        "Gram",
        "Meter",
        "Feet",
        "Roll",
      ],
      default: "Piece",
    },

    conversionEnabled: {
      type: Boolean,
      default: false,
    },

    conversions: {
      type: [conversionSchema],
      default: [],
    },

    /*
     * Unit every Inventory / StockTransaction quantity is
     * counted in. Derived from `unit` + `conversions`, but the
     * value is persisted so the stock migration stays idempotent.
     */
    stockUnit: {
      type: String,
      trim: true,
      default: "",
    },

    isFrame: {
      type: Boolean,
      default: false,
    },

    frameSize: {
      width: {
        type: Number,
        min: 0,
        default: null,
      },

      height: {
        type: Number,
        min: 0,
        default: null,
      },

      unit: {
        type: String,
        enum: ["mm", "cm", "inch", "feet"],
        default: "inch",
      },
    },

    dimensions: {
      length: {
        type: Number,
        min: 0,
        default: null,
      },

      width: {
        type: Number,
        min: 0,
        default: null,
      },

      height: {
        type: Number,
        min: 0,
        default: null,
      },

      unit: {
        type: String,
        enum: [
          "mm",
          "cm",
          "inch",
          "feet",
          "meter",
        ],
        default: "cm",
      },
    },

    weight: {
      value: {
        type: Number,
        min: 0,
        default: null,
      },

      unit: {
        type: String,
        enum: ["g", "kg", "lb"],
        default: "kg",
      },
    },

    media: {
      type: [mediaSchema],
      default: [],
    },

    minimumStockLevel: {
      type: Number,
      default: 0,
      min: 0,
    },

    location: {
      type: String,
      trim: true,
      default: "Main Warehouse",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    purchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    wholesalePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    gst: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    hsnCode: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Product",
    productSchema
  );