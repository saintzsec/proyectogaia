import { SiteShell } from "@/components/layouts/site-shell";
import { SaveToastProvider } from "@/components/ui/save-toast";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SaveToastProvider>
      <SiteShell>{children}</SiteShell>
    </SaveToastProvider>
  );
}
