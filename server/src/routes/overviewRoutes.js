const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { getOverview } = require("../controllers/overviewController");

const router = express.Router();
router.get("/", protect, requireRole("Super Admin"), getOverview);
module.exports = router;
