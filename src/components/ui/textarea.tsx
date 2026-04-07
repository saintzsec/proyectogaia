import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0baba9]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
