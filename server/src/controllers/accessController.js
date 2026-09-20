const User = require("../models/User");

const publicAccess = (user) => ({
  userId: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  department: user.department,
  status: user.status,
  role: user.role,
  access: user.access || User.defaultAccessForRole(user.role),
});

const listUsers = async (req, res) => {
  const users = await User.find({ role: { $ne: "Super Admin" } })
    .select("name email phone role department status access")
    .sort({ name: 1 });

  return res.json({ users: users.map(publicAccess) });
};

const updateUserAccess = async (req, res) => {
  const { modules, profile } = req.body;
  const user = await User.findOne({ _id: req.params.userId, role: { $ne: "Super Admin" } });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (!user.access) {
    user.access = User.defaultAccessForRole(user.role);
  }

  if (modules && typeof modules === "object" && !Array.isArray(modules)) {
    user.access.modules = new Map(
      Object.entries(modules).map(([module, enabled]) => [module, Boolean(enabled)])
    );
  }

  if (profile && typeof profile === "object") {
    user.access.profile = {
      ...user.access.profile?.toObject?.(),
      ...Object.fromEntries(
        ["view", "edit", "resetPassword"]
          .filter((key) => typeof profile[key] === "boolean")
          .map((key) => [key, profile[key]])
      ),
    };
  }

  await user.save();
  return res.json({ message: "Access updated successfully.", ...publicAccess(user) });
};

module.exports = { listUsers, updateUserAccess };