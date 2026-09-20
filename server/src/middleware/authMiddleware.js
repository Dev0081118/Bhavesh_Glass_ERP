const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");

const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || user.status !== "Active") {
      return res.status(401).json({ message: "User is not authorized." });
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = { protect };
