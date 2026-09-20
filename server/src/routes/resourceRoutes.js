const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireModuleAccess } = require("../middleware/moduleMiddleware");
const { createResourceController } = require("../controllers/resourceController");
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
mountResource("/sale-bills", "sale_bill", SaleBill);
mountResource("/payments", "payment", Payment);
mountResource("/dispatch", "dispatch", Dispatch);
mountResource("/lrs", "lr", LR);
mountResource("/ledger", "ledger", LedgerEntry, { createdBy: true, stringReferenceId: true });

module.exports = router;
