"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import {
  isVerificationPending,
  isVerificationRejected,
  isVerificationUnverified,
} from "@/lib/auth-routing";
import { VerificationAccessPanel } from "@/components/VerificationAccessPanel";

export function VerificationStatusBanner() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  if (!profile) return null;

  if (isVerificationPending(profile)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-tomris">{t.verification.pendingBannerTitle}</p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {t.verification.pendingBannerBody}
            </p>
          </div>
          <Link
            href="/akis"
            className="shrink-0 inline-flex justify-center px-5 py-3 rounded-xl border border-[var(--border)] bg-white text-tomris font-semibold hover:bg-[var(--primary-light)] transition-colors text-sm"
          >
            {t.verification.pendingBannerCta}
          </Link>
        </div>
        <VerificationAccessPanel variant="pending" />
      </div>
    );
  }

  if (isVerificationRejected(profile)) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-tomris">{t.verification.rejectedBannerTitle}</p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {t.verification.rejectedBannerBody}
            </p>
          </div>
          <Link
            href="/dogrulama"
            className="shrink-0 inline-flex justify-center px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors text-sm"
          >
            {t.verification.rejectedBannerCta}
          </Link>
        </div>
      </div>
    );
  }

  if (isVerificationUnverified(profile)) {
    return (
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-tomris">{t.verification.bannerTitle}</p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {t.verification.bannerBody}
            </p>
          </div>
          <Link
            href="/dogrulama"
            className="shrink-0 inline-flex justify-center px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors text-sm"
          >
            {t.verification.bannerCta}
          </Link>
        </div>
        <VerificationAccessPanel variant="unverified" showQueue={false} />
      </div>
    );
  }

  return null;
}
