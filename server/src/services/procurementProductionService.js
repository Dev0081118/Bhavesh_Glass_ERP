const mongoose = require("mongoose");

const {
  Party,
  Product,
  User,
  StockTransaction,
} = require("../models");

const validId = (value) =>
  mongoose.isValidObjectId(value);

const idOf = (value) =>
  String(
    value?._id ||
      value ||
      ""
  );

const number = (value) => {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const roundMoney = (value) =>
  Math.round(
    (Number(value) +
      Number.EPSILON) *
      100
  ) / 100;

const getAllowedUnits = (
  product
) => {
  const units =
    new Set();

  if (product.unit) {
    units.add(
      String(product.unit)
        .toLowerCase()
    );
  }

  (
    product.conversions ||
    []
  ).forEach(
    (conversion) => {
      if (conversion.unit) {
        units.add(
          String(
            conversion.unit
          ).toLowerCase()
        );
      }
    }
  );

  return units;
};

const validateResponsibleUser =
  async (
    userId,
    department
  ) => {
    if (!userId) {
      return null;
    }

    if (!validId(userId)) {
      throw new Error(
        "Invalid responsible person."
      );
    }

    const user =
      await User.findOne({
        _id: userId,
        status: "Active",

        $or: [
          {
            role:
              "Super Admin",
          },
          {
            role:
              "Admin",
          },
          {
            department,
          },
        ],
      });

    if (!user) {
      throw new Error(
        `Selected responsible person is inactive or does not have access to ${department}.`
      );
    }

    return user;
  };

const buildPurchaseNumber =
  () =>
    `PUR-${Date.now()
      .toString(36)
      .toUpperCase()}`;

const buildProductionNumber =
  () =>
    `PRD-${Date.now()
      .toString(36)
      .toUpperCase()}`;

const validatePurchasePayload =
  async (
    req,
    payload,
    previous = null
  ) => {
    const old =
      previous?.toObject
        ? previous.toObject()
        : previous || {};

    const supplier =
      payload.supplier ??
      old.supplier;

    const assignedTo =
      payload.assignedTo ??
      old.assignedTo ??
      null;

    const purchaseDate =
      payload.purchaseDate ??
      old.purchaseDate;

    const expectedDeliveryDate =
      payload.expectedDeliveryDate ??
      old.expectedDeliveryDate ??
      null;

    let actualReceiptDate =
      payload.actualReceiptDate ??
      old.actualReceiptDate ??
      null;

    const items =
      payload.items ??
      old.items ??
      [];

    const requestedStatus =
      payload.status ??
      old.status ??
      "Draft";

    if (
      !validId(supplier)
    ) {
      throw new Error(
        "Please select a valid supplier."
      );
    }

    const supplierRecord =
      await Party.findOne({
        _id: supplier,
        status: "Active",
        type: {
          $in: [
            "Supplier",
            "Both",
          ],
        },
      });

    if (!supplierRecord) {
      throw new Error(
        "Selected supplier is invalid or inactive."
      );
    }

    if (!purchaseDate) {
      throw new Error(
        "Purchase date is required."
      );
    }

    const purchaseDateValue =
      new Date(purchaseDate);

    if (
      Number.isNaN(
        purchaseDateValue.getTime()
      )
    ) {
      throw new Error(
        "Purchase date is invalid."
      );
    }

    if (
      expectedDeliveryDate
    ) {
      const expected =
        new Date(
          expectedDeliveryDate
        );

      if (
        Number.isNaN(
          expected.getTime()
        )
      ) {
        throw new Error(
          "Expected delivery date is invalid."
        );
      }

      if (
        expected <
        purchaseDateValue
      ) {
        throw new Error(
          "Expected delivery date cannot be before purchase date."
        );
      }
    }

    await validateResponsibleUser(
      assignedTo,
      "Purchase"
    );

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new Error(
        "Add at least one purchase item."
      );
    }

    const seen =
      new Set();

    for (
      const item of items
    ) {
      const productId =
        idOf(item.product);

      if (
        !validId(productId)
      ) {
        throw new Error(
          "One or more purchase products are invalid."
        );
      }

      if (
        seen.has(productId)
      ) {
        throw new Error(
          "The same product cannot be added twice in one purchase."
        );
      }

      seen.add(productId);
    }

    const products =
      await Product.find({
        _id: {
          $in:
            Array.from(
              seen
            ),
        },
      });

    if (
      products.length !==
      seen.size
    ) {
      throw new Error(
        "One or more purchase products no longer exist."
      );
    }

    const productMap =
      new Map(
        products.map(
          (product) => [
            String(
              product._id
            ),
            product,
          ]
        )
      );

    const sanitizedItems =
      [];

    for (
      const item of items
    ) {
      const product =
        productMap.get(
          idOf(
            item.product
          )
        );

      if (
        product.status !==
        "Active"
      ) {
        throw new Error(
          `${product.name} is inactive and cannot be purchased.`
        );
      }

      const quantity =
        number(
          item.quantity
        );

      const received =
        number(
          item.receivedQuantity
        );

      const rate =
        number(
          item.rate
        );

      if (
        quantity <= 0
      ) {
        throw new Error(
          `Quantity for ${product.name} must be greater than zero.`
        );
      }

      if (
        received < 0
      ) {
        throw new Error(
          `Received quantity for ${product.name} cannot be negative.`
        );
      }

      if (
        received >
        quantity
      ) {
        throw new Error(
          `Received quantity cannot exceed ordered quantity for ${product.name}.`
        );
      }

      if (
        rate < 0
      ) {
        throw new Error(
          `Purchase rate for ${product.name} cannot be negative.`
        );
      }

      const unit =
        String(
          item.unit ||
            product.unit
        ).trim();

      const allowedUnits =
        getAllowedUnits(
          product
        );

      if (
        !allowedUnits.has(
          unit.toLowerCase()
        )
      ) {
        throw new Error(
          `${unit} is not a valid unit for ${product.name}.`
        );
      }

      /*
       * Changing unit after receipt changes the physical
       * meaning of the old stock movement. Block it.
       */
      if (previous) {
        const oldItem =
          (
            old.items ||
            []
          ).find(
            (entry) =>
              idOf(
                entry.product
              ) ===
              String(
                product._id
              )
          );

        if (
          oldItem &&
          number(
            oldItem.receivedQuantity
          ) > 0 &&
          String(
            oldItem.unit ||
              product.unit
          ).toLowerCase() !==
            unit.toLowerCase()
        ) {
          throw new Error(
            `Unit for ${product.name} cannot be changed after stock has been received.`
          );
        }
      }

      sanitizedItems.push({
        product:
          product._id,

        quantity,

        unit,

        rate,

        receivedQuantity:
          received,

        notes:
          String(
            item.notes ||
              ""
          ).trim(),
      });
    }

    const anyReceived =
      sanitizedItems.some(
        (item) =>
          item.receivedQuantity >
          0
      );

    const allReceived =
      sanitizedItems.every(
        (item) =>
          item.receivedQuantity ===
          item.quantity
      );

    let status =
      requestedStatus;

    if (
      requestedStatus !==
      "Cancelled"
    ) {
      if (
        allReceived
      ) {
        status =
          "Received";
      } else if (
        anyReceived
      ) {
        status =
          "Partially Received";
      } else if (
        ![
          "Draft",
          "Pending",
          "Ordered",
        ].includes(
          requestedStatus
        )
      ) {
        status =
          "Pending";
      }
    }

    if (
      anyReceived &&
      !actualReceiptDate
    ) {
      actualReceiptDate =
        new Date();
    }

    const gst =
      number(
        payload.gst ??
          old.gst
      );

    const discount =
      number(
        payload.discount ??
          old.discount
      );

    if (
      gst < 0 ||
      gst > 100
    ) {
      throw new Error(
        "GST must be between 0 and 100."
      );
    }

    if (
      discount < 0
    ) {
      throw new Error(
        "Discount cannot be negative."
      );
    }

    const subtotal =
      roundMoney(
        sanitizedItems.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity *
              item.rate,
          0
        )
      );

    const safeDiscount =
      Math.min(
        discount,
        subtotal
      );

    const taxableAmount =
      roundMoney(
        Math.max(
          subtotal -
            safeDiscount,
          0
        )
      );

    const taxAmount =
      roundMoney(
        taxableAmount *
          (gst / 100)
      );

    const grandTotal =
      roundMoney(
        taxableAmount +
          taxAmount
      );

    return {
      purchaseNumber:
        payload.purchaseNumber ||
        old.purchaseNumber ||
        buildPurchaseNumber(),

      supplier:
        supplierRecord._id,

      supplierInvoiceNumber:
        String(
          payload.supplierInvoiceNumber ??
            old.supplierInvoiceNumber ??
            ""
        ).trim(),

      purchaseDate:
        purchaseDateValue,

      expectedDeliveryDate:
        expectedDeliveryDate ||
        null,

      actualReceiptDate:
        actualReceiptDate ||
        null,

      status,

      items:
        sanitizedItems,

      assignedTo:
        assignedTo ||
        null,

      gst,

      discount:
        safeDiscount,

      subtotal,

      taxableAmount,

      taxAmount,

      grandTotal,

      notes:
        String(
          payload.notes ??
            old.notes ??
            ""
        ).trim(),

      paymentStatus:
        payload.paymentStatus ??
        old.paymentStatus ??
        "Pending",
    };
  };

const productionMaterialTypes =
  new Set([
    "Raw Material",
    "Accessory",
    "Printing Material",
    "Packaging Material",
  ]);

const validateProductionPayload =
  async (
    req,
    payload,
    previous = null
  ) => {
    const old =
      previous?.toObject
        ? previous.toObject()
        : previous || {};

    const productId =
      idOf(
        payload.product ??
          old.product
      );

    const managerId =
      idOf(
        payload.manager ??
          old.manager
      );

    if (
      !validId(productId)
    ) {
      throw new Error(
        "Select a valid finished product."
      );
    }

    const product =
      await Product.findOne({
        _id: productId,
        status: "Active",
      });

    if (!product) {
      throw new Error(
        "Finished product does not exist or is inactive."
      );
    }

    if (
      product.type !==
      "Finished Product"
    ) {
      throw new Error(
        "Production output must be a Finished Product."
      );
    }

    if (
      previous &&
      number(
        old.completedQuantity
      ) > 0 &&
      idOf(
        old.product
      ) !==
        productId
    ) {
      throw new Error(
        "Finished product cannot be changed after production output has been recorded."
      );
    }

    const responsible =
      await validateResponsibleUser(
        managerId,
        "Production"
      );

    if (!responsible) {
      throw new Error(
        "Responsible person is required."
      );
    }

    const plannedQuantity =
      number(
        payload.plannedQuantity ??
          old.plannedQuantity
      );

    const completedQuantity =
      number(
        payload.completedQuantity ??
          old.completedQuantity
      );

    const wastage =
      number(
        payload.wastage ??
          old.wastage
      );

    if (
      plannedQuantity <= 0
    ) {
      throw new Error(
        "Planned quantity must be greater than zero."
      );
    }

    if (
      completedQuantity <
      0
    ) {
      throw new Error(
        "Completed quantity cannot be negative."
      );
    }

    if (
      completedQuantity >
      plannedQuantity
    ) {
      throw new Error(
        "Completed quantity cannot exceed planned quantity."
      );
    }

    if (
      wastage < 0
    ) {
      throw new Error(
        "Wastage cannot be negative."
      );
    }

    const startDate =
      new Date(
        payload.startDate ??
          old.startDate
      );

    const expectedDate =
      new Date(
        payload.expectedDate ??
          old.expectedDate
      );

    if (
      Number.isNaN(
        startDate.getTime()
      )
    ) {
      throw new Error(
        "Start date is invalid."
      );
    }

    if (
      Number.isNaN(
        expectedDate.getTime()
      )
    ) {
      throw new Error(
        "Expected completion date is invalid."
      );
    }

    if (
      expectedDate <
      startDate
    ) {
      throw new Error(
        "Expected completion date cannot be before start date."
      );
    }

    const rawMaterials =
      payload.rawMaterials ??
      old.rawMaterials ??
      [];

    const seen =
      new Set();

    for (
      const material of
      rawMaterials
    ) {
      const id =
        idOf(
          material.product
        );

      if (
        !validId(id)
      ) {
        throw new Error(
          "One or more raw materials are invalid."
        );
      }

      if (
        id === productId
      ) {
        throw new Error(
          "Finished product cannot also be used as its own raw material."
        );
      }

      if (
        seen.has(id)
      ) {
        throw new Error(
          "The same raw material cannot be added twice."
        );
      }

      seen.add(id);
    }

    const materialProducts =
      seen.size
        ? await Product.find({
            _id: {
              $in:
                Array.from(
                  seen
                ),
            },
          })
        : [];

    if (
      materialProducts.length !==
      seen.size
    ) {
      throw new Error(
        "One or more raw materials no longer exist."
      );
    }

    const materialMap =
      new Map(
        materialProducts.map(
          (item) => [
            String(
              item._id
            ),
            item,
          ]
        )
      );

    const sanitizedMaterials =
      [];

    for (
      const material of
      rawMaterials
    ) {
      const materialProduct =
        materialMap.get(
          idOf(
            material.product
          )
        );

      if (
        materialProduct.status !==
        "Active"
      ) {
        throw new Error(
          `${materialProduct.name} is inactive.`
        );
      }

      if (
        !productionMaterialTypes.has(
          materialProduct.type
        )
      ) {
        throw new Error(
          `${materialProduct.name} cannot be used as a production raw material.`
        );
      }

      const required =
        number(
          material.requiredQuantity
        );

      const consumed =
        number(
          material.consumedQuantity
        );

      if (
        required < 0
      ) {
        throw new Error(
          `Required quantity for ${materialProduct.name} cannot be negative.`
        );
      }

      if (
        consumed < 0
      ) {
        throw new Error(
          `Consumed quantity for ${materialProduct.name} cannot be negative.`
        );
      }

      if (
        required > 0 &&
        consumed >
          required
      ) {
        throw new Error(
          `Consumed quantity cannot exceed required quantity for ${materialProduct.name}.`
        );
      }

      const unit =
        String(
          material.unit ||
            materialProduct.unit
        ).trim();

      if (
        !getAllowedUnits(
          materialProduct
        ).has(
          unit.toLowerCase()
        )
      ) {
        throw new Error(
          `${unit} is not a valid unit for ${materialProduct.name}.`
        );
      }

      if (previous) {
        const oldMaterial =
          (
            old.rawMaterials ||
            []
          ).find(
            (entry) =>
              idOf(
                entry.product
              ) ===
              String(
                materialProduct._id
              )
          );

        if (
          oldMaterial &&
          number(
            oldMaterial.consumedQuantity
          ) > 0 &&
          String(
            oldMaterial.unit ||
              materialProduct.unit
          ).toLowerCase() !==
            unit.toLowerCase()
        ) {
          throw new Error(
            `Unit for ${materialProduct.name} cannot be changed after consumption has been recorded.`
          );
        }
      }

      sanitizedMaterials.push({
        product:
          materialProduct._id,

        requiredQuantity:
          required,

        consumedQuantity:
          consumed,

        unit,
      });
    }

    const status =
      payload.status ??
      old.status ??
      "Draft";

    const consumedAnything =
      sanitizedMaterials.some(
        (material) =>
          material.consumedQuantity >
          0
      );

    if (
      [
        "Draft",
        "Planned",
      ].includes(status) &&
      (
        consumedAnything ||
        completedQuantity > 0
      )
    ) {
      throw new Error(
        `${status} production cannot contain consumed material or completed output. Change status to In Progress first.`
      );
    }

    if (
      status ===
        "Completed" &&
      completedQuantity !==
        plannedQuantity
    ) {
      throw new Error(
        "Completed production must have completed quantity equal to planned quantity."
      );
    }

    if (
      status ===
        "Partially Completed" &&
      (
        completedQuantity <=
          0 ||
        completedQuantity >=
          plannedQuantity
      )
    ) {
      throw new Error(
        "Partially Completed production must have completed quantity between 1 and planned quantity."
      );
    }

    const actualCompletionDate =
      status ===
        "Completed"
        ? payload.actualCompletionDate ||
          old.actualCompletionDate ||
          new Date()
        : payload.actualCompletionDate ??
          old.actualCompletionDate ??
          null;

    return {
      productionNumber:
        payload.productionNumber ||
        old.productionNumber ||
        buildProductionNumber(),

      product:
        product._id,

      plannedQuantity,

      completedQuantity,

      wastage,

      startDate,

      expectedDate,

      actualCompletionDate,

      manager:
        responsible._id,

      location:
        String(
          payload.location ??
            old.location ??
            "Production Unit 1"
        ).trim(),

      status,

      notes:
        String(
          payload.notes ??
            old.notes ??
            ""
        ).trim(),

      rawMaterials:
        sanitizedMaterials,
    };
  };

const assertCanDeleteStockResource =
  async (
    document,
    referenceType
  ) => {
    const exists =
      await StockTransaction.exists({
        referenceType,
        referenceId:
          document._id,
      });

    if (exists) {
      throw new Error(
        `${referenceType} has already affected inventory and cannot be deleted. Cancel or reverse it instead.`
      );
    }
  };

const beforePurchaseCreate =
  async (
    req,
    payload
  ) =>
    validatePurchasePayload(
      req,
      payload
    );

const beforePurchaseUpdate =
  async (
    req,
    payload,
    previous
  ) =>
    validatePurchasePayload(
      req,
      payload,
      previous
    );

const beforeProductionCreate =
  async (
    req,
    payload
  ) =>
    validateProductionPayload(
      req,
      payload
    );

const beforeProductionUpdate =
  async (
    req,
    payload,
    previous
  ) =>
    validateProductionPayload(
      req,
      payload,
      previous
    );

module.exports = {
  beforePurchaseCreate,
  beforePurchaseUpdate,

  beforeProductionCreate,
  beforeProductionUpdate,

  assertCanDeleteStockResource,
};