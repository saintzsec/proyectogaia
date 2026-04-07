import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const HERO_SRC = "/brand/hero-aula-gaia.png";

export function LandingHeroSection() {
  return (
    <section
      className="relative min-h-[min(100svh,820px)] overflow-hidden border-b border-[#e5e7eb] pb-[env(safe-area-inset-bottom,0)]"
      aria-labelledby="hero-heading"
    >
      <Image
        src={HERO_SRC}
        alt="Estudiantes en aula con kits de experimentos GAIA"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_35%] md:object-center"
      />
      {/* Móvil: capa uniforme para leer texto; desktop: más contraste a la izquierda */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c1929]/90 via-[#0c1929]/76 to-[#0c1929]/62 md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#0c1929]/88 via-[#0c1929]/48 to-transparent md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30"
        aria-hidden
      />
      <div
        className="gaia-wave-layer pointer-events-none absolute -bottom-16 left-0 right-0 h-36 bg-[radial-gradient(120%_100%_at_50%_100%,rgba(126,232,230,0.28),rgba(0,0,0,0))]"
        aria-hidden
      />
      <div
        className="gaia-wave-layer gaia-wave-layer--delay gaia-wave-layer--slow pointer-events-none absolute -bottom-24 left-0 right-0 h-48 bg-[radial-gradient(120%_100%_at_50%_100%,rgba(11,186,169,0.24),rgba(0,0,0,0))]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[min(100svh,820px)] max-w-6xl flex-col justify-center px-4 pb-10 pt-[max(3.5rem,env(safe-area-inset-top))] sm:px-5 md:flex-row md:items-center md:gap-10 md:px-6 md:py-20">
        <div className="max-w-xl flex-1 space-y-5 sm:space-y-6 md:max-w-[28rem]">
          <Badge className="border border-white/20 bg-white/15 text-white backdrop-blur-sm">
            Ciencia · Sostenibilidad · PBL
          </Badge>
          <h1
            id="hero-heading"
            className="font-[family-name:var(--font-heading)] text-[1.7rem] font-bold leading-[1.2] text-white drop-shadow-sm min-[400px]:text-3xl sm:text-4xl md:text-5xl"
          >
            GAIA: experimentos reales para{" "}
            <span className="text-[#7ee8e6]">aulas que transforman</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[#e2e8f0] drop-shadow-sm sm:text-lg">
            Kits prácticos, metodología activa y herramientas para docentes. Empezamos con un proyecto
            emblemático: el filtro biológico de agua — comprensión científica con impacto ambiental.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <Link href="/proyectos" className="w-full sm:w-auto">
              <Button type="button" className="w-full shadow-md shadow-black/20 sm:w-auto">
                Ver proyecto piloto
              </Button>
            </Link>
            <Link
              href="/clase/unirse"
              className="w-full sm:w-auto"
              title="Si tu docente te compartió un código de clase, regístrate aquí"
            >
              <Button
                type="button"
                variant="secondary"
                className="w-full border-2 border-[#0baba9] bg-white/95 text-[#0b7876] shadow-md hover:bg-[#e6f9f8] sm:w-auto"
              >
                Unirse a una clase (código)
              </Button>
            </Link>
            <Link href="/minitutoriales" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                className="w-full border border-white/30 bg-white/95 text-[#111827] shadow-md hover:bg-white sm:w-auto"
              >
                Minitutoriales
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
              >
                Acceder (docentes)
              </Button>
            </Link>
          </div>
        </div>

        <aside
          className="mt-10 w-full max-w-md flex-1 md:mt-0 md:ml-auto md:max-w-sm"
          aria-label="Pilares del enfoque"
        >
          <div className="rounded-[var(--radius-gaia)] border border-white/25 bg-white/12 p-7 shadow-lg backdrop-blur-md md:bg-white/10">
            <p className="text-sm font-semibold tracking-wide text-[#7ee8e6]">Enfoque</p>
            <ul className="mt-4 space-y-3.5 text-sm leading-relaxed text-white/95">
              <li className="flex gap-2.5">
                <span className="mt-0.5 shrink-0 text-[#86efac]" aria-hidden>
                  ●
                </span>
                Manos a la obra con materiales accesibles y protocolos seguros.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-0.5 shrink-0 text-[#fcd34d]" aria-hidden>
                  ●
                </span>
                Rúbricas y registro para ahorrar tiempo en evaluación.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-0.5 shrink-0 text-[#fde047]" aria-hidden>
                  ●
                </span>
                Recursos abiertos para replicar en más colegios.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
