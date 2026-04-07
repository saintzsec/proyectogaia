import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { TutorialForm, type KitOption } from "@/components/admin/tutorial-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminTutorialNuevoPage() {
  const { supabase } = await requireUser();
  const { data: kits } = await supabase.from("kit_projects").select("id, name").order("name");
  const kitOpts: KitOption[] = (kits ?? []).map((k) => ({ id: k.id, name: k.name }));

  return (
    <div className="space-y-8">
      <Link href="/admin/tutoriales" className="text-sm font-medium text-[#0baba9] hover:underline">
        ← Volver
      </Link>
      <Card>
        <CardTitle>Nuevo minitutorial</CardTitle>
        <CardDescription>Slug único (minúsculas y guiones). Contenido en Markdown opcional.</CardDescription>
        <div className="mt-6">
          <TutorialForm kits={kitOpts} mode="create" />
        </div>
      </Card>
    </div>
  );
}
