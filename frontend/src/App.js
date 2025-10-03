import React, { useEffect, useState } from 'react';
import ExcelTable from './components/ExcelTable';
import DashboardCharts from './components/DashboardCharts';
import API from './api';

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
    <div className="container">
      <h1>Disponibilidad de Flota</h1>
      {loading ? (
        <p>Cargando...</p>
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
  );
}
