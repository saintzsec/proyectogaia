import { z } from "zod";

export const groupFormSchema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  grade_level: z.string().optional(),
  student_count_estimate: z.preprocess((v) => {
    if (v === "" || v === undefined || v === null) return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isNaN(n) ? undefined : n;
  }, z.number().int().min(0).optional()),
  notes: z.string().optional(),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;
