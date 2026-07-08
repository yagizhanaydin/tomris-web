"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { localeToIntl } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { ContentBlockedError } from "@/lib/security/content-filter";
import {
  fetchOlderMessages,
  sendMessage,
  subscribeToRecentMessages,
  MESSAGE_PAGE_SIZE,
} from "@/lib/chat/service";
import type { ChatMessage, Conversation } from "@/types/chat";
import type { UserProfile } from "@/types/user";
import { EmptyState } from "@/components/EmptyState";

interface MessageThreadProps {
  conversation: Conversation;
  profile: UserProfile;
  canSend: boolean;
}

function formatTime(iso: string, locale: Locale) {
  return new Date(iso).toLocaleString(localeToIntl(locale), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mergeMessages(older: ChatMessage[], live: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const m of older) map.set(m.id, m);
  for (const m of live) map.set(m.id, m);
  return Array.from(map.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function MessageThread({ conversation, profile, canSend }: MessageThreadProps) {
  const { t, locale } = useLanguage();
  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const messages = useMemo(
    () => mergeMessages(olderMessages, liveMessages),
    [olderMessages, liveMessages]
  );

  useEffect(() => {
    setOlderMessages([]);
    setLiveMessages([]);
    setLoading(true);
    setHasMore(false);

    const unsub = subscribeToRecentMessages(
      conversation.id,
      MESSAGE_PAGE_SIZE,
      (msgs) => {
        setLiveMessages(msgs);
        setHasMore(msgs.length >= MESSAGE_PAGE_SIZE);
        setLoading(false);
      },
      () => setError(t.chat.errorLoad)
    );

    return unsub;
  }, [conversation.id, t.chat.errorLoad]);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  const loadOlder = async () => {
    const oldest = messages[0];
    if (!hasMore || loadingMore || !oldest) return;

    setLoadingMore(true);
    try {
      const page = await fetchOlderMessages(conversation.id, oldest.id, MESSAGE_PAGE_SIZE);
      setOlderMessages((prev) => mergeMessages(page.messages, prev));
      setHasMore(page.hasMore);
    } catch {
      setError(t.chat.errorLoad);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend || !text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await sendMessage(conversation.id, profile.uid, profile.username, text);
      setText("");
    } catch (err: unknown) {
      if (err instanceof ContentBlockedError) {
        setError(t.posts.errorBannedContent);
      } else {
        setError(t.chat.errorSend);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[50vh]">
      <p className="text-xs text-[var(--muted)] mb-2 flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {t.chat.liveConnected}
      </p>

      <div className="flex-1 space-y-3 mb-4 max-h-[55vh] overflow-y-auto p-1">
        {hasMore && (
          <button
            type="button"
            onClick={loadOlder}
            disabled={loadingMore}
            className="w-full text-sm link-tomris py-2"
          >
            {loadingMore ? t.common.loading : t.chat.loadOlder}
          </button>
        )}

        {loading ? (
          <p className="text-sm text-[var(--muted)] text-center py-8">{t.common.loading}</p>
        ) : messages.length === 0 ? (
          <EmptyState
            variant="thread"
            title={t.empty.threadTitle}
            description={t.chat.emptyThread}
          />
        ) : (
          messages.map((msg) => {
            const mine = msg.authorUid === profile.uid;
            return (
              <div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-primary-light/50 border border-[var(--border)] rounded-bl-md"
                  }`}
                >
                  {!mine && (
                    <p className="text-xs font-medium text-tomris mb-0.5">@{msg.authorUsername}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-[var(--muted)]"}`}
                  >
                    {formatTime(msg.createdAt, locale)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="alert-error text-sm mb-3">{error}</div>}

      {canSend ? (
        <form onSubmit={handleSend} className="flex gap-2 sticky bottom-0 bg-[var(--card)]/80 backdrop-blur pt-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.chat.messagePlaceholder}
            maxLength={2000}
            disabled={submitting}
            className="input-field flex-1 text-sm py-2"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="btn-primary sm:w-auto px-4 text-sm py-2"
          >
            {t.chat.send}
          </button>
        </form>
      ) : (
        <p className="text-xs text-[var(--muted)]">{t.chat.gateHint}</p>
      )}
    </div>
  );
}
