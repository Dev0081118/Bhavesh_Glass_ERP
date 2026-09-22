const mongoose = require("mongoose");

const {
  Product,
  Inventory,
  StockTransaction,
} = require("../models");

const {
  ensureInventory,
  applyStockMovement,
} = require("../services/inventoryService");

const assignedPopulate = {
  path: "assignedTo",
  select:
    "name email role department status",
};

const listProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find({})
        .populate(
          assignedPopulate
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      data: products,
    });
  } catch (error) {
    console.error(
      "listProducts error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load products.",
    });
  }
};

const createProduct = async (
  req,
  res
) => {
  try {
    const {
      openingStock = 0,
      ...payload
    } = req.body;

    console.log(
      "PRODUCT CREATE PAYLOAD:",
      payload
    );

    const product =
      await Product.create(
        payload
      );

    await ensureInventory(
      product,
      product.location
    );

    if (
      Number(openingStock) > 0
    ) {
      await applyStockMovement({
        productId:
          product._id,

        type: "IN",

        source:
          "OPENING_STOCK",

        quantity:
          Number(
            openingStock
          ),

        unit:
          product.unit,

        referenceType:
          "Product",

        referenceId:
          product._id,

        reason:
          "Opening stock",

        createdBy:
          req.user?._id,

        location:
          product.location,
      });
    }

    const populatedProduct =
      await Product.findById(
        product._id
      ).populate(
        assignedPopulate
      );

    return res
      .status(201)
      .json({
        data:
          populatedProduct,
      });
  } catch (error) {
    console.error(
      "createProduct error:",
      error
    );

    return res
      .status(400)
      .json({
        message:
          error.message,
      });
  }
};

const updateProduct = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            "Invalid product ID.",
        });
    }

    const payload = {
      ...req.body,
    };

    delete payload.stock;
    delete payload.openingStock;

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        payload,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        assignedPopulate
      );

    if (!product) {
      return res
        .status(404)
        .json({
          message:
            "Product not found.",
        });
    }

    return res.json({
      data: product,
    });
  } catch (error) {
    return res
      .status(400)
      .json({
        message:
          error.message,
      });
  }
};

const getProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      ).populate(
        assignedPopulate
      );

    if (!product) {
      return res
        .status(404)
        .json({
          message:
            "Product not found.",
        });
    }

    const inventory =
      await Inventory.findOne({
        product: product._id,
      });

    return res.json({
      data: {
        product,
        inventory,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};

const deleteProduct = async (
  req,
  res
) => {
  try {
    const inventory =
      await Inventory.findOne({
        product:
          req.params.id,
      });

    if (
      inventory &&
      Number(
        inventory.quantity ||
          0
      ) > 0
    ) {
      return res
        .status(409)
        .json({
          message:
            "Product still has stock. Set inventory to zero first.",
        });
    }

    const hasHistory =
      await StockTransaction.exists(
        {
          product:
            req.params.id,
        }
      );

    if (hasHistory) {
      return res
        .status(409)
        .json({
          message:
            "This product has stock history. Set it to Inactive instead.",
        });
    }

    await Product.findByIdAndDelete(
      req.params.id
    );

    await Inventory.deleteMany({
      product:
        req.params.id,
    });

    return res.json({
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
};