"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { updateChatVisibility, getChatVisibility } from "@/lib/users/settings";
import type { ChatVisibility, UserProfile } from "@/types/user";

interface ChatVisibilitySettingProps {
  profile: UserProfile;
  onUpdated: () => Promise<void>;
}

export function ChatVisibilitySetting({ profile, onUpdated }: ChatVisibilitySettingProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState<ChatVisibility>(getChatVisibility(profile));
  const [pendingEveryone, setPendingEveryone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveVisibility = async (next: ChatVisibility) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateChatVisibility(profile.uid, next);
      setValue(next);
      await onUpdated();
      setMessage(t.settings.saved);
    } catch {
      setError(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (value === getChatVisibility(profile)) return;

    if (value === "everyone" && getChatVisibility(profile) !== "everyone") {
      setPendingEveryone(true);
      return;
    }

    await saveVisibility(value);
  };

  const confirmEveryone = async () => {
    setPendingEveryone(false);
    await saveVisibility("everyone");
  };

  const handleRadioChange = (next: ChatVisibility) => {
    setValue(next);
    setMessage("");
    setError("");
  };

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="font-semibold text-tomris">{t.settings.chatVisibilityTitle}</h2>
        <p className="text-sm text-[var(--muted)] mt-1">{t.settings.chatVisibilityHint}</p>
      </div>

      {message && <div className="alert-success text-sm">{message}</div>}
      {error && <div className="alert-error text-sm">{error}</div>}

      <fieldset className="space-y-2">
        {(
          [
            { value: "friends" as const, label: t.settings.chatFriends, desc: t.settings.chatFriendsDesc },
            { value: "everyone" as const, label: t.settings.chatEveryone, desc: t.settings.chatEveryoneDesc },
          ] as const
        ).map((opt) => (
          <label
            key={opt.value}
            className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              value === opt.value
                ? "selection-active"
                : "border-[var(--border)] hover:border-violet-200"
            }`}
          >
            <input
              type="radio"
              name="chatVisibility"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => handleRadioChange(opt.value)}
              className="mt-1"
            />
            <span>
              <span className="block font-medium text-tomris text-sm">{opt.label}</span>
              <span className="block text-xs text-[var(--muted)] mt-0.5">{opt.desc}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || value === getChatVisibility(profile)}
        className="btn-primary sm:w-auto sm:px-8"
      >
        {saving ? t.common.loading : t.common.save}
      </button>

      {pendingEveryone && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4 shadow-xl">
            <h3 className="font-semibold text-tomris">{t.settings.chatEveryoneConfirmTitle}</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {t.settings.chatEveryoneConfirmBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingEveryone(false);
                  setValue(getChatVisibility(profile));
                }}
                className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={confirmEveryone}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {t.settings.chatEveryoneConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
