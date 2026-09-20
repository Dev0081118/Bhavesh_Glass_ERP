import { useEffect, useState } from "react";
import KillSwitchHeader from "./KillSwitchHeader";
import SystemStatusCard from "./SystemStatusCard";
import KillSwitchPanel from "./KillSwitchPanel";
import DisableSystemModal from "./DisableSystemModal";
import { getSystemStatus, updateKillSwitch } from "../../lib/api";

const KillSwitch = ({ token }) => {
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("disable");

  const [systemInfo, setSystemInfo] = useState({
    lastChangedAt: null,
    changedBy: "Super Admin",
    reason: "System is currently operational.",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    getSystemStatus()
      .then((status) => {
        setIsSystemActive(status.isSystemActive);
        setSystemInfo({
          lastChangedAt: status.lastChangedAt,
          changedBy: status.changedBy?.name || "Super Admin",
          reason: status.reason,
        });
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const handleDisableRequest = () => {
    setModalAction("disable");
    setShowModal(true);
  };

  const handleEnableRequest = () => {
    setModalAction("enable");
    setShowModal(true);
  };

  const handleConfirm = async (reason) => {
    try {
      const status = await updateKillSwitch(token, modalAction === "enable", reason);
      setIsSystemActive(status.isSystemActive);
      setSystemInfo({
        lastChangedAt: status.lastChangedAt,
        changedBy: "Super Admin",
        reason: status.reason,
      });
      setShowModal(false);
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <KillSwitchHeader />

        <SystemStatusCard
          isSystemActive={isSystemActive}
          systemInfo={systemInfo}
        />

        <KillSwitchPanel
          isSystemActive={isSystemActive}
          onDisable={handleDisableRequest}
          onEnable={handleEnableRequest}
        />
      </div>

      <DisableSystemModal
        open={showModal}
        action={modalAction}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default KillSwitch;