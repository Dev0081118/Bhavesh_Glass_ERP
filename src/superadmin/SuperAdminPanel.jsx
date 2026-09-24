import {
  useCallback,
  useMemo,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import AdminDashboard from "../components/AdminDashboard";
import ManagerDashboard from "../components/ManagerDashboard";
import EmployeeDashboard from "../components/EmployeeDashboard";

import {
  normalizeAccess,
} from "../data/accessControl";

import AccessDenied from "./AccessDenied";

import SuperAdminDashboard from "./dashboard/SuperAdminDashboard";

import {
  DASHBOARD_SECTION,
  canViewSection,
  findSection,
  groupSections,
  visibleSectionsFor,
} from "./routes";

export default function SuperAdminPanel({
  onLogout,
  user,
  token,
}) {
  const [
    activeSection,
    setActiveSection,
  ] = useState(
    DASHBOARD_SECTION
  );

  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(
    false
  );

  const isSuperAdmin =
    user?.role ===
    "Super Admin";

  const access =
    useMemo(
      () =>
        normalizeAccess(
          user
        ),
      [
        user,
      ]
    );

  const modules =
    access.modules;

  const canAccessModule =
    useCallback(
      (
        moduleId
      ) =>
        isSuperAdmin ||
        Boolean(
          modules?.[
            moduleId
          ]
        ),

      [
        isSuperAdmin,
        modules,
      ]
    );

  const navigate =
    useCallback(
      (
        sectionId
      ) => {
        setActiveSection(
          sectionId ||
            DASHBOARD_SECTION
        );

        setIsSidebarOpen(
          false
        );
      },
      []
    );

  const section =
    findSection(
      activeSection
    );

  const isAllowed =
    canViewSection(
      section,
      {
        isSuperAdmin,
        canAccessModule,
      }
    );

  const groups =
    useMemo(
      () =>
        groupSections(
          visibleSectionsFor({
            isSuperAdmin,
            canAccessModule,
          })
        ),

      [
        isSuperAdmin,
        canAccessModule,
      ]
    );

  const renderDashboard =
    () => {
      const shared = {
        user,
        token,
        permissions:
          modules,
        onNavigate:
          navigate,
      };

      switch (
        user?.role
      ) {
        case "Super Admin":
          return (
            <SuperAdminDashboard
              {...shared}
            />
          );

        case "Admin":
          return (
            <AdminDashboard
              {...shared}
            />
          );

        case "Manager":
          return (
            <ManagerDashboard
              {...shared}
            />
          );

        case "Employee":
          return (
            <EmployeeDashboard
              {...shared}
            />
          );

        default:
          return (
            <AccessDenied />
          );
      }
    };

  const renderSection =
    () => {
      if (!isAllowed) {
        return (
          <AccessDenied
            onBack={() =>
              navigate(
                DASHBOARD_SECTION
              )
            }
          />
        );
      }

      if (
        section.id ===
        DASHBOARD_SECTION
      ) {
        return renderDashboard();
      }

      const Section =
        section.Element;

      return (
        <Section
          user={
            user
          }
          token={
            token
          }
          permissions={
            modules
          }
          onNavigate={
            navigate
          }
        />
      );
    };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        activeSection={
          activeSection
        }
        setActiveSection={
          navigate
        }
        groups={
          groups
        }
        mobileOpen={
          isSidebarOpen
        }
        onMobileClose={() =>
          setIsSidebarOpen(
            false
          )
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onLogout={
            onLogout
          }
          user={
            user
          }
          token={
            token
          }
          onMenuOpen={() =>
            setIsSidebarOpen(
              true
            )
          }
        />

        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}