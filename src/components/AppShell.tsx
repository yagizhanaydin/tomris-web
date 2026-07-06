"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TomrisLogo } from "./TomrisLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageProvider";

interface AppShellProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export function AppShell({ children, onLogout }: AppShellProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/akis", label: t.nav.feed },
    { href: "/mesajlar", label: t.nav.messages },
    { href: "/arkadaslar", label: t.nav.friends },
    { href: "/ayarlar", label: t.nav.settings },
  ];

  return (
    <div className="min-h-screen tomris-gradient relative">
      <div className="fixed top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <header className="bg-white/90 backdrop-blur border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 pr-14">
          <div className="flex items-center justify-between gap-3">
            <TomrisLogo size="sm" showText />
            <div className="flex items-center gap-2">
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-sm px-3 sm:px-4 py-2 rounded-xl border border-[var(--border)] text-tomris hover:bg-[var(--primary-light)] transition-colors shrink-0"
                >
                  {t.common.logout}
                </button>
              )}
            </div>
          </div>

          <nav className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary text-white font-medium"
                    : "text-tomris hover:bg-primary-light"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
