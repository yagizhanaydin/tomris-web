"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageProvider";

interface VerificationPrivacyConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  showError?: boolean;
}

export function VerificationPrivacyConsent({
  checked,
  onChange,
  showError,
}: VerificationPrivacyConsentProps) {
  const { t } = useLanguage();
  const parts = t.verification.privacyConsentLabel.split("{privacyLink}");

  return (
    <div className="rounded-xl border border-violet-200 bg-white/80 p-4 space-y-2">
      <label className="flex gap-3 text-sm leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
        />
        <span>
          {parts[0]}
          <Link href="/gizlilik-politikasi" className="text-tomris underline font-medium">
            {t.verification.privacyConsentLink}
          </Link>
          {parts[1] ?? ""}
        </span>
      </label>
      {showError && !checked && (
        <p className="text-xs text-red-600">{t.verification.privacyConsentRequired}</p>
      )}
    </div>
  );
}
