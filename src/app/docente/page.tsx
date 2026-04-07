import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DocenteHomePage() {
  const { profile, supabase } = await requireUser();

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!teacher) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Bienvenido/a, {profile.full_name ?? "docente"}
        </h1>
        <Card className="border-[#fed705]/60 bg-[#fffbeb]">
          <CardTitle>Falta vincular tu perfil docente</CardTitle>
          <CardDescription>
            Tu cuenta existe, pero aún no apareces en la tabla de docentes de un colegio. Pide al
            equipo GAIA que complete la asignación desde el panel administrador (colegio + perfil).
          </CardDescription>
        </Card>
        <Link href="/">
          <Button type="button" variant="outline">
            Volver al sitio público
          </Button>
        </Link>
      </div>
    );
  }

  const { data: groups } = await supabase
    .from("student_groups")
    .select("id")
    .eq("teacher_id", teacher.id);

  const groupIds = groups?.map((g) => g.id) ?? [];

  let safeWorkshops = 0;
  if (groupIds.length) {
    const { count } = await supabase
      .from("workshops")
      .select("id", { count: "exact", head: true })
      .in("student_group_id", groupIds);
    safeWorkshops = count ?? 0;
  }

  const { count: evalCount } = await supabase
    .from("evaluations")
    .select("id", { count: "exact", head: true })
    .eq("evaluator_id", profile.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--foreground)] md:text-3xl">
          Hola, {profile.full_name ?? "docente"}
        </h1>
        <p className="mt-2 text-[var(--gaia-text-muted)]">
          Aquí concentras talleres, evaluaciones con rúbrica y evidencias del piloto GAIA.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] shadow-sm">
        <div className="relative h-44 w-full md:h-52">
          <Image
            src="/brand/docente-classroom-banner.jpg"
            alt="Ambiente de aula para proyectos GAIA"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
            <p className="text-xs uppercase tracking-wide text-white/85">Piloto activo</p>
            <p className="text-lg font-semibold">
              Tus grupos ya pueden registrar evidencias y evaluaciones en tiempo real
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle className="text-3xl font-bold text-[#0baba9]">{groups?.length ?? 0}</CardTitle>
          <CardDescription>Grupos a tu cargo</CardDescription>
          <Link href="/docente/grupos" className="mt-3 inline-block text-sm font-medium text-[#0baba9]">
            Gestionar →
          </Link>
        </Card>
        <Card>
          <CardTitle className="text-3xl font-bold text-[#42b232]">{safeWorkshops}</CardTitle>
          <CardDescription>Talleres registrados</CardDescription>
          <Link href="/docente/talleres" className="mt-3 inline-block text-sm font-medium text-[#0baba9]">
            Ver historial →
          </Link>
        </Card>
        <Card>
          <CardTitle className="text-3xl font-bold text-[#f07800]">{evalCount ?? 0}</CardTitle>
          <CardDescription>Evaluaciones enviadas (tus registros)</CardDescription>
          <Link href="/docente/evaluaciones" className="mt-3 inline-block text-sm font-medium text-[#0baba9]">
            Ir a rúbricas →
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Flujo sugerido</CardTitle>
          <CardDescription>
            1) Crea o revisa grupos · 2) Registra cada taller · 3) Evalúa con la rúbrica del kit · 4)
            Sube evidencias fotográficas o documentos.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Recursos abiertos</CardTitle>
          <CardDescription>
            Los minitutoriales y la biblioteca están disponibles también en el sitio público para
            proyectar en clase.
          </CardDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/minitutoriales">
              <Button type="button" size="sm" variant="secondary">
                Minitutoriales
              </Button>
            </Link>
            <Link href="/proyectos/filtro-biologico-agua">
              <Button type="button" size="sm" variant="outline">
                Ficha del kit
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
