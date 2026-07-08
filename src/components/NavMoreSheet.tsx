"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageProvider";

type NavMoreSheetProps = {
  open: boolean;
  onClose: () => void;
  badges: { friends: number; signals: number };
};

function SheetBadge({ count, urgent }: { count: number; urgent?: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={`min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold ${
        urgent ? "bg-red-600 text-white" : "bg-primary text-white"
      }`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function NavMoreSheet({ open, onClose, badges }: NavMoreSheetProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const items = [
    { href: "/arkadaslar", label: t.nav.friends, badge: badges.friends },
    { href: "/sinyal", label: t.nav.signal, badge: badges.signals, urgent: true },
    { href: "/neden-biz", label: t.nav.whyUs, badge: 0 },
    { href: "/ayarlar", label: t.nav.settings, badge: 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t.common.cancel}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nav-more-title"
        className="relative bg-white rounded-t-2xl shadow-xl animate-[slideUp_0.25s_ease-out]"
      >
        <div className="pt-3 pb-2 px-4 border-b border-[var(--border)]">
          <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-3" aria-hidden />
          <h2 id="nav-more-title" className="text-base font-semibold text-tomris text-center">
            {t.nav.more}
          </h2>
        </div>

        <ul className="p-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? item.urgent
                        ? "bg-red-600 text-white"
                        : "bg-primary text-white"
                      : item.urgent
                        ? "text-red-700 hover:bg-red-50"
                        : "text-tomris hover:bg-primary-light/40"
                  }`}
                >
                  <span>{item.label}</span>
                  <SheetBadge count={item.badge} urgent={item.urgent} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
