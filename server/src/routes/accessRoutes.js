const express = require("express");
const { listUsers, updateUserAccess } = require("../controllers/accessController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, requireRole("Super Admin"));
router.get("/users", listUsers);
router.patch("/users/:userId", updateUserAccess);

module.exports = router;