const {
  User,
  Customer,
  Purchase,
  Production,
  SaleBill,
  Payment,
  Dispatch,
  LedgerEntry,
  Task,
  Activity,
  Inventory,
  Product,
} = require("../models");

const {
  buildOwnershipFilter,
  getDirectReports,
  getScopeName,
  mergeFilters,
  isCompanyRole,
} = require(
  "../services/dataScopeService"
);

const DAY =
  24 * 60 * 60 * 1000;

const resolveRange =
  (value) => {
    const days =
      value === "7d"
        ? 7
        : value === "90d"
          ? 90
          : 30;

    const to =
      new Date();

    const from =
      new Date(
        to.getTime() -
          days *
            DAY
      );

    return {
      days,
      from,
      to,
    };
  };

const countTasks =
  async (
    scope,
    range
  ) => {
    const now =
      new Date();

    const startToday =
      new Date();

    startToday.setHours(
      0,
      0,
      0,
      0
    );

    const endToday =
      new Date();

    endToday.setHours(
      23,
      59,
      59,
      999
    );

    const activeStatuses = [
      "Pending",
      "In Progress",
      "Blocked",
    ];

    const [
      open,
      overdue,
      dueToday,
      completed,
    ] =
      await Promise.all([
        Task.countDocuments(
          mergeFilters(
            scope,
            {
              status: {
                $in:
                  activeStatuses,
              },
            }
          )
        ),

        Task.countDocuments(
          mergeFilters(
            scope,
            {
              status: {
                $in:
                  activeStatuses,
              },

              dueDate: {
                $lt:
                  now,
              },
            }
          )
        ),

        Task.countDocuments(
          mergeFilters(
            scope,
            {
              status: {
                $in:
                  activeStatuses,
              },

              dueDate: {
                $gte:
                  startToday,

                $lte:
                  endToday,
              },
            }
          )
        ),

        Task.countDocuments(
          mergeFilters(
            scope,
            {
              status:
                "Completed",

              completedAt: {
                $gte:
                  range.from,

                $lte:
                  range.to,
              },
            }
          )
        ),
      ]);

    return {
      open,
      overdue,
      dueToday,
      completed,
    };
  };

const getTaskScope =
  async (
    user
  ) => {
    if (
      isCompanyRole(
        user
      )
    ) {
      return {};
    }

    if (
      user.role ===
      "Employee"
    ) {
      return {
        assignedTo:
          user._id,
      };
    }

    return buildOwnershipFilter(
      user,
      {
        ownershipFields: [
          "assignedTo",
          "assignedBy",
          "createdBy",
        ],
      }
    );
  };

const getRoleDashboard =
  async (
    req,
    res
  ) => {
    try {
      const user =
        req.user;

      const range =
        resolveRange(
          req.query.range
        );

      const customerFilter =
        await buildOwnershipFilter(
          user,
          {
            ownershipFields: [
              "createdBy",
              "assignedTo",
            ],
          }
        );

      const purchaseFilter =
        await buildOwnershipFilter(
          user,
          {
            ownershipFields: [
              "createdBy",
              "assignedTo",
            ],
          }
        );

      const productionFilter =
        await buildOwnershipFilter(
          user,
          {
            ownershipFields: [
              "createdBy",
              "manager",
            ],
          }
        );

      const saleBillFilter =
        await buildOwnershipFilter(
          user,
          {
            ownershipFields: [
              "createdBy",
              "manager",
            ],
          }
        );

      const paymentFilter =
        await buildOwnershipFilter(
          user,
          {
            ownershipFields: [
              "createdBy",
              "receivedBy",
            ],
          }
        );

      const dispatchFilter =
        await buildOwnershipFilter(
          user,
          {
            ownershipFields: [
              "createdBy",
              "manager",
            ],
          }
        );

      const ledgerFilter =
        await buildOwnershipFilter(
          user,
          {
            ownershipFields: [
              "createdBy",
            ],
          }
        );

      const taskFilter =
        await getTaskScope(
          user
        );

      const [
        customers,
        purchases,
        production,
        saleBills,
        payments,
        dispatches,
        ledgerEntries,
        taskStats,
        inventoryItems,
        activeProducts,
      ] =
        await Promise.all([
          Customer.countDocuments(
            customerFilter
          ),

          Purchase.countDocuments(
            purchaseFilter
          ),

          Production.countDocuments(
            productionFilter
          ),

          SaleBill.countDocuments(
            saleBillFilter
          ),

          Payment.countDocuments(
            paymentFilter
          ),

          Dispatch.countDocuments(
            dispatchFilter
          ),

          LedgerEntry.countDocuments(
            ledgerFilter
          ),

          countTasks(
            taskFilter,
            range
          ),

          Inventory.countDocuments(),

          Product.countDocuments({
            status:
              "Active",
          }),
        ]);

      const [
        pendingPurchases,
        activeProduction,
        activeDispatch,
        pendingPayments,
      ] =
        await Promise.all([
          Purchase.countDocuments(
            mergeFilters(
              purchaseFilter,
              {
                status: {
                  $in: [
                    "Draft",
                    "Pending",
                    "Ordered",
                    "Partially Received",
                  ],
                },
              }
            )
          ),

          Production.countDocuments(
            mergeFilters(
              productionFilter,
              {
                status: {
                  $in: [
                    "Planned",
                    "In Progress",
                    "On Hold",
                    "Partially Completed",
                  ],
                },
              }
            )
          ),

          Dispatch.countDocuments(
            mergeFilters(
              dispatchFilter,
              {
                status: {
                  $in: [
                    "Ready to Dispatch",
                    "Dispatched",
                    "In Transit",
                  ],
                },
              }
            )
          ),

          Payment.countDocuments(
            mergeFilters(
              paymentFilter,
              {
                status:
                  "Pending",
              }
            )
          ),
        ]);

      const recentTasks =
        await Task.find(
          taskFilter
        )
          .populate(
            "assignedTo",
            "name role department"
          )
          .populate(
            "assignedBy",
            "name role department"
          )
          .sort({
            dueDate:
              1,

            createdAt:
              -1,
          })
          .limit(
            8
          )
          .lean();

      let actorFilter = {};

      if (
        user.role ===
        "Employee"
      ) {
        actorFilter = {
          actor:
            user._id,
        };
      } else if (
        user.role ===
        "Manager"
      ) {
        const team =
          await getDirectReports(
            user._id
          );

        actorFilter = {
          actor: {
            $in: [
              user._id,
              ...team.map(
                (member) =>
                  member._id
              ),
            ],
          },
        };
      }

      const recentActivity =
        await Activity.find(
          actorFilter
        )
          .populate(
            "actor",
            "name role department"
          )
          .sort({
            createdAt:
              -1,
          })
          .limit(
            8
          )
          .lean();

      let managerName =
        null;

      if (
        user.role ===
          "Employee" &&
        user.manager
      ) {
        const manager =
          await User.findById(
            user.manager
          )
            .select(
              "name"
            )
            .lean();

        managerName =
          manager?.name ||
          null;
      }

      let team = [];

      if (
        user.role ===
        "Manager"
      ) {
        const members =
          await getDirectReports(
            user._id
          );

        team =
          await Promise.all(
            members.map(
              async (
                member
              ) => {
                const memberTaskFilter =
                  {
                    assignedTo:
                      member._id,
                  };

                const [
                  openTasks,
                  completedTasks,
                  overdueTasks,
                ] =
                  await Promise.all([
                    Task.countDocuments(
                      mergeFilters(
                        memberTaskFilter,
                        {
                          status: {
                            $in: [
                              "Pending",
                              "In Progress",
                              "Blocked",
                            ],
                          },
                        }
                      )
                    ),

                    Task.countDocuments(
                      mergeFilters(
                        memberTaskFilter,
                        {
                          status:
                            "Completed",

                          completedAt: {
                            $gte:
                              range.from,
                          },
                        }
                      )
                    ),

                    Task.countDocuments(
                      mergeFilters(
                        memberTaskFilter,
                        {
                          status: {
                            $in: [
                              "Pending",
                              "In Progress",
                              "Blocked",
                            ],
                          },

                          dueDate: {
                            $lt:
                              new Date(),
                          },
                        }
                      )
                    ),
                  ]);

                const total =
                  openTasks +
                  completedTasks;

                return {
                  id:
                    member._id,

                  name:
                    member.name,

                  department:
                    member.department,

                  status:
                    member.status,

                  openTasks,

                  completedTasks,

                  overdueTasks,

                  completionRate:
                    total >
                    0
                      ? Math.round(
                          (
                            completedTasks /
                            total
                          ) *
                            100
                        )
                      : 0,
                };
              }
            )
          );
      }

      let departmentOverview =
        [];

      if (
        isCompanyRole(
          user
        )
      ) {
        const departments = [
          "Account",
          "Sales",
          "Purchase",
          "Production",
          "Dispatch",
        ];

        departmentOverview =
          await Promise.all(
            departments.map(
              async (
                department
              ) => {
                const [
                  managers,
                  employees,
                  openTasks,
                  overdueTasks,
                  completedTasks,
                ] =
                  await Promise.all([
                    User.find({
                      role:
                        "Manager",

                      department,

                      status:
                        "Active",
                    })
                      .select(
                        "name"
                      )
                      .lean(),

                    User.countDocuments({
                      role:
                        "Employee",

                      department,

                      status:
                        "Active",
                    }),

                    Task.countDocuments({
                      department,

                      status: {
                        $in: [
                          "Pending",
                          "In Progress",
                          "Blocked",
                        ],
                      },
                    }),

                    Task.countDocuments({
                      department,

                      status: {
                        $in: [
                          "Pending",
                          "In Progress",
                          "Blocked",
                        ],
                      },

                      dueDate: {
                        $lt:
                          new Date(),
                      },
                    }),

                    Task.countDocuments({
                      department,

                      status:
                        "Completed",

                      completedAt: {
                        $gte:
                          range.from,
                      },
                    }),
                  ]);

                const taskTotal =
                  openTasks +
                  completedTasks;

                return {
                  department,

                  managers:
                    managers.map(
                      (
                        manager
                      ) =>
                        manager.name
                    ),

                  employees,

                  openTasks,

                  overdueTasks,

                  completedTasks,

                  completionRate:
                    taskTotal >
                    0
                      ? Math.round(
                          (
                            completedTasks /
                            taskTotal
                          ) *
                            100
                        )
                      : 0,
                };
              }
            )
          );
      }

      return res.json({
        role:
          user.role,

        scope:
          getScopeName(
            user
          ),

        department:
          user.department ||
          null,

        profile: {
          name:
            user.name,

          managerName,
        },

        range: {
          days:
            range.days,

          from:
            range.from,

          to:
            range.to,
        },

        summary: {
          customers,

          purchases,

          pendingPurchases,

          production,

          activeProduction,

          saleBills,

          payments,

          pendingPayments,

          dispatches,

          activeDispatch,

          ledgerEntries,

          inventoryItems,

          activeProducts,

          openTasks:
            taskStats.open,

          overdueTasks:
            taskStats.overdue,

          dueToday:
            taskStats.dueToday,

          completedTasks:
            taskStats.completed,
        },

        tasks:
          recentTasks,

        team,

        departmentOverview,

        activity:
          recentActivity.map(
            (entry) => ({
              id:
                entry._id,

              action:
                entry.action,

              description:
                entry.description,

              actor:
                entry.actor?.name ||
                "System",

              role:
                entry.actor?.role ||
                "",

              createdAt:
                entry.createdAt,
            })
          ),
      });
    } catch (error) {
      console.error(
        "getRoleDashboard error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to load dashboard.",
        });
    }
  };

module.exports = {
  getRoleDashboard,
};