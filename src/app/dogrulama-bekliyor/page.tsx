"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Eski URL — artık dashboard'a yönlendirilir (yumuşak bekleme deneyimi). */
export default function VerificationPendingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center tomris-gradient">
      <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
    </div>
  );
}
