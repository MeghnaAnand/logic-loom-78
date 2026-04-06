import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AccessibilitySettings {
  reducedMotion: boolean;
  focusMode: boolean;
  dyslexiaFont: boolean;
  largeText: boolean;
  highContrast: boolean;
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  focusMode: false,
  dyslexiaFont: false,
  largeText: false,
  highContrast: false,
};

interface AccessibilityCtx {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
}

const AccessibilityContext = createContext<AccessibilityCtx>({
  settings: defaultSettings,
  updateSetting: () => {},
});

const STORAGE_KEY = "automind_a11y";

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const root = document.documentElement;
    root.classList.toggle("a11y-reduced-motion", settings.reducedMotion);
    root.classList.toggle("a11y-focus-mode", settings.focusMode);
    root.classList.toggle("a11y-dyslexia", settings.dyslexiaFont);
    root.classList.toggle("a11y-large-text", settings.largeText);
    root.classList.toggle("a11y-high-contrast", settings.highContrast);
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
