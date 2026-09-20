import { useEffect, useState } from 'react'
import Login from './components/login'
import SuperAdminPanel from "./superadmin/SuperAdminPanel";
import { getCurrentUser } from "./lib/api";
const App = () => {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("erp-session")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!session?.token) return;

    getCurrentUser(session.token)
      .then(({ user }) => setSession((current) => ({ ...current, user })))
      .catch(() => {
        localStorage.removeItem("erp-session");
        setSession(null);
      });
  }, [session?.token]);

  const handleLogin = (user, token) => {
    const nextSession = { user, token };
    setSession(nextSession);
    localStorage.setItem("erp-session", JSON.stringify(nextSession));
  };

  const handleLogout = () => {
    localStorage.removeItem("erp-session");
    setSession(null);
  };

  return (
    <div>
      {session ? (
        <SuperAdminPanel
          user={session.user}
          token={session.token}
          onLogout={handleLogout}
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
