// database.js
const sqlite3 = require('sqlite3').verbose();

// Crear la base de datos en archivo persistente en lugar de memoria
const db = new sqlite3.Database('./formulario.db', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos SQLite:', err);
  } else {
    console.log('Conectado a la base de datos SQLite en formulario.db');
  }
});

// Crear tabla para almacenar la información del formulario si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombreAprendiz TEXT,
    tipoDocumento TEXT,
    noIdentificacion TEXT,
    regional TEXT,
    centroFormacion TEXT,
    programaFormacion TEXT,
    noFicha TEXT,
    modalidadFormacion TEXT,
    firmaAprendizURL TEXT,
    firmaJefeURL TEXT,
    firmaInstructorURL TEXT
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla documentos:', err);
    } else {
      console.log('Tabla documentos verificada o creada exitosamente.');
    }
  });
});

// Función para guardar información en la base de datos
function guardarDocumento(data, callback) {
  const {
    nombreAprendiz,
    tipoDocumento,
    noIdentificacion,
    regional,
    centroFormacion,
    programaFormacion,
    noFicha,
    modalidadFormacion,
    firmaAprendizURL,
    firmaJefeURL,
    firmaInstructorURL
  } = data;

  db.run(`INSERT INTO documentos 
    (nombreAprendiz, tipoDocumento, noIdentificacion, regional, centroFormacion, programaFormacion, noFicha, modalidadFormacion, firmaAprendizURL, firmaJefeURL, firmaInstructorURL) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombreAprendiz,
      tipoDocumento,
      noIdentificacion,
      regional,
      centroFormacion,
      programaFormacion,
      noFicha,
      modalidadFormacion,
      firmaAprendizURL,
      firmaJefeURL,
      firmaInstructorURL
    ],
    function (err) {
      if (err) {
        console.error('Error al guardar el documento en la base de datos:', err);
        callback(err);
      } else {
        console.log('Documento guardado correctamente con ID:', this.lastID);
        callback(null, this.lastID);
      }
    }
  );
}

// Exportar la base de datos y la función de guardado
module.exports = { db, guardarDocumento };
