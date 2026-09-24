import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  ContactRound,
  CreditCard,
  Factory,
  ListTodo,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
  X,
} from "lucide-react";

import {
  createTask,
  getRoleDashboard,
  getTaskAssignees,
  updateTask,
} from "../lib/api";

import {
  useToast,
} from "../components/ToastProvider";

const rangeOptions = [
  {
    value:
      "7d",

    label:
      "7 days",
  },

  {
    value:
      "30d",

    label:
      "30 days",
  },

  {
    value:
      "90d",

    label:
      "90 days",
  },
];

const priorityClasses = {
  Low:
    "bg-slate-100 text-slate-600",

  Medium:
    "bg-blue-50 text-blue-700",

  High:
    "bg-amber-50 text-amber-700",

  Urgent:
    "bg-red-50 text-red-700",
};

export default function RoleDashboard({
  user,
  token,
  title,
  subtitle,
}) {
  const {
    showToast,
  } = useToast();

  const [
    range,
    setRange,
  ] = useState(
    "30d"
  );

  const [
    data,
    setData,
  ] = useState(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  const [
    taskModalOpen,
    setTaskModalOpen,
  ] = useState(
    false
  );

  const load =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          const result =
            await getRoleDashboard(
              token,
              range
            );

          setData(
            result
          );
        } catch (
          loadError
        ) {
          setError(
            loadError.message
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        token,
        range,
      ]
    );

  useEffect(
    () => {
      load();
    },
    [load]
  );

  const canAssignTasks =
    user?.role !==
    "Employee";

  const cards =
    useMemo(
      () =>
        buildCards(
          user,
          data?.summary ||
            {}
        ),
      [
        user,
        data,
      ]
    );

  const handleTaskUpdate =
    async (
      task,
      patch
    ) => {
      try {
        await updateTask(
          token,
          task._id ||
            task.id,
          patch
        );

        showToast(
          "success",
          "Task Updated",
          "Task progress has been saved."
        );

        await load();
      } catch (taskError) {
        showToast(
          "error",
          "Unable to Update Task",
          taskError.message
        );
      }
    };

  if (
    loading &&
    !data
  ) {
    return (
      <DashboardSkeleton />
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {user?.role}
            {data?.department
              ? ` · ${data.department}`
              : ""}
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {title ||
              `Welcome, ${
                user?.name ||
                "User"
              }`}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {subtitle ||
              getDashboardSubtitle(
                user,
                data
              )}
          </p>

          {user?.role ===
            "Employee" &&
            data?.profile
              ?.managerName && (
              <p className="mt-1 text-xs text-slate-400">
                Reporting
                to{" "}
                <span className="font-medium text-slate-600">
                  {
                    data
                      .profile
                      .managerName
                  }
                </span>
              </p>
            )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={
              range
            }
            onChange={(
              event
            ) =>
              setRange(
                event
                  .target
                  .value
              )
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
          >
            {rangeOptions.map(
              (
                option
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>

          {canAssignTasks && (
            <button
              type="button"
              onClick={() =>
                setTaskModalOpen(
                  true
                )
              }
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Plus
                size={
                  16
                }
              />

              Assign
              Task
            </button>
          )}
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          ({
            label,
            value,
            description,
            icon:
              Icon,
          }) => (
            <div
              key={
                label
              }
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    {
                      label
                    }
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {
                      value
                    }
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-400">
                    {
                      description
                    }
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon
                    size={
                      18
                    }
                  />
                </div>
              </div>
            </div>
          )
        )}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ListTodo
                size={
                  18
                }
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {user?.role ===
                "Employee"
                  ? "My Tasks"
                  : "Task Progress"}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Work that
                needs
                attention
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {data?.tasks
              ?.length ? (
              data.tasks.map(
                (
                  task
                ) => (
                  <TaskRow
                    key={
                      task._id
                    }
                    task={
                      task
                    }
                    employee={
                      user?.role ===
                      "Employee"
                    }
                    onUpdate={
                      handleTaskUpdate
                    }
                  />
                )
              )
            ) : (
              <EmptyState
                message="No tasks currently require attention."
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Work
            Summary
          </h2>

          <div className="mt-5 space-y-3">
            <MiniStat
              label="Open tasks"
              value={
                data
                  ?.summary
                  ?.openTasks ??
                0
              }
              icon={
                Clock3
              }
            />

            <MiniStat
              label="Due today"
              value={
                data
                  ?.summary
                  ?.dueToday ??
                0
              }
              icon={
                ListTodo
              }
            />

            <MiniStat
              label="Overdue"
              value={
                data
                  ?.summary
                  ?.overdueTasks ??
                0
              }
              icon={
                AlertTriangle
              }
            />

            <MiniStat
              label={`Completed (${data?.range?.days || 30}d)`}
              value={
                data
                  ?.summary
                  ?.completedTasks ??
                0
              }
              icon={
                CheckCircle2
              }
            />
          </div>
        </div>
      </section>

      {user?.role ===
        "Manager" && (
        <TeamSection
          team={
            data?.team ||
            []
          }
        />
      )}

      {(user?.role ===
        "Admin" ||
        user?.role ===
          "Super Admin") && (
        <DepartmentSection
          departments={
            data?.departmentOverview ||
            []
          }
        />
      )}

      <ActivitySection
        activity={
          data?.activity ||
          []
        }
      />

      {taskModalOpen && (
        <TaskModal
          token={
            token
          }
          onClose={() =>
            setTaskModalOpen(
              false
            )
          }
          onCreated={
            async () => {
              setTaskModalOpen(
                false
              );

              await load();
            }
          }
        />
      )}
    </div>
  );
}

function buildCards(
  user,
  summary
) {
  const common = {
    Employee: [
      {
        label:
          "Open Tasks",

        value:
          summary.openTasks ??
          0,

        description:
          "Tasks still requiring work",

        icon:
          ListTodo,
      },

      {
        label:
          "Due Today",

        value:
          summary.dueToday ??
          0,

        description:
          "Work due before end of day",

        icon:
          Clock3,
      },

      {
        label:
          "Overdue",

        value:
          summary.overdueTasks ??
          0,

        description:
          "Tasks beyond their due date",

        icon:
          AlertTriangle,
      },

      {
        label:
          "Completed",

        value:
          summary.completedTasks ??
          0,

        description:
          "Completed in selected period",

        icon:
          CheckCircle2,
      },
    ],

    Manager: [
      {
        label:
          "Open Tasks",

        value:
          summary.openTasks ??
          0,

        description:
          "Open work across your team",

        icon:
          ListTodo,
      },

      {
        label:
          "Customers",

        value:
          summary.customers ??
          0,

        description:
          "Customers in your permitted scope",

        icon:
          ContactRound,
      },

      {
        label:
          "Active Work",

        value:
          (summary.activeProduction ||
            0) +
          (summary.activeDispatch ||
            0) +
          (summary.pendingPurchases ||
            0),

        description:
          "Current operational workload",

        icon:
          BarChart3,
      },

      {
        label:
          "Overdue",

        value:
          summary.overdueTasks ??
          0,

        description:
          "Team tasks requiring attention",

        icon:
          AlertTriangle,
      },
    ],

    Admin: [
      {
        label:
          "Customers",

        value:
          summary.customers ??
          0,

        description:
          "Company customer records",

        icon:
          ContactRound,
      },

      {
        label:
          "Purchases",

        value:
          summary.purchases ??
          0,

        description:
          `${summary.pendingPurchases || 0} currently pending`,

        icon:
          ShoppingCart,
      },

      {
        label:
          "Production",

        value:
          summary.production ??
          0,

        description:
          `${summary.activeProduction || 0} currently active`,

        icon:
          Factory,
      },

      {
        label:
          "Open Tasks",

        value:
          summary.openTasks ??
          0,

        description:
          `${summary.overdueTasks || 0} overdue`,

        icon:
          ListTodo,
      },
    ],
  };

  return (
    common[
      user?.role
    ] ||
    common.Admin
  );
}

function getDashboardSubtitle(
  user,
  data
) {
  if (
    user?.role ===
    "Employee"
  ) {
    return "Your personal workload, assigned records and tasks that need attention.";
  }

  if (
    user?.role ===
    "Manager"
  ) {
    return `Monitor your ${
      data?.department ||
      ""
    } team, workload and operational progress.`;
  }

  return "Monitor company operations, department workload and manager activity.";
}

function TaskRow({
  task,
  employee,
  onUpdate,
}) {
  const overdue =
    ![
      "Completed",
      "Cancelled",
    ].includes(
      task.status
    ) &&
    new Date(
      task.dueDate
    ) <
      new Date();

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {
                task.title
              }
            </p>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                priorityClasses[
                  task
                    .priority
                ] ||
                priorityClasses.Medium
              }`}
            >
              {
                task.priority
              }
            </span>

            {overdue && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                Overdue
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Assigned
            to{" "}
            {task
              .assignedTo
              ?.name ||
              "—"}{" "}
            · Due{" "}
            {new Date(
              task.dueDate
            ).toLocaleDateString()}
          </p>
        </div>

        <select
          value={
            task.status
          }
          onChange={(
            event
          ) =>
            onUpdate(
              task,
              {
                status:
                  event
                    .target
                    .value,
              }
            )
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none"
        >
          <option value="Pending">
            Pending
          </option>

          <option value="In Progress">
            In
            Progress
          </option>

          <option value="Blocked">
            Blocked
          </option>

          <option value="Completed">
            Completed
          </option>

          {!employee && (
            <option value="Cancelled">
              Cancelled
            </option>
          )}
        </select>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            Progress
          </span>

          <span>
            {task.progress ||
              0}
            %
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  Number(
                    task.progress ||
                      0
                  )
                )
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500">
          <Icon
            size={
              15
            }
          />
        </div>

        <span className="text-xs text-slate-600">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function TeamSection({
  team,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <Users
          size={
            18
          }
          className="text-slate-500"
        />

        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            My Team
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Direct
            reports
            only
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
              <th className="pb-3">
                Employee
              </th>

              <th className="pb-3">
                Open
              </th>

              <th className="pb-3">
                Completed
              </th>

              <th className="pb-3">
                Overdue
              </th>

              <th className="pb-3">
                Completion
              </th>
            </tr>
          </thead>

          <tbody>
            {team.map(
              (
                member
              ) => (
                <tr
                  key={
                    member.id
                  }
                  className="border-b border-slate-50 text-sm"
                >
                  <td className="py-3">
                    <p className="font-medium text-slate-800">
                      {
                        member.name
                      }
                    </p>

                    <p className="text-[11px] text-slate-400">
                      {
                        member.department
                      }
                    </p>
                  </td>

                  <td className="py-3 text-slate-600">
                    {
                      member.openTasks
                    }
                  </td>

                  <td className="py-3 text-slate-600">
                    {
                      member.completedTasks
                    }
                  </td>

                  <td className="py-3 text-slate-600">
                    {
                      member.overdueTasks
                    }
                  </td>

                  <td className="py-3 font-medium text-slate-800">
                    {
                      member.completionRate
                    }
                    %
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DepartmentSection({
  departments,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Department
        Overview
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {departments.map(
          (
            department
          ) => (
            <div
              key={
                department.department
              }
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {
                  department.department
                }
              </p>

              <p className="mt-1 truncate text-[11px] text-slate-400">
                {department
                  .managers
                  ?.length
                  ? department.managers.join(
                      ", "
                    )
                  : "No manager"}
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <Row
                  label="Employees"
                  value={
                    department.employees
                  }
                />

                <Row
                  label="Open"
                  value={
                    department.openTasks
                  }
                />

                <Row
                  label="Overdue"
                  value={
                    department.overdueTasks
                  }
                />

                <Row
                  label="Completion"
                  value={`${department.completionRate}%`}
                />
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function ActivitySection({
  activity,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Recent
        Activity
      </h2>

      <div className="mt-5 space-y-3">
        {activity.length ? (
          activity.map(
            (
              entry
            ) => (
              <div
                key={
                  entry.id
                }
                className="border-l-2 border-slate-200 pl-3"
              >
                <p className="text-xs font-medium text-slate-800">
                  {
                    entry.description
                  }
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {
                    entry.actor
                  }{" "}
                  ·{" "}
                  {new Date(
                    entry.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            )
          )
        ) : (
          <EmptyState
            message="No recent activity."
          />
        )}
      </div>
    </section>
  );
}

function TaskModal({
  token,
  onClose,
  onCreated,
}) {
  const {
    showToast,
  } = useToast();

  const [
    assignees,
    setAssignees,
  ] = useState(
    []
  );

  const [
    saving,
    setSaving,
  ] = useState(
    false
  );

  const [
    form,
    setForm,
  ] = useState({
    title:
      "",

    description:
      "",

    assignedTo:
      "",

    priority:
      "Medium",

    dueDate:
      "",
  });

  useEffect(
    () => {
      getTaskAssignees(
        token
      )
        .then(
          (
            result
          ) =>
            setAssignees(
              result.data ||
                []
            )
        )
        .catch(
          (
            error
          ) =>
            showToast(
              "error",
              "Unable to Load Staff",
              error.message
            )
        );
    },
    [
      token,
      showToast,
    ]
  );

  const submit =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !form.title ||
        !form.assignedTo ||
        !form.dueDate
      ) {
        showToast(
          "error",
          "Missing Information",
          "Title, assignee and due date are required."
        );

        return;
      }

      try {
        setSaving(
          true
        );

        await createTask(
          token,
          form
        );

        showToast(
          "success",
          "Task Assigned",
          "The task has been created successfully."
        );

        onCreated();
      } catch (error) {
        showToast(
          "error",
          "Unable to Create Task",
          error.message
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
      <form
        onSubmit={
          submit
        }
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Assign
              Task
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Create
              measurable
              work for
              your team.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X
              size={
                17
              }
            />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Field
            label="Task title"
            value={
              form.title
            }
            onChange={(
              value
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,
                  title:
                    value,
                })
              )
            }
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Assign
              to
            </label>

            <select
              value={
                form.assignedTo
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,

                    assignedTo:
                      event
                        .target
                        .value,
                  })
                )
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
            >
              <option value="">
                Select
                staff
              </option>

              {assignees.map(
                (
                  person
                ) => (
                  <option
                    key={
                      person._id
                    }
                    value={
                      person._id
                    }
                  >
                    {
                      person.name
                    }{" "}
                    —{" "}
                    {
                      person.role
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Priority
              </label>

              <select
                value={
                  form.priority
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      priority:
                        event
                          .target
                          .value,
                    })
                  )
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
              >
                <option>
                  Low
                </option>

                <option>
                  Medium
                </option>

                <option>
                  High
                </option>

                <option>
                  Urgent
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Due
                date
              </label>

              <input
                type="date"
                value={
                  form.dueDate
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      dueDate:
                        event
                          .target
                          .value,
                    })
                  )
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Description
            </label>

            <textarea
              rows={
                4
              }
              value={
                form.description
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,

                    description:
                      event
                        .target
                        .value,
                  })
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving
            }
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving
              ? "Creating..."
              : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <input
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event
              .target
              .value
          )
        }
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
      />
    </div>
  );
}

function Row({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-medium text-slate-700">
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  message,
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">
      {message}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(
          (
            item
          ) => (
            <div
              key={
                item
              }
              className="h-32 animate-pulse rounded-2xl bg-slate-100"
            />
          )
        )}
      </div>

      <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}