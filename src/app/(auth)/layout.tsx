import Link from "next/link";

/**
 * Fase 2 — layout de autenticación (grupo de rutas).
 * Rutas: /login, /login/forgot (sin prefijo /auth en URL).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fdfdfb]">
      <header className="border-b border-[#e5e7eb] bg-white px-4 py-4">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#0baba9]"
          >
            GAIA
          </Link>
          <Link href="/" className="text-sm text-[#6b7280] hover:text-[#0baba9]">
            Sitio público
          </Link>
        </div>
      </header>
      <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </div>
    </div>
  );
}
