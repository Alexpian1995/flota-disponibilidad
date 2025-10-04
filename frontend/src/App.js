import React, { useEffect, useState } from 'react';
import ExcelTable from './components/ExcelTable';
import DashboardCharts from './components/DashboardCharts';
import API from './api';
import './styles.css'; // 👈 Importamos los estilos

export default function App() {
  const [flota, setFlota] = useState([]);
  const [taller, setTaller] = useState([]);
  const [recuperadas, setRecuperadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get('/today');
      if (res.data.success) {
        setFlota(res.data.flota || []);
        setTaller(res.data.taller || []);
        setRecuperadas(res.data.recuperadas || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function save(newFlota, newTaller, newRecuperadas) {
    setFlota(newFlota);
    setTaller(newTaller);
    setRecuperadas(newRecuperadas);
    try {
      await API.post('/today', {
        flota: newFlota,
        taller: newTaller,
        recuperadas: newRecuperadas,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      {/* 🧭 Encabezado con logo y título */}
      <header>
        <img src="/lis_black.jpg" alt="Logo" className="logo" />
        <h1>🚗 Disponibilidad de Flota</h1>
      </header>

      {/* 📊 Contenido */}
      <div className="container">
        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando...</p>
        ) : (
          <>
            <ExcelTable
              flota={flota}
              taller={taller}
              recuperadas={recuperadas}
              setData={save}
            />
            <DashboardCharts
              flota={flota}
              taller={taller}
              recuperadas={recuperadas}
            />
          </>
        )}
      </div>

      {/* 📌 Pie de página */}
      <footer>
        © {new Date().getFullYear()} Anderson Alzate — Todos los derechos reservados.
      </footer>
    </>
  );
}
