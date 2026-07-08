"use client";

import Link from "next/link";
import { TomrisMark } from "./TomrisMark";

export type EmptyStateVariant =
  | "posts"
  | "postsFiltered"
  | "inbox"
  | "groups"
  | "groupsFiltered"
  | "friends"
  | "requests"
  | "thread";

type EmptyStateProps = {
  variant: EmptyStateVariant;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

function Illustration({ variant }: { variant: EmptyStateVariant }) {
  const base = "mx-auto w-28 h-28 rounded-3xl flex items-center justify-center shadow-inner";

  if (variant === "posts" || variant === "postsFiltered") {
    return (
      <div className={`${base} bg-primary-light/60`}>
        <svg viewBox="0 0 80 80" className="w-16 h-16 text-primary" aria-hidden>
          <rect x="12" y="18" width="56" height="44" rx="8" fill="currentColor" opacity="0.15" />
          <rect x="18" y="28" width="32" height="4" rx="2" fill="currentColor" opacity="0.5" />
          <rect x="18" y="38" width="44" height="4" rx="2" fill="currentColor" opacity="0.35" />
          <rect x="18" y="48" width="28" height="4" rx="2" fill="currentColor" opacity="0.25" />
          <circle cx="58" cy="52" r="10" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    );
  }

  if (variant === "inbox" || variant === "thread") {
    return (
      <div className={`${base} bg-primary-light/60`}>
        <svg viewBox="0 0 80 80" className="w-16 h-16 text-primary" aria-hidden>
          <path
            d="M14 24h52a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M14 24l26 18 26-18"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            opacity="0.45"
          />
        </svg>
      </div>
    );
  }

  if (variant === "groups" || variant === "groupsFiltered") {
    return (
      <div className={`${base} bg-primary-light/60 p-4`}>
        <TomrisMark size={72} className="rounded-2xl shadow-sm text-primary" />
      </div>
    );
  }

  if (variant === "friends" || variant === "requests") {
    return (
      <div className={`${base} bg-primary-light/60`}>
        <svg viewBox="0 0 80 80" className="w-16 h-16 text-primary" aria-hidden>
          <circle cx="30" cy="30" r="12" fill="currentColor" opacity="0.45" />
          <circle cx="52" cy="30" r="12" fill="currentColor" opacity="0.35" />
          <path
            d="M16 58c0-10 8-16 18-16h12c10 0 18 6 18 16"
            fill="currentColor"
            opacity="0.2"
          />
        </svg>
      </div>
    );
  }

  return null;
}

export function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4 space-y-4">
      <Illustration variant={variant} />
      <div className="space-y-2 max-w-sm">
        <h3 className="font-semibold text-tomris text-base">{title}</h3>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary sm:w-auto sm:px-8 text-sm py-2.5">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button type="button" onClick={onAction} className="btn-primary sm:w-auto sm:px-8 text-sm py-2.5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
