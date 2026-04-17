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

      <h2 className="mt-10 font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
        Qué hacemos
      </h2>
      <ul className="mt-4 space-y-4 text-[#4b5563]">
        <li>
          <strong className="text-[#111827]">Diseñamos kits</strong> con pasos claros, errores
          comunes anticipados y conexión explícita con sostenibilidad.
        </li>
        <li>
          <strong className="text-[#111827]">Acompañamos docentes</strong> con guías, minitutoriales
          y una plataforma para registrar talleres, asistencia y evaluaciones con rúbricas.
        </li>
        <li>
          <strong className="text-[#111827]">Documentamos el piloto</strong> con métricas básicas
          que permiten mejorar cada iteración sin perder trazabilidad.
        </li>
      </ul>

      <h2 className="mt-10 font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
        Cómo funciona
      </h2>
      <ol className="mt-4 list-decimal space-y-4 pl-5 text-[#4b5563]">
        <li>El colegio participa del piloto y se crean grupos con su docente referente.</li>
        <li>Los estudiantes exploran el desafío, construyen el prototipo y registran evidencias.</li>
        <li>El docente usa GAIA para planificar talleres, evaluar con rúbrica y consolidar resultados.</li>
        <li>El equipo GAIA monitorea indicadores agregados para ajustar materiales y soporte.</li>
      </ol>
      <p className="mt-8 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4 text-sm text-[#4b5563]">
        El contenido público (proyectos, recursos y minitutoriales) está disponible para inspirar
        otras comunidades; el seguimiento fino del piloto vive en el área privada.
      </p>
    </div>
  );
}
