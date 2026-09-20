const { User, Purchase, Payment, Activity } = require("../models");

const getOverview = async (req, res) => {
  const [totalStaff, totalAdmins, totalManagers, totalEmployees, modules, activeUsers, pendingPurchases, pendingPayments, activities] = await Promise.all([
    User.countDocuments({ role: { $ne: "Super Admin" } }),
    User.countDocuments({ role: "Admin" }),
    User.countDocuments({ role: "Manager" }),
    User.countDocuments({ role: "Employee" }),
    Promise.resolve(12),
    User.countDocuments({ status: "Active" }),
    Purchase.countDocuments({ status: { $in: ["Draft", "Pending", "Ordered"] } }),
    Payment.countDocuments({ status: "Pending" }),
    Activity.find()
      .populate("actor", "name")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return res.json({
    stats: { totalStaff, totalAdmins, totalManagers, totalEmployees },
    system: { modules, activeUsers, departments: 5, pending: pendingPurchases + pendingPayments },
    activities: activities.map((activity) => ({
      id: activity._id,
      title: activity.action,
      user: activity.actor?.name || "System",
      description: activity.description,
      time: activity.createdAt,
    })),
  });
};

module.exports = { getOverview };
