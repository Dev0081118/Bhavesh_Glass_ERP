import RoleDashboard from "./RoleDashboard";

export default function ManagerDashboard({
  user,
  token,
}) {
  return (
    <RoleDashboard
      user={user}
      token={token}
      title={`Welcome, ${
        user?.name || "Manager"
      }`}
      subtitle={`Monitor your ${
        user?.department || ""
      } team, assigned workload and department progress.`}
    />
  );
}