import { requireRole } from "@/lib/auth";
import { DOCENTE_DASHBOARD_NAV } from "@/config/navigation";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { SaveToastProvider } from "@/components/ui/save-toast";

export default async function DocenteLayout({ children }: { children: React.ReactNode }) {
  await requireRole("docente");

  return (
    <DashboardShell variant="docente" homeHref="/docente" navItems={[...DOCENTE_DASHBOARD_NAV]}>
      <SaveToastProvider>{children}</SaveToastProvider>
    </DashboardShell>
  );
}
