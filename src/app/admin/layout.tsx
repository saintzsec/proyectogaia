import { requireRole } from "@/lib/auth";
import { ADMIN_DASHBOARD_NAV } from "@/config/navigation";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { SaveToastProvider } from "@/components/ui/save-toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin_gaia");

  return (
    <DashboardShell variant="admin" homeHref="/admin" navItems={[...ADMIN_DASHBOARD_NAV]}>
      <SaveToastProvider>{children}</SaveToastProvider>
    </DashboardShell>
  );
}
