const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  alternatePhone: user.alternatePhone,
  role: user.role,
  department: user.department,
  status: user.status,
  access: user.access || User.defaultAccessForRole(user.role),
});

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const createInitialPassword = (phone, dob) => {
  const phoneDigits = String(phone).replace(/\D/g, "");

  if (phoneDigits.length < 5) {
    return null;
  }

  const date = new Date(dob);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${phoneDigits.slice(-5)}${day}${month}${year}`;
};

const register = async (req, res) => {
  try {
    const { name, email, phone, dob, department } = req.body;

    if (!name || !email || !phone || !dob) {
      return res.status(400).json({ message: "Name, email, phone, and date of birth are required." });
    }

    const initialPassword = createInitialPassword(phone, dob);

    if (!initialPassword) {
      return res.status(400).json({ message: "Phone must contain at least 5 digits and DOB must be valid." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(initialPassword, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      dob: new Date(dob),
      role: "Employee",
      department,
      access: User.defaultAccessForRole("Employee"),
    });

    return res.status(201).json({
      message: "User registered successfully. Initial password is based on the phone number and date of birth.",
      user: publicUser(user),
      token: createToken(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    const isPasswordValid = user && await bcrypt.compare(password, user.password);

    if (!isPasswordValid || user.status !== "Active") {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.role !== "Super Admin") {
      const settings = await SystemSettings.findOne({ key: "global" }).lean();
      if (settings && !settings.isSystemActive) {
        return res.status(503).json({
          code: "SYSTEM_MAINTENANCE",
          message: settings.reason || "The ERP system is temporarily unavailable.",
        });
      }
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      message: "Login successful.",
      user: publicUser(user),
      token: createToken(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in." });
  }
};

const getCurrentUser = async (req, res) => {
  return res.json({ user: publicUser(req.user) });
};

module.exports = { register, login, getCurrentUser, createInitialPassword };
