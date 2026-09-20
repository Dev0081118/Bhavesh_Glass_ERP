import { useState } from 'react'
import Login from './components/login'
import SuperAdminPanel from "./superadmin/SuperAdminPanel";
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div>
      {isAuthenticated ? (
        <SuperAdminPanel onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  )
}

export default App
