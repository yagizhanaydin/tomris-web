"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { isVerificationPending } from "@/lib/auth-routing";

interface VerificationGateProps {
  children: React.ReactNode;
}

export function VerificationGate({ children }: VerificationGateProps) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const pending = isVerificationPending(profile);

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-sm w-full rounded-2xl border border-violet-200 bg-white/95 backdrop-blur shadow-lg p-5 text-center space-y-3">
          <div className="text-2xl" aria-hidden>
            {pending ? "⏳" : "💜"}
          </div>
          <p className="font-semibold text-tomris">
            {pending ? t.verification.pendingGateTitle : t.verification.gateTitle}
          </p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {pending ? t.verification.pendingGateBody : t.verification.gateBody}
          </p>
          {!pending && (
            <Link href="/dogrulama" className="btn-primary inline-block text-sm">
              {t.verification.gateCta}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
