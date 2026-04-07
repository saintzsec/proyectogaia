import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  TutorialDetailContent,
  type TutorialDetailRecord,
} from "@/components/tutorials/tutorial-detail-content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("tutorials")
    .select("title")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  return { title: data?.title ?? "Minitutorial" };
}

export default async function MinitutorialPublicPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: tutorial } = await supabase
    .from("tutorials")
    .select("title, slug, description, duration_min, video_url, content_md, kit_project_id")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!tutorial) notFound();

  let kitName: string | null = null;
  if (tutorial.kit_project_id) {
    const { data: k } = await supabase
      .from("kit_projects")
      .select("name")
      .eq("id", tutorial.kit_project_id)
      .maybeSingle();
    kitName = k?.name ?? null;
  }

  return (
    <TutorialDetailContent
      tutorial={tutorial as TutorialDetailRecord}
      kitName={kitName}
      backHref="/minitutoriales"
    />
  );
}
