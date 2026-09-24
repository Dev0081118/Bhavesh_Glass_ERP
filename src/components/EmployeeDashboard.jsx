import RoleDashboard from "./RoleDashboard";

export default function EmployeeDashboard({
  user,
  token,
}) {
  return (
    <RoleDashboard
      user={user}
      token={token}
      title={`Welcome, ${
        user?.name || "Employee"
      }`}
      subtitle="Your personal work queue, assigned tasks and records that need your attention."
    />
  );
}