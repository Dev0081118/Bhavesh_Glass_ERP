const jwt = require("jsonwebtoken");

const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");

const {
  createInitialPassword,
  hashPassword,
  comparePassword,
  validatePassword,
} = require("../utils/password");

const {
  recordActivity,
} = require("../utils/activity");

const publicUser = (user) => ({
  id: user._id,

  name: user.name,

  email: user.email,

  phone: user.phone,

  alternatePhone: user.alternatePhone,

  role: user.role,

  department: user.department,

  managerId:
    user.manager?._id ||
    user.manager ||
    null,

  managerName:
    user.manager &&
    typeof user.manager === "object"
      ? user.manager.name || null
      : null,

  status: user.status,

  access:
    user.access ||
    User.defaultAccessForRole(
      user.role
    ),
});

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      userId:
        user._id.toString(),

      role:
        user.role,
    },

    process.env.JWT_SECRET,

    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "1d",
    }
  );
};

const register = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      phone,
      dob,
      department,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !dob
    ) {
      return res
        .status(400)
        .json({
          message:
            "Name, email, phone, and date of birth are required.",
        });
    }

    const initialPassword =
      createInitialPassword(
        phone,
        dob
      );

    if (!initialPassword) {
      return res
        .status(400)
        .json({
          message:
            "Phone must contain at least 5 digits and DOB must be valid.",
        });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const existingUser =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (existingUser) {
      return res
        .status(409)
        .json({
          message:
            "A user with this email already exists.",
        });
    }

    const user =
      await User.create({
        name:
          name.trim(),

        email:
          normalizedEmail,

        password:
          await hashPassword(
            initialPassword
          ),

        phone:
          String(
            phone
          ).trim(),

        dob:
          new Date(dob),

        role:
          "Employee",

        department,

        access:
          User.defaultAccessForRole(
            "Employee"
          ),
      });

    return res
      .status(201)
      .json({
        message:
          "User registered successfully. Initial password is based on phone number and date of birth.",

        user:
          publicUser(user),

        token:
          createToken(user),
      });
  } catch (error) {
    console.error(
      "register error:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Unable to register user.",
      });
  }
};

const login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "Email and password are required.",
        });
    }

    /*
     * Keep the existing login behaviour:
     * new logins are blocked while the
     * global kill switch is active.
     */
    const settings =
      await SystemSettings.findOne({
        key:
          "global",
      }).lean();

    if (
      settings &&
      !settings.isSystemActive
    ) {
      return res
        .status(503)
        .json({
          code:
            "SYSTEM_MAINTENANCE",

          message:
            settings.reason ||
            "The ERP system is temporarily unavailable.",
        });
    }

    const user =
      await User.findOne({
        email:
          email
            .trim()
            .toLowerCase(),
      }).select(
        "+password"
      );

    if (
      !user ||
      user.status !==
        "Active"
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password.",
        });
    }

    const valid =
      await comparePassword(
        password,
        user.password
      );

    if (!valid) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password.",
        });
    }

    user.lastLoginAt =
      new Date();

    await user.save();

    const populated =
      await User.findById(
        user._id
      ).populate(
        "manager",
        "name"
      );

    return res.json({
      message:
        "Login successful.",

      user:
        publicUser(
          populated ||
            user
        ),

      token:
        createToken(user),
    });
  } catch (error) {
    console.error(
      "login error:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Unable to log in.",
      });
  }
};

const getCurrentUser =
  async (
    req,
    res
  ) => {
    try {
      const user =
        await User.findById(
          req.user._id
        ).populate(
          "manager",
          "name"
        );

      return res.json({
        user:
          publicUser(
            user ||
              req.user
          ),
      });
    } catch (error) {
      return res.json({
        user:
          publicUser(
            req.user
          ),
      });
    }
  };

/**
 * Every authenticated user can change
 * THEIR OWN password.
 *
 * This does not depend on access.profile.resetPassword.
 */
const changePassword =
  async (
    req,
    res
  ) => {
    try {
      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = req.body || {};

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              "Current password, new password and confirmation are required.",
          });
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              "New password and confirmation do not match.",
          });
      }

      const validation =
        validatePassword(
          newPassword
        );

      if (
        !validation.valid
      ) {
        return res
          .status(400)
          .json({
            message:
              validation.message,
          });
      }

      const user =
        await User.findById(
          req.user._id
        ).select(
          "+password"
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User account not found.",
          });
      }

      const currentValid =
        await comparePassword(
          currentPassword,
          user.password
        );

      if (
        !currentValid
      ) {
        return res
          .status(400)
          .json({
            message:
              "Current password is incorrect.",
          });
      }

      const samePassword =
        await comparePassword(
          newPassword,
          user.password
        );

      if (samePassword) {
        return res
          .status(400)
          .json({
            message:
              "New password must be different from your current password.",
          });
      }

      user.password =
        await hashPassword(
          newPassword
        );

      await user.save();

      await recordActivity({
        action:
          "PASSWORD_CHANGED",

        description:
          `${user.name} changed their account password.`,

        actor:
          user._id,

        target:
          user._id,
      });

      return res.json({
        success:
          true,

        message:
          "Password updated successfully.",
      });
    } catch (error) {
      console.error(
        "changePassword error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to update password.",
        });
    }
  };

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,

  /*
   * Re-exported only for backwards compatibility
   * with old scripts. The implementation lives in
   * utils/password.js.
   */
  createInitialPassword,
};