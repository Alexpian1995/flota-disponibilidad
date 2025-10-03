const express = require('express');
const router = express.Router();
const excelService = require('./excelService');

// 🔹 GET /today → Lee y devuelve los datos del Excel del día
router.get('/today', async (req, res) => {
  try {
    const rows = await excelService.readToday();
    console.log(`[GET /today] Datos leídos (${new Date().toISOString()}):`, rows);
    res.json({ success: true, rows });
  } catch (err) {
    console.error('[GET /today] Error leyendo excel:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 🔹 POST /today → Reemplaza completamente los datos del Excel del día
router.post('/today', async (req, res) => {
  try {
    const rows = req.body.rows || [];
    console.log(`[POST /today] Guardando ${rows.length} registros en Excel`);
    await excelService.writeToday(rows);
    res.json({ success: true });
  } catch (err) {
    console.error('[POST /today] Error guardando excel:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 🔹 (Opcional) PATCH /today → Agregar un registro sin sobrescribir todos
router.patch('/today', async (req, res) => {
  try {
    const newRow = req.body.row;
    if (!newRow) {
      return res.status(400).json({ success: false, error: "Falta row en body" });
    }

    const rows = await excelService.readToday();
    rows.push(newRow); // 👈 agregamos al final
    await excelService.writeToday(rows);

    console.log(`[PATCH /today] Registro agregado:`, newRow);
    res.json({ success: true, rows });
  } catch (err) {
    console.error('[PATCH /today] Error agregando registro:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

module.exports = router;
