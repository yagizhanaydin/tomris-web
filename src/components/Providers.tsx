"use client";

import { AuthProvider } from "@/context/AuthProvider";
import { LanguageProvider } from "@/context/LanguageProvider";
import { PermissionPrompt } from "@/components/PermissionPrompt";
import { PushOptIn } from "@/components/PushOptIn";
import { TomrisSerwistProvider } from "@/components/TomrisSerwistProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TomrisSerwistProvider>
      <LanguageProvider>
        <AuthProvider>
          <PermissionPrompt />
          <PushOptIn />
          {children}
        </AuthProvider>
      </LanguageProvider>
    </TomrisSerwistProvider>
  );
}
