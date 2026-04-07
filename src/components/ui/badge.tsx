import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#42b232]/15 px-2.5 py-0.5 text-xs font-medium text-[#2d7a22]",
        className,
      )}
      {...props}
    />
  );
}
