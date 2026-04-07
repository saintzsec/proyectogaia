"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createStudentGroup } from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { groupFormSchema, type GroupFormValues } from "@/lib/validations/group";
import { useSaveToast } from "@/components/ui/save-toast";

export function CreateGroupForm() {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormValues>({
    defaultValues: {
      name: "",
      grade_level: "",
      notes: "",
    },
  });

  async function onSubmit(values: GroupFormValues) {
    setServerError(null);
    const parsed = groupFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          setError(key as keyof GroupFormValues, { message: issue.message });
        }
      }
      return;
    }

    const fd = new FormData();
    fd.set("name", parsed.data.name);
    if (parsed.data.grade_level) fd.set("grade_level", parsed.data.grade_level);
    if (parsed.data.student_count_estimate != null) {
      fd.set("student_count_estimate", String(parsed.data.student_count_estimate));
    }
    if (parsed.data.notes) fd.set("notes", parsed.data.notes);

    const res = await createStudentGroup(fd);
    if ("error" in res && res.error) {
      setServerError(res.error);
      return;
    }
    showSaved("Grupo creado");
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="name">Nombre del grupo</Label>
        <Input id="name" placeholder="Ej. 2° medio A" {...register("name")} />
        {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="grade_level">Nivel (opcional)</Label>
        <Input id="grade_level" placeholder="Ej. 2° medio" {...register("grade_level")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="student_count_estimate">Estudiantes (aprox.)</Label>
        <Input id="student_count_estimate" type="number" min={0} {...register("student_count_estimate")} />
        {errors.student_count_estimate ? (
          <p className="text-sm text-red-600">{errors.student_count_estimate.message}</p>
        ) : null}
      </div>
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" placeholder="Observaciones del piloto…" {...register("notes")} />
      </div>
      {serverError ? <p className="md:col-span-2 text-sm text-red-600">{serverError}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Crear grupo"}
        </Button>
      </div>
    </form>
  );
}
