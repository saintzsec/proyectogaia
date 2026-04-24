"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { assignTeacher, deleteTeacherLink, updateTeacherSchool } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { useSaveToast } from "@/components/ui/save-toast";

type TeacherLinkRow = {
  profile_id: string;
  teacher_id: string | null;
  teacher_name: string | null;
  active: boolean | null;
  school_name: string | null;
  school_id: string | null;
};

type SchoolOption = {
  id: string;
  label: string;
};

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z" />
      <path d="m14.06 4.94 3.75 3.75" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function LinkedTeachersTable({
  teachers,
  schools,
}: {
  teachers: TeacherLinkRow[];
  schools: SchoolOption[];
}) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSchoolFilter, setShowSchoolFilter] = useState(false);
  const [showActiveFilter, setShowActiveFilter] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "yes" | "no" | "unlinked">("all");

  function startEdit(row: TeacherLinkRow) {
    setError(null);
    setEditingId(row.profile_id);
    setSelectedSchoolId(row.school_id ?? (schools[0]?.id ?? ""));
  }

  function cancelEdit() {
    setEditingId(null);
    setSelectedSchoolId("");
    setError(null);
  }

  async function handleSave(row: TeacherLinkRow) {
    if (!selectedSchoolId) {
      setError("Selecciona un colegio.");
      return;
    }
    setError(null);
    setLoadingId(row.profile_id);

    const fd = new FormData();
    let res: { ok?: true; error?: string };

    if (row.teacher_id) {
      fd.set("teacher_id", row.teacher_id);
      fd.set("school_id", selectedSchoolId);
      res = await updateTeacherSchool(fd);
    } else {
      fd.set("profile_id", row.profile_id);
      fd.set("school_id", selectedSchoolId);
      res = await assignTeacher(fd);
    }

    setLoadingId(null);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }

    showSaved(row.teacher_id ? "Vinculación actualizada" : "Docente vinculado");
    cancelEdit();
    router.refresh();
  }

  async function handleDelete(row: TeacherLinkRow) {
    const ok = window.confirm(
      `¿Eliminar la vinculación del docente ${row.teacher_name ?? row.profile_id.slice(0, 8)}?`,
    );
    if (!ok) return;

    setError(null);
    if (!row.teacher_id) return;

    setLoadingId(row.profile_id);
    const fd = new FormData();
    fd.set("teacher_id", row.teacher_id);
    const res = await deleteTeacherLink(fd);
    setLoadingId(null);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }

    showSaved("Docente desvinculado");
    router.refresh();
  }

  const filteredTeachers = teachers.filter((t) => {
    const schoolMatch =
      schoolFilter === "all" ||
      (schoolFilter === "unlinked" ? !t.school_id : t.school_id === schoolFilter);
    const activeMatch =
      activeFilter === "all" ||
      (activeFilter === "yes" ? t.active === true : false) ||
      (activeFilter === "no" ? t.active === false : false) ||
      (activeFilter === "unlinked" ? t.teacher_id === null : false);
    return schoolMatch && activeMatch;
  });

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Docente</th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-2">
                  Colegio
                  <button
                    type="button"
                    className="rounded p-1 text-[#0baba9] hover:bg-[#0baba9]/10"
                    onClick={() => setShowSchoolFilter((v) => !v)}
                    aria-label="Filtrar por colegio"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 5h18" />
                      <path d="M6 12h12" />
                      <path d="M10 19h4" />
                    </svg>
                  </button>
                </div>
                {showSchoolFilter ? (
                  <select
                    value={schoolFilter}
                    onChange={(e) => setSchoolFilter(e.target.value)}
                    className="mt-2 h-9 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-2 text-xs font-normal normal-case text-[#111827]"
                    aria-label="Filtro de colegio"
                  >
                    <option value="all">Todos</option>
                    <option value="unlinked">Sin colegio</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-2">
                  Activo
                  <button
                    type="button"
                    className="rounded p-1 text-[#0baba9] hover:bg-[#0baba9]/10"
                    onClick={() => setShowActiveFilter((v) => !v)}
                    aria-label="Filtrar por estado activo"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 5h18" />
                      <path d="M6 12h12" />
                      <path d="M10 19h4" />
                    </svg>
                  </button>
                </div>
                {showActiveFilter ? (
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value as "all" | "yes" | "no" | "unlinked")}
                    className="mt-2 h-9 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-2 text-xs font-normal normal-case text-[#111827]"
                    aria-label="Filtro de estado activo"
                  >
                    <option value="all">Todos</option>
                    <option value="yes">Activos</option>
                    <option value="no">Inactivos</option>
                    <option value="unlinked">Sin vincular</option>
                  </select>
                ) : null}
              </th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length ? (
              filteredTeachers.map((t) => {
                const isEditing = editingId === t.profile_id;
                const isLoading = loadingId === t.profile_id;

                if (isEditing) {
                  return (
                    <tr key={t.profile_id} className="border-b border-[#f3f4f6]">
                      <td className="px-4 py-3">
                        <div className="text-sm text-[#111827]">{t.teacher_name ?? "Sin nombre"}</div>
                        <div className="font-mono text-xs text-[#6b7280]">{t.profile_id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={selectedSchoolId}
                          onChange={(e) => setSelectedSchoolId(e.target.value)}
                          className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827]"
                          aria-label="Colegio vinculado"
                        >
                          {schools.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">{t.teacher_id ? (t.active ? "Sí" : "No") : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button type="button" size="sm" onClick={() => handleSave(t)} disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar"}
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={cancelEdit} disabled={isLoading}>
                            Cancelar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={t.profile_id} className="border-b border-[#f3f4f6]">
                    <td className="px-4 py-3">
                      <div className="text-sm text-[#111827]">{t.teacher_name ?? "Sin nombre"}</div>
                      <div className="font-mono text-xs text-[#6b7280]">{t.profile_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      {t.school_name ? (
                        t.school_name
                      ) : (
                        <span className="inline-flex rounded-full bg-[#fde2e8] px-2.5 py-1 text-xs font-medium text-[#7f1d1d]">
                          Sin vincular
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.teacher_id ? (
                        t.active ? (
                          <span className="inline-flex rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-medium text-[#166534]">
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#fde2e8] px-2.5 py-1 text-xs font-medium text-[#7f1d1d]">
                            No
                          </span>
                        )
                      ) : (
                        <span className="inline-flex rounded-full bg-[#fde2e8] px-2.5 py-1 text-xs font-medium text-[#7f1d1d]">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-9 px-2 text-[#0baba9] hover:bg-[#0baba9]/10"
                          onClick={() => startEdit(t)}
                          aria-label={`Editar colegio de ${t.profile_id}`}
                          disabled={Boolean(loadingId)}
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-9 px-2 text-[#111827] hover:bg-[#fed705]/25"
                          onClick={() => handleDelete(t)}
                          aria-label={`Eliminar vinculación de ${t.profile_id}`}
                          disabled={Boolean(loadingId) || !t.teacher_id}
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#6b7280]">
                  No hay docentes para ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
