export const metadata = { title: "Cómo funciona" };

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0baba9] md:text-4xl">
        Cómo funciona
      </h1>
      <ol className="mt-8 list-decimal space-y-4 pl-5 text-[#4b5563]">
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
