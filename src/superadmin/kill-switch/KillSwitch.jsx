import { useState } from "react";
import KillSwitchHeader from "./KillSwitchHeader";
import SystemStatusCard from "./SystemStatusCard";
import KillSwitchPanel from "./KillSwitchPanel";
import DisableSystemModal from "./DisableSystemModal";

const KillSwitch = () => {
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("disable");

  const [systemInfo, setSystemInfo] = useState({
    lastChangedAt: null,
    changedBy: "Super Admin",
    reason: "System is currently operational.",
  });

  const handleDisableRequest = () => {
    setModalAction("disable");
    setShowModal(true);
  };

  const handleEnableRequest = () => {
    setModalAction("enable");
    setShowModal(true);
  };

  const handleConfirm = (reason) => {
    const now = new Date();

    setIsSystemActive(modalAction === "enable");

    setSystemInfo({
      lastChangedAt: now,
      changedBy: "Super Admin",
      reason:
        reason ||
        (modalAction === "disable"
          ? "System manually disabled."
          : "System manually enabled."),
    });

    setShowModal(false);
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
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