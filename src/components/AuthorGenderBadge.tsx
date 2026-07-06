"use client";

import type { Gender } from "@/types/user";
import { useLanguage } from "@/context/LanguageProvider";

interface AuthorGenderBadgeProps {
  gender: Gender;
  size?: "sm" | "md";
}

/** Gönderi sahibi cinsiyeti — metin yerine renkli rozet (♀ / ♂) */
export function AuthorGenderBadge({ gender, size = "sm" }: AuthorGenderBadgeProps) {
  const { t } = useLanguage();
  const isFemale = gender === "kadin";
  const label = isFemale ? t.posts.authorFemale : t.posts.authorMale;

  const dim = size === "sm" ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs";

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-bold leading-none ${dim} ${
        isFemale
          ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {isFemale ? "♀" : "♂"}
    </span>
  );
}
