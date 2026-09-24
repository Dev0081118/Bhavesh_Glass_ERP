const mongoose =
  require("mongoose");

const User =
  require("../models/User");

const COMPANY_ROLES = [
  "Super Admin",
  "Admin",
];

const isCompanyRole =
  (user) =>
    COMPANY_ROLES.includes(
      user?.role
    );

const getDirectReports =
  async (
    managerId,
    options = {}
  ) => {
    if (
      !managerId ||
      !mongoose.isValidObjectId(
        managerId
      )
    ) {
      return [];
    }

    const filter = {
      manager:
        managerId,

      role:
        "Employee",
    };

    if (
      options.activeOnly
    ) {
      filter.status =
        "Active";
    }

    return User.find(
      filter
    )
      .select(
        "_id name email role department status manager"
      )
      .lean();
  };

const getDirectReportIds =
  async (
    managerId,
    options = {}
  ) => {
    const users =
      await getDirectReports(
        managerId,
        options
      );

    return users.map(
      (user) =>
        user._id
    );
  };

const getScopeOwnerIds =
  async (
    user
  ) => {
    if (!user) {
      return [];
    }

    if (
      isCompanyRole(
        user
      )
    ) {
      return [];
    }

    if (
      user.role ===
      "Employee"
    ) {
      return [
        user._id,
      ];
    }

    if (
      user.role ===
      "Manager"
    ) {
      const employeeIds =
        await getDirectReportIds(
          user._id
        );

      return [
        user._id,
        ...employeeIds,
      ];
    }

    return [
      user._id,
    ];
  };

const mergeFilters =
  (...filters) => {
    const clean =
      filters.filter(
        (filter) =>
          filter &&
          typeof filter ===
            "object" &&
          Object.keys(
            filter
          ).length > 0
      );

    if (
      clean.length === 0
    ) {
      return {};
    }

    if (
      clean.length === 1
    ) {
      return clean[0];
    }

    return {
      $and:
        clean,
    };
  };

/**
 * Build query filter for row-level access.
 *
 * Example:
 *
 * ownershipFields: [
 *   "createdBy",
 *   "assignedTo"
 * ]
 */
const buildOwnershipFilter =
  async (
    user,
    policy = {}
  ) => {
    if (!user) {
      return {
        _id:
          null,
      };
    }

    if (
      policy.globalRead
    ) {
      return {};
    }

    if (
      isCompanyRole(
        user
      )
    ) {
      return {};
    }

    const ownershipFields =
      Array.isArray(
        policy.ownershipFields
      )
        ? policy.ownershipFields
        : [];

    if (
      ownershipFields.length ===
      0
    ) {
      /*
       * Secure default:
       * no ownership definition means
       * non-company roles see nothing.
       */
      return {
        _id:
          null,
      };
    }

    const ownerIds =
      await getScopeOwnerIds(
        user
      );

    const orFilters =
      ownershipFields.map(
        (field) => ({
          [field]: {
            $in:
              ownerIds,
          },
        })
      );

    return {
      $or:
        orFilters,
    };
  };

const canAssignUser =
  async (
    actor,
    targetUserId,
    options = {}
  ) => {
    if (
      !targetUserId ||
      !mongoose.isValidObjectId(
        targetUserId
      )
    ) {
      return false;
    }

    const target =
      await User.findById(
        targetUserId
      );

    if (
      !target ||
      target.status !==
        "Active"
    ) {
      return false;
    }

    const allowedRoles =
      options.allowedRoles ||
      [
        "Manager",
        "Employee",
      ];

    if (
      !allowedRoles.includes(
        target.role
      )
    ) {
      return false;
    }

    if (
      isCompanyRole(
        actor
      )
    ) {
      return true;
    }

    if (
      actor.role ===
      "Employee"
    ) {
      return (
        String(
          target._id
        ) ===
        String(
          actor._id
        )
      );
    }

    if (
      actor.role ===
      "Manager"
    ) {
      if (
        String(
          target._id
        ) ===
        String(
          actor._id
        )
      ) {
        return true;
      }

      return (
        target.role ===
          "Employee" &&
        String(
          target.manager
        ) ===
          String(
            actor._id
          ) &&
        target.department ===
          actor.department
      );
    }

    return false;
  };

const assertAssignableUser =
  async (
    actor,
    targetUserId,
    options = {}
  ) => {
    const allowed =
      await canAssignUser(
        actor,
        targetUserId,
        options
      );

    if (!allowed) {
      const error =
        new Error(
          "You cannot assign this record to the selected user."
        );

      error.status =
        403;

      throw error;
    }

    return true;
  };

/**
 * Prevent spoofed assignment fields in generic CRUD.
 */
const enforceAssignmentScope =
  async (
    user,
    payload,
    policy = {},
    options = {}
  ) => {
    const result = {
      ...payload,
    };

    const assignmentFields =
      policy.assignmentFields ||
      [];

    const isCreate =
      options.isCreate ===
      true;

    if (
      assignmentFields.length ===
      0
    ) {
      return result;
    }

    if (
      user.role ===
      "Employee"
    ) {
      assignmentFields.forEach(
        (field) => {
          if (
            isCreate ||
            result[field] !==
              undefined
          ) {
            result[field] =
              user._id;
          }
        }
      );

      return result;
    }

    if (
      user.role ===
      "Manager"
    ) {
      for (
        const field of
        assignmentFields
      ) {
        if (
          result[field]
        ) {
          await assertAssignableUser(
            user,
            result[field]
          );
        } else if (
          isCreate &&
          policy
            .autoAssignManagerToSelf
        ) {
          result[field] =
            user._id;
        }
      }
    }

    return result;
  };

const getScopeName =
  (user) => {
    if (
      user?.role ===
      "Super Admin" ||
      user?.role ===
      "Admin"
    ) {
      return "COMPANY";
    }

    if (
      user?.role ===
      "Manager"
    ) {
      return "TEAM";
    }

    return "SELF";
  };

module.exports = {
  COMPANY_ROLES,
  isCompanyRole,
  getDirectReports,
  getDirectReportIds,
  getScopeOwnerIds,
  mergeFilters,
  buildOwnershipFilter,
  canAssignUser,
  assertAssignableUser,
  enforceAssignmentScope,
  getScopeName,
};