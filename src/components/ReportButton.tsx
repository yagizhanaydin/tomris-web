"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { submitReport } from "@/lib/reports/service";
import type { ReportTargetType } from "@/types/report";

type ReportButtonProps = {
  reporterUid: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetId: string;
  targetAuthorUid?: string;
  disabled?: boolean;
};

export function ReportButton({
  reporterUid,
  reporterUsername,
  targetType,
  targetId,
  targetAuthorUid,
  disabled = false,
}: ReportButtonProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (targetAuthorUid === reporterUid) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || reason.trim().length < 5) return;
    setSubmitting(true);
    setError("");
    try {
      await submitReport({
        reporterUid,
        reporterUsername,
        targetType,
        targetId,
        targetAuthorUid,
        reason,
      });
      setMessage(t.report.success);
      setReason("");
      setTimeout(() => {
        setOpen(false);
        setMessage("");
      }, 1500);
    } catch {
      setError(t.report.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--muted)] hover:text-red-600 underline"
      >
        {t.report.action}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4 shadow-xl">
            <h3 className="font-semibold text-tomris">{t.report.title}</h3>
            <p className="text-sm text-[var(--muted)]">{t.report.hint}</p>
            {message && <div className="alert-success text-sm">{message}</div>}
            {error && <div className="alert-error text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t.report.placeholder}
                maxLength={500}
                rows={4}
                className="input-field text-sm resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting || reason.trim().length < 5}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? t.report.sending : t.report.send}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
