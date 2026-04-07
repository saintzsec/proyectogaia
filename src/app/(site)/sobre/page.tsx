export const metadata = { title: "Sobre GAIA" };

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0baba9] md:text-4xl">
        Sobre GAIA
      </h1>
      <p className="mt-6 text-lg text-[#4b5563]">
        GAIA es un proyecto educativo que acerca la ciencia aplicada a la sostenibilidad. Inspirado en
        experiencias tipo “makers” de divulgación rigurosa, buscamos que cualquier aula pueda
        reproducir proyectos con materiales accesibles, seguridad y sentido ambiental.
      </p>
      <h2 className="mt-10 font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
        Misión
      </h2>
      <p className="mt-3 text-[#4b5563]">
        Facilitar aprendizajes profundos sobre recursos naturales y tecnologías apropiadas,
        fortaleciendo el pensamiento crítico y la acción colectiva.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
        Visión
      </h2>
      <p className="mt-3 text-[#4b5563]">
        Una red de escuelas que comparte kits, datos y narrativas de impacto — lista para crecer
        hacia nuevos desafíos científicos y, eventualmente, acompañamiento digital en el aula.
      </p>
    </div>
  );
}
