export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "users-dashboard-theme";

/**
 * Инлайн-скрипт для <head>: выставляет data-theme до первой отрисовки,
 * поэтому тёмная тема не «мигает» белым. Держим его маленьким и без зависимостей.
 */
export const themeInitScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var m=(s==="light"||s==="dark"||s==="system")?s:"system";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";document.documentElement.dataset.themeMode=m;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): "light" | "dark" {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}

/** Применяет тему к документу и запоминает выбор. Безопасно вызывать только в браузере. */
export function applyTheme(mode: ThemeMode): void {
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = resolveTheme(mode, prefersDark);

  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = mode;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Приватный режим / отключённое хранилище — тема просто не запомнится.
  }
}

export function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // игнорируем недоступный localStorage
  }

  return "system";
}

export const themeModeLabels: Record<ThemeMode, string> = {
  light: "светлая",
  dark: "тёмная",
  system: "как в системе",
};

export const nextThemeMode: Record<ThemeMode, ThemeMode> = {
  system: "light",
  light: "dark",
  dark: "system",
};
