import Image from "next/image";
import Link from "next/link";
import { PUBLIC_MAIN_NAV } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function PublicHeader() {
  return (
    <header className="gaia-surface sticky top-0 z-40 border-b border-[var(--gaia-border)]/80 bg-[var(--gaia-surface)]/90 pt-[env(safe-area-inset-top,0)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6">
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/gaia-logo-light.svg"
              alt="GAIA"
              width={160}
              height={40}
              className="gaia-logo-light h-9 w-auto md:h-10"
              priority
            />
            <Image
              src="/brand/gaia-logo-dark.svg"
              alt="GAIA"
              width={160}
              height={40}
              className="gaia-logo-dark h-9 w-auto md:h-10"
              priority
            />
          </Link>
        </div>
        <nav
          className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm font-medium text-[var(--gaia-text-muted)] lg:flex"
          aria-label="Principal"
        >
          {PUBLIC_MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className="transition-colors hover:text-[#0baba9]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/registro"
            className="hidden text-sm font-medium text-[#0baba9] hover:underline md:inline"
          >
            Registro
          </Link>
          <Link href="/login" className="hidden sm:block">
            <Button type="button" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/login" className="sm:hidden">
            <Button type="button" size="sm" variant="outline">
              Entrar
            </Button>
          </Link>
          <ThemeToggle compact />
        </div>
      </div>
      <nav
        className="flex gap-3 overflow-x-auto overscroll-x-contain border-t border-[var(--gaia-border)] px-4 py-2.5 text-xs font-medium text-[var(--gaia-text-muted)] [-webkit-overflow-scrolling:touch] lg:hidden"
        aria-label="Principal móvil"
      >
        {PUBLIC_MAIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className="shrink-0 whitespace-nowrap py-1.5"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
