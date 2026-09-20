const bcrypt = require("bcrypt");
const User = require("../models/User");
const { createInitialPassword } = require("./authController");
const { recordActivity } = require("../utils/activity");

const publicStaff = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  alternatePhone: user.alternatePhone,
  dob: user.dob,
  address: user.address,
  role: user.role,
  department: user.department,
  managerId: user.manager,
  managerName: user.manager?.name || null,
  status: user.status,
  access: user.access || User.defaultAccessForRole(user.role),
});

const listStaff = async (req, res) => {
  const staff = await User.find({ role: { $ne: "Super Admin" } })
    .populate("manager", "name")
    .sort({ createdAt: -1 });
  return res.json({ staff: staff.map(publicStaff) });
};

const createStaff = async (req, res) => {
  const { name, email, phone, dob, address, role, department, managerId } = req.body;
  if (!name || !email || !phone || !dob || !role) {
    return res.status(400).json({ message: "Name, email, phone, DOB, and role are required." });
  }

  const password = createInitialPassword(phone, dob);
  if (!password) {
    return res.status(400).json({ message: "Phone must contain 5 digits and DOB must be valid." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: "A user with this email already exists." });
  }

  const staff = await User.create({
    name,
    email: normalizedEmail,
    phone,
    dob: new Date(dob),
    address,
    role,
    department: role === "Admin" ? undefined : department,
    manager: managerId || null,
    password: await bcrypt.hash(password, 12),
    access: User.defaultAccessForRole(role),
  });

  await recordActivity({
    action: "STAFF_CREATED",
    description: `Created ${staff.role} ${staff.name}.`,
    actor: req.user._id,
    target: staff._id,
  });

  return res.status(201).json({ staff: publicStaff(staff), initialPassword: password });
};

const updateStaff = async (req, res) => {
  const updates = { ...req.body };
  delete updates.password;
  delete updates.email;
  if (updates.role === "Admin") updates.department = undefined;
  const staff = await User.findOneAndUpdate(
    { _id: req.params.userId, role: { $ne: "Super Admin" } },
    updates,
    { new: true, runValidators: true }
  ).populate("manager", "name");

  if (!staff) return res.status(404).json({ message: "Staff member not found." });
  await recordActivity({
    action: "STAFF_UPDATED",
    description: `Updated staff profile for ${staff.name}.`,
    actor: req.user._id,
    target: staff._id,
  });
  return res.json({ staff: publicStaff(staff) });
};

const deleteStaff = async (req, res) => {
  const staff = await User.findOneAndDelete({ _id: req.params.userId, role: { $ne: "Super Admin" } });
  if (!staff) return res.status(404).json({ message: "Staff member not found." });
  await User.updateMany({ manager: staff._id }, { manager: null });
  await recordActivity({
    action: "STAFF_DELETED",
    description: `Deleted staff profile for ${staff.name}.`,
    actor: req.user._id,
    metadata: { deletedUserId: staff._id },
  });
  return res.json({ message: "Staff member deleted successfully." });
};

module.exports = { listStaff, createStaff, updateStaff, deleteStaff };
