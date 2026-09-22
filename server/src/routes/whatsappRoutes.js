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
  listWhatsAppCustomers,
  listWhatsAppProducts,
  listShares,
  shareProducts,
} = require(
  "../controllers/whatsappController"
);

const router = express.Router();

router.use(protect);

router.use(
  requireModuleAccess(
    "whatsapp_ai"
  )
);

router.get(
  "/customers",
  listWhatsAppCustomers
);

router.get(
  "/products",
  listWhatsAppProducts
);

router.get(
  "/shares",
  listShares
);

router.post(
  "/share-products",
  shareProducts
);

module.exports = router;