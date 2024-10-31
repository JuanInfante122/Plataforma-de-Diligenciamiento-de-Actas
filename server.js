// server.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Ruta para generar PDF y enviar por correo sin guardar en base de datos
app.post('/guardar', async (req, res) => {
  try {
    // Crear PDF con pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    page.drawText(`Nombre del Aprendiz: ${req.body.nombreAprendiz}`, { x: 50, y: 750, size: 12 });
    
    // Insertar las firmas como imágenes
    const firmaAprendizImg = await pdfDoc.embedPng(req.body.firmaAprendizURL);
    page.drawImage(firmaAprendizImg, { x: 50, y: 600, width: 100, height: 50 });
    const pdfBytes = await pdfDoc.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'juanmainqui123@gmail.com', // Tu dirección de Gmail
          pass: 'Pepelunajuan123', // Tu contraseña de Gmail o contraseña de aplicación
        },
      });
      

    const mailOptions = {
      from: 'juanmainqui123@gmail.com',
      to: 'juanmainqui34@gmail.com', // Correo de destino
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

    // Enviar correo
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Correo enviado con el PDF firmado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el correo.' });
  }
});

// Iniciar servidor en el puerto 5000
app.listen(5000, () => console.log('Servidor en http://localhost:5000'));
