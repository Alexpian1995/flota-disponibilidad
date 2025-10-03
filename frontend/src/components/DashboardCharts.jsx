import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashboardCharts({ rows }) {
  const data = (rows || []).map(r => ({
    fecha: r.fecha,
    Asignada: Number(r.asignada) || 0,
    NoDisponible: Number(r.noDisponible) || 0,
    Disponible: Number(r.disponible) || 0,
  }));

  if (data.length === 0) {
    return <p>No hay datos para graficar.</p>;
  }

  return (
    <div style={{ height: 400, marginTop: 20 }}>
      <h3>Disponibilidad de Flota</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Asignada" fill="#8884d8" />
          <Bar dataKey="NoDisponible" fill="#ff4d4d" />
          <Bar dataKey="Disponible" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
