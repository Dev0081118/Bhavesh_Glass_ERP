const express = require(
  "express"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const {
  requireModuleAccess,
} = require(
  "../middleware/moduleMiddleware"
);

const {
  createResourceController,
} = require(
  "../controllers/resourceController"
);

const {
  getSettings,
} = require(
  "../controllers/systemController"
);

const productController =
  require(
    "../controllers/productController"
  );

const inventoryController =
  require(
    "../controllers/inventoryController"
  );

const {
  syncPurchase,
  syncProduction,
  syncSaleBill,
} = require(
  "../services/resourceInventorySync"
);

const {
  Party,
  Purchase,
  Production,
  SaleBill,
  Payment,
  Dispatch,
  LR,
  LedgerEntry,
  Notification,
} = require("../models");

const router =
  express.Router();

router.use(protect);

const captureBillingSnapshot =
  async (
    req,
    payload
  ) => {
    try {
      const settings =
        await getSettings();

      const stamp =
        settings.companyStamp ||
        {};

      return {
        ...payload,

        billingSnapshot: {
          companyStamp: {
            dataUrl:
              stamp.dataUrl ||
              "",

            fileName:
              stamp.fileName ||
              "",

            mimeType:
              stamp.mimeType ||
              "",
          },

          termsAndConditions:
            settings.termsAndConditions ||
            "",

          capturedAt:
            new Date(),
        },
      };
    } catch (error) {
      console.error(
        "captureBillingSnapshot:",
        error.message
      );

      return payload;
    }
  };

/* =========================
   PRODUCT
========================= */

const productRouter =
  express.Router();

productRouter.use(
  requireModuleAccess(
    "product"
  )
);

productRouter.get(
  "/",
  productController.listProducts
);

productRouter.get(
  "/:id",
  productController.getProduct
);

productRouter.post(
  "/",
  productController.createProduct
);

productRouter.patch(
  "/:id",
  productController.updateProduct
);

productRouter.delete(
  "/:id",
  productController.deleteProduct
);

router.use(
  "/products",
  productRouter
);

/* =========================
   INVENTORY
========================= */

const inventoryRouter =
  express.Router();

inventoryRouter.use(
  requireModuleAccess(
    "inventory"
  )
);

inventoryRouter.get(
  "/",
  inventoryController.listInventory
);

inventoryRouter.get(
  "/:id/movements",
  inventoryController.getMovements
);

inventoryRouter.post(
  "/:id/movement",
  inventoryController.moveStock
);

inventoryRouter.post(
  "/:id/adjust",
  inventoryController.adjustInventory
);

inventoryRouter.get(
  "/:id",
  inventoryController.getInventory
);

router.use(
  "/inventory",
  inventoryRouter
);

/* =========================
   GENERIC RESOURCES
========================= */

const mountResource = (
  path,
  moduleName,
  Model,
  options = {}
) => {
  const controller =
    createResourceController(
      Model,
      options
    );

  const resource =
    express.Router();

  resource.use(
    requireModuleAccess(
      moduleName
    )
  );

  resource.get(
    "/",
    controller.list
  );

  resource.get(
    "/:id",
    controller.getOne
  );

  resource.post(
    "/",
    controller.create
  );

  resource.patch(
    "/:id",
    controller.update
  );

  resource.delete(
    "/:id",
    controller.remove
  );

  router.use(
    path,
    resource
  );
};

mountResource(
  "/parties",
  "dashboard",
  Party
);

mountResource(
  "/purchases",
  "purchase",
  Purchase,
  {
    createdBy: true,

    afterCreate:
      syncPurchase,

    afterUpdate:
      syncPurchase,
  }
);

mountResource(
  "/production",
  "production",
  Production,
  {
    afterCreate:
      syncProduction,

    afterUpdate:
      syncProduction,
  }
);

mountResource(
  "/sale-bills",
  "sale_bill",
  SaleBill,
  {
    beforeCreate:
      captureBillingSnapshot,

    afterCreate:
      syncSaleBill,

    afterUpdate:
      syncSaleBill,
  }
);

mountResource(
  "/payments",
  "payment",
  Payment
);

mountResource(
  "/dispatch",
  "dispatch",
  Dispatch
);

mountResource(
  "/lrs",
  "lr",
  LR
);

mountResource(
  "/ledger",
  "ledger",
  LedgerEntry,
  {
    createdBy: true,
    stringReferenceId: true,
  }
);

/* =========================
   NOTIFICATIONS
========================= */

router.get(
  "/notifications",
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          user: req.user._id,
        })
          .populate(
            "product",
            "name sku"
          )
          .sort({
            createdAt: -1,
          })
          .limit(100);

      res.json({
        data:
          notifications,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            "Unable to load notifications.",
        });
    }
  }
);

router.patch(
  "/notifications/:id/read",
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndUpdate(
          {
            _id:
              req.params.id,

            user:
              req.user._id,
          },
          {
            readAt:
              new Date(),
          },
          {
            new: true,
          }
        );

      res.json({
        data:
          notification,
      });
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            "Unable to update notification.",
        });
    }
  }
);

module.exports = router;