const mongoose = require("mongoose");

const {
  Customer,
  User,
  WhatsAppShare,
} = require("../models");

const {
  normalizePhone,
} = require("../utils/phone");

const assignedPopulate = {
  path: "assignedTo",
  select:
    "name role department status",
};

const isValidObjectId = (id) =>
  mongoose.isValidObjectId(id);

const sanitizeCustomerPayload = (
  body = {}
) => {
  const payload = {};

  if (body.name !== undefined) {
    payload.name =
      String(body.name).trim();
  }

  if (body.companyName !== undefined) {
    payload.companyName =
      String(body.companyName).trim();
  }

  if (body.phone !== undefined) {
    payload.phone =
      normalizePhone(body.phone);
  }

  if (
    body.alternatePhone !== undefined
  ) {
    payload.alternatePhone =
      body.alternatePhone
        ? normalizePhone(
            body.alternatePhone
          )
        : "";
  }

  if (body.email !== undefined) {
    payload.email =
      String(body.email)
        .trim()
        .toLowerCase();
  }

  if (body.address !== undefined) {
    payload.address =
      String(body.address).trim();
  }

  if (body.city !== undefined) {
    payload.city =
      String(body.city).trim();
  }

  if (body.state !== undefined) {
    payload.state =
      String(body.state).trim();
  }

  if (body.pincode !== undefined) {
    payload.pincode =
      String(body.pincode).trim();
  }

  if (body.gstNumber !== undefined) {
    payload.gstNumber =
      String(body.gstNumber)
        .trim()
        .toUpperCase();
  }

  if (body.notes !== undefined) {
    payload.notes =
      String(body.notes).trim();
  }

  if (body.status !== undefined) {
    payload.status = body.status;
  }

  if (body.assignedTo !== undefined) {
    payload.assignedTo =
      body.assignedTo || null;
  }

  return payload;
};

const validateAssignedUser = async (
  assignedTo
) => {
  if (!assignedTo) {
    return null;
  }

  if (!isValidObjectId(assignedTo)) {
    return null;
  }

  return User.findOne({
    _id: assignedTo,

    role: {
      $in: [
        "Manager",
        "Employee",
      ],
    },

    status: "Active",
  });
};

const listCustomers = async (
  req,
  res
) => {
  try {
    const customers =
      await Customer.find({})
        .populate(assignedPopulate)
        .sort({
          createdAt: -1,
        });

    return res.json({
      data: customers,
    });
  } catch (error) {
    console.error(
      "listCustomers error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to load customers.",
    });
  }
};

const getCustomer = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid customer ID.",
      });
    }

    const customer =
      await Customer.findById(
        req.params.id
      ).populate(assignedPopulate);

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer not found.",
      });
    }

    return res.json({
      data: customer,
    });
  } catch (error) {
    console.error(
      "getCustomer error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to load customer.",
    });
  }
};

const createCustomer = async (
  req,
  res
) => {
  try {
    const payload =
      sanitizeCustomerPayload(
        req.body
      );

    if (!payload.name) {
      return res.status(400).json({
        message:
          "Customer name is required.",
      });
    }

    if (!payload.phone) {
      return res.status(400).json({
        message:
          "Enter a valid WhatsApp number.",
      });
    }

    const duplicate =
      await Customer.exists({
        phone: payload.phone,
      });

    if (duplicate) {
      return res.status(409).json({
        message:
          "A customer with this WhatsApp number already exists.",
      });
    }

    if (
      payload.status &&
      ![
        "Active",
        "Inactive",
      ].includes(payload.status)
    ) {
      return res.status(400).json({
        message:
          "Invalid customer status.",
      });
    }

    if (payload.assignedTo) {
      const staff =
        await validateAssignedUser(
          payload.assignedTo
        );

      if (!staff) {
        return res.status(400).json({
          message:
            "Selected employee is invalid or inactive.",
        });
      }

      payload.assignedTo =
        staff._id;
    }

    payload.createdBy =
      req.user._id;

    const customer =
      await Customer.create(
        payload
      );

    const populated =
      await Customer.findById(
        customer._id
      ).populate(assignedPopulate);

    return res
      .status(201)
      .json({
        data: populated,
      });
  } catch (error) {
    console.error(
      "createCustomer error:",
      error.message
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "A customer with this WhatsApp number already exists.",
      });
    }

    return res.status(400).json({
      message:
        error.message ||
        "Unable to create customer.",
    });
  }
};

const updateCustomer = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid customer ID.",
      });
    }

    const existing =
      await Customer.findById(
        req.params.id
      );

    if (!existing) {
      return res.status(404).json({
        message:
          "Customer not found.",
      });
    }

    const payload =
      sanitizeCustomerPayload(
        req.body
      );

    if (
      payload.name !== undefined &&
      !payload.name
    ) {
      return res.status(400).json({
        message:
          "Customer name is required.",
      });
    }

    if (
      req.body.phone !== undefined &&
      !payload.phone
    ) {
      return res.status(400).json({
        message:
          "Enter a valid WhatsApp number.",
      });
    }

    if (
      payload.phone &&
      payload.phone !==
        existing.phone
    ) {
      const duplicate =
        await Customer.exists({
          phone: payload.phone,
          _id: {
            $ne: existing._id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          message:
            "A customer with this WhatsApp number already exists.",
        });
      }
    }

    if (
      payload.status !== undefined &&
      ![
        "Active",
        "Inactive",
      ].includes(payload.status)
    ) {
      return res.status(400).json({
        message:
          "Invalid customer status.",
      });
    }

    if (payload.assignedTo) {
      const staff =
        await validateAssignedUser(
          payload.assignedTo
        );

      if (!staff) {
        return res.status(400).json({
          message:
            "Selected employee is invalid or inactive.",
        });
      }

      payload.assignedTo =
        staff._id;
    }

    const customer =
      await Customer.findByIdAndUpdate(
        req.params.id,
        payload,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        assignedPopulate
      );

    return res.json({
      data: customer,
    });
  } catch (error) {
    console.error(
      "updateCustomer error:",
      error.message
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "A customer with this WhatsApp number already exists.",
      });
    }

    return res.status(400).json({
      message:
        error.message ||
        "Unable to update customer.",
    });
  }
};

const deleteCustomer = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid customer ID.",
      });
    }

    const customer =
      await Customer.findById(
        req.params.id
      );

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer not found.",
      });
    }

    const usedInShare =
      await WhatsAppShare.exists({
        customers: customer._id,
      });

    if (usedInShare) {
      return res.status(409).json({
        message:
          "This customer has WhatsApp share history. Set the customer to Inactive instead.",
      });
    }

    await Customer.findByIdAndDelete(
      customer._id
    );

    return res.json({
      message:
        "Customer deleted successfully.",
    });
  } catch (error) {
    console.error(
      "deleteCustomer error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Unable to delete customer.",
    });
  }
};

const listAssignableStaff =
  async (req, res) => {
    try {
      const staff =
        await User.find({
          role: {
            $in: [
              "Manager",
              "Employee",
            ],
          },

          status: "Active",
        })
          .select(
            "name role department status"
          )
          .sort({
            name: 1,
          });

      return res.json({
        data: staff,
      });
    } catch (error) {
      console.error(
        "listAssignableStaff error:",
        error.message
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to load assignable staff.",
        });
    }
  };

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listAssignableStaff,
};