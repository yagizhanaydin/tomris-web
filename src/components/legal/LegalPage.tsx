"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageProvider";

interface LegalPageProps {
  type: "terms" | "privacy";
}

export function LegalPage({ type }: LegalPageProps) {
  const { t } = useLanguage();
  const content = type === "terms" ? t.legal.terms : t.legal.privacy;

  return (
    <AppShell>
      <article className="card prose-sm max-w-none space-y-6">
        <header>
          <h1 className="text-xl sm:text-2xl font-bold text-tomris">{content.title}</h1>
          <p className="text-xs text-[var(--muted)] mt-2">{content.updated}</p>
        </header>

        {content.sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-base font-semibold text-tomris">{section.title}</h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className="text-sm text-[var(--muted)] leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <footer className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-4 text-sm">
          <Link href="/giris" className="link-tomris">
            {t.legal.backLogin}
          </Link>
          {type === "terms" ? (
            <Link href="/gizlilik-politikasi" className="link-tomris">
              {t.legal.privacyLink}
            </Link>
          ) : (
            <Link href="/kullanim-kosullari" className="link-tomris">
              {t.legal.termsLink}
            </Link>
          )}
        </footer>
      </article>
    </AppShell>
  );
}
