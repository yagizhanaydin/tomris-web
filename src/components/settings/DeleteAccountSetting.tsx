"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageProvider";

export function DeleteAccountSetting() {
  const router = useRouter();
  const { t } = useLanguage();
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (confirm !== "DELETE") {
      setError(t.settings.deleteConfirmError);
      return;
    }

    setSubmitting(true);
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error("no_user");

      const token = await user.getIdToken();
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirm: "DELETE" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "failed");
      }

      await signOut(getFirebaseAuth());
      router.replace("/giris");
    } catch {
      setError(t.settings.deleteError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card space-y-4 border-red-200">
      <div>
        <h2 className="font-semibold text-red-700">{t.settings.deleteTitle}</h2>
        <p className="text-sm text-[var(--muted)] mt-1">{t.settings.deleteHint}</p>
      </div>

      {error && <div className="alert-error text-sm">{error}</div>}

      <form onSubmit={handleDelete} className="space-y-3">
        <label className="block">
          <span className="text-xs text-tomris font-medium mb-1 block">
            {t.settings.deletePrompt}
          </span>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            className="input-field text-sm"
            disabled={submitting}
          />
        </label>
        <button
          type="submit"
          disabled={submitting || confirm !== "DELETE"}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? t.common.loading : t.settings.deleteButton}
        </button>
      </form>
    </div>
  );
}
