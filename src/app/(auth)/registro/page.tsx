import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Registro docente" };

export default function RegistroPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardTitle>Registro de docente</CardTitle>
        <CardDescription>
          Crea tu cuenta con rol docente. Un administrador GAIA debe asignarte a un colegio en el panel
          admin para que puedas crear grupos y talleres en el piloto.
        </CardDescription>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-[#6b7280]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-[#0baba9] hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
