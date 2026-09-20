const SystemSettings = require("../models/SystemSettings");
const { recordActivity } = require("../utils/activity");

const getSettings = async () => {
  return SystemSettings.findOneAndUpdate(
    { key: "global" },
    { $setOnInsert: { key: "global", isSystemActive: true, reason: "System is currently operational." } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const getSystemStatus = async (req, res) => {
  const settings = await getSettings();
  return res.json({
    isSystemActive: settings.isSystemActive,
    reason: settings.reason,
    changedBy: settings.changedBy,
    lastChangedAt: settings.lastChangedAt,
  });
};

const updateKillSwitch = async (req, res) => {
  const { isSystemActive, reason } = req.body;

  if (typeof isSystemActive !== "boolean") {
    return res.status(400).json({ message: "isSystemActive must be a boolean." });
  }

  if (!isSystemActive && !String(reason || "").trim()) {
    return res.status(400).json({ message: "A reason is required before disabling the system." });
  }

  const settings = await SystemSettings.findOneAndUpdate(
    { key: "global" },
    {
      isSystemActive,
      reason: String(reason || (isSystemActive ? "System manually enabled." : "System manually disabled.")).trim(),
      changedBy: req.user._id,
      lastChangedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await recordActivity({
    action: isSystemActive ? "SYSTEM_ENABLED" : "SYSTEM_DISABLED",
    description: isSystemActive ? "Enabled the ERP system." : "Disabled the ERP system.",
    actor: req.user._id,
    metadata: { reason: settings.reason },
  });

  return res.json({
    isSystemActive: settings.isSystemActive,
    reason: settings.reason,
    changedBy: settings.changedBy,
    lastChangedAt: settings.lastChangedAt,
  });
};

module.exports = { getSystemStatus, updateKillSwitch, getSettings };
