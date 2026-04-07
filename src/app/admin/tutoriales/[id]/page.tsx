import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { TutorialForm, type KitOption, type TutorialFormValues } from "@/components/admin/tutorial-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminTutorialEditPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: t } = await supabase.from("tutorials").select("*").eq("id", id).maybeSingle();
  const { data: kits } = await supabase.from("kit_projects").select("id, name").order("name");

  if (!t) notFound();

  const kitOpts: KitOption[] = (kits ?? []).map((k) => ({ id: k.id, name: k.name }));
  const initial: TutorialFormValues = {
    id: t.id,
    kit_project_id: t.kit_project_id,
    title: t.title,
    slug: t.slug,
    description: t.description,
    content_md: (t as { content_md?: string | null }).content_md ?? null,
    video_url: t.video_url,
    duration_min: t.duration_min,
    sort_order: t.sort_order,
    is_public: t.is_public,
  };

  return (
    <div className="space-y-8">
      <Link href="/admin/tutoriales" className="text-sm font-medium text-[#0baba9] hover:underline">
        ← Volver
      </Link>
      <Card>
        <CardTitle>Editar: {t.title}</CardTitle>
        <CardDescription>
          Vista pública:{" "}
          <Link href={`/minitutoriales/${t.slug}`} className="text-[#0baba9] underline">
            /minitutoriales/{t.slug}
          </Link>
        </CardDescription>
        <div className="mt-6">
          <TutorialForm kits={kitOpts} initial={initial} mode="edit" />
        </div>
      </Card>
    </div>
  );
}
