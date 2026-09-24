const User =
  require("../models/User");

const defaultModules = [
  "dashboard",
  "inventory",
  "product",
  "customer",
  "purchase",
  "production",
  "dispatch",
  "sale_bill",
  "payment",
  "ledger",
  "lr",
  "whatsapp_ai",
  "reports",
];

const publicAccessUser =
  (user) => ({
    id:
      user._id,

    userId:
      user._id.toString(),

    name:
      user.name,

    email:
      user.email,

    phone:
      user.phone,

    alternatePhone:
      user.alternatePhone,

    role:
      user.role,

    department:
      user.department,

    managerId:
      user.manager?._id ||
      user.manager ||
      null,

    managerName:
      user.manager &&
      typeof user.manager ===
        "object"
        ? user.manager.name ||
          null
        : null,

    status:
      user.status,

    access:
      user.access ||
      User.defaultAccessForRole(
        user.role
      ),
  });

const listUsers =
  async (
    req,
    res
  ) => {
    try {
      const users =
        await User.find({
          role: {
            $ne:
              "Super Admin",
          },
        })
          .populate(
            "manager",
            "name"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        users:
          users.map(
            publicAccessUser
          ),
      });
    } catch (error) {
      console.error(
        "listUsers error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to load access users.",
        });
    }
  };

const updateUserAccess =
  async (
    req,
    res
  ) => {
    try {
      const {
        modules,
        profile,
      } =
        req.body || {};

      const user =
        await User.findOne({
          _id:
            req.params.userId,

          role: {
            $ne:
              "Super Admin",
          },
        });

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found.",
          });
      }

      if (
        modules !==
        undefined
      ) {
        if (
          typeof modules !==
            "object" ||
          modules === null ||
          Array.isArray(
            modules
          )
        ) {
          return res
            .status(400)
            .json({
              message:
                "modules must be an object of booleans.",
            });
        }

        const sanitized =
          {};

        for (
          const [
            key,
            value,
          ] of Object.entries(
            modules
          )
        ) {
          if (
            defaultModules.includes(
              String(key)
            ) &&
            typeof value ===
              "boolean"
          ) {
            sanitized[
              key
            ] =
              value;
          }
        }

        /*
         * Dashboard is always available to
         * authenticated users.
         */
        sanitized.dashboard =
          true;

        user.set(
          "access.modules",
          sanitized
        );
      }

      if (
        profile !==
        undefined
      ) {
        if (
          typeof profile !==
            "object" ||
          profile === null ||
          Array.isArray(
            profile
          )
        ) {
          return res
            .status(400)
            .json({
              message:
                "profile must be an object.",
            });
        }

        /*
         * resetPassword now means privileged
         * administrative reset capability.
         *
         * It is NOT used for self password changes.
         */
        user.access.profile =
          {
            view:
              true,

            edit:
              Boolean(
                profile.edit
              ),

            resetPassword:
              Boolean(
                profile.resetPassword
              ),
          };
      }

      await user.save();

      const populated =
        await User.findById(
          user._id
        ).populate(
          "manager",
          "name"
        );

      return res.json({
        user:
          publicAccessUser(
            populated ||
              user
          ),
      });
    } catch (error) {
      console.error(
        "updateUserAccess error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to update access.",
        });
    }
  };

module.exports = {
  listUsers,
  updateUserAccess,
};