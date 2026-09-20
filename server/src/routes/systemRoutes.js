const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { getSystemStatus, updateKillSwitch } = require("../controllers/systemController");

const router = express.Router();
router.get("/status", getSystemStatus);
router.patch("/kill-switch", protect, requireRole("Super Admin"), updateKillSwitch);
module.exports = router;
