"use client";

import Link from "next/link";
import { AtaturkQuote } from "./AtaturkQuote";
import { TomrisLogo } from "./TomrisLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageProvider";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col tomris-gradient">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <TomrisLogo size="lg" showText />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-tomris">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
            )}
            <p className="mt-3 text-xs sm:text-sm text-tomris/80 font-medium">
              {t.brand.tagline}
            </p>
          </div>

          <div className="card">
            <div className="mb-6">
              <AtaturkQuote />
            </div>
            {children}
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-[var(--muted)] px-4 space-y-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/kullanim-kosullari" className="link-tomris">
            {t.legal.footerTerms}
          </Link>
          <Link href="/gizlilik-politikasi" className="link-tomris">
            {t.legal.footerPrivacy}
          </Link>
        </div>
        <p>
          <span className="text-tomris font-semibold">{t.brand.name}</span> &copy;{" "}
          {new Date().getFullYear()} — {t.brand.footer}
        </p>
      </footer>
    </div>
  );
}
