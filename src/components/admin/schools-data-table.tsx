"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type SchoolRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
};

const columnHelper = createColumnHelper<SchoolRow>();

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

export function SchoolsDataTable({ data }: { data: SchoolRow[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-[#f3f4f6]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-[#4b5563]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-[#6b7280]">
                Sin colegios.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
