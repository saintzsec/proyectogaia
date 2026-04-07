import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function LandingPillarsSection() {
  return (
    <section className="bg-[#fdfdfb] py-16 md:py-20" aria-labelledby="pillars-heading">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2
          id="pillars-heading"
          className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#111827] md:text-3xl"
        >
          Por qué GAIA
        </h2>
        <p className="mt-3 max-w-2xl text-[#4b5563]">
          Conectamos curiosidad científica con problemas ambientales reales. Los estudiantes
          construyen evidencia; los docentes guían con claridad y menos fricción administrativa.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card>
            <CardTitle>Estudiantes</CardTitle>
            <CardDescription>
              Aprenden haciendo, documentando y comunicando como en un laboratorio escolar moderno.
            </CardDescription>
          </Card>
          <Card>
            <CardTitle>Docentes</CardTitle>
            <CardDescription>
              Talleres, asistencia, rúbricas y evidencias en un solo flujo pensado para el piloto.
            </CardDescription>
          </Card>
          <Card>
            <CardTitle>Escalabilidad</CardTitle>
            <CardDescription>
              Base lista para más kits y colegios; el sitio público está pensado también para verse bien en celular.
            </CardDescription>
          </Card>
        </div>
      </div>
    </section>
  );
}
