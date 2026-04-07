export const metadata = { title: "Qué hacemos" };

export default function QueHacemosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0baba9] md:text-4xl">
        Qué hacemos
      </h1>
      <ul className="mt-8 space-y-4 text-[#4b5563]">
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
    </div>
  );
}
