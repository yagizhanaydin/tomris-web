"use client";

import { useLanguage } from "@/context/LanguageProvider";

type SignalSafetyNoticeProps = {
  variant: "send" | "receive";
};

export function SignalSafetyNotice({ variant }: SignalSafetyNoticeProps) {
  const { t } = useLanguage();

  return (
    <div
      className="rounded-xl border-2 border-red-300 bg-red-50 p-4 space-y-3"
      role="alert"
    >
      <p className="font-semibold text-red-800 text-sm">{t.signal.safetyWarningTitle}</p>
      <p className="text-sm text-red-900 leading-relaxed">
        {variant === "send" ? t.signal.safetyWarningBody : t.signal.incomingSafetyWarning}
      </p>
      <a
        href="tel:112"
        className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-colors"
      >
        📞 {t.signal.emergencyCall}
      </a>
    </div>
  );
}
