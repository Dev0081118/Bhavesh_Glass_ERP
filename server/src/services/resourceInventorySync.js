const {
  applyStockMovement,
  convertToPrimary,
  getProduct,
} = require(
  "./inventoryService"
);

const isPurchaseReceived =
  (status) =>
    [
      "Partially Received",
      "Received",
    ].includes(status);

const isProductionActive =
  (status) =>
    [
      "In Progress",
      "Partially Completed",
      "Completed",
    ].includes(status);

const isSaleConfirmed =
  (status) =>
    [
      "Confirmed",
      "Partially Paid",
      "Paid",
    ].includes(status);

const mapByProduct = (
  items = []
) => {
  const map = new Map();

  items.forEach((item) => {
    const id = String(
      item.product?._id ||
        item.product
    );

    map.set(id, item);
  });

  return map;
};

const syncPurchase =
  async (
    req,
    current,
    previous
  ) => {
    if (
      !isPurchaseReceived(
        current.status
      )
    ) {
      return;
    }

    const oldItems =
      mapByProduct(
        previous?.items || []
      );

    for (
      const item of
      current.items
    ) {
      const productId =
        item.product?._id ||
        item.product;

      const old =
        oldItems.get(
          String(productId)
        );

      const oldReceived =
        previous &&
        isPurchaseReceived(
          previous.status
        )
          ? Number(
              old?.receivedQuantity ||
                0
            )
          : 0;

      const currentReceived =
        Number(
          item.receivedQuantity ||
            0
        );

      const difference =
        currentReceived -
        oldReceived;

      if (
        difference > 0
      ) {
        await applyStockMovement(
          {
            productId,

            type: "IN",

            source:
              "PURCHASE",

            quantity:
              difference,

            referenceType:
              "Purchase",

            referenceId:
              current._id,

            reason:
              "Purchase quantity received",

            createdBy:
              req.user?._id,
          }
        );
      }
    }
  };

const syncProduction =
  async (
    req,
    current,
    previous
  ) => {
    if (
      !isProductionActive(
        current.status
      )
    ) {
      return;
    }

    const oldMaterials =
      mapByProduct(
        previous?.rawMaterials ||
          []
      );

    for (
      const material of
      current.rawMaterials || []
    ) {
      const productId =
        material.product?._id ||
        material.product;

      const old =
        oldMaterials.get(
          String(productId)
        );

      const oldConsumed =
        previous &&
        isProductionActive(
          previous.status
        )
          ? Number(
              old?.consumedQuantity ||
                0
            )
          : 0;

      const consumed =
        Number(
          material.consumedQuantity ||
            0
        );

      const difference =
        consumed -
        oldConsumed;

      if (
        difference > 0
      ) {
        await applyStockMovement(
          {
            productId,

            type: "OUT",

            source:
              "PRODUCTION_CONSUMPTION",

            quantity:
              difference,

            unit:
              material.unit,

            referenceType:
              "Production",

            referenceId:
              current._id,

            reason:
              "Raw material consumed in production",

            createdBy:
              req.user?._id,
          }
        );
      }
    }

    const oldCompleted =
      previous &&
      isProductionActive(
        previous.status
      )
        ? Number(
            previous.completedQuantity ||
              0
          )
        : 0;

    const completed =
      Number(
        current.completedQuantity ||
          0
      );

    const outputDifference =
      completed -
      oldCompleted;

    if (
      outputDifference > 0
    ) {
      await applyStockMovement(
        {
          productId:
            current.product?._id ||
            current.product,

          type: "IN",

          source:
            "PRODUCTION_OUTPUT",

          quantity:
            outputDifference,

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
        }
      );
    }
  };

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
        previous?.items || []
      );

    /*
     * Bill cancelled after previously
     * affecting stock.
     */
    if (
      previousActive &&
      current.status ===
        "Cancelled"
    ) {
      for (
        const oldItem of
        previous.items
      ) {
        await applyStockMovement(
          {
            productId:
              oldItem.product?._id ||
              oldItem.product,

            type: "IN",

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
          }
        );
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

      const currentPrimary =
        convertToPrimary(
          product,
          Number(item.quantity),
          item.unit
        );

      const old =
        oldItems.get(
          String(productId)
        );

      const oldPrimary =
        previousActive &&
        old
          ? convertToPrimary(
              product,
              Number(
                old.quantity
              ),
              old.unit
            )
          : 0;

      const difference =
        currentPrimary -
        oldPrimary;

      if (
        difference > 0
      ) {
        await applyStockMovement(
          {
            productId,

            type: "OUT",

            source: "SALE",

            quantity:
              difference,

            unit:
              product.unit,

            referenceType:
              "SaleBill",

            referenceId:
              current._id,

            reason:
              "Sale bill confirmed",

            createdBy:
              req.user?._id,
          }
        );
      }

      if (
        difference < 0
      ) {
        await applyStockMovement(
          {
            productId,

            type: "IN",

            source:
              "SALE_REVERSAL",

            quantity:
              Math.abs(
                difference
              ),

            unit:
              product.unit,

            referenceType:
              "SaleBill",

            referenceId:
              current._id,

            reason:
              "Sale quantity reduced",

            createdBy:
              req.user?._id,
          }
        );
      }
    }
  };

module.exports = {
  syncPurchase,
  syncProduction,
  syncSaleBill,
};