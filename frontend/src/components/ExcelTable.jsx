import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DashboardCharts from "./DashboardCharts"; // gráfico de flota
import html2canvas from "html2canvas"; // 👈 librería para screenshot

const App = () => {
  const hoy = new Date().toISOString().split("T")[0];

  const [flota, setFlota] = useState([]);
  const [taller, setTaller] = useState([]);
  const [recuperadas, setRecuperadas] = useState([]);
  const dashboardRef = useRef(null); // 👈 referencia al contenedor

  // ------- AGREGAR REGISTROS -------
  const addFlota = (asignada, noDisponible) => {
    const row = {
      fecha: hoy,
      asignada: Number(asignada),
      noDisponible: Number(noDisponible),
      disponible: Number(asignada) - Number(noDisponible),
    };
    setFlota([...flota, row]);
  };

  const addTaller = (placa, ingreso, novedad, status, tallerName) => {
    const dias = Math.floor(
      (new Date(hoy) - new Date(ingreso)) / (1000 * 60 * 60 * 24)
    );
    const row = {
      placa,
      ingresoTaller: ingreso,
      novedad,
      status,
      taller: tallerName,
      diasEnTaller: dias,
    };
    setTaller([...taller, row]);
  };

  const addRecuperada = (placa, ingreso, reparacion, tallerName, entrega) => {
    const row = {
      placa,
      fechaIngreso: ingreso,
      reparacion,
      status: "Operativo",
      taller: tallerName,
      fechaEntrega: entrega,
    };
    setRecuperadas([...recuperadas, row]);
  };

  // ------- LIMPIAR DATOS -------
  const clearAll = () => {
    setFlota([]);
    setTaller([]);
    setRecuperadas([]);
    alert("Datos limpiados. Listo para nuevo día.");
  };

  // ------- EXPORTAR A EXCEL -------
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const flotaSheet = XLSX.utils.json_to_sheet(flota, {
      header: ["fecha", "asignada", "noDisponible", "disponible"],
    });
    const tallerSheet = XLSX.utils.json_to_sheet(taller, {
      header: ["placa", "ingresoTaller", "novedad", "status", "taller", "diasEnTaller"],
    });
    const recuperadasSheet = XLSX.utils.json_to_sheet(recuperadas, {
      header: ["placa", "fechaIngreso", "reparacion", "status", "taller", "fechaEntrega"],
    });

    XLSX.utils.book_append_sheet(workbook, flotaSheet, "Flota");
    XLSX.utils.book_append_sheet(workbook, tallerSheet, "Taller");
    XLSX.utils.book_append_sheet(workbook, recuperadasSheet, "Recuperadas");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileName = `Reporte_${hoy}.xlsx`;
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, fileName);
  };

  // ------- EXPORTAR PANTALLAZO -------
  const exportScreenshot = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `Pantallazo_${hoy}.png`;
    link.click();
  };

  return (
    <div ref={dashboardRef} style={{ padding: "20px" }}>
      <h2>Disponibilidad de Flota (Hoy: {hoy})</h2>

      {/* ------- Tabla Flota ------- */}
      <input type="number" id="flotaAsignada" placeholder="Flota asignada" />
      <input type="number" id="flotaNoDisp" placeholder="Flota no disponible" />
      <button
        onClick={() =>
          addFlota(
            document.getElementById("flotaAsignada").value,
            document.getElementById("flotaNoDisp").value
          )
        }
      >
        Agregar Flota
      </button>

      <table border="1" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Asignada</th>
            <th>No Disponible</th>
            <th>Disponible</th>
          </tr>
        </thead>
        <tbody>
          {flota.map((f, i) => (
            <tr key={i}>
              <td>{f.fecha}</td>
              <td>{f.asignada}</td>
              <td>{f.noDisponible}</td>
              <td>{f.disponible}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Gráfico de disponibilidad */}
      <DashboardCharts rows={flota} />

      {/* ------- Tabla Taller ------- */}
      <h2>Taller</h2>
      <input type="text" id="placa" placeholder="Placa" />
      <input type="date" id="ingreso" />
      <input type="text" id="novedad" placeholder="Novedad" />
      <select id="status">
        <option value="Inoperativo">Inoperativo</option>
        <option value="Restricción">Restricción</option>
      </select>
      <input type="text" id="tallerName" placeholder="Taller" />
      <button
        onClick={() =>
          addTaller(
            document.getElementById("placa").value,
            document.getElementById("ingreso").value,
            document.getElementById("novedad").value,
            document.getElementById("status").value,
            document.getElementById("tallerName").value
          )
        }
      >
        Agregar Taller
      </button>

      <table border="1" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Ingreso Taller</th>
            <th>Novedad</th>
            <th>Status</th>
            <th>Taller</th>
            <th>Días en Taller</th>
          </tr>
        </thead>
        <tbody>
          {taller.map((t, i) => (
            <tr key={i}>
              <td>{t.placa}</td>
              <td>{t.ingresoTaller}</td>
              <td>{t.novedad}</td>
              <td>{t.status}</td>
              <td>{t.taller}</td>
              <td>{t.diasEnTaller}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ------- Tabla Recuperadas ------- */}
      <h2>PLACAS RECUPERADAS DE TALLER - OPERATIVAS MAÑANA</h2>
      <input type="text" id="placaRec" placeholder="Placa" />
      <input type="date" id="ingresoRec" />
      <input type="text" id="reparacion" placeholder="Reparación o MTTO" />
      <input type="text" id="tallerRec" placeholder="Taller" />
      <input type="date" id="entrega" />
      <button
        onClick={() =>
          addRecuperada(
            document.getElementById("placaRec").value,
            document.getElementById("ingresoRec").value,
            document.getElementById("reparacion").value,
            document.getElementById("tallerRec").value,
            document.getElementById("entrega").value
          )
        }
      >
        Agregar Recuperada
      </button>

      <table border="1" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Fecha Ingreso</th>
            <th>Reparación / MTTO</th>
            <th>Status</th>
            <th>Taller</th>
            <th>Fecha Entrega</th>
          </tr>
        </thead>
        <tbody>
          {recuperadas.map((r, i) => (
            <tr key={i}>
              <td>{r.placa}</td>
              <td>{r.fechaIngreso}</td>
              <td>{r.reparacion}</td>
              <td>{r.status}</td>
              <td>{r.taller}</td>
              <td>{r.fechaEntrega}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botones */}
      <br />
      <button onClick={exportToExcel}>💾 Guardar en Excel</button>
      <button
        onClick={clearAll}
        style={{
          marginLeft: "10px",
          backgroundColor: "red",
          color: "white",
          padding: "5px 15px",
          border: "none",
          borderRadius: "5px",
        }}
      >
        🗑️ Nuevo Día (Limpiar Datos)
      </button>
      <button
        onClick={exportScreenshot}
        style={{
          marginLeft: "10px",
          backgroundColor: "green",
          color: "white",
          padding: "5px 15px",
          border: "none",
          borderRadius: "5px",
        }}
      >
        📸 Exportar Pantallazo
      </button>
    </div>
  );
};

export default App;
