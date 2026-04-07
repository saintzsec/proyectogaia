import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { sanitizeInternalNext } from "@/lib/internal-path";

export const metadata = { title: "Iniciar sesión" };

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const nextPath = sanitizeInternalNext(sp.next ?? null);
  const authError = sp.error === "auth";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardTitle>Acceso docentes y equipo</CardTitle>
        <CardDescription>
          Entra con tu correo y contraseña. Si aún no tienes cuenta, puedes registrarte como docente; el
          equipo GAIA te vinculará a tu colegio en el piloto.
        </CardDescription>
        {authError ? (
          <p className="mt-4 text-sm text-red-600">
            No se pudo completar el inicio de sesión. Vuelve a intentarlo o contacta al equipo GAIA.
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm nextPath={nextPath} />
        </div>
        <p className="mt-6 space-y-2 text-center text-sm text-[#6b7280]">
          <span className="block">
            ¿Primera vez?{" "}
            <Link href="/registro" className="font-medium text-[#0baba9] hover:underline">
              Crear cuenta docente
            </Link>
          </span>
          <span className="block">
            <Link href="/login/forgot" className="text-[#0baba9] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </span>
        </p>
      </Card>
    </div>
  );
}
