const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");

const router = express.Router();
router.use(protect, requireRole("Super Admin"));
router.get("/", listStaff);
router.post("/", createStaff);
router.patch("/:userId", updateStaff);
router.delete("/:userId", deleteStaff);
module.exports = router;
