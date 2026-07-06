"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageProvider";

interface VerificationGateProps {
  children: React.ReactNode;
}

export function VerificationGate({ children }: VerificationGateProps) {
  const { t } = useLanguage();

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-sm w-full rounded-2xl border border-violet-200 bg-white/95 backdrop-blur shadow-lg p-5 text-center space-y-3">
          <div className="text-2xl" aria-hidden>
            💜
          </div>
          <p className="font-semibold text-tomris">{t.verification.gateTitle}</p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {t.verification.gateBody}
          </p>
          <Link href="/dogrulama" className="btn-primary inline-block text-sm">
            {t.verification.gateCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
