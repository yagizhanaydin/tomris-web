export function AtaturkQuote() {
  return (
    <blockquote className="border-l-4 border-[var(--primary)] pl-4 py-2">
      <p className="text-sm sm:text-base italic text-[var(--muted)] leading-relaxed">
        &ldquo;Şuna inanmak lazımdır ki, dünya yüzünde gördüğümüz her şey kadının eseridir.&rdquo;
      </p>
      <footer className="mt-2 text-xs sm:text-sm font-semibold text-[var(--primary)]">
        — Mustafa Kemal Atatürk
      </footer>
    </blockquote>
  );
}
