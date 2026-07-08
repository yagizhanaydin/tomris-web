"use client";

import { useLanguage } from "@/context/LanguageProvider";
import { TomrisMark } from "./TomrisMark";

interface TomrisLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const markSizes = { sm: 36, md: 48, lg: 56 };

const textSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function TomrisLogo({ size = "md", showText = true }: TomrisLogoProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 rounded-2xl shadow-md overflow-hidden text-primary">
        <TomrisMark size={markSizes[size]} />
      </div>
      {showText && (
        <div className="text-left">
          <p className={`font-bold ${textSizes[size]} text-tomris leading-tight tracking-tight`}>
            {t.brand.name}
          </p>
          <p className="text-[10px] sm:text-xs text-[var(--muted)] leading-snug">{t.brand.solidarity}</p>
        </div>
      )}
    </div>
  );
}
