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

/*
 * ============================================================
 * GLOBAL SYSTEM SETTINGS (theme / stamp / terms & conditions)
 * ============================================================
 */

const ALLOWED_THEMES = ["light", "dark"];
const ALLOWED_STAMP_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_TERMS_LENGTH = 5000;
/* Maximum allowed size of the decoded stamp image (2 MB). */
const MAX_STAMP_BYTES = 2 * 1024 * 1024;
/* Maximum length of the Base64 data URL string (≈ 2.9 MB for 2 MB raw). */
const MAX_STAMP_DATA_URL_LENGTH = 4 * Math.ceil(MAX_STAMP_BYTES / 3) + 256;

const publicSettings = (settings) => ({
  theme: settings.theme || "light",
  companyStamp: {
    dataUrl: settings.companyStamp?.dataUrl || "",
    fileName: settings.companyStamp?.fileName || "",
    mimeType: settings.companyStamp?.mimeType || "",
    uploadedAt: settings.companyStamp?.uploadedAt || null,
  },
  termsAndConditions: settings.termsAndConditions || "",
});

const extractStampPayload = (stamp) => {
  if (typeof stamp !== "object" || stamp === null || Array.isArray(stamp)) {
    return { message: "companyStamp must be an object." };
  }

  const dataUrl = typeof stamp.dataUrl === "string" ? stamp.dataUrl.trim() : "";

  if (!dataUrl) {
    /* Empty dataUrl -> explicit removal of the stamp. */
    return { stamp: null };
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/);

  if (!match) {
    return { message: "Only PNG, JPG and WEBP images are allowed." };
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2].replace(/\s/g, "");

  if (!ALLOWED_STAMP_MIME_TYPES.includes(mimeType)) {
    return { message: "Only PNG, JPG and WEBP images are allowed." };
  }

  /* Approximate decoded size of the Base64 payload. */
  const decodedBytes = Math.floor((base64Data.length * 3) / 4);

  if (decodedBytes > MAX_STAMP_BYTES) {
    return { message: "Stamp/signature image must be below 2 MB." };
  }

  return {
    stamp: {
      dataUrl: `data:${mimeType};base64,${base64Data}`,
      fileName: String(stamp.fileName || "").trim().slice(0, 255),
      mimeType,
      uploadedAt: new Date(),
    },
  };
};

const getSystemSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    return res.json({ data: publicSettings(settings) });
  } catch (error) {
    console.error("getSystemSettings error:", error);
    return res.status(500).json({ message: "Unable to load system settings." });
  }
};

const updateSystemSettings = async (req, res) => {
  try {
    const { theme, companyStamp, termsAndConditions } = req.body || {};

    if (
      theme === undefined &&
      companyStamp === undefined &&
      termsAndConditions === undefined
    ) {
      return res.status(400).json({
        message: "Nothing to update. Provide theme, companyStamp or termsAndConditions.",
      });
    }

    if (theme !== undefined && !ALLOWED_THEMES.includes(theme)) {
      return res.status(400).json({ message: "Theme must be either light or dark." });
    }

    if (
      termsAndConditions !== undefined &&
      String(termsAndConditions).length > MAX_TERMS_LENGTH
    ) {
      return res.status(400).json({
        message: "Terms and conditions cannot exceed 5000 characters.",
      });
    }

    let stampUpdate;
    if (companyStamp !== undefined) {
      stampUpdate = extractStampPayload(companyStamp);

      if (stampUpdate.message) {
        return res.status(400).json({ message: stampUpdate.message });
      }
    }

    /*
     * Load (or create) the document, mutate it in memory and save.
     * This avoids conflicting MongoDB operators ($set + $setOnInsert)
     * on the same fields.
     */
    const settings = await getSettings();

    if (theme !== undefined) {
      settings.theme = theme;
    }

    if (termsAndConditions !== undefined) {
      settings.termsAndConditions = String(termsAndConditions);
    }

    if (stampUpdate) {
      settings.companyStamp = stampUpdate.stamp
        ? stampUpdate.stamp
        : { dataUrl: "", fileName: "", mimeType: "", uploadedAt: null };
    }

    settings.changedBy = req.user._id;
    settings.lastChangedAt = new Date();

    await settings.save();

    await recordActivity({
      action: "SYSTEM_SETTINGS_UPDATED",
      description: "Updated global system settings.",
      actor: req.user._id,
      metadata: {
        theme: settings.theme,
        stampFileName: settings.companyStamp?.fileName || "",
        stampRemoved: stampUpdate ? !stampUpdate.stamp : undefined,
        termsUpdated: termsAndConditions !== undefined,
      },
    });

    return res.json({ data: publicSettings(settings) });
  } catch (error) {
    console.error("updateSystemSettings error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)[0]?.message || "Invalid system settings.",
      });
    }

    return res.status(500).json({ message: "Unable to update system settings." });
  }
};

module.exports = {
  getSystemStatus,
  updateKillSwitch,
  getSettings,
  getSystemSettings,
  updateSystemSettings,
};

