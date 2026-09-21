const bcrypt = require("bcrypt");
const User = require("../models/User");
const { createInitialPassword } = require("./authController");
const { recordActivity } = require("../utils/activity");

/**
 * Convert MongoDB user document into frontend-safe staff object.
 */
const publicStaff = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  alternatePhone: user.alternatePhone,
  dob: user.dob,
  address: user.address,
  aadhaar: user.aadhaar || "",
  role: user.role,
  department: user.department,
  managerId: user.manager?._id || user.manager || null,
  managerName:
    user.manager && typeof user.manager === "object"
      ? user.manager.name || null
      : null,
  status: user.status || "Active",
  access:
    user.access || User.defaultAccessForRole(user.role),
});

/**
 * LIST STAFF
 */
const listStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $ne: "Super Admin" },
    })
      .select("+aadhaar")
      .populate("manager", "name")
      .sort({ createdAt: -1 });

    return res.json({
      staff: staff.map(publicStaff),
    });
  } catch (error) {
    console.error("listStaff error:", error);

    return res.status(500).json({
      message: "Unable to load staff.",
    });
  }
};

/**
 * CREATE STAFF
 */
const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      dob,
      address,
      aadhaar,
      role,
      department,
      managerId,
    } = req.body;

    if (!name || !email || !phone || !dob || !role) {
      return res.status(400).json({
        message:
          "Name, email, phone, DOB, and role are required.",
      });
    }

    if (!["Admin", "Manager", "Employee"].includes(role)) {
      return res.status(400).json({
        message: "Invalid staff role.",
      });
    }

    if (role !== "Admin" && !department) {
      return res.status(400).json({
        message: "Department is required.",
      });
    }

    if (role === "Employee" && !managerId) {
      return res.status(400).json({
        message: "Manager is required for employees.",
      });
    }

    const password = createInitialPassword(phone, dob);

    if (!password) {
      return res.status(400).json({
        message:
          "Phone must contain at least 5 digits and DOB must be valid.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    /*
     * Validate manager when creating an employee.
     */
    let manager = null;

    if (role === "Employee") {
      manager = await User.findOne({
        _id: managerId,
        role: "Manager",
        department,
        status: "Active",
      });

      if (!manager) {
        return res.status(400).json({
          message:
            "Selected manager is invalid, inactive, or belongs to another department.",
        });
      }
    }

    const staff = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      dob: new Date(dob),
      address: address?.trim() || "",
      aadhaar: aadhaar?.trim() || "",
      role,

      department:
        role === "Admin"
          ? undefined
          : department,

      manager:
        role === "Employee"
          ? manager._id
          : null,

      password: await bcrypt.hash(password, 12),

      status: "Active",

      access: User.defaultAccessForRole(role),
    });

    await recordActivity({
      action: "STAFF_CREATED",
      description: `Created ${staff.role} ${staff.name}.`,
      actor: req.user._id,
      target: staff._id,
    });

    const populatedStaff = await User.findById(staff._id)
      .select("+aadhaar")
      .populate("manager", "name");

    return res.status(201).json({
      staff: publicStaff(populatedStaff),
      initialPassword: password,
    });
  } catch (error) {
    console.error("createStaff error:", error);

    return res.status(500).json({
      message: "Unable to create staff.",
    });
  }
};

/**
 * UPDATE STAFF
 *
 * Important:
 * Frontend uses `managerId`
 * MongoDB User model uses `manager`.
 */
const updateStaff = async (req, res) => {
  try {
    const existingStaff = await User.findOne({
      _id: req.params.userId,
      role: { $ne: "Super Admin" },
    });

    if (!existingStaff) {
      return res.status(404).json({
        message: "Staff member not found.",
      });
    }

    const {
      name,
      phone,
      dob,
      address,
      aadhaar,
      role,
      department,
      managerId,
      status,
    } = req.body;

    const updates = {};

    /*
     * Basic profile fields
     */
    if (name !== undefined) {
      updates.name = String(name).trim();
    }

    if (phone !== undefined) {
      updates.phone = String(phone).trim();
    }

    if (dob !== undefined && dob !== "") {
      updates.dob = new Date(dob);
    }

    if (address !== undefined) {
      updates.address = String(address).trim();
    }

    if (aadhaar !== undefined) {
      updates.aadhaar = String(aadhaar).trim();
    }

    /*
     * Email and password intentionally cannot be changed
     * from this Staff Edit endpoint.
     */
    if (role !== undefined) {
      if (
        !["Admin", "Manager", "Employee"].includes(role)
      ) {
        return res.status(400).json({
          message: "Invalid staff role.",
        });
      }

      updates.role = role;
    }

    /*
     * Determine final role/department.
     */
    const finalRole = role || existingStaff.role;
    const finalDepartment =
      department !== undefined
        ? department
        : existingStaff.department;

    /*
     * Admins do not belong to a department.
     */
    if (finalRole === "Admin") {
      updates.department = undefined;
      updates.manager = null;
    } else {
      if (!finalDepartment) {
        return res.status(400).json({
          message: "Department is required.",
        });
      }

      updates.department = finalDepartment;

      /*
       * Employee must have a manager.
       */
      if (finalRole === "Employee") {
        const finalManagerId =
          managerId !== undefined
            ? managerId
            : existingStaff.manager;

        if (!finalManagerId) {
          return res.status(400).json({
            message:
              "Manager is required for employees.",
          });
        }

        const manager = await User.findOne({
          _id: finalManagerId,
          role: "Manager",
          department: finalDepartment,
          status: "Active",
        });

        if (!manager) {
          return res.status(400).json({
            message:
              "Selected manager is invalid, inactive, or belongs to another department.",
          });
        }

        updates.manager = manager._id;
      } else {
        /*
         * Managers don't need a manager.
         */
        updates.manager = null;
      }
    }

    /*
     * STATUS
     *
     * Only Active / Inactive are allowed.
     */
    if (status !== undefined) {
      if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({
          message: "Invalid staff status.",
        });
      }

      updates.status = status;
    }

    const wasStatusChanged =
      status !== undefined &&
      status !== existingStaff.status;

    const staff = await User.findOneAndUpdate(
      {
        _id: req.params.userId,
        role: { $ne: "Super Admin" },
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("+aadhaar")
      .populate("manager", "name");

    if (!staff) {
      return res.status(404).json({
        message: "Staff member not found.",
      });
    }

    /*
     * Record normal staff update.
     */
    if (!wasStatusChanged) {
      await recordActivity({
        action: "STAFF_UPDATED",
        description: `Updated staff profile for ${staff.name}.`,
        actor: req.user._id,
        target: staff._id,
      });
    }

    /*
     * Record status change separately.
     */
    if (wasStatusChanged) {
      await recordActivity({
        action: "STAFF_STATUS_CHANGED",
        description: `${staff.status === "Active" ? "Activated" : "Deactivated"} staff account for ${staff.name}.`,
        actor: req.user._id,
        target: staff._id,
        metadata: {
          previousStatus: existingStaff.status,
          newStatus: staff.status,
        },
      });
    }

    return res.json({
      staff: publicStaff(staff),
    });
  } catch (error) {
    console.error("updateStaff error:", error);

    return res.status(500).json({
      message: "Unable to update staff.",
    });
  }
};

/**
 * DELETE STAFF
 */
const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({
      _id: req.params.userId,
      role: { $ne: "Super Admin" },
    });

    if (!staff) {
      return res.status(404).json({
        message: "Staff member not found.",
      });
    }

    /*
     * Remove deleted manager from all employees.
     */
    await User.updateMany(
      {
        manager: staff._id,
      },
      {
        manager: null,
      }
    );

    await recordActivity({
      action: "STAFF_DELETED",
      description: `Deleted staff profile for ${staff.name}.`,
      actor: req.user._id,
      metadata: {
        deletedUserId: staff._id,
      },
    });

    return res.json({
      message: "Staff member deleted successfully.",
    });
  } catch (error) {
    console.error("deleteStaff error:", error);

    return res.status(500).json({
      message: "Unable to delete staff.",
    });
  }
};

module.exports = {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};