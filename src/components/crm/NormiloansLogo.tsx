import type { HTMLAttributes } from "react";

interface NormiloansLogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "full-color";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showTagline?: boolean;
}

export function NormiloansLogo({
  variant = "full-color",
  size = "lg",
  showTagline = true,
  className = "",
  ...props
}: NormiloansLogoProps) {
  // Height sizing mapping for logo image
  const heightClass =
    size === "sm"
      ? "h-10 sm:h-12"
      : size === "md"
        ? "h-14 sm:h-16"
        : size === "lg"
          ? "h-20 sm:h-24"
          : size === "xl"
            ? "h-28 sm:h-32"
            : "h-36 sm:h-44";

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} {...props}>
      {/* 
        Exact Official Normiloans Logo Image uploaded by user.
        Renders logo asset directly without any white background card container.
      */}
      <img
        src="/normiloans-logo.png"
        alt="Normiloans - Fueal Your Ambitions"
        className={`${heightClass} w-auto max-w-full object-contain shrink-0`}
      />
    </div>
  );
}
