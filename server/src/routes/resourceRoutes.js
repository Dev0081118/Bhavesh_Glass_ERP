const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireModuleAccess } = require("../middleware/moduleMiddleware");
const { createResourceController } = require("../controllers/resourceController");
const { getSettings } = require("../controllers/systemController");
const {
  Party,
  Product,
  Inventory,
  Purchase,
  Production,
  SaleBill,
  Payment,
  Dispatch,
  LR,
  LedgerEntry,
} = require("../models");

const router = express.Router();
router.use(protect);

/*
 * Captures the current company stamp and default terms & conditions
 * from the global System Settings onto every NEW sale bill.
 *
 * Existing bills keep their original snapshot because this hook only
 * runs on creation (never on update).
 */
const captureBillingSnapshot = async (req, payload) => {
  try {
    const settings = await getSettings();
    const stamp = settings.companyStamp || {};

    return {
      ...payload,
      billingSnapshot: {
        companyStamp: {
          dataUrl: stamp.dataUrl || "",
          fileName: stamp.fileName || "",
          mimeType: stamp.mimeType || "",
        },
        termsAndConditions: settings.termsAndConditions || "",
        capturedAt: new Date(),
      },
    };
  } catch (error) {
    /* Snapshot must never block bill creation. */
    console.error("captureBillingSnapshot error:", error.message);
    return payload;
  }
};

const mountResource = (path, moduleName, Model, options = {}) => {
  const controller = createResourceController(Model, options);
  const resource = express.Router();
  resource.use(requireModuleAccess(moduleName));
  resource.get("/", controller.list);
  resource.get("/:id", controller.getOne);
  resource.post("/", controller.create);
  resource.patch("/:id", controller.update);
  resource.delete("/:id", controller.remove);
  router.use(path, resource);
};

mountResource("/parties", "dashboard", Party);
mountResource("/products", "product", Product);
mountResource("/inventory", "inventory", Inventory, { populate: ["product"] });
mountResource("/purchases", "purchase", Purchase, { createdBy: true });
mountResource("/production", "production", Production);
mountResource("/sale-bills", "sale_bill", SaleBill, { beforeCreate: captureBillingSnapshot });
mountResource("/payments", "payment", Payment);
mountResource("/dispatch", "dispatch", Dispatch);
mountResource("/lrs", "lr", LR);
mountResource("/ledger", "ledger", LedgerEntry, { createdBy: true, stringReferenceId: true });

module.exports = router;
