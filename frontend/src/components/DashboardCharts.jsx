import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardCharts({ rows }) {
  if (!rows || rows.length === 0) {
    return <p>No hay datos para graficar.</p>;
  }

  // 🥧 Usamos el último registro (día actual o último del mes filtrado)
  const ultimo = rows[rows.length - 1];
  const pieData = [
    { name: "Disponible", value: Number(ultimo.disponible) || 0 },
    { name: "No Disponible", value: Number(ultimo.noDisponible) || 0 },
  ];

  const COLORS = ["#82ca9d", "#ff4d4d"];

  return (
    <div style={{ marginTop: 20 }}>
      <h3>📊 Distribución Disponible vs No Disponible</h3>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              label
              // Simulación de efecto 3D
              startAngle={210}
              endAngle={-150}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="#fff" />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
