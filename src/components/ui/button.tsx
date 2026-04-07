import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex touch-manipulation items-center justify-center gap-2 rounded-[var(--radius-gaia)] font-medium transition-[transform,colors,opacity,box-shadow] duration-150 ease-out active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0baba9] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100",
          variant === "primary" &&
            "bg-[#0baba9] text-white hover:bg-[#09908e] active:bg-[#087a78]",
          variant === "secondary" &&
            "bg-[#fed705] text-[#111827] hover:bg-[#e6c304]",
          variant === "outline" &&
            "border border-[#0baba9] bg-transparent text-[#0baba9] hover:bg-[#0baba9]/5",
          variant === "ghost" && "bg-transparent text-[#0baba9] hover:bg-black/5",
          size === "sm" && "min-h-11 px-4 text-sm sm:min-h-9 sm:px-3",
          size === "md" && "min-h-12 px-5 text-sm sm:min-h-10 sm:px-4",
          size === "lg" && "min-h-12 px-6 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
