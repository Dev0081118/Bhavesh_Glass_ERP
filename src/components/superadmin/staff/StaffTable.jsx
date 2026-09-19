import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";

export default function StaffTable({
  staff,
  onView,
  onEdit,
  onDelete,
}) {
  const [openMenu, setOpenMenu] =
    useState(null);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="
      overflow-hidden rounded-2xl
      border border-slate-200 bg-white
    ">

      {/* DESKTOP */}

      <div className="hidden overflow-x-auto md:block">

        <table className="w-full min-w-[900px]">

          <thead>
            <tr className="
              border-b border-slate-100
              bg-slate-50/70
            ">

              <th className={thClass}>
                Staff
              </th>

              <th className={thClass}>
                Role
              </th>

              <th className={thClass}>
                Department
              </th>

              <th className={thClass}>
                Manager
              </th>

              <th className={thClass}>
                Status
              </th>

              <th className="w-[70px] px-5 py-3" />

            </tr>
          </thead>

          <tbody>

            {staff.length === 0 ? (
              <EmptyState />
            ) : (
              staff.map((person) => (

                <tr
                  key={person.id}
                  className="
                    border-b border-slate-100
                    last:border-0
                    hover:bg-slate-50/70
                  "
                >

                  {/* STAFF */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-full bg-slate-100
                        text-[11px] font-semibold
                        text-slate-600
                      ">
                        {getInitials(person.name)}
                      </div>

                      <div className="min-w-0">

                        <p className="
                          truncate text-sm
                          font-medium text-slate-900
                        ">
                          {person.name}
                        </p>

                        <p className="
                          truncate text-xs
                          text-slate-400
                        ">
                          {person.email}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* ROLE */}

                  <td className="px-5 py-4">
                    <span className="
                      text-xs font-medium
                      text-slate-700
                    ">
                      {person.role}
                    </span>
                  </td>

                  {/* DEPARTMENT */}

                  <td className="px-5 py-4">
                    <span className="
                      text-xs text-slate-500
                    ">
                      {person.department || "—"}
                    </span>
                  </td>

                  {/* MANAGER */}

                  <td className="px-5 py-4">
                    <span className="
                      text-xs text-slate-500
                    ">
                      {person.managerName || "—"}
                    </span>
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">

                    <div className="
                      inline-flex items-center gap-1.5
                    ">

                      <span className={`
                        h-1.5 w-1.5 rounded-full
                        ${
                          person.status === "Active"
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }
                      `} />

                      <span className={`
                        text-xs font-medium
                        ${
                          person.status === "Active"
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }
                      `}>
                        {person.status}
                      </span>

                    </div>

                  </td>

                  {/* ACTIONS */}

                  <td className="relative px-5 py-4">

                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === person.id
                            ? null
                            : person.id
                        )
                      }
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg text-slate-400
                        hover:bg-slate-100
                        hover:text-slate-700
                      "
                    >
                      <MoreHorizontal size={17} />
                    </button>

                    {openMenu === person.id && (
                      <ActionMenu
                        person={person}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        closeMenu={() =>
                          setOpenMenu(null)
                        }
                      />
                    )}

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

      {/* MOBILE */}

      <div className="
        divide-y divide-slate-100 md:hidden
      ">

        {staff.length === 0 ? (
          <EmptyMobile />
        ) : (
          staff.map((person) => (

            <div
              key={person.id}
              className="p-4"
            >

              <div className="
                flex items-center justify-between
              ">

                <button
                  onClick={() =>
                    onView(person)
                  }
                  className="
                    flex items-center
                    gap-3 text-left
                  "
                >

                  <div className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-full bg-slate-100
                    text-xs font-semibold
                    text-slate-600
                  ">
                    {getInitials(person.name)}
                  </div>

                  <div>
                    <p className="
                      text-sm font-medium
                      text-slate-900
                    ">
                      {person.name}
                    </p>

                    <p className="
                      text-xs text-slate-400
                    ">
                      {person.role}
                      {person.department
                        ? ` • ${person.department}`
                        : ""}
                    </p>
                  </div>

                </button>

                <button
                  onClick={() =>
                    setOpenMenu(
                      openMenu === person.id
                        ? null
                        : person.id
                    )
                  }
                  className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    text-slate-400
                  "
                >
                  <MoreHorizontal size={17} />
                </button>

              </div>

              {openMenu === person.id && (
                <div className="
                  mt-3 flex gap-2
                ">

                  <MobileAction
                    icon={Eye}
                    label="View"
                    onClick={() => {
                      onView(person);
                      setOpenMenu(null);
                    }}
                  />

                  <MobileAction
                    icon={Pencil}
                    label="Edit"
                    onClick={() => {
                      onEdit(person);
                      setOpenMenu(null);
                    }}
                  />

                  <MobileAction
                    icon={Trash2}
                    label="Delete"
                    danger
                    onClick={() => {
                      onDelete(person);
                      setOpenMenu(null);
                    }}
                  />

                </div>
              )}

            </div>

          ))
        )}

      </div>

    </div>
  );
}

const thClass = `
  px-5 py-3 text-left
  text-[11px] font-semibold
  uppercase tracking-wider
  text-slate-400
`;

function ActionMenu({
  person,
  onView,
  onEdit,
  onDelete,
  closeMenu,
}) {
  return (
    <div className="
      absolute right-5 top-12 z-20
      w-40 rounded-xl
      border border-slate-200
      bg-white p-1 shadow-lg
    ">

      <MenuButton
        icon={Eye}
        label="View Profile"
        onClick={() => {
          onView(person);
          closeMenu();
        }}
      />

      <MenuButton
        icon={Pencil}
        label="Edit Staff"
        onClick={() => {
          onEdit(person);
          closeMenu();
        }}
      />

      <div className="
        my-1 border-t border-slate-100
      " />

      <MenuButton
        icon={Trash2}
        label="Delete Staff"
        danger
        onClick={() => {
          onDelete(person);
          closeMenu();
        }}
      />

    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center
        gap-2 rounded-lg px-3 py-2
        text-left text-xs
        ${
          danger
            ? "text-red-500 hover:bg-red-50"
            : "text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function MobileAction({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-1 items-center
        justify-center gap-2
        rounded-lg py-2 text-xs
        ${
          danger
            ? "bg-red-50 text-red-500"
            : "bg-slate-100 text-slate-600"
        }
      `}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <tr>
      <td
        colSpan="6"
        className="px-5 py-16 text-center"
      >
        <UserRound
          size={30}
          className="mx-auto text-slate-300"
        />

        <p className="
          mt-3 text-sm font-medium
          text-slate-600
        ">
          No staff found
        </p>

        <p className="
          mt-1 text-xs text-slate-400
        ">
          Try changing your search or filters.
        </p>
      </td>
    </tr>
  );
}

function EmptyMobile() {
  return (
    <div className="px-5 py-16 text-center">
      <UserRound
        size={30}
        className="mx-auto text-slate-300"
      />

      <p className="
        mt-3 text-sm font-medium
        text-slate-600
      ">
        No staff found
      </p>
    </div>
  );
}