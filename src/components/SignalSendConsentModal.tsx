"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";

interface SignalSendConsentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting?: boolean;
}

export function SignalSendConsentModal({
  open,
  onClose,
  onConfirm,
  submitting = false,
}: SignalSendConsentModalProps) {
  const { t } = useLanguage();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signal-consent-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 id="signal-consent-title" className="font-semibold text-tomris text-base">
          {t.signal.sendConsentTitle}
        </h2>
        <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc pl-5">
          {t.signal.sendConsentPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--border)] text-primary focus:ring-primary"
          />
          <span className="text-sm text-[var(--foreground)] leading-relaxed">
            {t.signal.sendConsentCheckbox}
          </span>
        </label>
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary flex-1 disabled:opacity-50"
          >
            {t.signal.sendConsentCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!checked || submitting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? t.signal.sending : t.signal.sendConsentConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
