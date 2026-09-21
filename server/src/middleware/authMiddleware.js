const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");

const protect = async (req, res, next) => {
  try {
    const authorization =
      req.headers.authorization;

    const token =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    if (!token) {
      return res.status(401).json({
        code: "AUTH_REQUIRED",
        message: "Authentication required.",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      payload.userId
    );

    /*
     * IMPORTANT:
     *
     * We check the user's current database status
     * on EVERY authenticated request.
     *
     * Therefore:
     *
     * Active -> can access
     * Inactive -> immediately blocked
     *
     * Even if the user already has a valid JWT.
     */
    if (!user) {
      return res.status(401).json({
        code: "USER_NOT_FOUND",
        message: "User is not authorized.",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        code: "ACCOUNT_INACTIVE",
        message:
          "Your account has been deactivated. Please contact the Super Admin.",
      });
    }

    /*
     * Global ERP Kill Switch.
     *
     * Super Admin bypasses maintenance mode.
     */
    if (user.role !== "Super Admin") {
      const settings =
        await SystemSettings.findOne({
          key: "global",
        }).lean();

      if (
        settings &&
        !settings.isSystemActive
      ) {
        return res.status(503).json({
          code: "SYSTEM_MAINTENANCE",
          message:
            settings.reason ||
            "The ERP system is temporarily unavailable.",
        });
      }
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "authMiddleware error:",
      error
    );

    return res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Invalid or expired token.",
    });
  }
};

module.exports = {
  protect,
};