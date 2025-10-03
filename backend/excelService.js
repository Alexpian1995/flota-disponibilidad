const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const EXCEL_DIR = path.join(__dirname, 'excels');
if (!fs.existsSync(EXCEL_DIR)) fs.mkdirSync(EXCEL_DIR);

// Columnas adaptadas a tus datos reales
const COLUMNS = [
  { header: 'Fecha', key: 'fecha', width: 15 },
  { header: 'Asignada', key: 'asignada', width: 15 },
  { header: 'No Disponible', key: 'noDisponible', width: 15 },
  { header: 'Disponible', key: 'disponible', width: 15 }
];

function todayFilename(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}.xlsx`;
}

async function writeToday(rows) {
  const file = path.join(EXCEL_DIR, todayFilename());
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  ws.columns = COLUMNS;

  // Agrega cada fila
  rows.forEach(r => {
    ws.addRow({
      fecha: r.fecha || new Date().toISOString().slice(0, 10),
      asignada: r.asignada || 0,
      noDisponible: r.noDisponible || 0,
      disponible: r.disponible || 0
    });
  });

  await wb.xlsx.writeFile(file);
}

async function readToday() {
  const file = path.join(EXCEL_DIR, todayFilename());
  if (!fs.existsSync(file)) return [];

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const ws = wb.worksheets[0];
  const rows = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // saltar encabezados
    rows.push({
      fecha: row.getCell(1).value,
      asignada: row.getCell(2).value,
      noDisponible: row.getCell(3).value,
      disponible: row.getCell(4).value
    });
  });

  return rows;
}

module.exports = { readToday, writeToday, COLUMNS };
