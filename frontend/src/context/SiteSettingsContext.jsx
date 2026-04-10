import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "adminPlatformSettings";

const DEFAULT_SETTINGS = {
  platformName: "EduPlatform",
  supportEmail: "support@eduplatform.com",
};

const SiteSettingsContext = createContext(null);

function readSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // fall back to defaults
  }

  return DEFAULT_SETTINGS;
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(readSettings);

  useEffect(() => {
    document.title = settings.platformName || DEFAULT_SETTINGS.platformName;
  }, [settings.platformName]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      setSettings(readSettings());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateSettings = (nextSettings) => {
    const merged = { ...DEFAULT_SETTINGS, ...nextSettings };
    setSettings(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  };

  const value = useMemo(
    () => ({
      siteName: settings.platformName || DEFAULT_SETTINGS.platformName,
      supportEmail: settings.supportEmail || DEFAULT_SETTINGS.supportEmail,
      settings,
      updateSettings,
    }),
    [settings]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return {
      siteName: DEFAULT_SETTINGS.platformName,
      supportEmail: DEFAULT_SETTINGS.supportEmail,
      settings: DEFAULT_SETTINGS,
      updateSettings: () => {},
    };
  }

  return context;
}