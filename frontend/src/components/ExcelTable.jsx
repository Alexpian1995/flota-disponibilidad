import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DashboardCharts from "./DashboardCharts";
import html2canvas from "html2canvas";

const App = () => {
  const hoy = new Date().toISOString().split("T")[0];

  const [flota, setFlota] = useState([]);
  const [taller, setTaller] = useState([]);
  const [recuperadas, setRecuperadas] = useState([]);
  const [workbook, setWorkbook] = useState(null);
  const [historialMensual, setHistorialMensual] = useState({
    flota: [],
    taller: [],
    recuperadas: [],
  });
  const [modoHistorial, setModoHistorial] = useState(false);

  const dashboardRef = useRef(null);

  // ------- CARGAR HISTORIAL EXISTENTE -------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const wb = XLSX.read(data, { type: "array" });
      setWorkbook(wb);
      alert(`✅ Historial cargado: ${file.name}`);
    };
    reader.readAsArrayBuffer(file);
  };

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

  // ------- ACTUALIZAR REGISTRO EN TALLER -------
  const updateTallerRow = (index) => {
    const current = taller[index];
    const placa = prompt("Placa:", current.placa);
    const ingresoTaller = prompt(
      "Ingreso Taller (yyyy-MM-dd):",
      current.ingresoTaller
    );
    const novedad = prompt("Novedad:", current.novedad);
    const status = prompt("Status:", current.status);
    const tallerName = prompt("Taller:", current.taller);

    if (!placa || !ingresoTaller) return;

    const dias = Math.floor(
      (new Date(hoy) - new Date(ingresoTaller)) / (1000 * 60 * 60 * 24)
    );

    const updated = [...taller];
    updated[index] = {
      placa,
      ingresoTaller,
      novedad,
      status,
      taller: tallerName,
      diasEnTaller: dias,
    };

    setTaller(updated);
  };

  // ------- LIMPIAR DATOS -------
  const clearAll = () => {
    setFlota([]);
    setTaller([]);
    setRecuperadas([]);
    setModoHistorial(false);

    // 🧼 Limpiar todos los inputs y selects
    const inputs = document.querySelectorAll("input, select");
    inputs.forEach((input) => (input.value = ""));

    alert("🧹 Todos los datos e inputs han sido limpiados.");
  };

  // ------- EXPORTAR A HISTORIAL EXCEL -------
  const exportToExcel = () => {
    let wb = workbook;
    if (!wb) wb = XLSX.utils.book_new();

    const appendToSheet = (sheetName, newData) => {
      let sheet = wb.Sheets[sheetName];
      let existingData = [];

      if (sheet) {
        existingData = XLSX.utils.sheet_to_json(sheet);
      } else {
        sheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, sheet, sheetName);
      }

      const combinedData = [...existingData, ...newData];
      const newSheet = XLSX.utils.json_to_sheet(combinedData);
      wb.Sheets[sheetName] = newSheet;
    };

    appendToSheet("Flota", flota);
    appendToSheet("Taller", taller);
    appendToSheet("Recuperadas", recuperadas);

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Historial.xlsx");
    setWorkbook(wb);
    alert("📊 Historial actualizado y descargado");
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

  // ------- FILTRAR HISTORIAL POR MES -------
  const handleMonthChange = (e) => {
    if (!workbook) {
      alert("⚠️ Carga primero un Historial.xlsx");
      return;
    }

    const selectedMonth = e.target.value; // yyyy-MM

    const flotaSheet = workbook.Sheets["Flota"];
    const flotaData = flotaSheet ? XLSX.utils.sheet_to_json(flotaSheet) : [];
    const flotaFiltered = flotaData.filter((row) =>
      String(row.fecha || "").startsWith(selectedMonth)
    );

    const tallerSheet = workbook.Sheets["Taller"];
    const tallerData = tallerSheet ? XLSX.utils.sheet_to_json(tallerSheet) : [];
    const tallerFiltered = tallerData.filter((row) => {
      const fecha =
        row.ingresoTaller ||
        row["Ingreso Taller"] ||
        row.fecha ||
        row["Fecha"];
      if (!fecha) return false;
      const fechaStr =
        typeof fecha === "string"
          ? fecha
          : new Date(fecha).toISOString().split("T")[0];
      return fechaStr.startsWith(selectedMonth);
    });

    const recSheet = workbook.Sheets["Recuperadas"];
    const recData = recSheet ? XLSX.utils.sheet_to_json(recSheet) : [];
    const recFiltered = recData.filter((row) =>
      String(row.fechaIngreso || "").startsWith(selectedMonth)
    );

    setHistorialMensual({
      flota: flotaFiltered,
      taller: tallerFiltered,
      recuperadas: recFiltered,
    });
    setModoHistorial(true);
  };

  return (
    <div ref={dashboardRef} style={{ padding: "20px" }}>
      <h2>🚛 Disponibilidad de Flota (Hoy: {hoy})</h2>

      {/* 📂 Cargar Historial Excel */}
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        style={{ marginBottom: "10px" }}
      />

      {/* 📅 Selector de Mes */}
      <label>📅 Ver historial del mes:</label>
      <input
        type="month"
        onChange={handleMonthChange}
        style={{ marginLeft: "10px" }}
      />

      {/* Tabla y gráfico mensual */}
      {modoHistorial && (
        <div style={{ marginTop: "10px" }}>
          <h3>📈 Historial mensual seleccionado</h3>
          <DashboardCharts rows={historialMensual.flota} />

          {/* Tabla Taller mensual */}
          <h4>🛠️ Taller</h4>
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
              {historialMensual.taller.map((t, i) => (
                <tr key={i}>
                  <td>{t.placa}</td>
                  <td>{t.ingresoTaller || t["Ingreso Taller"]}</td>
                  <td>{t.novedad}</td>
                  <td>{t.status}</td>
                  <td>{t.taller}</td>
                  <td>{t.diasEnTaller}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla diaria */}
      {!modoHistorial && (
        <>
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

          <DashboardCharts rows={flota} />
        </>
      )}

      {/* ------- Tabla Taller diaria ------- */}
      <br />
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
            <th>Acciones</th>
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
              <td>
                <button onClick={() => updateTallerRow(i)}>✏️ Actualizar</button>
              </td>
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
      <button onClick={exportToExcel}>💾 Guardar en Excel (Historial)</button>
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
