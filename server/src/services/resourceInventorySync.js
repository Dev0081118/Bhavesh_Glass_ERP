const {
  Product,
} = require("../models");

const {
  applyStockMovement,
  applyStockMovementsSafely,
  convertToStockUnit,
  getProduct,
  getStockUnit,
} = require(
  "./inventoryService"
);

const idOf = (
  value
) =>
  String(
    value?._id ||
      value ||
      ""
  );

const isPurchaseReceived =
  (status) =>
    [
      "Partially Received",
      "Received",
    ].includes(
      status
    );

/*
 * On Hold still represents material/output that was
 * already physically consumed/created.
 */
const isProductionStockActive =
  (status) =>
    [
      "In Progress",
      "On Hold",
      "Partially Completed",
      "Completed",
    ].includes(
      status
    );

const isSaleConfirmed =
  (status) =>
    [
      "Confirmed",
      "Partially Paid",
      "Paid",
    ].includes(
      status
    );

const mapByProduct =
  (
    items = []
  ) => {
    const map =
      new Map();

    items.forEach(
      (item) => {
        const id =
          idOf(
            item.product
          );

        if (id) {
          map.set(
            id,
            item
          );
        }
      }
    );

    return map;
  };

const syncPurchaseAssignments =
  async (
    current
  ) => {
    if (
      !current.assignedTo
    ) {
      return;
    }

    const productIds =
      (
        current.items ||
        []
      ).map(
        (item) =>
          item.product?._id ||
          item.product
      );

    if (
      productIds.length ===
      0
    ) {
      return;
    }

    /*
     * Only fill missing responsibility.
     * Never overwrite an existing Product.assignedTo.
     */
    await Product.updateMany(
      {
        _id: {
          $in:
            productIds,
        },

        assignedTo:
          null,
      },
      {
        $set: {
          assignedTo:
            current.assignedTo,
        },
      }
    );
  };

const syncPurchase =
  async (
    req,
    current,
    previous
  ) => {
    await syncPurchaseAssignments(
      current
    );

    const currentActive =
      isPurchaseReceived(
        current.status
      );

    const previousActive =
      previous
        ? isPurchaseReceived(
            previous.status
          )
        : false;

    const currentItems =
      mapByProduct(
        current.items ||
          []
      );

    const oldItems =
      mapByProduct(
        previous?.items ||
          []
      );

    const productIds =
      new Set([
        ...currentItems.keys(),
        ...oldItems.keys(),
      ]);

    const movements = [];

    for (
      const productId of
      productIds
    ) {
      const currentItem =
        currentItems.get(
          productId
        );

      const oldItem =
        oldItems.get(
          productId
        );

      const currentReceived =
        currentActive &&
        currentItem
          ? Number(
              currentItem.receivedQuantity ||
                0
            )
          : 0;

      const oldReceived =
        previousActive &&
        oldItem
          ? Number(
              oldItem.receivedQuantity ||
                0
            )
          : 0;

      const difference =
        currentReceived -
        oldReceived;

      if (
        difference > 0
      ) {
        movements.push({
          productId,

          type:
            "IN",

          source:
            "PURCHASE",

          quantity:
            difference,

          unit:
            currentItem.unit,

          referenceType:
            "Purchase",

          referenceId:
            current._id,

          reason:
            "Purchase quantity received",

          createdBy:
            req.user?._id,
        });
      }

      if (
        difference < 0
      ) {
        movements.push({
          productId,

          type:
            "OUT",

          source:
            "PURCHASE_REVERSAL",

          quantity:
            Math.abs(
              difference
            ),

          unit:
            oldItem?.unit ||
            currentItem?.unit,

          referenceType:
            "Purchase",

          referenceId:
            current._id,

          reason:
            current.status ===
            "Cancelled"
              ? "Purchase cancelled - received stock reversed"
              : "Purchase received quantity reduced",

          createdBy:
            req.user?._id,
        });
      }
    }

    await applyStockMovementsSafely(
      movements
    );
  };

const syncProduction =
  async (
    req,
    current,
    previous
  ) => {
    const currentActive =
      isProductionStockActive(
        current.status
      );

    const previousActive =
      previous
        ? isProductionStockActive(
            previous.status
          )
        : false;

    const currentMaterials =
      mapByProduct(
        current.rawMaterials ||
          []
      );

    const oldMaterials =
      mapByProduct(
        previous?.rawMaterials ||
          []
      );

    const materialIds =
      new Set([
        ...currentMaterials.keys(),
        ...oldMaterials.keys(),
      ]);

    const movements = [];

    /*
     * Raw material consumption.
     */
    for (
      const productId of
      materialIds
    ) {
      const currentMaterial =
        currentMaterials.get(
          productId
        );

      const oldMaterial =
        oldMaterials.get(
          productId
        );

      const currentConsumed =
        currentActive &&
        currentMaterial
          ? Number(
              currentMaterial.consumedQuantity ||
                0
            )
          : 0;

      const oldConsumed =
        previousActive &&
        oldMaterial
          ? Number(
              oldMaterial.consumedQuantity ||
                0
            )
          : 0;

      const difference =
        currentConsumed -
        oldConsumed;

      if (
        difference > 0
      ) {
        movements.push({
          productId,

          type:
            "OUT",

          source:
            "PRODUCTION_CONSUMPTION",

          quantity:
            difference,

          unit:
            currentMaterial.unit,

          referenceType:
            "Production",

          referenceId:
            current._id,

          reason:
            "Raw material consumed in production",

          createdBy:
            req.user?._id,
        });
      }

      if (
        difference < 0
      ) {
        movements.push({
          productId,

          type:
            "IN",

          source:
            "PRODUCTION_CONSUMPTION_REVERSAL",

          quantity:
            Math.abs(
              difference
            ),

          unit:
            oldMaterial?.unit ||
            currentMaterial?.unit,

          referenceType:
            "Production",

          referenceId:
            current._id,

          reason:
            current.status ===
            "Cancelled"
              ? "Production cancelled - raw material returned"
              : "Production material consumption reduced",

          createdBy:
            req.user?._id,
        });
      }
    }

    /*
     * Finished-product output.
     */
    const currentOutputProduct =
      idOf(
        current.product
      );

    const oldOutputProduct =
      idOf(
        previous?.product
      );

    const currentCompleted =
      currentActive
        ? Number(
            current.completedQuantity ||
              0
          )
        : 0;

    const oldCompleted =
      previousActive
        ? Number(
            previous?.completedQuantity ||
              0
          )
        : 0;

    if (
      previous &&
      oldOutputProduct &&
      oldOutputProduct !==
        currentOutputProduct &&
      oldCompleted > 0
    ) {
      movements.push({
        productId:
          oldOutputProduct,

        type:
          "OUT",

        source:
          "PRODUCTION_OUTPUT_REVERSAL",

        quantity:
          oldCompleted,

        referenceType:
          "Production",

        referenceId:
          current._id,

        reason:
          "Previous production output reversed",

        createdBy:
          req.user?._id,

        location:
          previous.location,
      });

      if (
        currentCompleted >
        0
      ) {
        movements.push({
          productId:
            currentOutputProduct,

          type:
            "IN",

          source:
            "PRODUCTION_OUTPUT",

          quantity:
            currentCompleted,

          referenceType:
            "Production",

          referenceId:
            current._id,

          reason:
            "Finished product added from production",

          createdBy:
            req.user?._id,

          location:
            current.location,
        });
      }
    } else {
      const difference =
        currentCompleted -
        oldCompleted;

      if (
        difference > 0
      ) {
        movements.push({
          productId:
            currentOutputProduct,

          type:
            "IN",

          source:
            "PRODUCTION_OUTPUT",

          quantity:
            difference,

          referenceType:
            "Production",

          referenceId:
            current._id,

          reason:
            "Finished product added from production",

          createdBy:
            req.user?._id,

          location:
            current.location,
        });
      }

      if (
        difference < 0
      ) {
        movements.push({
          productId:
            oldOutputProduct ||
            currentOutputProduct,

          type:
            "OUT",

          source:
            "PRODUCTION_OUTPUT_REVERSAL",

          quantity:
            Math.abs(
              difference
            ),

          referenceType:
            "Production",

          referenceId:
            current._id,

          reason:
            current.status ===
            "Cancelled"
              ? "Production cancelled - finished output reversed"
              : "Completed production quantity reduced",

          createdBy:
            req.user?._id,

          location:
            previous?.location ||
            current.location,
        });
      }
    }

    await applyStockMovementsSafely(
      movements
    );
  };

/*
 * Existing Sale Bill synchronization.
 */
const syncSaleBill =
  async (
    req,
    current,
    previous
  ) => {
    const currentActive =
      isSaleConfirmed(
        current.status
      );

    const previousActive =
      previous
        ? isSaleConfirmed(
            previous.status
          )
        : false;

    const oldItems =
      mapByProduct(
        previous?.items ||
          []
      );

    if (
      previousActive &&
      current.status ===
        "Cancelled"
    ) {
      for (
        const oldItem of
        previous.items
      ) {
        await applyStockMovement({
          productId:
            oldItem.product?._id ||
            oldItem.product,

          type:
            "IN",

          source:
            "SALE_REVERSAL",

          quantity:
            Number(
              oldItem.quantity
            ),

          unit:
            oldItem.unit,

          referenceType:
            "SaleBill",

          referenceId:
            current._id,

          reason:
            "Sale bill cancelled",

          createdBy:
            req.user?._id,
        });
      }

      return;
    }

    if (!currentActive) {
      return;
    }

    for (
      const item of
      current.items
    ) {
      const productId =
        item.product?._id ||
        item.product;

      const product =
        await getProduct(
          productId
        );

      const currentStock =
        convertToStockUnit(
          product,
          Number(
            item.quantity
          ),
          item.unit
        );

      const old =
        oldItems.get(
          String(
            productId
          )
        );

      const oldStock =
        previousActive &&
        old
          ? convertToStockUnit(
              product,
              Number(
                old.quantity
              ),
              old.unit
            )
          : 0;

      const difference =
        currentStock -
        oldStock;

      const stockUnit =
        getStockUnit(
          product
        );

      if (
        difference > 0
      ) {
        await applyStockMovement({
          productId,

          type:
            "OUT",

          source:
            "SALE",

          quantity:
            difference,

          unit:
            stockUnit,

          referenceType:
            "SaleBill",

          referenceId:
            current._id,

          reason:
            "Sale bill confirmed",

          createdBy:
            req.user?._id,
        });
      }

      if (
        difference < 0
      ) {
        await applyStockMovement({
          productId,

          type:
            "IN",

          source:
            "SALE_REVERSAL",

          quantity:
            Math.abs(
              difference
            ),

          unit:
            stockUnit,

          referenceType:
            "SaleBill",

          referenceId:
            current._id,

          reason:
            "Sale quantity reduced",

          createdBy:
            req.user?._id,
        });
      }
    }
  };

module.exports = {
  syncPurchase,
  syncProduction,
  syncSaleBill,
};