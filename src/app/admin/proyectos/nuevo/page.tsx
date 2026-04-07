import Link from "next/link";
import { KitCreateForm } from "@/components/admin/kit-create-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function AdminKitNuevoPage() {
  return (
    <div className="space-y-8">
      <Link href="/admin/proyectos" className="text-sm font-medium text-[#0baba9] hover:underline">
        ← Volver a proyectos
      </Link>
      <Card>
        <CardTitle>Nuevo proyecto / kit</CardTitle>
        <CardDescription>
          Define un slug único. Puedes dejarlo en borrador y publicarlo cuando el contenido esté listo.
        </CardDescription>
        <div className="mt-6">
          <KitCreateForm />
        </div>
      </Card>
    </div>
  );
}
