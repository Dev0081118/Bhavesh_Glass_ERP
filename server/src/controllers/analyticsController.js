const {
  Product,
  Inventory,
  Purchase,
  Production,
  SaleBill,
  Payment,
  Dispatch,
  LR,
  Activity,
} = require("../models");

const getAnalytics = async (req, res) => {
  const [products, inventoryItems, purchases, productions, saleBills, payments, dispatches, lrs, pendingPayments, pendingPurchases, recentActivity] = await Promise.all([
    Product.countDocuments({ status: "Active" }),
    Inventory.countDocuments(),
    Purchase.countDocuments(),
    Production.countDocuments(),
    SaleBill.countDocuments(),
    Payment.countDocuments(),
    Dispatch.countDocuments(),
    LR.countDocuments(),
    Payment.countDocuments({ status: "Pending" }),
    Purchase.countDocuments({ status: { $in: ["Draft", "Pending", "Ordered"] } }),
    Activity.find().populate("actor", "name").sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  return res.json({
    metrics: {
      products,
      inventoryItems,
      purchases,
      productions,
      saleBills,
      payments,
      dispatches,
      lrs,
      pending: pendingPayments + pendingPurchases,
    },
    activity: recentActivity.map((entry) => ({
      id: entry._id,
      description: entry.description,
      actor: entry.actor?.name || "System",
      createdAt: entry.createdAt,
    })),
  });
};

module.exports = { getAnalytics };
