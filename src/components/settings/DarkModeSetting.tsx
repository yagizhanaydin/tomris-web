"use client";

import { useLanguage } from "@/context/LanguageProvider";
import { useTheme, type ThemePreference } from "@/context/ThemeProvider";

const OPTIONS: ThemePreference[] = ["light", "dark", "system"];

export function DarkModeSetting() {
  const { t } = useLanguage();
  const { preference, setPreference } = useTheme();

  const labels: Record<ThemePreference, string> = {
    light: t.settings.themeLight,
    dark: t.settings.themeDark,
    system: t.settings.themeSystem,
  };

  return (
    <div className="card space-y-3">
      <div>
        <h2 className="font-semibold text-tomris">{t.settings.themeTitle}</h2>
        <p className="text-sm text-[var(--muted)] mt-1">{t.settings.themeHint}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setPreference(opt)}
            className={`text-sm py-2.5 px-2 rounded-xl border transition-colors ${
              preference === opt ? "selection-active font-medium" : "border-[var(--border)] hover:bg-primary-light/25"
            }`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}
