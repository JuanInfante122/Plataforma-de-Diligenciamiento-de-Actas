const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Configuración de la base de datos SQLite
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error('Error al conectar a la base de datos SQLite:', err);
  else console.log('Conectado a la base de datos SQLite en memoria');
});

// Crear tabla para almacenar información del formulario y la asociación de roles
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
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipoDocumento TEXT,
    numeroDocumento TEXT,
    rol TEXT,
    aprendizID INTEGER
  )`);
});

// Lista de usuarios autorizados con roles específicos y sus relaciones
const usuariosAutorizados = [
  { tipoDocumento: 'CÉDULA DE CIUDADANÍA', numeroDocumento: '1014976764', rol: 'Aprendiz', aprendizID: 1 },
  { tipoDocumento: 'TARJETA DE IDENTIDAD', numeroDocumento: '987654321', rol: 'Jefe', aprendizID: 1 },
  { tipoDocumento: 'CÉDULA DE CIUDADANÍA', numeroDocumento: '112233445', rol: 'Instructor', aprendizID: 1 },
];

// Insertar usuarios autorizados en la base de datos
db.serialize(() => {
  usuariosAutorizados.forEach(({ tipoDocumento, numeroDocumento, rol, aprendizID }) => {
    db.run(
      `INSERT INTO usuarios (tipoDocumento, numeroDocumento, rol, aprendizID) VALUES (?, ?, ?, ?)`,
      [tipoDocumento, numeroDocumento, rol, aprendizID]
    );
  });
});

// Ruta de validación de documento
app.post('/validar', (req, res) => {
  const { tipoDocumento, numeroDocumento } = req.body;

  // Normalización de entrada para evitar errores de coincidencia
  const tipoDocumentoNormalizado = tipoDocumento.trim().toUpperCase();
  const numeroDocumentoNormalizado = numeroDocumento.trim();

  console.log("Datos recibidos en la validación:", tipoDocumentoNormalizado, numeroDocumentoNormalizado);

  // Buscar el usuario autorizado
  db.get(
    `SELECT rol, aprendizID FROM usuarios WHERE tipoDocumento = ? AND numeroDocumento = ?`,
    [tipoDocumentoNormalizado, numeroDocumentoNormalizado],
    (err, usuario) => {
      if (err) {
        console.error('Error en la validación:', err);
        return res.status(500).json({ accesoPermitido: false });
      }
      if (usuario) {
        console.log("Usuario autorizado encontrado:", usuario);
        res.json({ accesoPermitido: true, rol: usuario.rol, aprendizID: usuario.aprendizID });
      } else {
        console.log("Usuario no autorizado.");
        res.json({ accesoPermitido: false, message: 'Documento no válido. Verifique su información.' });
      }
    }
  );
});

// Ruta para obtener el documento del aprendiz asociado
app.get('/documento/:aprendizID', (req, res) => {
  const { aprendizID } = req.params;

  db.get(
    `SELECT * FROM documentos WHERE id = ?`,
    [aprendizID],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Error al obtener los datos del documento.' });
      }
      res.json(row || {});
    }
  );
});

// Ruta para guardar el formulario y enviar PDF
app.post('/guardar', async (req, res) => {
  const {
    nombreAprendiz, tipoDocumento, noIdentificacion, regional, centroFormacion,
    programaFormacion, noFicha, modalidadFormacion, firmaAprendizURL, firmaJefeURL, firmaInstructorURL,
  } = req.body;

  db.run(`INSERT INTO documentos 
    (nombreAprendiz, tipoDocumento, noIdentificacion, regional, centroFormacion, programaFormacion, noFicha, modalidadFormacion, firmaAprendizURL, firmaJefeURL, firmaInstructorURL) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombreAprendiz, tipoDocumento, noIdentificacion, regional, centroFormacion, programaFormacion, noFicha, modalidadFormacion, firmaAprendizURL, firmaJefeURL, firmaInstructorURL],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al guardar en la base de datos.' });
      }

      generarYEnviarPDF(req.body)
        .then(() => res.json({ message: 'Datos guardados y PDF enviado por correo.' }))
        .catch((error) => {
          console.error(error);
          res.status(500).json({ message: 'Error al enviar el PDF.' });
        });
    }
  );
});

// Función para generar y enviar el PDF
async function generarYEnviarPDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  page.drawText(`Nombre del Aprendiz: ${data.nombreAprendiz}`, { x: 50, y: 750, size: 12 });

  if (data.firmaAprendizURL) {
    const firmaAprendizImg = await pdfDoc.embedPng(data.firmaAprendizURL);
    page.drawImage(firmaAprendizImg, { x: 50, y: 600, width: 100, height: 50 });
  }
  const pdfBytes = await pdfDoc.save();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'yvonne.schuster@ethereal.email',
      pass: 'V2Aqg7ZyNfKAUJSmYt',
    },
  });

  const mailOptions = {
    from: 'yvonne.schuster@ethereal.email',
    to: 'juanmainqui123@gmail.com', // Correo de destino
    subject: 'PDF firmado',
    text: 'Aquí está el PDF firmado.',
    attachments: [
      {
        filename: 'documento_firmado.pdf',
        content: pdfBytes,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

// Iniciar el servidor en el puerto 5000
app.listen(5000, () => console.log('Servidor en http://localhost:5000'));
