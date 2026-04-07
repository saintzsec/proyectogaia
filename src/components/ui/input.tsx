import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#0baba9]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
