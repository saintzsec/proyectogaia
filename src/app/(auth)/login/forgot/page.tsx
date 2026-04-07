import Link from "next/link";
import { ForgotForm } from "@/components/auth/forgot-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Recuperar contraseña" };

export default function ForgotPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-md px-4 pt-6">
        <Link href="/login" className="text-sm font-medium text-[#0baba9] hover:underline">
          ← Volver al login
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-md">
          <CardTitle>Recuperar contraseña</CardTitle>
          <CardDescription>
            Te enviaremos un enlace seguro (vía Supabase Auth) para definir una nueva contraseña.
          </CardDescription>
          <div className="mt-6">
            <ForgotForm />
          </div>
        </Card>
      </div>
    </>
  );
}
