"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { deleteSchool, updateSchool } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSaveToast } from "@/components/ui/save-toast";

export type SchoolRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
};

const columnHelper = createColumnHelper<SchoolRow>();

type SchoolsDataTableProps = {
  data: SchoolRow[];
};

type EditValues = {
  name: string;
  city: string;
  country: string;
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

const columns = [
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => <span className="font-medium text-[#111827]">{info.getValue()}</span>,
  }),
  columnHelper.accessor("city", {
    header: "Ciudad",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("country", {
    header: "País",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => (
      <span className="font-mono text-xs text-[#9ca3af] break-all">{info.getValue()}</span>
    ),
  }),
];

export function SchoolsDataTable({ data }: SchoolsDataTableProps) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<EditValues>({ name: "", city: "", country: "" });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function startEdit(school: SchoolRow) {
    setError(null);
    setEditingId(school.id);
    setValues({
      name: school.name,
      city: school.city ?? "",
      country: school.country ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
    setValues({ name: "", city: "", country: "" });
  }

  async function submitEdit(schoolId: string) {
    setError(null);
    setLoadingId(schoolId);
    const fd = new FormData();
    fd.set("school_id", schoolId);
    fd.set("name", values.name);
    fd.set("city", values.city);
    fd.set("country", values.country);
    const res = await updateSchool(fd);
    setLoadingId(null);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }

    showSaved("Colegio actualizado");
    cancelEdit();
    router.refresh();
  }

  async function handleDelete(school: SchoolRow) {
    const confirmed = window.confirm(
      `¿Eliminar "${school.name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setError(null);
    setLoadingId(school.id);
    const fd = new FormData();
    fd.set("school_id", school.id);
    const res = await deleteSchool(fd);
    setLoadingId(null);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }

    showSaved("Colegio eliminado");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3">
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const school = row.original;
              const isEditing = editingId === school.id;
              const isLoading = loadingId === school.id;

              if (isEditing) {
                return (
                  <tr key={row.id} className="border-b border-[#f3f4f6] align-top">
                    <td className="px-4 py-3">
                      <Input
                        value={values.name}
                        onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
                        aria-label="Nombre del colegio"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={values.city}
                        onChange={(e) => setValues((prev) => ({ ...prev, city: e.target.value }))}
                        aria-label="Ciudad del colegio"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={values.country}
                        onChange={(e) => setValues((prev) => ({ ...prev, country: e.target.value }))}
                        aria-label="País del colegio"
                      />
                    </td>
                    <td className="px-4 py-3 text-[#4b5563]">
                      <span className="font-mono text-xs text-[#9ca3af] break-all">{school.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => submitEdit(school.id)}
                          disabled={isLoading || values.name.trim().length < 2}
                        >
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
                <tr key={row.id} className="border-b border-[#f3f4f6]">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-[#4b5563]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-9 px-2 text-[#0baba9] hover:bg-[#0baba9]/10"
                        onClick={() => startEdit(school)}
                        aria-label={`Editar ${school.name}`}
                        disabled={Boolean(loadingId)}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-9 px-2 text-[#111827] hover:bg-[#fed705]/25"
                        onClick={() => handleDelete(school)}
                        aria-label={`Eliminar ${school.name}`}
                        disabled={Boolean(loadingId)}
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
              <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-[#6b7280]">
                Sin colegios.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
