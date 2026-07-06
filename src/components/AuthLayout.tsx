import { AtaturkQuote } from "./AtaturkQuote";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)]">
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)] text-white text-2xl font-bold mb-4 shadow-lg">
              T
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-[var(--border)] p-6 sm:p-8">
            <div className="mb-6">
              <AtaturkQuote />
            </div>
            {children}
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-[var(--muted)]">
        Tomris Web &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
