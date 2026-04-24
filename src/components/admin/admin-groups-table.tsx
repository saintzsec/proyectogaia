"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createAdminGroup, deleteAdminGroup, updateAdminGroup } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSaveToast } from "@/components/ui/save-toast";

type GroupRow = {
  id: string;
  name: string;
  school_name: string | null;
  school_id: string | null;
  grade_level: string | null;
  academic_year: string | null;
  teacher_id: string | null;
  teacher_profile_id: string | null;
  teacher_name: string | null;
};

type SchoolOption = { id: string; label: string };
type TeacherOption = { id: string; profile_id: string; label: string };

type Draft = {
  name: string;
  school_id: string;
  teacher_id: string;
  grade_level: string;
  academic_year: string;
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

function FilterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </svg>
  );
}

export function AdminGroupsTable({
  groups,
  schools,
  teachers,
}: {
  groups: GroupRow[];
  schools: SchoolOption[];
  teachers: TeacherOption[];
}) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const currentYear = new Date().getFullYear().toString();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [showSchoolFilter, setShowSchoolFilter] = useState(false);
  const [showLevelFilter, setShowLevelFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    name: "",
    school_id: schools[0]?.id ?? "",
    teacher_id: teachers[0]?.id ?? "",
    grade_level: "",
    academic_year: currentYear,
  });

  const levels = useMemo(
    () => Array.from(new Set(groups.map((g) => g.grade_level).filter((x): x is string => Boolean(x)))).sort(),
    [groups],
  );
  const years = useMemo(
    () => Array.from(new Set(groups.map((g) => g.academic_year).filter((x): x is string => Boolean(x)))).sort(),
    [groups],
  );

  const filtered = groups.filter((g) => {
    const schoolOk = schoolFilter === "all" || g.school_id === schoolFilter;
    const levelOk = levelFilter === "all" || (levelFilter === "__missing__" ? !g.grade_level : g.grade_level === levelFilter);
    const yearOk = yearFilter === "all" || (yearFilter === "__missing__" ? !g.academic_year : g.academic_year === yearFilter);
    return schoolOk && levelOk && yearOk;
  });

  function startCreate() {
    setError(null);
    setCreating(true);
    setEditingId(null);
    setDraft({
      name: "",
      school_id: schools[0]?.id ?? "",
      teacher_id: teachers[0]?.id ?? "",
      grade_level: "",
      academic_year: currentYear,
    });
  }

  function startEdit(row: GroupRow) {
    setError(null);
    setCreating(false);
    setEditingId(row.id);
    setDraft({
      name: row.name,
      school_id: row.school_id ?? schools[0]?.id ?? "",
      teacher_id: row.teacher_id ?? teachers[0]?.id ?? "",
      grade_level: row.grade_level ?? "",
      academic_year: row.academic_year ?? currentYear,
    });
  }

  function cancelEdit() {
    setCreating(false);
    setEditingId(null);
    setError(null);
  }

  async function saveCreate() {
    setError(null);
    setLoadingId("__create__");
    const fd = new FormData();
    fd.set("name", draft.name);
    fd.set("school_id", draft.school_id);
    fd.set("teacher_id", draft.teacher_id);
    fd.set("grade_level", draft.grade_level);
    fd.set("academic_year", draft.academic_year);
    const res = await createAdminGroup(fd);
    setLoadingId(null);
    if ("error" in res && res.error) return setError(res.error);
    showSaved("Grupo creado");
    cancelEdit();
    router.refresh();
  }

  async function saveEdit(groupId: string) {
    setError(null);
    setLoadingId(groupId);
    const fd = new FormData();
    fd.set("group_id", groupId);
    fd.set("name", draft.name);
    fd.set("school_id", draft.school_id);
    fd.set("teacher_id", draft.teacher_id);
    fd.set("grade_level", draft.grade_level);
    fd.set("academic_year", draft.academic_year);
    const res = await updateAdminGroup(fd);
    setLoadingId(null);
    if ("error" in res && res.error) return setError(res.error);
    showSaved("Grupo actualizado");
    cancelEdit();
    router.refresh();
  }

  async function onDelete(row: GroupRow) {
    if (!window.confirm(`¿Eliminar el grupo "${row.name}"?`)) return;
    setError(null);
    setLoadingId(row.id);
    const fd = new FormData();
    fd.set("group_id", row.id);
    const res = await deleteAdminGroup(fd);
    setLoadingId(null);
    if ("error" in res && res.error) return setError(res.error);
    showSaved("Grupo eliminado");
    router.refresh();
  }

  const missingBadge = "inline-flex rounded-full bg-[#fde2e8] px-2.5 py-1 text-xs font-medium text-[#7f1d1d]";

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" onClick={startCreate}>Crear grupo</Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-2">
                  Colegio
                  <button type="button" className="rounded p-1 text-[#0baba9] hover:bg-[#0baba9]/10" onClick={() => setShowSchoolFilter((v) => !v)} aria-label="Filtrar colegio">
                    <FilterIcon />
                  </button>
                </div>
                {showSchoolFilter ? (
                  <select aria-label="Filtrar por colegio" value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className="mt-2 h-9 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-2 text-xs font-normal normal-case text-[#111827]">
                    <option value="all">Todos</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                ) : null}
              </th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-2">
                  Nivel
                  <button type="button" className="rounded p-1 text-[#0baba9] hover:bg-[#0baba9]/10" onClick={() => setShowLevelFilter((v) => !v)} aria-label="Filtrar nivel">
                    <FilterIcon />
                  </button>
                </div>
                {showLevelFilter ? (
                  <select aria-label="Filtrar por nivel" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="mt-2 h-9 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-2 text-xs font-normal normal-case text-[#111827]">
                    <option value="all">Todos</option>
                    <option value="__missing__">Sin dato</option>
                    {levels.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                ) : null}
              </th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-2">
                  Año
                  <button type="button" className="rounded p-1 text-[#0baba9] hover:bg-[#0baba9]/10" onClick={() => setShowYearFilter((v) => !v)} aria-label="Filtrar año">
                    <FilterIcon />
                  </button>
                </div>
                {showYearFilter ? (
                  <select aria-label="Filtrar por año" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="mt-2 h-9 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-2 text-xs font-normal normal-case text-[#111827]">
                    <option value="all">Todos</option>
                    <option value="__missing__">Sin dato</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                ) : null}
              </th>
              <th className="px-4 py-3">Docente</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {creating ? (
              <tr className="border-b border-[#f3f4f6] align-top">
                <td className="px-4 py-3"><Input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} aria-label="Nombre del grupo" /></td>
                <td className="px-4 py-3">
                  <select aria-label="Seleccionar colegio para nuevo grupo" value={draft.school_id} onChange={(e) => setDraft((p) => ({ ...p, school_id: e.target.value }))} className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827]">
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><Input value={draft.grade_level} onChange={(e) => setDraft((p) => ({ ...p, grade_level: e.target.value }))} placeholder="Ej: 5to básico" /></td>
                <td className="px-4 py-3"><Input value={draft.academic_year} onChange={(e) => setDraft((p) => ({ ...p, academic_year: e.target.value }))} /></td>
                <td className="px-4 py-3">
                  <select aria-label="Seleccionar docente para nuevo grupo" value={draft.teacher_id} onChange={(e) => setDraft((p) => ({ ...p, teacher_id: e.target.value }))} className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827]">
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" onClick={saveCreate} disabled={loadingId === "__create__" || draft.name.trim().length < 2}>Guardar</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>Cancelar</Button>
                  </div>
                </td>
              </tr>
            ) : null}

            {filtered.length ? (
              filtered.map((g) => {
                const isEditing = editingId === g.id;
                const isLoading = loadingId === g.id;
                if (isEditing) {
                  return (
                    <tr key={g.id} className="border-b border-[#f3f4f6] align-top">
                      <td className="px-4 py-3"><Input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} /></td>
                      <td className="px-4 py-3">
                        <select aria-label="Seleccionar colegio del grupo" value={draft.school_id} onChange={(e) => setDraft((p) => ({ ...p, school_id: e.target.value }))} className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827]">
                          {schools.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3"><Input value={draft.grade_level} onChange={(e) => setDraft((p) => ({ ...p, grade_level: e.target.value }))} /></td>
                      <td className="px-4 py-3"><Input value={draft.academic_year} onChange={(e) => setDraft((p) => ({ ...p, academic_year: e.target.value }))} /></td>
                      <td className="px-4 py-3">
                        <select aria-label="Seleccionar docente del grupo" value={draft.teacher_id} onChange={(e) => setDraft((p) => ({ ...p, teacher_id: e.target.value }))} className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827]">
                          {teachers.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button type="button" size="sm" onClick={() => saveEdit(g.id)} disabled={isLoading || draft.name.trim().length < 2}>Guardar</Button>
                          <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>Cancelar</Button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={g.id} className="border-b border-[#f3f4f6]">
                    <td className="px-4 py-3 font-medium text-[#111827]">{g.name}</td>
                    <td className="px-4 py-3 text-[#4b5563]">{g.school_name ?? <span className={missingBadge}>Sin dato</span>}</td>
                    <td className="px-4 py-3 text-[#4b5563]">{g.grade_level ?? <span className={missingBadge}>Sin dato</span>}</td>
                    <td className="px-4 py-3 text-[#4b5563]">{g.academic_year ?? <span className={missingBadge}>Sin dato</span>}</td>
                    <td className="px-4 py-3">
                      {g.teacher_name ? (
                        <div>
                          <div className="text-sm text-[#111827]">{g.teacher_name}</div>
                          <div className="font-mono text-xs text-[#6b7280]">{g.teacher_profile_id}</div>
                        </div>
                      ) : (
                        <span className={missingBadge}>Sin dato</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" className="min-h-9 px-2 text-[#0baba9] hover:bg-[#0baba9]/10" onClick={() => startEdit(g)} disabled={Boolean(loadingId)}>
                          <EditIcon />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="min-h-9 px-2 text-[#111827] hover:bg-[#fed705]/25" onClick={() => onDelete(g)} disabled={Boolean(loadingId)}>
                          <DeleteIcon />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[#6b7280]">Sin grupos para ese filtro.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
