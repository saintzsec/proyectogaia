import Image from "next/image";
import Link from "next/link";
import type { NavItem } from "@/config/navigation";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { DashboardNav } from "@/components/layouts/dashboard-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type Variant = "docente" | "admin";

const styles: Record<
  Variant,
  { title: string; accentInactive: string; accentActive: string }
> = {
  docente: {
    title: "Panel docente",
    accentInactive: "hover:bg-[#0baba9]/10 hover:text-[#0baba9]",
    accentActive: "bg-[#0baba9]/10 font-medium text-[#0baba9]",
  },
  admin: {
    title: "Administración GAIA",
    accentInactive: "hover:bg-[#f07800]/10 hover:text-[#c2410c]",
    accentActive: "bg-[#f07800]/10 font-medium text-[#c2410c]",
  },
};

export function DashboardShell({
  variant,
  homeHref,
  navItems,
  children,
}: {
  variant: Variant;
  homeHref: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const s = styles[variant];

  return (
    <div className="gaia-surface min-h-screen">
      <div className="border-b border-[var(--gaia-border)] bg-[var(--gaia-surface)] pt-[env(safe-area-inset-top,0)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link href={homeHref} className="flex items-center">
              <Image
                src="/brand/gaia-logo-light.svg"
                alt="GAIA"
                width={140}
                height={36}
                className="gaia-logo-light h-8 w-auto"
                priority
              />
              <Image
                src="/brand/gaia-logo-dark.svg"
                alt="GAIA"
                width={140}
                height={36}
                className="gaia-logo-dark h-8 w-auto"
                priority
              />
            </Link>
            <span className="hidden text-sm font-medium text-[var(--gaia-text-muted)] sm:inline">
              {s.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-[var(--gaia-text-muted)] hover:text-[#0baba9] sm:text-sm"
            >
              <span className="sm:hidden">Inicio</span>
              <span className="hidden sm:inline">Sitio público</span>
            </Link>
            <SignOutButton />
            <ThemeToggle compact />
          </div>
        </div>
        <DashboardNav
          items={navItems}
          accentInactive={s.accentInactive}
          accentActive={s.accentActive}
        />
      </div>
      <div
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-8 md:px-6 outline-none"
      >
        {variant === "docente" ? (
          <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] shadow-sm">
            <div className="relative h-40 w-full md:h-48">
              <Image
                src="/brand/docente-panel-cover.jpg"
                alt="Estudiantes en aula usando kits GAIA"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0baba9]/75 via-[#0baba9]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                <p className="text-xs uppercase tracking-wide text-white/90">GAIA docente</p>
                <p className="text-base font-semibold md:text-lg">
                  Gestiona tus clases con evaluación y seguimiento visual
                </p>
              </div>
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
