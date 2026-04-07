export const metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0baba9] md:text-4xl">
        Contacto
      </h1>
      <p className="mt-6 text-[#4b5563]">
        Para alianzas institucionales, réplicas del piloto o soporte a docentes, escribe al equipo
        GAIA desde tu correo institucional. En esta versión MVP el formulario de envío se integra en
        una fase posterior; mientras tanto, usa los canales oficiales del proyecto.
      </p>
      <p className="mt-4 text-sm text-[#6b7280]">
        Supuesto de producto: se configurará un alias tipo{" "}
        <span className="font-mono text-[#111827]">contacto@gaia-proyecto.org</span> al pasar a
        producción.
      </p>
    </div>
  );
}
