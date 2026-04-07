"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PilotRow = { metric_key: string; metric_value: number };

export function PilotChart({ data }: { data: PilotRow[] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-[#6b7280]">
        Aún no hay métricas registradas. Usa el módulo administrador para cargar indicadores.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="metric_key" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }}
            labelStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="metric_value" fill="#0baba9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
