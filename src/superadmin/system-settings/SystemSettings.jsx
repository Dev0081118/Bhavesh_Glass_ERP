import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import SystemSettingsHeader from "./SystemSettingsHeader";
import StampCard from "./StampCard";
import { AppearanceCard, TermsCard } from "./SettingsCards";
import { getSystemSettings, updateSystemSettings } from "../../lib/api";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../components/ToastProvider";

const MAX_TERMS_LENGTH = 5000;
const MAX_STAMP_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_STAMP_TYPES = ["image/png", "image/jpeg", "image/webp"];

const SystemSettings = ({ token }) => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingStamp, setSavingStamp] = useState(false);
  const [savingTerms, setSavingTerms] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);

  const [stamp, setStamp] = useState({
    dataUrl: "",
    fileName: "",
    mimeType: "",
    uploadedAt: null,
  });
  const [terms, setTerms] = useState("");
  const [pageError, setPageError] = useState("");
  const fileInputRef = useRef(null);

  /* Load the saved settings when the page opens. */
  useEffect(() => {
    let isCurrent = true;

    getSystemSettings(token)
      .then((response) => {
        if (!isCurrent) return;
        const data = response?.data || {};
        setStamp({
          dataUrl: data.companyStamp?.dataUrl || "",
          fileName: data.companyStamp?.fileName || "",
          mimeType: data.companyStamp?.mimeType || "",
          uploadedAt: data.companyStamp?.uploadedAt || null,
        });
        setTerms(data.termsAndConditions || "");
        setLoading(false);
      })
      .catch((loadError) => {
        if (!isCurrent) return;
        setPageError(loadError.message || "Unable to load system settings.");
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  /*
   * Theme is applied instantly via ThemeContext (the whole ERP switches
   * immediately), then persisted to MongoDB.
   */
  const handleThemeChange = async (nextTheme) => {
    if (nextTheme === theme || savingTheme) return;

    setSavingTheme(true);
    setTheme(nextTheme); // instant feedback + localStorage

    try {
      await updateSystemSettings(token, { theme: nextTheme });
      showToast("success", "Theme Updated", `Switched to ${nextTheme} mode.`);
    } catch (saveError) {
      setTheme(theme); // roll back if the save fails
      showToast("error", "Update Failed", saveError.message || "Unable to update system settings.");
    } finally {
      setSavingTheme(false);
    }
  };

  const pickFile = () => fileInputRef.current?.click();

  /*
   * Validate on the client (type + size), show an instant preview,
   * then persist the Base64 data URL to MongoDB.
   */
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    if (!ALLOWED_STAMP_TYPES.includes(file.type)) {
      showToast(
        "error",
        "Invalid File",
        "Only PNG, JPG and WEBP images are allowed."
      );
      return;
    }

    if (file.size > MAX_STAMP_BYTES) {
      showToast(
        "error",
        "File Too Large",
        "Stamp/signature image must be below 2 MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const dataUrl = reader.result;
      const previous = stamp;

      /* Preview immediately while saving. */
      setStamp({
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      });

      setSavingStamp(true);
      try {
        const response = await updateSystemSettings(token, {
          companyStamp: { dataUrl, fileName: file.name, mimeType: file.type },
        });
        setStamp({
          dataUrl: "",
          fileName: "",
          mimeType: "",
          uploadedAt: null,
          ...(response?.data?.companyStamp || {}),
        });
        showToast("success", "Stamp Saved", "Company stamp saved successfully.");
      } catch (saveError) {
        setStamp(previous); // roll back the preview
        showToast("error", "Update Failed", saveError.message || "Unable to update system settings.");
      } finally {
        setSavingStamp(false);
      }
    };

    reader.onerror = () => showToast("error", "Invalid File", "Could not read the selected file.");
    reader.readAsDataURL(file);
  };

  const handleRemoveStamp = async () => {
    const previous = stamp;
    setStamp({ dataUrl: "", fileName: "", mimeType: "", uploadedAt: null });

    setSavingStamp(true);
    try {
      await updateSystemSettings(token, {
        companyStamp: { dataUrl: "", fileName: "", mimeType: "" },
      });
      showToast("success", "Stamp Removed", "Company stamp removed successfully.");
    } catch (saveError) {
      setStamp(previous);
      showToast("error", "Update Failed", saveError.message || "Unable to update system settings.");
    } finally {
      setSavingStamp(false);
    }
  };

  const handleSaveTerms = async () => {
    if (terms.length > MAX_TERMS_LENGTH) {
      showToast(
        "error",
        "Content Too Long",
        "Terms and conditions cannot exceed 5000 characters."
      );
      return;
    }

    setSavingTerms(true);
    try {
      await updateSystemSettings(token, { termsAndConditions: terms });
      showToast(
        "success",
        "Billing Settings Saved",
        "Default billing terms saved successfully."
      );
    } catch (saveError) {
      showToast("error", "Update Failed", saveError.message || "Unable to update system settings.");
    } finally {
      setSavingTerms(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {pageError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pageError}
          </div>
        )}

        <SystemSettingsHeader />

        <AppearanceCard
          theme={theme}
          onSelect={handleThemeChange}
          saving={savingTheme}
        />

        <StampCard
          stamp={stamp}
          onPickFile={pickFile}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onRemove={handleRemoveStamp}
          uploading={savingStamp}
        />

        <TermsCard
          terms={terms}
          onChange={setTerms}
          onSave={handleSaveTerms}
          saving={savingTerms}
          max={MAX_TERMS_LENGTH}
        />
      </div>
    </div>
  );
};

export default SystemSettings;