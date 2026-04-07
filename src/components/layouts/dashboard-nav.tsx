"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

function linkActive(pathname: string, href: string) {
  if (href === "/docente" || href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({
  items,
  accentInactive,
  accentActive,
}: {
  items: NavItem[];
  accentInactive: string;
  accentActive: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="mx-auto flex max-w-6xl flex-nowrap gap-1 overflow-x-auto overscroll-x-contain border-t border-[var(--gaia-border)] px-4 py-2 text-sm [-webkit-overflow-scrolling:touch] md:flex-wrap md:gap-2 md:overflow-visible md:px-6"
      aria-label="Panel"
    >
      {items.map((item) => {
        const active = linkActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-[var(--gaia-text-muted)] transition-[transform,colors] duration-150 active:scale-[0.985] md:px-2 md:py-1",
              active ? accentActive : accentInactive,
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
