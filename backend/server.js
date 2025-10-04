const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const path = require('path');

const app = express();

// 🧰 Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 📌 Rutas principales
app.use('/api', routes);

// 📂 Carpeta estática para archivos Excel
app.use('/excels', express.static(path.join(__dirname, 'excels')));

// ✅ Ruta raíz para comprobar disponibilidad
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '✅ Backend funcionando correctamente' });
});

// 🚀 Arranque del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
