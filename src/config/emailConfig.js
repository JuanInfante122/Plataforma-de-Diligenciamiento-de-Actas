const nodemailer = require('nodemailer');

// Crear el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Función para enviar correos
const enviarCorreo = async ({ to, subject, html }) => {
  try {
    console.log('Intentando enviar correo a:', to);
    
    const info = await transporter.sendMail({
      from: `"Sistema de Documentación SENA" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html
    });

    console.log('📧 Correo enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error; // Propagar el error para mejor manejo
  }
};

// Verificar la conexión al iniciar
const verificarConexion = async () => {
  try {
    await transporter.verify();
    console.log('✅ Servidor de correo listo para enviar mensajes');
    return true;
  } catch (error) {
    console.error('❌ Error en la configuración del servidor de correo:', error);
    return false;
  }
};

module.exports = { 
  enviarCorreo,
  verificarConexion
};
