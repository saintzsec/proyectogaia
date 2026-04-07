"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSchool } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveToast } from "@/components/ui/save-toast";

export function CreateSchoolForm() {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await createSchool(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Colegio registrado");
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="name">Nombre del colegio</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Ciudad</Label>
        <Input id="city" name="city" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
        <Input id="country" name="country" defaultValue="Chile" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" />
      </div>
      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Crear colegio"}
        </Button>
      </div>
    </form>
  );
}
