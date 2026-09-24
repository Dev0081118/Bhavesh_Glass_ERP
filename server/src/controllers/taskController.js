const mongoose =
  require("mongoose");

const {
  Task,
  User,
} = require("../models");

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

const populateTask =
  (query) =>
    query
      .populate(
        "assignedTo",
        "name email role department status"
      )
      .populate(
        "assignedBy",
        "name role department"
      )
      .populate(
        "createdBy",
        "name role department"
      );

const taskScope =
  (user) => {
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

const listTasks =
  async (
    req,
    res
  ) => {
    try {
      const scope =
        await taskScope(
          req.user
        );

      const tasks =
        await populateTask(
          Task.find(
            scope
          ).sort({
            dueDate:
              1,

            createdAt:
              -1,
          })
        );

      return res.json({
        data:
          tasks,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load tasks.",
        });
    }
  };

const getAssignableUsers =
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
          data: [],
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

        const users =
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
              "name role department"
            )
            .sort({
              name:
                1,
            });

        return res.json({
          data:
            users,
        });
      }

      const users =
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
            "name role department"
          )
          .sort({
            department:
              1,

            name:
              1,
          });

      return res.json({
        data:
          users,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            "Unable to load task assignees.",
        });
    }
  };

const createTask =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user.role ===
        "Employee"
      ) {
        return res
          .status(403)
          .json({
            message:
              "Employees cannot assign tasks.",
          });
      }

      const {
        title,
        description,
        assignedTo,
        relatedModule,
        relatedRecordId,
        priority,
        dueDate,
        notes,
      } = req.body || {};

      if (
        !title ||
        !assignedTo ||
        !dueDate
      ) {
        return res
          .status(400)
          .json({
            message:
              "Title, assignee and due date are required.",
          });
      }

      await assertAssignableUser(
        req.user,
        assignedTo
      );

      const assignee =
        await User.findById(
          assignedTo
        );

      if (!assignee) {
        return res
          .status(404)
          .json({
            message:
              "Assignee not found.",
          });
      }

      const task =
        await Task.create({
          title:
            String(
              title
            ).trim(),

          description:
            String(
              description ||
                ""
            ).trim(),

          department:
            assignee.department ||
            req.user.department,

          assignedTo:
            assignee._id,

          assignedBy:
            req.user._id,

          createdBy:
            req.user._id,

          relatedModule:
            String(
              relatedModule ||
                ""
            ).trim(),

          relatedRecordId:
            relatedRecordId &&
            mongoose.isValidObjectId(
              relatedRecordId
            )
              ? relatedRecordId
              : null,

          priority:
            priority ||
            "Medium",

          dueDate:
            new Date(
              dueDate
            ),

          notes:
            String(
              notes ||
                ""
            ).trim(),
        });

      await recordActivity({
        action:
          "TASK_CREATED",

        description:
          `${req.user.name} assigned "${task.title}" to ${assignee.name}.`,

        actor:
          req.user._id,

        target:
          assignee._id,

        metadata: {
          taskId:
            task._id.toString(),
        },
      });

      const populated =
        await populateTask(
          Task.findById(
            task._id
          )
        );

      return res
        .status(201)
        .json({
          data:
            populated,
        });
    } catch (error) {
      return res
        .status(
          error.status ||
            400
        )
        .json({
          message:
            error.message ||
            "Unable to create task.",
        });
    }
  };

const updateTask =
  async (
    req,
    res
  ) => {
    try {
      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid task ID.",
          });
      }

      const scope =
        await taskScope(
          req.user
        );

      const task =
        await Task.findOne(
          mergeFilters(
            {
              _id:
                req.params.id,
            },
            scope
          )
        );

      if (!task) {
        return res
          .status(404)
          .json({
            message:
              "Task not found or you do not have access to it.",
          });
      }

      const previousStatus =
        task.status;

      const previousProgress =
        task.progress;

      if (
        req.user.role ===
        "Employee"
      ) {
        const allowed = [
          "status",
          "progress",
          "notes",
        ];

        Object.keys(
          req.body || {}
        ).forEach(
          (key) => {
            if (
              allowed.includes(
                key
              )
            ) {
              task[key] =
                req.body[key];
            }
          }
        );
      } else {
        const allowed = [
          "title",
          "description",
          "priority",
          "status",
          "progress",
          "dueDate",
          "notes",
          "relatedModule",
          "relatedRecordId",
        ];

        allowed.forEach(
          (field) => {
            if (
              req.body[field] !==
              undefined
            ) {
              task[field] =
                req.body[field];
            }
          }
        );

        if (
          req.body.assignedTo &&
          String(
            req.body.assignedTo
          ) !==
            String(
              task.assignedTo
            )
        ) {
          await assertAssignableUser(
            req.user,
            req.body.assignedTo
          );

          const assignee =
            await User.findById(
              req.body.assignedTo
            );

          task.assignedTo =
            assignee._id;

          task.department =
            assignee.department ||
            task.department;
        }
      }

      task.progress =
        Math.min(
          100,
          Math.max(
            0,
            Number(
              task.progress ||
                0
            )
          )
        );

      if (
        task.status ===
        "Completed"
      ) {
        task.progress =
          100;

        if (
          !task.completedAt
        ) {
          task.completedAt =
            new Date();
        }
      } else {
        task.completedAt =
          null;
      }

      await task.save();

      if (
        previousStatus !==
        task.status
      ) {
        await recordActivity({
          action:
            task.status ===
            "Completed"
              ? "TASK_COMPLETED"
              : "TASK_STATUS_UPDATED",

          description:
            `${req.user.name} changed task "${task.title}" to ${task.status}.`,

          actor:
            req.user._id,

          target:
            task.assignedTo,

          metadata: {
            taskId:
              task._id.toString(),

            previousStatus,

            newStatus:
              task.status,
          },
        });
      } else if (
        previousProgress !==
        task.progress
      ) {
        await recordActivity({
          action:
            "TASK_PROGRESS_UPDATED",

          description:
            `${req.user.name} updated "${task.title}" to ${task.progress}% complete.`,

          actor:
            req.user._id,

          target:
            task.assignedTo,

          metadata: {
            taskId:
              task._id.toString(),
          },
        });
      }

      const populated =
        await populateTask(
          Task.findById(
            task._id
          )
        );

      return res.json({
        data:
          populated,
      });
    } catch (error) {
      return res
        .status(
          error.status ||
            400
        )
        .json({
          message:
            error.message ||
            "Unable to update task.",
        });
    }
  };

const deleteTask =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user.role ===
        "Employee"
      ) {
        return res
          .status(403)
          .json({
            message:
              "Employees cannot delete tasks.",
          });
      }

      const scope =
        await taskScope(
          req.user
        );

      const task =
        await Task.findOne(
          mergeFilters(
            {
              _id:
                req.params.id,
            },
            scope
          )
        );

      if (!task) {
        return res
          .status(404)
          .json({
            message:
              "Task not found or you do not have access to it.",
          });
      }

      await task.deleteOne();

      return res.json({
        message:
          "Task deleted successfully.",
      });
    } catch (error) {
      return res
        .status(400)
        .json({
          message:
            error.message ||
            "Unable to delete task.",
        });
    }
  };

module.exports = {
  listTasks,
  getAssignableUsers,
  createTask,
  updateTask,
  deleteTask,
};