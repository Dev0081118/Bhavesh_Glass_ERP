import { useEffect, useRef, useState } from "react";
import Login from "./components/login";
import SuperAdminPanel from "./superadmin/SuperAdminPanel";
import { getCurrentUser, getSystemStatus } from "./lib/api";
import SystemMaintenance from "./components/SystemMaintenance";
import { useTheme } from "./context/ThemeContext";

const App = () => {
  const { syncTheme } = useTheme();
  const lastSyncedTokenRef = useRef(null);
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("erp-session")) || null;
    } catch {
      return null;
    }
  });

  const [maintenance, setMaintenance] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    const verifySystemAccess = async () => {
      let systemStatus;

      try {
        systemStatus = await getSystemStatus();
      } catch {
        if (isCurrent) {
          setMaintenance("The ERP system is temporarily unavailable.");
          setIsBooting(false);
        }

        return;
      }

      if (!isCurrent) return;

      const hasSuperAdminSession =
        Boolean(session?.token) &&
        session?.user?.role === "Super Admin";

      /*
       * Check maintenance mode before rendering Login.
       *
       * A Super Admin who was already logged in can continue
       * using the system and restore access.
       */
      if (
        !systemStatus.isSystemActive &&
        !hasSuperAdminSession
      ) {
        setMaintenance(
          systemStatus.reason ||
            "The ERP system is temporarily unavailable."
        );

        setIsBooting(false);
        return;
      }

      /*
       * System is active and there is no stored session.
       * The normal login page can now be displayed.
       */
      if (!session?.token) {
        setMaintenance(null);
        setIsBooting(false);
        return;
      }

      try {
        const { user } = await getCurrentUser(
          session.token
        );

        if (!isCurrent) return;

        /*
         * Protect against someone manually changing the
         * role inside localStorage.
         */
        if (
          !systemStatus.isSystemActive &&
          user.role !== "Super Admin"
        ) {
          setMaintenance(
            systemStatus.reason ||
              "The ERP system is temporarily unavailable."
          );

          setIsBooting(false);
          return;
        }

        setMaintenance(null);

        setSession((current) =>
          current?.token === session.token
            ? {
                ...current,
                user,
              }
            : current
        );

        /*
         * Sync the MongoDB-stored theme into the ThemeContext +
         * localStorage so the whole ERP follows the global setting.
         * Runs once per token (the 10s verifier must not spam it).
         */
        if (session.token && lastSyncedTokenRef.current !== session.token) {
          lastSyncedTokenRef.current = session.token;
          syncTheme(session.token);
        }

        setIsBooting(false);
      } catch (error) {
        if (!isCurrent) return;

        if (
          error.code === "SYSTEM_MAINTENANCE"
        ) {
          setMaintenance(error.message);
        } else {
          localStorage.removeItem("erp-session");
          setSession(null);

          setMaintenance(
            systemStatus.isSystemActive
              ? null
              : systemStatus.reason ||
                  "The ERP system is temporarily unavailable."
          );
        }

        setIsBooting(false);
      }
    };

    verifySystemAccess();

    /*
     * Recheck every 10 seconds.
     * When the recovery script enables the system,
     * the login page automatically returns.
     */
    const statusInterval = window.setInterval(
      verifySystemAccess,
      10000
    );

    return () => {
      isCurrent = false;
      window.clearInterval(statusInterval);
    };
  }, [
    session?.token,
    session?.user?.role,
  ]);

  const handleLogin = (user, token) => {
    const nextSession = {
      user,
      token,
    };

    setSession(nextSession);

    localStorage.setItem(
      "erp-session",
      JSON.stringify(nextSession)
    );

    setMaintenance(null);
    setIsBooting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("erp-session");
    lastSyncedTokenRef.current = null;

    /*
     * Show a blank screen while checking whether
     * the system is under maintenance.
     */
    setIsBooting(true);
    setSession(null);
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-white" />
    );
  }

  /*
   * Do not render Login while maintenance is active.
   */
  if (
    maintenance &&
    session?.user?.role !== "Super Admin"
  ) {
    return <SystemMaintenance />;
  }

  if (!session) {
    return (
      <Login onLogin={handleLogin} />
    );
  }

  return (
    <SuperAdminPanel
      user={session.user}
      token={session.token}
      onLogout={handleLogout}
    />
  );
};

export default App;