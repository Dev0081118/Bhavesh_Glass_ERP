const express =
  require("express");

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const {
  requireRole,
} = require(
  "../middleware/roleMiddleware"
);

const {
  getDashboardSummary,
} = require(
  "../controllers/dashboardController"
);

const {
  getRoleDashboard,
} = require(
  "../controllers/roleDashboardController"
);

const router =
  express.Router();

/*
 * Role-aware dashboard for
 * Admin / Manager / Employee.
 *
 * Super Admin may also call it, but the existing
 * /summary dashboard remains untouched.
 */
router.get(
  "/role-summary",
  protect,
  getRoleDashboard
);

/*
 * Existing Super Admin analytics endpoint.
 */
router.get(
  "/summary",
  protect,
  requireRole(
    "Super Admin"
  ),
  getDashboardSummary
);

module.exports =
  router;