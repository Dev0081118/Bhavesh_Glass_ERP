const express = require("express");

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
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listAssignableStaff,
} = require(
  "../controllers/customerController"
);

const router = express.Router();

router.use(protect);

router.use(
  requireModuleAccess("customer")
);

router.get(
  "/assignable-staff",
  listAssignableStaff
);

router.get(
  "/",
  listCustomers
);

router.post(
  "/",
  createCustomer
);

router.get(
  "/:id",
  getCustomer
);

router.patch(
  "/:id",
  updateCustomer
);

router.delete(
  "/:id",
  deleteCustomer
);

module.exports = router;