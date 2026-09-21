const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/summary", protect, requireRole("Super Admin"), getDashboardSummary);

module.exports = router;
