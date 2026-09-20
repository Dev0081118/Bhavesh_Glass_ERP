const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  alternatePhone: user.alternatePhone,
  role: user.role,
  department: user.department,
  status: user.status,
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

const register = async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: "Employee",
      department,
    });

    return res.status(201).json({
      message: "User registered successfully.",
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

module.exports = { register, login, getCurrentUser };
