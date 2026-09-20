import { useEffect, useState } from 'react'
import Login from './components/login'
import SuperAdminPanel from "./superadmin/SuperAdminPanel";
import { getCurrentUser, getSystemStatus } from "./lib/api";
import SystemMaintenance from "./components/SystemMaintenance";
const App = () => {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("erp-session")) || null;
    } catch {
      return null;
    }
  });
  const [maintenance, setMaintenance] = useState(null);
  const [isBooting, setIsBooting] = useState(Boolean(session?.token));

  useEffect(() => {
    if (!session?.token) {
      setIsBooting(false);
      return;
    }

    let isCurrent = true;

    const restoreSession = async () => {
      try {
        const isSuperAdmin = session.user?.role === "Super Admin";

        if (!isSuperAdmin) {
          const systemStatus = await getSystemStatus();

          if (!systemStatus.isSystemActive) {
            if (isCurrent) {
              setMaintenance(systemStatus.reason);
              setIsBooting(false);
            }
            return;
          }
        }

        const { user } = await getCurrentUser(session.token);

        if (isCurrent) {
          setMaintenance(null);
          setSession((current) => ({ ...current, user }));
          setIsBooting(false);
        }
      } catch (error) {
        if (error.code === "SYSTEM_MAINTENANCE") {
          if (isCurrent) {
            setMaintenance(error.message);
            setIsBooting(false);
          }
          return;
        }

        if (isCurrent) {
          localStorage.removeItem("erp-session");
          setSession(null);
          setIsBooting(false);
        }
      }
    };

    restoreSession();

    return () => {
      isCurrent = false;
    };
  }, [session?.token]);

  const handleLogin = (user, token) => {
    const nextSession = { user, token };
    setIsBooting(false);
    setSession(nextSession);
    localStorage.setItem("erp-session", JSON.stringify(nextSession));
    setMaintenance(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("erp-session");
    setMaintenance(null);
    setSession(null);
    setIsBooting(false);
  };

  if (isBooting) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div>
      {maintenance && session?.user?.role !== "Super Admin" ? (
        <SystemMaintenance reason={maintenance} />
      ) : (
        session ? (
          <SuperAdminPanel
            user={session.user}
            token={session.token}
            onLogout={handleLogout}
          />
        ) : (
          <Login onLogin={handleLogin} onMaintenance={setMaintenance} />
        )
      )}
    </div>
  );
}

export default App
