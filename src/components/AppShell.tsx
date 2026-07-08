"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TomrisLogo } from "./TomrisLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavMoreSheet } from "./NavMoreSheet";
import { useLanguage } from "@/context/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";
import { useNavBadges } from "@/hooks/useNavBadges";

interface AppShellProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}

const MORE_PATHS = ["/arkadaslar", "/sinyal", "/ayarlar", "/neden-biz"];

export function AppShell({ children, onLogout }: AppShellProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();
  const badges = useNavBadges(user?.uid);
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryNav = [
    { href: "/dashboard", label: t.nav.dashboard, badge: 0 },
    { href: "/akis", label: t.nav.feed, badge: 0 },
    { href: "/mesajlar", label: t.nav.messages, badge: badges.messages },
  ];

  const moreBadge = badges.friends + badges.signals;
  const moreActive = MORE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  return (
    <div className="min-h-screen tomris-gradient relative">
      <header className="bg-[var(--card)]/90 backdrop-blur border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="shrink-0">
              <TomrisLogo size="sm" showText />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
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

          <nav className="flex gap-2 mt-3 pb-1">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex-1 sm:flex-none text-center text-sm px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary text-white font-medium"
                    : "text-tomris hover:bg-primary-light border border-transparent sm:border-[var(--border)]"
                }`}
              >
                {item.label}
                <NavBadge count={item.badge} />
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={`relative flex-1 sm:flex-none text-center text-sm px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                moreActive
                  ? "bg-primary text-white font-medium"
                  : "text-tomris hover:bg-primary-light border border-[var(--border)]"
              }`}
            >
              {t.nav.more}
              {moreBadge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none">
                  {moreBadge > 9 ? "9+" : moreBadge}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <NavMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} badges={badges} />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
