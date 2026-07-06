"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { needsEmailVerification } from "@/lib/auth-routing";

/** E-posta/şifre kullanıcıları doğrulamadan platform sayfalarına giremesin */
export function useRedirectUnverifiedEmail() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    if (needsEmailVerification(user, profile)) {
      router.replace("/eposta-dogrula");
    }
  }, [user, profile, loading, router]);
}
