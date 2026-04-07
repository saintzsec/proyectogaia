import { ClassJoinForm } from "@/components/clase/class-join-form";

export const metadata = { title: "Unirse a una clase | GAIA" };

export default function UnirseClasePage() {
  return (
    <div className="mx-auto max-w-3xl py-12 md:py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0baba9] md:text-3xl">
        Unirse con código de clase
      </h1>
      <p className="mt-3 text-[#4b5563]">
        Si tu docente te compartió un código (formato XXX-XXX-XXX), regístrate como líder de grupo y
        añade a tus compañeros. Guarda los enlaces personales que te mostraremos al final.
      </p>
      <div className="mt-8">
        <ClassJoinForm />
      </div>
    </div>
  );
}
