import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { KitEditForm, type KitEditValues } from "@/components/admin/kit-edit-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminKitEditPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: kit } = await supabase.from("kit_projects").select("*").eq("id", id).maybeSingle();
  const { data: tutorials } = await supabase
    .from("tutorials")
    .select("id, title, slug, sort_order, kit_project_id")
    .order("sort_order")
    .order("title");

  if (!kit) notFound();

  const values: KitEditValues = {
    id: kit.id,
    slug: kit.slug,
    name: kit.name,
    short_description: kit.short_description,
    description: kit.description,
    learning_objective: kit.learning_objective,
    materials_md: kit.materials_md,
    steps_md: kit.steps_md,
    common_errors_md: kit.common_errors_md,
    sustainability_md: kit.sustainability_md,
    what_you_learn_md: kit.what_you_learn_md,
    tutorial_url: kit.tutorial_url,
    tutorial_video_url: (kit as { tutorial_video_url?: string | null }).tutorial_video_url ?? null,
    is_published: kit.is_published,
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/proyectos" className="text-sm font-medium text-[#0baba9] hover:underline">
          ← Volver a proyectos
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Editar kit: {kit.name}
        </h1>
      </div>
      <Card>
        <CardTitle>Contenido pedagógico</CardTitle>
        <CardDescription>
          Markdown en materiales, pasos y secciones afines. Vista previa pública en{" "}
          <Link href={`/proyectos/${kit.slug}`} className="text-[#0baba9] underline">
            /proyectos/{kit.slug}
          </Link>
          .
        </CardDescription>
        <div className="mt-6">
          <KitEditForm
            kit={values}
            tutorials={
              tutorials?.map((t) => ({
                id: t.id,
                title: t.title,
                slug: t.slug,
                sort_order: t.sort_order,
                kit_project_id: t.kit_project_id,
              })) ?? []
            }
          />
        </div>
      </Card>
    </div>
  );
}
