import { cn } from "@/lib/utils";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * The NUVORA mark: two angled bars forming a negative-space "N",
 * built from geometric strokes rather than a literal letterform so
 * it reads cleanly at favicon size and works in monochrome.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="NUVORA"
    >
      <rect x="4" y="4" width="9" height="32" rx="2" fill="currentColor" />
      <rect x="27" y="4" width="9" height="32" rx="2" fill="currentColor" />
      <path d="M13 4L27 36H27L13 4Z" fill="currentColor" />
      <path
        d="M13 4H16.6L30 34.5V36H27L13.4 5.5V4Z"
        fill="currentColor"
        className="text-nuvora-green"
        fillOpacity="1"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markClassName?: string;
  size?: number;
}

export function Logo({ className, markClassName, size = 28 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} className={cn("text-nuvora-white", markClassName)} />
      <span className="font-display text-lg font-semibold tracking-tight">NUVORA</span>
    </div>
  );
}
