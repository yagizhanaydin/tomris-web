"use client";

import { AuthProvider } from "@/context/AuthProvider";
import { LanguageProvider } from "@/context/LanguageProvider";
import { PermissionPrompt } from "@/components/PermissionPrompt";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PermissionPrompt />
        {children}
      </AuthProvider>
    </LanguageProvider>
  );
}
