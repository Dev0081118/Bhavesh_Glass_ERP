const mongoose =
  require("mongoose");

const {
  Customer,
  User,
  WhatsAppShare,
} = require("../models");

const {
  normalizePhone,
} = require(
  "../utils/phone"
);

const {
  buildOwnershipFilter,
  mergeFilters,
  getDirectReportIds,
  assertAssignableUser,
  isCompanyRole,
} = require(
  "../services/dataScopeService"
);

const {
  recordActivity,
} = require(
  "../utils/activity"
);

const assignedPopulate = {
  path:
    "assignedTo",

  select:
    "name role department status",
};

const isValidObjectId =
  (id) =>
    mongoose.isValidObjectId(
      id
    );

const customerScope =
  (user) =>
    buildOwnershipFilter(
      user,
      {
        ownershipFields: [
          "createdBy",
          "assignedTo",
        ],
      }
    );

const sanitizeCustomerPayload =
  (
    body = {}
  ) => {
    const payload =
      {};

    if (
      body.name !==
      undefined
    ) {
      payload.name =
        String(
          body.name
        ).trim();
    }

    if (
      body.companyName !==
      undefined
    ) {
      payload.companyName =
        String(
          body.companyName
        ).trim();
    }

    if (
      body.phone !==
      undefined
    ) {
      payload.phone =
        normalizePhone(
          body.phone
        );
    }

    if (
      body.alternatePhone !==
      undefined
    ) {
      payload.alternatePhone =
        body.alternatePhone
          ? normalizePhone(
              body.alternatePhone
            )
          : "";
    }

    if (
      body.email !==
      undefined
    ) {
      payload.email =
        String(
          body.email
        )
          .trim()
          .toLowerCase();
    }

    [
      "address",
      "city",
      "state",
      "pincode",
      "notes",
    ].forEach(
      (field) => {
        if (
          body[field] !==
          undefined
        ) {
          payload[field] =
            String(
              body[field]
            ).trim();
        }
      }
    );

    if (
      body.gstNumber !==
      undefined
    ) {
      payload.gstNumber =
        String(
          body.gstNumber
        )
          .trim()
          .toUpperCase();
    }

    if (
      body.status !==
      undefined
    ) {
      payload.status =
        body.status;
    }

    if (
      body.assignedTo !==
      undefined
    ) {
      payload.assignedTo =
        body.assignedTo ||
        null;
    }

    /*
     * createdBy from client is intentionally ignored.
     */
    return payload;
  };

const applyAssignmentRules =
  async (
    req,
    payload,
    options = {}
  ) => {
    const result = {
      ...payload,
    };

    const creating =
      options.creating ===
      true;

    if (
      req.user.role ===
      "Employee"
    ) {
      /*
       * Employee-owned customer.
       * They cannot spoof another assignee.
       */
      result.assignedTo =
        req.user._id;

      return result;
    }

    if (
      req.user.role ===
      "Manager"
    ) {
      if (
        result.assignedTo
      ) {
        await assertAssignableUser(
          req.user,
          result.assignedTo
        );
      } else if (
        creating
      ) {
        result.assignedTo =
          req.user._id;
      }

      return result;
    }

    if (
      isCompanyRole(
        req.user
      ) &&
      result.assignedTo
    ) {
      await assertAssignableUser(
        req.user,
        result.assignedTo
      );
    }

    return result;
  };

const listCustomers =
  async (
    req,
    res
  ) => {
    try {
      const scope =
        await customerScope(
          req.user
        );

      const customers =
        await Customer.find(
          scope
        )
          .populate(
            assignedPopulate
          )
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        data:
          customers,
      });
    } catch (error) {
      console.error(
        "listCustomers error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to load customers.",
        });
    }
  };

const getCustomer =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid customer ID.",
          });
      }

      const scope =
        await customerScope(
          req.user
        );

      const customer =
        await Customer.findOne(
          mergeFilters(
            {
              _id:
                req.params.id,
            },
            scope
          )
        ).populate(
          assignedPopulate
        );

      if (!customer) {
        return res
          .status(404)
          .json({
            message:
              "Customer not found or you do not have access to it.",
          });
      }

      return res.json({
        data:
          customer,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load customer.",
        });
    }
  };

const createCustomer =
  async (
    req,
    res
  ) => {
    try {
      let payload =
        sanitizeCustomerPayload(
          req.body
        );

      if (!payload.name) {
        return res
          .status(400)
          .json({
            message:
              "Customer name is required.",
          });
      }

      if (!payload.phone) {
        return res
          .status(400)
          .json({
            message:
              "Enter a valid WhatsApp number.",
          });
      }

      const duplicate =
        await Customer.exists({
          phone:
            payload.phone,
        });

      if (duplicate) {
        return res
          .status(409)
          .json({
            message:
              "A customer with this WhatsApp number already exists.",
          });
      }

      if (
        payload.status &&
        ![
          "Active",
          "Inactive",
        ].includes(
          payload.status
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid customer status.",
          });
      }

      payload =
        await applyAssignmentRules(
          req,
          payload,
          {
            creating:
              true,
          }
        );

      payload.createdBy =
        req.user._id;

      const customer =
        await Customer.create(
          payload
        );

      await recordActivity({
        action:
          "CUSTOMER_CREATED",

        description:
          `${req.user.name} created customer ${customer.name}.`,

        actor:
          req.user._id,

        metadata: {
          customerId:
            customer._id.toString(),
        },
      });

      const populated =
        await Customer.findById(
          customer._id
        ).populate(
          assignedPopulate
        );

      return res
        .status(201)
        .json({
          data:
            populated,
        });
    } catch (error) {
      console.error(
        "createCustomer error:",
        error
      );

      if (
        error?.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            message:
              "A customer with this WhatsApp number already exists.",
          });
      }

      return res
        .status(
          error.status ||
            400
        )
        .json({
          message:
            error.message ||
            "Unable to create customer.",
        });
    }
  };

const updateCustomer =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid customer ID.",
          });
      }

      const scope =
        await customerScope(
          req.user
        );

      const existing =
        await Customer.findOne(
          mergeFilters(
            {
              _id:
                req.params.id,
            },
            scope
          )
        );

      if (!existing) {
        return res
          .status(404)
          .json({
            message:
              "Customer not found or you do not have access to it.",
          });
      }

      let payload =
        sanitizeCustomerPayload(
          req.body
        );

      if (
        payload.name !==
          undefined &&
        !payload.name
      ) {
        return res
          .status(400)
          .json({
            message:
              "Customer name is required.",
          });
      }

      if (
        req.body.phone !==
          undefined &&
        !payload.phone
      ) {
        return res
          .status(400)
          .json({
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
            phone:
              payload.phone,

            _id: {
              $ne:
                existing._id,
            },
          });

        if (duplicate) {
          return res
            .status(409)
            .json({
              message:
                "A customer with this WhatsApp number already exists.",
            });
        }
      }

      if (
        payload.status !==
          undefined &&
        ![
          "Active",
          "Inactive",
        ].includes(
          payload.status
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid customer status.",
          });
      }

      const previousAssignee =
        existing.assignedTo
          ? String(
              existing.assignedTo
            )
          : null;

      payload =
        await applyAssignmentRules(
          req,
          payload
        );

      const customer =
        await Customer.findByIdAndUpdate(
          existing._id,

          payload,

          {
            new:
              true,

            runValidators:
              true,
          }
        ).populate(
          assignedPopulate
        );

      const nextAssignee =
        customer.assignedTo?._id ||
        customer.assignedTo;

      if (
        payload.assignedTo !==
          undefined &&
        previousAssignee !==
          String(
            nextAssignee ||
              ""
          )
      ) {
        await recordActivity({
          action:
            "CUSTOMER_REASSIGNED",

          description:
            `${req.user.name} reassigned customer ${customer.name}.`,

          actor:
            req.user._id,

          metadata: {
            customerId:
              customer._id.toString(),

            previousAssignee,

            newAssignee:
              nextAssignee
                ? String(
                    nextAssignee
                  )
                : null,
          },
        });
      }

      return res.json({
        data:
          customer,
      });
    } catch (error) {
      console.error(
        "updateCustomer error:",
        error
      );

      if (
        error?.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            message:
              "A customer with this WhatsApp number already exists.",
          });
      }

      return res
        .status(
          error.status ||
            400
        )
        .json({
          message:
            error.message ||
            "Unable to update customer.",
        });
    }
  };

const deleteCustomer =
  async (
    req,
    res
  ) => {
    try {
      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid customer ID.",
          });
      }

      const scope =
        await customerScope(
          req.user
        );

      const customer =
        await Customer.findOne(
          mergeFilters(
            {
              _id:
                req.params.id,
            },
            scope
          )
        );

      if (!customer) {
        return res
          .status(404)
          .json({
            message:
              "Customer not found or you do not have access to it.",
          });
      }

      const usedInShare =
        await WhatsAppShare.exists({
          customers:
            customer._id,
        });

      if (usedInShare) {
        return res
          .status(409)
          .json({
            message:
              "This customer has WhatsApp share history. Set the customer to Inactive instead.",
          });
      }

      await customer.deleteOne();

      return res.json({
        message:
          "Customer deleted successfully.",
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to delete customer.",
        });
    }
  };

const listAssignableStaff =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user.role ===
        "Employee"
      ) {
        return res.json({
          data: [
            {
              _id:
                req.user._id,

              name:
                req.user.name,

              role:
                req.user.role,

              department:
                req.user.department,

              status:
                req.user.status,
            },
          ],
        });
      }

      if (
        req.user.role ===
        "Manager"
      ) {
        const employeeIds =
          await getDirectReportIds(
            req.user._id,
            {
              activeOnly:
                true,
            }
          );

        const staff =
          await User.find({
            _id: {
              $in: [
                req.user._id,
                ...employeeIds,
              ],
            },

            status:
              "Active",
          })
            .select(
              "name role department status"
            )
            .sort({
              name:
                1,
            });

        return res.json({
          data:
            staff,
        });
      }

      const staff =
        await User.find({
          role: {
            $in: [
              "Manager",
              "Employee",
            ],
          },

          status:
            "Active",
        })
          .select(
            "name role department status"
          )
          .sort({
            name:
              1,
          });

      return res.json({
        data:
          staff,
      });
    } catch (error) {
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