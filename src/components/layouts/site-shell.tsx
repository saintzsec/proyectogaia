import { PublicFooter } from "@/components/site/public-footer";
import { PublicHeader } from "@/components/site/public-header";

/**
 * Layout general del sitio público (Fase 2): header sticky, main flexible, footer.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="gaia-surface flex min-h-screen flex-col">
      <PublicHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
