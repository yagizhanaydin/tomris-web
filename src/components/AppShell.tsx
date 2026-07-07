"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TomrisLogo } from "./TomrisLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
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

export function AppShell({ children, onLogout }: AppShellProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();
  const badges = useNavBadges(user?.uid);

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, badge: 0 },
    { href: "/akis", label: t.nav.feed, badge: 0 },
    { href: "/sinyal", label: t.nav.signal, badge: badges.signals, urgent: true },
    { href: "/mesajlar", label: t.nav.messages, badge: badges.messages },
    { href: "/arkadaslar", label: t.nav.friends, badge: badges.friends },
    { href: "/ayarlar", label: t.nav.settings, badge: 0 },
  ];

  return (
    <div className="min-h-screen tomris-gradient relative">
      <header className="bg-white/90 backdrop-blur border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <TomrisLogo size="sm" showText />
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

          <nav className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? item.urgent
                      ? "bg-red-600 text-white font-medium"
                      : "bg-primary text-white font-medium"
                    : item.urgent
                      ? "text-red-700 hover:bg-red-50 border border-red-200"
                      : "text-tomris hover:bg-primary-light"
                }`}
              >
                {item.label}
                <NavBadge count={item.badge} />
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
