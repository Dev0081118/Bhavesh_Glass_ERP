const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getSystemStatus,
  updateKillSwitch,
  getSystemSettings,
  updateSystemSettings,
} = require("../controllers/systemController");

const router = express.Router();
router.get("/status", getSystemStatus);
router.patch("/kill-switch", protect, requireRole("Super Admin"), updateKillSwitch);

/*
 * Global system settings (theme / company stamp / terms & conditions).
 * Reading requires any authenticated user, updating is Super Admin only.
 */
router.get("/settings", protect, getSystemSettings);
router.patch("/settings", protect, requireRole("Super Admin"), updateSystemSettings);

module.exports = router;
