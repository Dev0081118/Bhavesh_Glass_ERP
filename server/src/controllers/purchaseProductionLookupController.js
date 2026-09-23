const {
  Party,
  Product,
  Inventory,
  User,
} = require("../models");

const {
  ensureInventory,
  getStockUnit,
} = require("../services/inventoryService");

/* =========================================================
   HELPERS
========================================================= */

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const publicProductWithInventory = async () => {
  const products = await Product.find({
    status: "Active",
  })
    .populate({
      path: "assignedTo",
      select: "name email role department status",
    })
    .sort({
      name: 1,
    });

  const productIds = products.map(
    (product) => product._id
  );

  const inventories =
    productIds.length > 0
      ? await Inventory.find({
          product: {
            $in: productIds,
          },
        })
      : [];

  const inventoryMap = new Map(
    inventories.map((inventory) => [
      String(inventory.product),
      inventory,
    ])
  );

  return products.map((product) => {
    const inventory = inventoryMap.get(
      String(product._id)
    );

    const plain =
      typeof product.toObject === "function"
        ? product.toObject()
        : product;

    return {
      ...plain,

      availableQuantity: Number(
        inventory?.availableQuantity || 0
      ),

      reservedQuantity: Number(
        inventory?.reservedQuantity || 0
      ),

      quantity: Number(
        inventory?.quantity || 0
      ),

      inventoryLocation:
        inventory?.location ||
        product.location ||
        "",

      stockUnit:
        product.stockUnit ||
        getStockUnit(product),
    };
  });
};

const getAssignableUsers = async (department) => {
  return User.find({
    status: "Active",

    $or: [
      {
        role: "Super Admin",
      },

      {
        role: "Admin",
      },

      {
        department,
      },
    ],
  })
    .select(
      "name email role department status"
    )
    .sort({
      name: 1,
    });
};

/* =========================================================
   PURCHASE LOOKUPS
========================================================= */

const getPurchaseLookups = async (
  req,
  res
) => {
  try {
    const [
      products,
      suppliers,
      staff,
    ] = await Promise.all([
      publicProductWithInventory(),

      Party.find({
        status: "Active",

        type: {
          $in: [
            "Supplier",
            "Both",
          ],
        },
      }).sort({
        name: 1,
      }),

      getAssignableUsers(
        "Purchase"
      ),
    ]);

    return res.json({
      data: {
        products,
        suppliers,
        staff,
      },
    });
  } catch (error) {
    console.error(
      "getPurchaseLookups:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to load purchase data.",
    });
  }
};

/* =========================================================
   QUICK CREATE SUPPLIER
========================================================= */

const createPurchaseSupplier = async (
  req,
  res
) => {
  try {
    const {
      name,
      phone,
      email,
      gstNumber,
      address,
      city,
      state,
    } = req.body;

    const cleanName =
      String(name || "").trim();

    const cleanPhone =
      String(phone || "").trim();

    if (!cleanName) {
      return res.status(400).json({
        message:
          "Supplier name is required.",
      });
    }

    /*
     * Party model currently requires phone,
     * therefore quick supplier creation also
     * requires it.
     */
    if (!cleanPhone) {
      return res.status(400).json({
        message:
          "Supplier phone number is required.",
      });
    }

    const exactName =
      new RegExp(
        `^${escapeRegex(
          cleanName
        )}$`,
        "i"
      );

    const existing =
      await Party.findOne({
        name: exactName,
      });

    if (existing) {
      if (
        [
          "Supplier",
          "Both",
        ].includes(
          existing.type
        )
      ) {
        if (
          existing.status !==
          "Active"
        ) {
          return res.status(409).json({
            message:
              "A supplier with this name already exists but is inactive.",
          });
        }

        return res.status(200).json({
          message:
            "Existing supplier selected.",

          data:
            existing,
        });
      }

      return res.status(409).json({
        message:
          "A party with this name already exists as a Customer. Change that party type to Both before using it as a supplier.",
      });
    }

    const supplier =
      await Party.create({
        name:
          cleanName,

        type:
          "Supplier",

        phone:
          cleanPhone,

        email:
          String(
            email || ""
          )
            .trim()
            .toLowerCase(),

        gstNumber:
          String(
            gstNumber || ""
          )
            .trim()
            .toUpperCase(),

        address:
          String(
            address || ""
          ).trim(),

        city:
          String(
            city || ""
          ).trim(),

        state:
          String(
            state || ""
          ).trim(),

        openingBalance:
          0,

        status:
          "Active",
      });

    return res
      .status(201)
      .json({
        message:
          "Supplier created successfully.",

        data:
          supplier,
      });
  } catch (error) {
    console.error(
      "createPurchaseSupplier:",
      error
    );

    return res.status(400).json({
      message:
        error.message ||
        "Unable to create supplier.",
    });
  }
};

/* =========================================================
   PRODUCTION LOOKUPS
========================================================= */

const getProductionLookups = async (
  req,
  res
) => {
  try {
    const [
      products,
      staff,
    ] = await Promise.all([
      publicProductWithInventory(),

      getAssignableUsers(
        "Production"
      ),
    ]);

    const finishedProducts =
      products.filter(
        (product) =>
          product.type ===
          "Finished Product"
      );

    const rawMaterials =
      products.filter(
        (product) =>
          [
            "Raw Material",
            "Accessory",
            "Printing Material",
            "Packaging Material",
          ].includes(
            product.type
          )
      );

    return res.json({
      data: {
        products,
        finishedProducts,
        rawMaterials,
        staff,
      },
    });
  } catch (error) {
    console.error(
      "getProductionLookups:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to load production data.",
    });
  }
};

/* =========================================================
   QUICK CREATE FINISHED PRODUCT
========================================================= */

const createProductionFinishedProduct =
  async (
    req,
    res
  ) => {
    let createdProduct =
      null;

    try {
      const {
        name,
        sku,
        category,
        unit,
        location,
        minimumStockLevel,
        sellingPrice,
        gst,
        description,
      } = req.body;

      const cleanName =
        String(
          name || ""
        ).trim();

      const cleanSku =
        String(
          sku || ""
        )
          .trim()
          .toUpperCase();

      const cleanCategory =
        String(
          category || ""
        ).trim();

      const productUnit =
        String(
          unit ||
            "Piece"
        ).trim();

      if (!cleanName) {
        return res.status(400).json({
          message:
            "Finished product name is required.",
        });
      }

      if (!cleanSku) {
        return res.status(400).json({
          message:
            "SKU is required.",
        });
      }

      if (!cleanCategory) {
        return res.status(400).json({
          message:
            "Category is required.",
        });
      }

      const validUnits = [
        "Piece",
        "Sheet",
        "Pack",
        "Box",
        "Kg",
        "Gram",
        "Meter",
        "Feet",
        "Roll",
      ];

      if (
        !validUnits.includes(
          productUnit
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid product unit.",
        });
      }

      const existingSku =
        await Product.findOne({
          sku:
            cleanSku,
        });

      if (existingSku) {
        return res.status(409).json({
          message:
            `Product with SKU ${cleanSku} already exists.`,
        });
      }

      const productData = {
        name:
          cleanName,

        sku:
          cleanSku,

        category:
          cleanCategory,

        type:
          "Finished Product",

        unit:
          productUnit,

        conversionEnabled:
          false,

        conversions:
          [],

        stockUnit:
          productUnit,

        minimumStockLevel:
          Math.max(
            Number(
              minimumStockLevel ||
                0
            ),
            0
          ),

        location:
          String(
            location ||
              "Main Warehouse"
          ).trim(),

        sellingPrice:
          Math.max(
            Number(
              sellingPrice ||
                0
            ),
            0
          ),

        gst:
          Math.min(
            Math.max(
              Number(
                gst ||
                  0
              ),
              0
            ),
            100
          ),

        description:
          String(
            description ||
              ""
          ).trim(),

        purchasePrice:
          0,

        wholesalePrice:
          0,

        status:
          "Active",
      };

      productData.stockUnit =
        getStockUnit(
          productData
        );

      createdProduct =
        await Product.create(
          productData
        );

      /*
       * Important:
       * every Product must use the same Inventory
       * architecture, including quick-created
       * Production products.
       */
      const inventory =
        await ensureInventory(
          createdProduct,
          createdProduct.location
        );

      const product =
        await Product.findById(
          createdProduct._id
        ).populate({
          path:
            "assignedTo",

          select:
            "name email role department status",
        });

      return res
        .status(201)
        .json({
          message:
            "Finished product created successfully.",

          data: {
            ...product.toObject(),

            availableQuantity:
              Number(
                inventory.availableQuantity ||
                  0
              ),

            reservedQuantity:
              Number(
                inventory.reservedQuantity ||
                  0
              ),

            quantity:
              Number(
                inventory.quantity ||
                  0
              ),

            inventoryLocation:
              inventory.location,

            stockUnit:
              getStockUnit(
                product
              ),
          },
        });
    } catch (error) {
      console.error(
        "createProductionFinishedProduct:",
        error
      );

      /*
       * Do not leave a Product without Inventory
       * if inventory creation unexpectedly fails.
       */
      if (
        createdProduct?._id
      ) {
        const inventory =
          await Inventory.findOne({
            product:
              createdProduct._id,
          }).catch(
            () => null
          );

        if (!inventory) {
          await Product.findByIdAndDelete(
            createdProduct._id
          ).catch(
            () => {}
          );
        }
      }

      return res.status(400).json({
        message:
          error.message ||
          "Unable to create finished product.",
      });
    }
  };

module.exports = {
  getPurchaseLookups,
  createPurchaseSupplier,

  getProductionLookups,
  createProductionFinishedProduct,
};