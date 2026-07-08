import { TOMRIS_MARK_PURPLE } from "@/lib/brand/mark";

type TomrisMarkProps = {
  className?: string;
  size?: number;
};

/** Marka simgesi — üç birleşen daire (dayanışma); maskable ikon ile uyumlu */
export function TomrisMark({ className = "", size = 36 }: TomrisMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      aria-hidden
    >
      <rect width="512" height="512" rx="112" fill={TOMRIS_MARK_PURPLE} />
      <g fill="#ffffff" opacity="0.96">
        <circle cx="256" cy="178" r="62" />
        <circle cx="168" cy="292" r="62" />
        <circle cx="344" cy="292" r="62" />
      </g>
      <circle cx="256" cy="248" r="38" fill={TOMRIS_MARK_PURPLE} />
      <circle cx="256" cy="248" r="22" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}
