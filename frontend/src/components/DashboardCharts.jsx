// src/DashboardCharts.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DashboardCharts({ rows }) {
  if (!rows || rows.length === 0) {
    return <p>No hay datos para graficar.</p>;
  }

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const getDateStr = (r) => {
    const raw = r.fecha ?? r.Fecha ?? "";
    if (typeof raw === "string") return raw.slice(0, 10);
    if (raw instanceof Date) return raw.toISOString().split("T")[0];
    if (typeof raw === "number") return new Date(raw).toISOString().split("T")[0];
    return "";
  };

  const uniqueDates = Array.from(new Set(rows.map(getDateStr).filter(Boolean)));
  const isMonthly = uniqueDates.length > 1;

  if (isMonthly) {
  // ✅ --- MODO MENSUAL ---
  const flotaAsignadaMes = Math.max(...rows.map((r) => toNumber(r.asignada)));
  const totalNoDisponibles = rows.reduce(
    (acc, r) => acc + toNumber(r.noDisponible),
    0
  );
  const promedioNoDisponible = totalNoDisponibles / uniqueDates.length;

  const pctNoDisponible = Number(((promedioNoDisponible / flotaAsignadaMes) * 100).toFixed(1));
  const pctDisponible = Number((100 - pctNoDisponible).toFixed(1));

  const data = [
    { name: "Disponible", value: pctDisponible },
    { name: "No Disponible", value: pctNoDisponible },
  ];

  const COLORS = ["#82ca9d", "#ff4d4d"];

  return (
    <div style={{ height: 420, marginTop: 20, textAlign: "center" }}>
      <h3>Disponibilidad Mensual (%)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={50}
            label={({ name, value }) => `${name}: ${value}%`}
            startAngle={210}
            endAngle={-150}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" />
            ))}
          </Pie>
          <Tooltip formatter={(val) => `${val}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 10, fontSize: 16 }}>
        <p>
          <strong>Flota asignada (mes):</strong> {flotaAsignadaMes} &nbsp;|&nbsp;
          <strong>Promedio No Disponibles:</strong> {promedioNoDisponible.toFixed(1)} &nbsp;
        </p>
      </div>
    </div>
  );
}


  // ----- MODO DIARIO -----
  const totalAsignada = rows.reduce((acc, r) => acc + toNumber(r.asignada), 0);
  const totalNoDisp = rows.reduce((acc, r) => acc + toNumber(r.noDisponible), 0);
  const totalDisp = rows.reduce((acc, r) => acc + toNumber(r.disponible), 0);

  const pieData = [
    { name: "Disponible", value: totalDisp },
    { name: "No Disponible", value: totalNoDisp },
  ];
  const COLORS = ["#82ca9d", "#ff4d4d"];

  return (
    <div style={{ height: 420, marginTop: 20, textAlign: "center" }}>
      <h3>Disponibilidad (resumen diario)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={50}
            label={({ name, value }) => `${name}: ${value}`}
            startAngle={210}
            endAngle={-150}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 10 }}>
        <p>
          <strong>Total Asignada:</strong> {totalAsignada} &nbsp;|&nbsp;
          <strong>Disponible:</strong> {totalDisp} &nbsp;|&nbsp;
          <strong>No Disponible:</strong> {totalNoDisp}
        </p>
      </div>
    </div>
  );
}
