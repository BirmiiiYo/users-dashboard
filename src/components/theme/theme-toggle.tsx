"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  applyTheme,
  nextThemeMode,
  readStoredTheme,
  themeModeLabels,
  type ThemeMode,
} from "@/lib/theme";

const icons: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/**
 * Тема хранится в localStorage и применяется до первой отрисовки скриптом из <head>.
 * Компонент лишь переключает режим.
 *
 * `mode === null` до первого эффекта — это важно: пока режим неизвестен, нельзя
 * синхронизировать «как в системе», иначе на гидрации системная тема затирает
 * сохранённый выбор пользователя (баг: выбрал светлую — после перезагрузки тёмная).
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode | null>(null);
  const activeMode = mode ?? "system";

  useEffect(() => {
    const stored = readStoredTheme();
    setMode(stored);
    // инлайн-скрипт мог не сработать (CSP/расширения) — догоняем на клиенте
    if (stored !== "system") applyTheme(stored);
  }, []);

  // В режиме «как в системе» следим за сменой системной темы на лету.
  useEffect(() => {
    if (mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      document.documentElement.dataset.theme = media.matches ? "dark" : "light";
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [mode]);

  const Icon = icons[activeMode];
  const next = nextThemeMode[activeMode];
  const label = `Тема: ${themeModeLabels[activeMode]}. Переключить на ${themeModeLabels[next]}`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        applyTheme(next);
        setMode(next);
      }}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors duration-150 ease-ui hover:border-line-strong hover:bg-surface-hover"
      data-testid="theme-toggle"
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}
