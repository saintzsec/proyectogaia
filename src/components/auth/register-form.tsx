"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_PASSWORD = 8;

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsEmailConfirm(false);

    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { data, error: signError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
      },
    });
    setLoading(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    if (data.user && !data.session) {
      setNeedsEmailConfirm(true);
      return;
    }

    if (data.session) {
      router.push("/auth/post-login");
      router.refresh();
    }
  }

  if (needsEmailConfirm) {
    return (
      <div className="space-y-4 rounded-[var(--radius-gaia)] border border-[#0baba9]/30 bg-[#0baba9]/5 p-4 text-sm text-[#374151]">
        <p className="font-medium text-[#111827]">Revisa tu correo</p>
        <p>
          Te enviamos un enlace para confirmar la cuenta. Cuando lo abras, podrás iniciar sesión. Si no
          ves el mensaje, revisa spam o promociones.
        </p>
        <Link href="/login" className="inline-block font-medium text-[#0baba9] hover:underline">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Correo institucional o personal</Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Contraseña</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-[#6b7280]">Mínimo {MIN_PASSWORD} caracteres.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password_confirm">Confirmar contraseña</Label>
        <Input
          id="password_confirm"
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          required
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta…" : "Crear cuenta docente"}
      </Button>
    </form>
  );
}
