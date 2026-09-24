const express =
  require("express");

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
  requireRole,
} = require(
  "../middleware/roleMiddleware"
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
  getPurchaseLookups,
  createPurchaseSupplier,
  getProductionLookups,
  createProductionFinishedProduct,
} = require(
  "../controllers/purchaseProductionLookupController"
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

router.use(
  protect
);

/* =========================================================
   BILLING SNAPSHOT
========================================================= */

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
            settings
              .termsAndConditions ||
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

/* =========================================================
   PRODUCT
   Shared master data.

   READ:
   anybody with Product module.

   WRITE:
   Manager/Admin/Super Admin.
========================================================= */

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
  requireRole(
    "Super Admin",
    "Admin",
    "Manager"
  ),
  productController.createProduct
);

productRouter.patch(
  "/:id",
  requireRole(
    "Super Admin",
    "Admin",
    "Manager"
  ),
  productController.updateProduct
);

productRouter.delete(
  "/:id",
  requireRole(
    "Super Admin",
    "Admin",
    "Manager"
  ),
  productController.deleteProduct
);

router.use(
  "/products",
  productRouter
);

/* =========================================================
   INVENTORY
   GLOBAL READ for anyone with module access.
   Mutations restricted.
========================================================= */

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
  requireRole(
    "Super Admin",
    "Admin",
    "Manager"
  ),
  inventoryController.moveStock
);

inventoryRouter.post(
  "/:id/adjust",
  requireRole(
    "Super Admin",
    "Admin",
    "Manager"
  ),
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

/* =========================================================
   PURCHASE LOOKUPS
========================================================= */

router.get(
  "/purchases/lookups",

  requireModuleAccess(
    "purchase"
  ),

  getPurchaseLookups
);

router.post(
  "/purchases/suppliers",

  requireModuleAccess(
    "purchase"
  ),

  createPurchaseSupplier
);

/* =========================================================
   PRODUCTION LOOKUPS
========================================================= */

router.get(
  "/production/lookups",

  requireModuleAccess(
    "production"
  ),

  getProductionLookups
);

router.post(
  "/production/finished-products",

  requireModuleAccess(
    "production"
  ),

  createProductionFinishedProduct
);

/* =========================================================
   GENERIC RESOURCE BUILDER
========================================================= */

const mountResource =
  (
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

    resource.post(
      "/",
      controller.create
    );

    resource.get(
      "/:id",
      controller.getOne
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

/* =========================================================
   PARTY MASTER DATA

   Party remains shared because Purchase/Sale/Payment/LR
   currently reference Party rather than the newer Customer model.
========================================================= */

mountResource(
  "/parties",
  "dashboard",
  Party,
  {
    scopePolicy: {
      globalRead:
        true,
    },

    writeRoles: [
      "Super Admin",
      "Admin",
      "Manager",
    ],
  }
);

/* =========================================================
   PURCHASE
========================================================= */

mountResource(
  "/purchases",
  "purchase",
  Purchase,
  {
    createdBy:
      true,

    scopePolicy: {
      ownershipFields: [
        "createdBy",
        "assignedTo",
      ],

      assignmentFields: [
        "assignedTo",
      ],

      autoAssignManagerToSelf:
        true,
    },

    populate: [
      {
        path:
          "supplier",

        select:
          "name type email phone alternatePhone address city state gstNumber status",
      },

      {
        path:
          "assignedTo",

        select:
          "name email role department status",
      },

      {
        path:
          "createdBy",

        select:
          "name email role department",
      },

      {
        path:
          "items.product",

        select:
          "name sku type category subCategory unit stockUnit purchasePrice sellingPrice minimumStockLevel location assignedTo status",

        populate: {
          path:
            "assignedTo",

          select:
            "name email role department status",
        },
      },
    ],

    afterCreate:
      syncPurchase,

    afterUpdate:
      syncPurchase,
  }
);

/* =========================================================
   PRODUCTION
========================================================= */

mountResource(
  "/production",
  "production",
  Production,
  {
    createdBy:
      true,

    scopePolicy: {
      ownershipFields: [
        "createdBy",
        "manager",
      ],

      assignmentFields: [
        "manager",
      ],

      autoAssignManagerToSelf:
        true,
    },

    populate: [
      {
        path:
          "product",

        select:
          "name sku type category subCategory unit stockUnit location status",
      },

      {
        path:
          "manager",

        select:
          "name email role department status",
      },

      {
        path:
          "createdBy",

        select:
          "name email role department",
      },

      {
        path:
          "rawMaterials.product",

        select:
          "name sku type category unit stockUnit location minimumStockLevel status",
      },
    ],

    afterCreate:
      syncProduction,

    afterUpdate:
      syncProduction,
  }
);

/* =========================================================
   SALE BILL
========================================================= */

mountResource(
  "/sale-bills",
  "sale_bill",
  SaleBill,
  {
    createdBy:
      true,

    scopePolicy: {
      ownershipFields: [
        "createdBy",
        "manager",
      ],

      assignmentFields: [
        "manager",
      ],

      autoAssignManagerToSelf:
        true,
    },

    populate: [
      {
        path:
          "customer",

        select:
          "name type phone city address status",
      },

      {
        path:
          "manager",

        select:
          "name email role department status",
      },

      {
        path:
          "createdBy",

        select:
          "name email role department",
      },

      {
        path:
          "items.product",

        select:
          "name sku unit stockUnit sellingPrice gst status",
      },
    ],

    beforeCreate:
      captureBillingSnapshot,

    afterCreate:
      syncSaleBill,

    afterUpdate:
      syncSaleBill,
  }
);

/* =========================================================
   PAYMENT
========================================================= */

mountResource(
  "/payments",
  "payment",
  Payment,
  {
    createdBy:
      true,

    scopePolicy: {
      ownershipFields: [
        "createdBy",
        "receivedBy",
      ],

      assignmentFields: [
        "receivedBy",
      ],

      autoAssignManagerToSelf:
        true,
    },

    populate: [
      {
        path:
          "saleBill",
      },

      {
        path:
          "customer",

        select:
          "name type phone city",
      },

      {
        path:
          "receivedBy",

        select:
          "name role department",
      },

      {
        path:
          "createdBy",

        select:
          "name role department",
      },
    ],
  }
);

/* =========================================================
   DISPATCH
========================================================= */

mountResource(
  "/dispatch",
  "dispatch",
  Dispatch,
  {
    createdBy:
      true,

    scopePolicy: {
      ownershipFields: [
        "createdBy",
        "manager",
      ],

      assignmentFields: [
        "manager",
      ],

      autoAssignManagerToSelf:
        true,
    },

    populate: [
      {
        path:
          "saleBill",
      },

      {
        path:
          "customer",

        select:
          "name phone city address",
      },

      {
        path:
          "manager",

        select:
          "name role department",
      },

      {
        path:
          "createdBy",

        select:
          "name role department",
      },

      {
        path:
          "items.product",

        select:
          "name sku unit stockUnit",
      },
    ],
  }
);

/* =========================================================
   LR
========================================================= */

mountResource(
  "/lrs",
  "lr",
  LR,
  {
    createdBy:
      true,

    scopePolicy: {
      ownershipFields: [
        "createdBy",
        "assignedTo",
      ],

      assignmentFields: [
        "assignedTo",
      ],

      autoAssignManagerToSelf:
        true,
    },

    populate: [
      {
        path:
          "dispatch",
      },

      {
        path:
          "saleBill",
      },

      {
        path:
          "customer",

        select:
          "name phone city address",
      },

      {
        path:
          "assignedTo",

        select:
          "name role department",
      },

      {
        path:
          "createdBy",

        select:
          "name role department",
      },
    ],
  }
);

/* =========================================================
   LEDGER
========================================================= */

mountResource(
  "/ledger",
  "ledger",
  LedgerEntry,
  {
    createdBy:
      true,

    stringReferenceId:
      true,

    scopePolicy: {
      ownershipFields: [
        "createdBy",
      ],
    },

    populate: [
      {
        path:
          "party",

        select:
          "name type phone city",
      },

      {
        path:
          "createdBy",

        select:
          "name role department",
      },
    ],
  }
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

router.get(
  "/notifications",
  async (
    req,
    res
  ) => {
    try {
      const notifications =
        await Notification.find({
          user:
            req.user._id,
        })
          .populate(
            "product",
            "name sku"
          )
          .sort({
            createdAt:
              -1,
          })
          .limit(
            100
          );

      return res.json({
        data:
          notifications,
      });
    } catch (error) {
      return res
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
  async (
    req,
    res
  ) => {
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
            new:
              true,
          }
        );

      if (!notification) {
        return res
          .status(404)
          .json({
            message:
              "Notification not found.",
          });
      }

      return res.json({
        data:
          notification,
      });
    } catch (error) {
      return res
        .status(400)
        .json({
          message:
            error.message ||
            "Unable to update notification.",
        });
    }
  }
);

module.exports =
  router;