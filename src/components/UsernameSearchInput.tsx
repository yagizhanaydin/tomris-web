"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { searchUsersByUsernamePrefix } from "@/lib/friends/service";
import { normalizeUsername } from "@/lib/security/validate";
import type { FriendProfile } from "@/types/friendship";

type UsernameSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (user: FriendProfile) => void;
  excludeUid?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

function UsernameMatch({ username, query }: { username: string; query: string }) {
  const prefix = normalizeUsername(query);
  if (!prefix || !username.startsWith(prefix)) {
    return <>@{username}</>;
  }

  return (
    <>
      <span className="font-semibold text-primary">@{username.slice(0, prefix.length)}</span>
      {username.slice(prefix.length)}
    </>
  );
}

export function UsernameSearchInput({
  value,
  onChange,
  onSelect,
  excludeUid,
  disabled = false,
  placeholder,
  className = "",
  inputClassName = "input-field w-full",
}: UsernameSearchInputProps) {
  const { t } = useLanguage();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const normalized = normalizeUsername(value);
    if (normalized.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const results = await searchUsersByUsernamePrefix(normalized, { excludeUid });
        setSuggestions(results);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [value, excludeUid, disabled]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const pickSuggestion = (user: FriendProfile) => {
    onChange(user.username);
    onSelect?.(user);
    setOpen(false);
    setSuggestions([]);
  };

  const showPanel = open && !disabled && normalizeUsername(value).length >= 2;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!showPanel || suggestions.length === 0) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
          } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            pickSuggestion(suggestions[activeIndex]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder ?? t.friends.usernamePlaceholder}
        maxLength={20}
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        disabled={disabled}
        className={inputClassName}
      />

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden"
        >
          <p className="px-3 py-2 text-xs font-medium text-[var(--muted)] border-b border-[var(--border)]">
            {loading ? t.friends.searchingSuggestions : t.friends.suggestions}
          </p>

          {loading && suggestions.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[var(--muted)]">{t.common.loading}</p>
          ) : suggestions.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[var(--muted)]">{t.friends.noSuggestions}</p>
          ) : (
            <ul className="max-h-56 overflow-y-auto py-1">
              {suggestions.map((user, index) => (
                <li key={user.uid}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(user)}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                      index === activeIndex
                        ? "bg-primary-light/40 text-tomris"
                        : "hover:bg-primary-light/25 text-tomris"
                    }`}
                  >
                    <UsernameMatch username={user.username} query={value} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
