"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageProvider";
import { AuthorGenderBadge } from "@/components/AuthorGenderBadge";
import { ReportButton } from "@/components/ReportButton";
import { localeToIntl } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { fetchComments, addComment } from "@/lib/posts/service";
import { ContentBlockedError } from "@/lib/security/content-filter";
import { formatPostLocation } from "@/lib/locations";
import type { Post, Comment } from "@/types/post";
import type { UserProfile } from "@/types/user";

interface PostCardProps {
  post: Post;
  profile: UserProfile;
  canInteract: boolean;
  onDelete?: (postId: string) => void;
  audienceLabel: (audience: Post["audience"]) => string;
}

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleString(localeToIntl(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PostCard({
  post,
  profile,
  canInteract,
  onDelete,
  audienceLabel,
}: PostCardProps) {
  const { t, locale } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const data = await fetchComments(post.id);
      setComments(data);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments, loadComments]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canInteract || !commentText.trim()) return;
    setCommentError("");
    setSubmitting(true);
    try {
      await addComment(post.id, profile.uid, profile.username, commentText);
      setCommentText("");
      await loadComments();
    } catch (err: unknown) {
      if (err instanceof ContentBlockedError) {
        setCommentError(t.posts.errorBannedContent);
      } else {
        setCommentError(t.posts.errorGeneric);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete || !confirm(t.posts.deleteConfirm)) return;
    onDelete(post.id);
  };

  return (
    <article className="card space-y-3">
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-tomris">@{post.authorUsername}</p>
            <AuthorGenderBadge gender={post.authorGender} />
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {formatDate(post.createdAt, locale)}
          </p>
        </div>
        {post.authorUid === profile.uid && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs text-red-600 hover:underline shrink-0"
          >
            {t.posts.deletePost}
          </button>
        )}
      </header>

      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-lg bg-primary-light text-tomris">
          📍 {formatPostLocation(post, locale)}
        </span>
        <span className="px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--muted)]">
          👁 {audienceLabel(post.audience)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="text-sm link-tomris"
        >
          {showComments ? t.posts.hideComments : t.posts.showComments}
          {comments.length > 0 && ` (${comments.length})`}
        </button>
        {canInteract && (
          <ReportButton
            reporterUid={profile.uid}
            reporterUsername={profile.username}
            targetType="post"
            targetId={post.id}
            targetAuthorUid={post.authorUid}
          />
        )}
      </div>

      {showComments && (
        <div className="border-t border-[var(--border)] pt-3 space-y-3">
          {loadingComments ? (
            <p className="text-sm text-[var(--muted)]">{t.common.loading}</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{t.posts.commentEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="text-sm p-3 rounded-xl bg-primary-light/30 border border-[var(--border)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-tomris">@{c.authorUsername}</span>
                      <span className="text-xs text-[var(--muted)] ml-2">
                        {formatDate(c.createdAt, locale)}
                      </span>
                    </div>
                    {canInteract && c.authorUid !== profile.uid && (
                      <ReportButton
                        reporterUid={profile.uid}
                        reporterUsername={profile.username}
                        targetType="comment"
                        targetId={c.id}
                        targetAuthorUid={c.authorUid}
                      />
                    )}
                  </div>
                  <p className="mt-1 break-words">{c.content}</p>
                </li>
              ))}
            </ul>
          )}

          {canInteract ? (
            <form onSubmit={handleComment} className="space-y-2">
              {commentError && <div className="alert-error text-xs">{commentError}</div>}
              <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t.posts.commentPlaceholder}
                maxLength={500}
                disabled={submitting}
                className="input-field flex-1 text-sm py-2"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="btn-primary sm:w-auto px-4 text-sm py-2"
              >
                {t.posts.commentSubmit}
              </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-[var(--muted)]">{t.posts.gateHint}</p>
          )}
        </div>
      )}
    </article>
  );
}
