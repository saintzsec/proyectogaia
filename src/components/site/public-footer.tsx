import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-[#111827] text-[#e5e7eb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div>
          <Image
            src="/brand/gaia-logo-dark.svg"
            alt="GAIA"
            width={148}
            height={40}
            className="h-10 w-auto"
          />
          <p className="mt-2 max-w-sm text-sm text-[#d1d5db]">
            Plataforma abierta para ciencia aplicada, sostenibilidad y aprendizaje basado en
            proyectos.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-white">Explorar</p>
            <ul className="space-y-1 text-[#d1d5db]">
              <li>
                <Link href="/proyectos" className="hover:text-[#0baba9]">
                  Proyectos
                </Link>
              </li>
              <li>
                <Link href="/recursos" className="hover:text-[#0baba9]">
                  Biblioteca
                </Link>
              </li>
              <li>
                <Link href="/minitutoriales" className="hover:text-[#0baba9]">
                  Minitutoriales
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Equipo</p>
            <ul className="space-y-1 text-[#d1d5db]">
              <li>
                <Link href="/login" className="hover:text-[#0baba9]">
                  Acceso docentes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-[#0baba9]">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] text-center text-xs text-[#9ca3af]">
        © {new Date().getFullYear()} GAIA · Educación y sostenibilidad
      </div>
    </footer>
  );
}
