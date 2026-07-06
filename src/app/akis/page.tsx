"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import {
  needsProfileCompletion,
  isPlatformUnlocked,
} from "@/lib/auth-routing";
import { AppShell } from "@/components/AppShell";
import { VerificationStatusBanner } from "@/components/VerificationStatusBanner";
import { VerificationGate } from "@/components/VerificationGate";
import { PostFiltersBar } from "@/components/posts/PostFilters";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard } from "@/components/posts/PostCard";
import {
  fetchPosts,
  createPost,
  deletePost,
  filterPosts,
} from "@/lib/posts/service";
import { DEFAULT_POST_FILTERS } from "@/types/post";
import type { Post, PostAudience, PostLocationInput } from "@/types/post";
import type { Gender } from "@/types/user";
import { useRedirectUnverifiedEmail } from "@/lib/use-auth-guard";

export default function FeedPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  useRedirectUnverifiedEmail();

  const [posts, setPosts] = useState<Post[]>([]);
  const [filters, setFilters] = useState(DEFAULT_POST_FILTERS);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const unlocked = isPlatformUnlocked(profile);

  const loadPosts = useCallback(async () => {
    setFetching(true);
    setError("");
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch {
      setError(t.posts.errorGeneric);
    } finally {
      setFetching(false);
    }
  }, [t.posts.errorGeneric]);

  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
    if (!loading && user && !profile) router.replace("/kayit-tamamla");
    if (!loading && profile && needsProfileCompletion(profile)) {
      router.replace("/kayit-tamamla");
    }
    if (!loading && profile?.verificationStatus === "banned") {
      router.replace("/hesap-yasaklandi");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (profile) loadPosts();
  }, [profile, loadPosts]);

  const visiblePosts = useMemo(() => {
    if (!profile) return [];
    return filterPosts(posts, filters, profile.gender);
  }, [posts, filters, profile]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/giris");
  };

  const handlePublish = async (
    content: string,
    location: PostLocationInput,
    audience: PostAudience
  ) => {
    if (!profile || !unlocked) return;
    await createPost(
      profile.uid,
      profile.username,
      profile.gender,
      content,
      location,
      audience
    );
    await loadPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!profile) return;
    try {
      await deletePost(postId, profile.uid);
      await loadPosts();
    } catch {
      setError(t.posts.errorGeneric);
    }
  };

  const audienceLabel = (audience: PostAudience) => {
    if (audience === "all") return t.posts.audienceAll;
    if (audience === "kadin") return t.posts.audienceWomen;
    return t.posts.audienceMen;
  };

  const genderLabel = (gender: Gender) =>
    gender === "kadin" ? t.posts.authorFemale : t.posts.authorMale;

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center tomris-gradient">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AppShell onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-tomris">{t.posts.title}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{t.posts.subtitle}</p>
        </div>

        {!unlocked && <VerificationStatusBanner />}

        {unlocked ? (
          <PostComposer onPublish={handlePublish} />
        ) : (
          <VerificationGate>
            <PostComposer onPublish={async () => {}} disabled />
          </VerificationGate>
        )}

        <PostFiltersBar filters={filters} onChange={setFilters} />

        {error && <div className="alert-error">{error}</div>}

        {fetching ? (
          <p className="text-sm text-[var(--muted)]">{t.common.loading}</p>
        ) : visiblePosts.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-8">
            {posts.length === 0 ? t.posts.empty : t.posts.emptyFiltered}
          </p>
        ) : (
          <div className="space-y-4">
            {visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                profile={profile}
                canInteract={unlocked}
                onDelete={handleDelete}
                audienceLabel={audienceLabel}
                genderLabel={genderLabel}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
