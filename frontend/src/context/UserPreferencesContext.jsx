import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "userPreferences";

const DEFAULT_PREFERENCES = {
  theme: "dark",
  textSize: "medium",
  language: "en",
  reducedMotion: false,
  highContrast: false,
};

const TEXT_SIZE_SCALE = {
  small: 0.94,
  medium: 1,
  large: 1.08,
  xlarge: 1.16,
};

const UserPreferencesContext = createContext();

function getStoredPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function applyPreferences(preferences) {
  const root = document.documentElement;
  root.dataset.theme = preferences.theme;
  root.lang = preferences.language;
  root.style.setProperty("--user-font-scale", String(TEXT_SIZE_SCALE[preferences.textSize] || 1));

  root.classList.toggle("reduced-motion", Boolean(preferences.reducedMotion));
  root.classList.toggle("high-contrast", Boolean(preferences.highContrast));
}

export function UserPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(getStoredPreferences);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    applyPreferences(preferences);
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const value = useMemo(
    () => ({ preferences, updatePreference, resetPreferences }),
    [preferences]
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  }
  return context;
}