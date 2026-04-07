import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  KitDetailContent,
  type KitDetailRecord,
  type KitTutorialSummary,
} from "@/components/kits/kit-detail-content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("kit_projects").select("name").eq("slug", slug).maybeSingle();
  return { title: data?.name ?? "Proyecto" };
}

export default async function DocenteKitDetailPage({ params }: Props) {
  await requireUser();
  const { slug } = await params;
  const supabase = await createClient();
  const { data: kit } = await supabase.from("kit_projects").select("*").eq("slug", slug).maybeSingle();

  if (!kit) notFound();

  const { data: tutorials } = await supabase
    .from("tutorials")
    .select("slug, title, description, duration_min")
    .eq("kit_project_id", kit.id)
    .order("sort_order");

  return (
    <KitDetailContent
      kit={kit as KitDetailRecord}
      tutorials={(tutorials ?? []) as KitTutorialSummary[]}
      backHref="/docente/proyectos"
      tutorialLinkBase="docente"
    />
  );
}
