import { useState } from 'react'
import Login from './components/login'
import SuperAdminPanel from "./superadmin/SuperAdminPanel";
const App = () => {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("erp-session")) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user, token, rememberMe) => {
    const nextSession = { user, token };
    setSession(nextSession);
    if (rememberMe) {
      localStorage.setItem("erp-session", JSON.stringify(nextSession));
    }
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
