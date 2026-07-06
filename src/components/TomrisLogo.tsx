interface TomrisLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const iconSizes = {
  sm: "w-9 h-9 text-base",
  md: "w-12 h-12 text-xl",
  lg: "w-14 h-14 text-2xl",
};

const textSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function TomrisLogo({ size = "md", showText = true }: TomrisLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${iconSizes[size]} rounded-2xl flex items-center justify-center font-extrabold text-white shadow-md bg-gradient-to-br from-violet-600 to-purple-700 shrink-0`}
        aria-hidden
      >
        T
      </div>
      {showText && (
        <div className="text-left">
          <p className={`font-bold ${textSizes[size]} text-tomris leading-tight tracking-tight`}>
            Tomris
          </p>
          <p className="text-xs text-[var(--muted)] hidden sm:block">
            Dayanışma platformu
          </p>
        </div>
      )}
    </div>
  );
}
