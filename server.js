const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const { PDFDocument } = require('pdf-lib');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Configuración de la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'documentacion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Verificar conexión a la base de datos
pool.getConnection()
  .then(connection => {
    console.log('Conectado a la base de datos MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });

// Ruta para validar usuario
app.post('/validar', async (req, res) => {
  const { tipoDocumento, numeroDocumento } = req.body;

  try {
    const [usuarios] = await pool.query(`
      SELECT 
        u.id,
        u.tipo_documento,
        u.numero_documento,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.tipo_documento = ? 
      AND u.numero_documento = ?
      AND u.estado = 'ACTIVO'
      LIMIT 1
    `, [tipoDocumento, numeroDocumento]);

    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      res.json({
        accesoPermitido: true,
        id: usuario.id,
        rol: usuario.rol,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        tipoDocumento: usuario.tipo_documento,
        numeroDocumento: usuario.numero_documento,
        telefono: usuario.telefono
      });
    } else {
      res.json({
        accesoPermitido: false,
        mensaje: 'Usuario no encontrado o inactivo. Verifique su información.'
      });
    }
  } catch (error) {
    console.error('Error en la validación:', error);
    res.status(500).json({ 
      accesoPermitido: false, 
      mensaje: 'Error en el servidor durante la validación'
    });
  }
});

// Ruta para obtener plantillas según rol
app.get('/plantillas/:rol', async (req, res) => {
  const { rol } = req.params;
  console.log('Solicitando plantillas para rol:', rol); // Debug log

  try {
    let query = `
      SELECT pd.*, u.nombres as creador_nombre
      FROM plantillas_documento pd
      LEFT JOIN usuarios u ON pd.creado_por = u.id
      WHERE pd.estado = 'ACTIVO'
    `;

    // Filtrar plantillas según el rol
    if (rol === 'APRENDIZ') {
      query += ` AND pd.requiere_firma_instructor = true`;
    } else if (rol === 'INSTRUCTOR') {
      query += ` AND pd.requiere_firma_instructor = true`;
    }

    const [plantillas] = await pool.query(query);
    console.log('Plantillas encontradas:', plantillas.length); // Debug log
    
    // Parsear la estructura JSON
    const plantillasFormateadas = plantillas.map(plantilla => ({
      ...plantilla,
      estructura: JSON.parse(plantilla.estructura)
    }));

    res.json(plantillasFormateadas);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).json({ message: 'Error al obtener plantillas' });
  }
});

// Ruta para obtener el documento del aprendiz
app.get('/documento/:aprendizID', async (req, res) => {
  const { aprendizID } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT d.*, pd.titulo as tipo_documento, pd.estructura
       FROM documentos d
       JOIN plantillas_documento pd ON d.plantilla_id = pd.id
       WHERE d.aprendiz_id = ?
       ORDER BY d.created_at DESC
       LIMIT 1`,
      [aprendizID]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({});
    }
  } catch (err) {
    console.error('Error al obtener documento:', err);
    res.status(500).json({ message: 'Error al obtener los datos del documento.' });
  }
});

// Ruta para obtener documento específico
app.get('/documento/:aprendizId/:plantillaId', async (req, res) => {
  const { aprendizId, plantillaId } = req.params;

  try {
    const [documentos] = await pool.query(
      `SELECT d.*, pd.estructura, pd.titulo
       FROM documentos d
       JOIN plantillas_documento pd ON d.plantilla_id = pd.id
       WHERE d.aprendiz_id = ? AND d.plantilla_id = ?
       ORDER BY d.created_at DESC
       LIMIT 1`,
      [aprendizId, plantillaId]
    );

    if (documentos.length > 0) {
      const documento = documentos[0];
      res.json({
        ...documento,
        contenido: JSON.parse(documento.contenido),
        estructura: JSON.parse(documento.estructura)
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ message: 'Error al obtener documento' });
  }
});

// Ruta para guardar el formulario y enviar PDF
app.post('/guardar', async (req, res) => {
  const {
    plantillaId,
    fichaId,
    aprendizId,
    contenido,
    firmaAprendizURL,
    firmaInstructorURL,
    firmaCoordinadorURL
  } = req.body;

  try {
    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insertar documento
      const [result] = await connection.query(
        `INSERT INTO documentos (plantilla_id, ficha_id, aprendiz_id, contenido, estado)
         VALUES (?, ?, ?, ?, 'ENVIADO')`,
        [plantillaId, fichaId, aprendizId, JSON.stringify(contenido)]
      );

      const documentoId = result.insertId;

      // Insertar firmas
      if (firmaAprendizURL) {
        await connection.query(
          `INSERT INTO firmas (documento_id, usuario_id, tipo_firma, estado)
           VALUES (?, ?, 'APRENDIZ', 'FIRMADO')`,
          [documentoId, aprendizId]
        );
      }

      // Crear notificaciones para los revisores
      const [instructores] = await connection.query(
        `SELECT id FROM usuarios WHERE rol_id = 1 AND estado = 'ACTIVO'`
      );

      for (const instructor of instructores) {
        await connection.query(
          `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, documento_id)
           VALUES (?, 'FIRMA_REQUERIDA', 'Nuevo documento para revisar', 'Hay un nuevo documento que requiere su revisión', ?)`,
          [instructor.id, documentoId]
        );
      }

      await connection.commit();

      // Generar y enviar PDF
      await generarYEnviarPDF(req.body);

      res.json({ 
        success: true, 
        message: 'Documento guardado y notificaciones enviadas.' 
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error al guardar documento:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al guardar el documento.' 
    });
  }
});

// Función para generar y enviar el PDF
async function generarYEnviarPDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  // Agregar contenido al PDF
  page.drawText(`Documento de ${data.nombreAprendiz}`, { x: 50, y: 750, size: 12 });
  
  // Agregar firmas si existen
  if (data.firmaAprendizURL) {
    const firmaAprendizImg = await pdfDoc.embedPng(data.firmaAprendizURL);
    page.drawImage(firmaAprendizImg, { x: 50, y: 600, width: 100, height: 50 });
  }

  const pdfBytes = await pdfDoc.save();

  // Configurar el transportador de correo
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Enviar el correo
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: 'Documento Generado',
    text: 'Se ha generado su documento. Adjunto encontrará el PDF.',
    attachments: [
      {
        filename: 'documento.pdf',
        content: pdfBytes,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

// Ruta para obtener perfil del aprendiz
app.get('/perfil-aprendiz/:aprendizId', async (req, res) => {
  const { aprendizId } = req.params;
  console.log('📋 Solicitando perfil del aprendiz:', aprendizId);

  try {
    const [perfil] = await pool.query(`
      SELECT 
        u.id,
        u.tipo_documento,
        u.numero_documento,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        f.numero as numero_ficha,
        pf.nombre as programa_formacion,
        CONCAT(ui.nombres, ' ', ui.apellidos) as instructor_nombre,
        ui.email as instructor_email,
        (
          SELECT CONCAT(u2.nombres, ' ', u2.apellidos)
          FROM usuarios u2
          WHERE u2.rol_id = 2 AND u2.estado = 'ACTIVO'
          LIMIT 1
        ) as jefe_nombre,
        (
          SELECT u2.email
          FROM usuarios u2
          WHERE u2.rol_id = 2 AND u2.estado = 'ACTIVO'
          LIMIT 1
        ) as jefe_email
      FROM usuarios u
      JOIN aprendices_ficha af ON u.id = af.aprendiz_id
      JOIN fichas f ON af.ficha_id = f.id
      JOIN programas_formacion pf ON f.programa_id = pf.id
      JOIN usuarios ui ON f.instructor_id = ui.id
      WHERE u.id = ? AND u.rol_id = 3 AND af.estado = 'ACTIVO'
    `, [aprendizId]);

    if (perfil.length === 0) {
      return res.status(404).json({
        message: 'Perfil no encontrado'
      });
    }

    res.json(perfil[0]);
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({ 
      message: 'Error al obtener el perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/estadisticas-instructor/:instructorId?', async (req, res) => {
  const instructorId = req.params.instructorId;
  console.log('📊 Solicitando estadísticas para instructor:', instructorId);

  try {
    // Si no se proporciona ID, obtener estadísticas generales
    if (!instructorId) {
      const [stats] = await pool.query(`
        SELECT 
          SUM(total_documentos) as totalDocumentos,
          SUM(documentos_aprobados) as aprobados,
          SUM(documentos_rechazados) as rechazados,
          SUM(documentos_pendientes) as pendientes
        FROM estadisticas_instructor
        WHERE fecha_calculo = CURDATE()
      `);

      // Obtener estadísticas por ficha
      const [porFicha] = await pool.query(`
        SELECT 
          f.numero as ficha,
          pf.nombre as programa,
          ef.total_documentos as totalDocumentos,
          ef.documentos_aprobados as aprobados,
          ef.documentos_rechazados as rechazados,
          ef.documentos_pendientes as pendientes
        FROM estadisticas_ficha ef
        JOIN fichas f ON ef.ficha_id = f.id
        JOIN programas_formacion pf ON f.programa_id = pf.id
        WHERE ef.fecha_calculo = CURDATE()
      `);

      // Obtener aprendices con documentos pendientes
      const [aprendices] = await pool.query(`
        SELECT 
          u.id,
          CONCAT(u.nombres, ' ', u.apellidos) as nombre,
          u.email,
          f.numero as ficha,
          sd.documentos_pendientes
        FROM seguimiento_documentos sd
        JOIN usuarios u ON sd.aprendiz_id = u.id
        JOIN fichas f ON sd.ficha_id = f.id
        WHERE sd.documentos_pendientes > 0
      `);

      return res.json({
        ...stats[0],
        porFicha,
        aprendices
      });
    }

    // Si se proporciona ID, obtener estadísticas específicas del instructor
    const [stats] = await pool.query(`
      SELECT 
        total_documentos as totalDocumentos,
        documentos_aprobados as aprobados,
        documentos_rechazados as rechazados,
        documentos_pendientes as pendientes
      FROM estadisticas_instructor
      WHERE instructor_id = ? AND fecha_calculo = CURDATE()
    `, [instructorId]);

    // Obtener estadísticas por ficha del instructor
    const [porFicha] = await pool.query(`
      SELECT 
        f.numero as ficha,
        pf.nombre as programa,
        ef.total_documentos as totalDocumentos,
        ef.documentos_aprobados as aprobados,
        ef.documentos_rechazados as rechazados,
        ef.documentos_pendientes as pendientes
      FROM estadisticas_ficha ef
      JOIN fichas f ON ef.ficha_id = f.id
      JOIN programas_formacion pf ON f.programa_id = pf.id
      WHERE ef.instructor_id = ? AND ef.fecha_calculo = CURDATE()
    `, [instructorId]);

    // Obtener aprendices con documentos pendientes del instructor
    const [aprendices] = await pool.query(`
      SELECT 
        u.id,
        CONCAT(u.nombres, ' ', u.apellidos) as nombre,
        u.email,
        f.numero as ficha,
        sd.documentos_pendientes
      FROM seguimiento_documentos sd
      JOIN usuarios u ON sd.aprendiz_id = u.id
      JOIN fichas f ON sd.ficha_id = f.id
      WHERE sd.instructor_id = ? AND sd.documentos_pendientes > 0
    `, [instructorId]);

    // Calcular estadísticas si no existen
    if (!stats.length) {
      await pool.query('CALL calcular_estadisticas_instructor(?)', [instructorId]);
      return res.redirect(`/estadisticas-instructor/${instructorId}`);
    }

    res.json({
      ...stats[0],
      porFicha,
      aprendices
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para obtener documentos del aprendiz
app.get('/documentos-aprendiz/:aprendizId', async (req, res) => {
  const { aprendizId } = req.params;
  console.log('📄 Solicitando documentos para aprendiz:', aprendizId);

  try {
    // 1. Verificar si el aprendiz existe y obtener su ficha
    const [aprendizFicha] = await pool.query(`
      SELECT 
        af.ficha_id,
        f.numero as numero_ficha
      FROM aprendices_ficha af
      JOIN fichas f ON af.ficha_id = f.id
      WHERE af.aprendiz_id = ? AND af.estado = 'ACTIVO'
      LIMIT 1
    `, [aprendizId]);

    if (aprendizFicha.length === 0) {
      return res.status(404).json({
        message: 'No se encontró una ficha activa para el aprendiz'
      });
    }

    // 2. Obtener documentos con toda la información relacionada
    const [documentos] = await pool.query(`
      SELECT 
        d.id,
        d.plantilla_id,
        d.ficha_id,
        d.aprendiz_id,
        d.contenido,
        d.estado,
        d.created_at,
        d.updated_at,
        pd.titulo,
        pd.descripcion,
        f.numero as numero_ficha,
        CONCAT(ui.nombres, ' ', ui.apellidos) as instructor_nombre,
        pf.nombre as programa_formacion,
        (
          SELECT CONCAT(u.nombres, ' ', u.apellidos)
          FROM usuarios u
          WHERE u.rol_id = 2 AND u.estado = 'ACTIVO'
          LIMIT 1
        ) as jefe_nombre
      FROM documentos d
      JOIN plantillas_documento pd ON d.plantilla_id = pd.id
      JOIN fichas f ON d.ficha_id = f.id
      JOIN usuarios ui ON f.instructor_id = ui.id
      JOIN programas_formacion pf ON f.programa_id = pf.id
      WHERE d.aprendiz_id = ?
      ORDER BY d.created_at DESC
    `, [aprendizId]);

    console.log(`📊 Encontrados ${documentos.length} documentos`);

    // 3. Para cada documento, obtener información adicional
    const documentosConDetalles = await Promise.all(documentos.map(async (documento) => {
      try {
        // Obtener firmas
        const [firmas] = await pool.query(`
          SELECT 
            f.*,
            CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo
          FROM firmas f
          JOIN usuarios u ON f.usuario_id = u.id
          WHERE f.documento_id = ?
        `, [documento.id]);

        // Obtener historial
        const [historial] = await pool.query(`
          SELECT 
            h.*,
            CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo
          FROM historial_cambios h
          JOIN usuarios u ON h.usuario_id = u.id
          WHERE h.documento_id = ?
          ORDER BY h.created_at DESC
        `, [documento.id]);

        // Parsear contenido JSON
        let contenido = {};
        try {
          contenido = documento.contenido ? JSON.parse(documento.contenido) : {};
        } catch (error) {
          console.error(`Error al parsear contenido JSON del documento ${documento.id}:`, error);
          contenido = { error: 'Error al parsear contenido' };
        }

        return {
          ...documento,
          contenido,
          firmas: firmas || [],
          historial: historial || []
        };
      } catch (error) {
        console.error(`Error al procesar documento ${documento.id}:`, error);
        return {
          ...documento,
          error: 'Error al procesar detalles del documento'
        };
      }
    }));

    res.json(documentosConDetalles);
  } catch (error) {
    console.error('❌ Error al obtener documentos:', error);
    res.status(500).json({ 
      message: 'Error al obtener los documentos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para obtener documentos pendientes de revisión
app.get('/documentos-pendientes/:instructorId', async (req, res) => {
  const { instructorId } = req.params;
  console.log('📋 Solicitando documentos pendientes para instructor:', instructorId);

  try {
    const [documentos] = await pool.query(`
      SELECT 
        d.id,
        d.plantilla_id,
        d.aprendiz_id,
        d.contenido,
        d.estado,
        d.created_at as fecha,
        pd.titulo,
        pd.descripcion,
        f.numero as numero_ficha,
        CONCAT(u.nombres, ' ', u.apellidos) as nombre_aprendiz,
        u.email as aprendiz_email,
        f.id as ficha_id,
        pf.nombre as programa_formacion
      FROM documentos d
      JOIN plantillas_documento pd ON d.plantilla_id = pd.id
      JOIN fichas f ON d.ficha_id = f.id
      JOIN usuarios u ON d.aprendiz_id = u.id
      JOIN programas_formacion pf ON f.programa_id = pf.id
      WHERE f.instructor_id = ? 
      AND d.estado IN ('ENVIADO', 'EN_REVISION')
      ORDER BY d.created_at DESC
    `, [instructorId]);

    // Parsear el contenido JSON de cada documento
    const documentosFormateados = documentos.map(doc => ({
      ...doc,
      contenido: JSON.parse(doc.contenido || '{}')
    }));

    console.log(`📊 Se encontraron ${documentos.length} documentos pendientes`);
    res.json(documentosFormateados);
  } catch (error) {
    console.error('❌ Error al obtener documentos pendientes:', error);
    res.status(500).json({ 
      message: 'Error al obtener documentos pendientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para obtener un documento específico por ID
app.get('/documento-detalle/:documentoId', async (req, res) => {
  const { documentoId } = req.params;
  console.log('📄 Solicitando detalle del documento:', documentoId);

  try {
    // Obtener información del documento
    const [documentos] = await pool.query(`
      SELECT 
        d.id,
        d.plantilla_id,
        d.aprendiz_id,
        d.ficha_id,
        d.contenido,
        d.estado,
        d.created_at,
        d.updated_at,
        pd.titulo,
        pd.descripcion,
        pd.estructura,
        CONCAT(u.nombres, ' ', u.apellidos) as nombre_aprendiz,
        u.email as aprendiz_email,
        f.numero as numero_ficha,
        pf.nombre as programa_formacion
      FROM documentos d
      JOIN plantillas_documento pd ON d.plantilla_id = pd.id
      JOIN usuarios u ON d.aprendiz_id = u.id
      JOIN fichas f ON d.ficha_id = f.id
      JOIN programas_formacion pf ON f.programa_id = pf.id
      WHERE d.id = ?
    `, [documentoId]);

    if (documentos.length === 0) {
      return res.status(404).json({
        message: 'Documento no encontrado'
      });
    }

    // Obtener firmas asociadas al documento
    const [firmas] = await pool.query(`
      SELECT 
        f.*,
        CONCAT(u.nombres, ' ', u.apellidos) as nombre_usuario,
        u.email,
        r.nombre as rol
      FROM firmas f
      JOIN usuarios u ON f.usuario_id = u.id
      JOIN roles r ON u.rol_id = r.id
      WHERE f.documento_id = ?
    `, [documentoId]);

    // Obtener historial de cambios
    const [historial] = await pool.query(`
      SELECT 
        h.*,
        CONCAT(u.nombres, ' ', u.apellidos) as nombre_usuario,
        r.nombre as rol
      FROM historial_cambios h
      JOIN usuarios u ON h.usuario_id = u.id
      JOIN roles r ON u.rol_id = r.id
      WHERE h.documento_id = ?
      ORDER BY h.created_at DESC
    `, [documentoId]);

    // Formatear la respuesta
    const documento = documentos[0];
    const respuesta = {
      ...documento,
      contenido: JSON.parse(documento.contenido || '{}'),
      estructura: JSON.parse(documento.estructura || '{}'),
      firmas: firmas || [],
      historial: historial || []
    };

    res.json(respuesta);
  } catch (error) {
    console.error('❌ Error al obtener detalle del documento:', error);
    res.status(500).json({ 
      message: 'Error al obtener detalle del documento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para guardar documento
app.post('/guardar-documento', async (req, res) => {
  console.log('Recibiendo solicitud para guardar documento:', req.body); // Debug log
  
  const { plantilla_id, aprendiz_id, contenido, firma } = req.body;

  if (!plantilla_id || !aprendiz_id || !contenido) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos'
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Obtener la ficha del aprendiz
    const [fichas] = await connection.query(
      `SELECT f.id 
       FROM fichas f 
       JOIN aprendices_ficha af ON f.id = af.ficha_id 
       WHERE af.aprendiz_id = ? AND af.estado = 'ACTIVO'
       LIMIT 1`,
      [aprendiz_id]
    );

    if (fichas.length === 0) {
      throw new Error('No se encontró una ficha activa para el aprendiz');
    }

    const ficha_id = fichas[0].id;

    // Insertar documento
    const [result] = await connection.query(
      `INSERT INTO documentos (plantilla_id, ficha_id, aprendiz_id, contenido, estado)
       VALUES (?, ?, ?, ?, 'ENVIADO')`,
      [plantilla_id, ficha_id, aprendiz_id, JSON.stringify(contenido)]
    );

    const documento_id = result.insertId;

    // Insertar firma del aprendiz si existe
    if (firma) {
      await connection.query(
        `INSERT INTO firmas (documento_id, usuario_id, tipo_firma, estado)
         VALUES (?, ?, 'APRENDIZ', 'FIRMADO')`,
        [documento_id, aprendiz_id]
      );
    }

    // Obtener instructores de la ficha
    const [instructores] = await connection.query(`
      SELECT DISTINCT u.id 
      FROM usuarios u
      JOIN fichas f ON f.instructor_id = u.id
      WHERE f.id = ? AND u.estado = 'ACTIVO'`, 
      [fichaId]);

    for (const instructor of instructores) {
      await crearNotificacion(connection, {
        usuario_id: instructor.id,
        tipo: 'DOCUMENTO_NUEVO',
        titulo: 'Nuevo documento para revisar',
        mensaje: `El aprendiz ${nombreAprendiz} ha enviado un nuevo documento para revisión`,
        documento_id: documentoId
      });
    }

    await connection.commit();
    
    console.log('Documento guardado exitosamente:', documento_id); // Debug log
    
    res.json({ 
      success: true, 
      message: 'Documento guardado exitosamente',
      documentoId: documento_id
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al guardar documento:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al guardar documento'
    });
  } finally {
    connection.release();
  }
});

// Ruta para aprobar documento
app.post('/aprobar-documento', async (req, res) => {
  console.log('Recibiendo solicitud para aprobar documento:', req.body); // Debug log
  
  const { documento_id, comentario, firma, instructor_id } = req.body;
  
  if (!documento_id || !instructor_id) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos'
    });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Actualizar estado del documento
    await connection.query(
      `UPDATE documentos SET estado = 'APROBADO', updated_at = NOW() WHERE id = ?`,
      [documento_id]
    );

    // Registrar firma del instructor
    if (firma) {
      await connection.query(
        `INSERT INTO firmas (documento_id, usuario_id, tipo_firma, firma_data, estado)
         VALUES (?, ?, 'INSTRUCTOR', ?, 'FIRMADO')`,
        [documento_id, instructor_id, firma]
      );
    }

    // Registrar historial
    await connection.query(
      `INSERT INTO historial_cambios 
       (documento_id, usuario_id, tipo_cambio, descripcion, created_at)
       VALUES (?, ?, 'APROBACION', ?, NOW())`,
      [documento_id, instructor_id, comentario || 'Documento aprobado']
    );

    // Obtener información del aprendiz para notificación
    const [documento] = await connection.query(
      `SELECT aprendiz_id FROM documentos WHERE id = ?`,
      [documento_id]
    );

    if (documento.length > 0) {
      // Crear notificación para el aprendiz
      await connection.query(
        `INSERT INTO notificaciones 
         (usuario_id, tipo, titulo, mensaje, documento_id, created_at)
         VALUES (?, 'DOCUMENTO_APROBADO', 'Documento Aprobado', ?, ?, NOW())`,
        [documento[0].aprendiz_id, comentario || 'Su documento ha sido aprobado', documento_id]
      );
    }

    await connection.commit();
    
    console.log('Documento aprobado exitosamente:', documento_id); // Debug log
    
    res.json({ 
      success: true, 
      message: 'Documento aprobado exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al aprobar documento:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al aprobar documento'
    });
  } finally {
    connection.release();
  }
});

// Ruta para rechazar documento
app.post('/rechazar-documento', async (req, res) => {
  console.log('Recibiendo solicitud para rechazar documento:', req.body); // Debug log
  
  const { documento_id, comentario, instructor_id } = req.body;
  
  if (!documento_id || !instructor_id || !comentario) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos (documento_id, instructor_id y comentario son obligatorios)'
    });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Actualizar estado del documento
    await connection.query(
      `UPDATE documentos SET estado = 'RECHAZADO', updated_at = NOW() WHERE id = ?`,
      [documento_id]
    );

    // Registrar historial
    await connection.query(
      `INSERT INTO historial_cambios 
       (documento_id, usuario_id, tipo_cambio, descripcion, created_at)
       VALUES (?, ?, 'RECHAZO', ?, NOW())`,
      [documento_id, instructor_id, comentario]
    );

    // Obtener información del aprendiz para notificación
    const [documento] = await connection.query(
      `SELECT aprendiz_id FROM documentos WHERE id = ?`,
      [documento_id]
    );

    if (documento.length > 0) {
      // Crear notificación para el aprendiz
      await connection.query(
        `INSERT INTO notificaciones 
         (usuario_id, tipo, titulo, mensaje, documento_id, created_at)
         VALUES (?, 'DOCUMENTO_RECHAZADO', 'Documento Rechazado', ?, ?, NOW())`,
        [documento[0].aprendiz_id, comentario, documento_id]
      );
    }

    await connection.commit();
    
    console.log('Documento rechazado exitosamente:', documento_id); // Debug log
    
    res.json({ 
      success: true, 
      message: 'Documento rechazado exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al rechazar documento:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al rechazar documento'
    });
  } finally {
    connection.release();
  }
});

// Ruta para solicitar correcciones a un documento
app.post('/solicitar-correccion', async (req, res) => {
  console.log('Recibiendo solicitud para corrección de documento:', req.body); // Debug log
  
  const { documento_id, comentario, instructor_id } = req.body;
  
  if (!documento_id || !instructor_id || !comentario) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos'
    });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Actualizar estado del documento
    await connection.query(
      `UPDATE documentos SET estado = 'REQUIERE_CORRECCION', updated_at = NOW() WHERE id = ?`,
      [documento_id]
    );

    // Registrar historial
    await connection.query(
      `INSERT INTO historial_cambios 
       (documento_id, usuario_id, tipo_cambio, descripcion, created_at)
       VALUES (?, ?, 'SOLICITUD_CORRECCION', ?, NOW())`,
      [documento_id, instructor_id, comentario]
    );

    // Obtener información del aprendiz para notificación
    const [documento] = await connection.query(
      `SELECT aprendiz_id FROM documentos WHERE id = ?`,
      [documento_id]
    );

    if (documento.length > 0) {
      // Crear notificación para el aprendiz
      await connection.query(
        `INSERT INTO notificaciones 
         (usuario_id, tipo, titulo, mensaje, documento_id, created_at)
         VALUES (?, 'CORRECCION_REQUERIDA', 'Se requieren correcciones', ?, ?, NOW())`,
        [documento[0].aprendiz_id, comentario, documento_id]
      );
    }

    await connection.commit();
    
    console.log('Solicitud de corrección enviada exitosamente:', documento_id); // Debug log
    
    res.json({ 
      success: true, 
      message: 'Solicitud de corrección enviada exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al solicitar corrección:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error al solicitar corrección'
    });
  } finally {
    connection.release();
  }
});

// Ruta para obtener firma del instructor
app.get('/firma-instructor/:instructorId', async (req, res) => {
  const { instructorId } = req.params;
  console.log('🖋️ Solicitando firma del instructor:', instructorId);

  try {
    const [firma] = await pool.query(`
      SELECT firma 
      FROM firmas_instructores 
      WHERE instructor_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [instructorId]);

    res.json({ 
      success: true,
      firma: firma.length > 0 ? firma[0].firma : null 
    });
  } catch (error) {
    console.error('❌ Error al obtener firma:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener la firma',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para guardar firma del instructor
app.post('/guardar-firma-instructor', async (req, res) => {
  const { instructor_id, firma } = req.body;
  console.log('🖋️ Guardando firma para instructor:', instructor_id);

  if (!instructor_id || !firma) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos (instructor_id y firma son obligatorios)'
    });
  }

  try {
    await pool.query(`
      INSERT INTO firmas_instructores (instructor_id, firma, created_at)
      VALUES (?, ?, NOW())
    `, [instructor_id, firma]);

    res.json({ 
      success: true, 
      message: 'Firma guardada exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error al guardar firma:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al guardar la firma',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para verificar si un instructor tiene firma registrada
app.get('/verificar-firma/:instructorId', async (req, res) => {
  const { instructorId } = req.params;
  console.log('🔍 Verificando si el instructor tiene firma:', instructorId);

  try {
    const [firma] = await pool.query(`
      SELECT COUNT(*) as tiene_firma
      FROM firmas_instructores 
      WHERE instructor_id = ?
    `, [instructorId]);

    res.json({ 
      success: true,
      tieneFirma: firma[0].tiene_firma > 0
    });
  } catch (error) {
    console.error('❌ Error al verificar firma:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al verificar firma',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para eliminar firma del instructor
app.delete('/eliminar-firma-instructor/:instructorId', async (req, res) => {
  const { instructorId } = req.params;
  console.log('🗑️ Eliminando firma del instructor:', instructorId);

  try {
    await pool.query(`
      DELETE FROM firmas_instructores 
      WHERE instructor_id = ?
    `, [instructorId]);

    res.json({ 
      success: true, 
      message: 'Firma eliminada exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error al eliminar firma:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar la firma',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/notificaciones/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  console.log('📬 Solicitando notificaciones para usuario:', usuarioId);

  try {
    const [notificaciones] = await pool.query(`
      SELECT 
        n.id,
        n.tipo,
        n.titulo,
        n.mensaje,
        n.documento_id,
        n.leida,
        n.created_at,
        pd.titulo as documento_titulo,
        CONCAT(u.nombres, ' ', u.apellidos) as aprendiz_nombre,
        f.numero as ficha_numero
      FROM notificaciones n
      LEFT JOIN documentos d ON n.documento_id = d.id
      LEFT JOIN plantillas_documento pd ON d.plantilla_id = pd.id
      LEFT JOIN usuarios u ON d.aprendiz_id = u.id
      LEFT JOIN fichas f ON d.ficha_id = f.id
      WHERE n.usuario_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [usuarioId]);

    // Formatear las fechas y agregar información adicional
    const notificacionesFormateadas = notificaciones.map(notif => ({
      ...notif,
      created_at: new Date(notif.created_at).toISOString(),
      tiempo_relativo: formatearTiempoRelativo(notif.created_at)
    }));

    res.json(notificacionesFormateadas);
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    res.status(500).json({ 
      message: 'Error al obtener notificaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Función auxiliar para formatear el tiempo relativo
const formatearTiempoRelativo = (fecha) => {
  const ahora = new Date();
  const fechaNotif = new Date(fecha);
  const diferencia = ahora - fechaNotif;
  const minutos = Math.floor(diferencia / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (minutos < 60) {
    return `Hace ${minutos} minutos`;
  } else if (horas < 24) {
    return `Hace ${horas} horas`;
  } else {
    return `Hace ${dias} días`;
  }
};

// Ruta para marcar notificación como leída
app.post('/marcar-notificacion-leida', async (req, res) => {
  const { notificacion_id, usuario_id } = req.body;
  console.log('📌 Marcando notificación como leída:', notificacion_id);

  try {
    await pool.query(`
      UPDATE notificaciones 
      SET leida = true, 
          updated_at = NOW() 
      WHERE id = ? 
      AND usuario_id = ?
    `, [notificacion_id, usuario_id]);

    res.json({ 
      success: true, 
      message: 'Notificación marcada como leída' 
    });
  } catch (error) {
    console.error('❌ Error al marcar notificación:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al marcar la notificación como leída',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Función para crear notificación (útil para otros endpoints)
const crearNotificacion = async (connection, {
  usuario_id,
  tipo,
  titulo,
  mensaje,
  documento_id
}) => {
  try {
    await connection.query(`
      INSERT INTO notificaciones (
        usuario_id,
        tipo,
        titulo,
        mensaje,
        documento_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `, [usuario_id, tipo, titulo, mensaje, documento_id]);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};


// Ruta para obtener perfil del instructor
app.get('/perfil-instructor/:instructorId', async (req, res) => {
  const { instructorId } = req.params;
  console.log('📋 Solicitando perfil del instructor:', instructorId);

  try {
    const [perfil] = await pool.query(`
      SELECT 
        u.id,
        u.tipo_documento,
        u.numero_documento,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        (
          SELECT COUNT(DISTINCT f.id)
          FROM fichas f
          WHERE f.instructor_id = u.id
          AND f.estado = 'ACTIVO'
        ) as total_fichas,
        (
          SELECT COUNT(DISTINCT af.aprendiz_id)
          FROM fichas f
          JOIN aprendices_ficha af ON f.id = af.ficha_id
          WHERE f.instructor_id = u.id
          AND f.estado = 'ACTIVO'
          AND af.estado = 'ACTIVO'
        ) as total_aprendices
      FROM usuarios u
      WHERE u.id = ? 
      AND u.rol_id = 1 
      AND u.estado = 'ACTIVO'
      LIMIT 1
    `, [instructorId]);

    if (perfil.length === 0) {
      return res.status(404).json({
        message: 'Perfil no encontrado'
      });
    }

    // Obtener las fichas asignadas al instructor
    const [fichas] = await pool.query(`
      SELECT 
        f.id,
        f.numero,
        pf.nombre as programa,
        (
          SELECT COUNT(DISTINCT af.aprendiz_id)
          FROM aprendices_ficha af
          WHERE af.ficha_id = f.id
          AND af.estado = 'ACTIVO'
        ) as total_aprendices
      FROM fichas f
      JOIN programas_formacion pf ON f.programa_id = pf.id
      WHERE f.instructor_id = ?
      AND f.estado = 'ACTIVO'
    `, [instructorId]);

    res.json({
      ...perfil[0],
      fichas
    });
  } catch (error) {
    console.error('❌ Error al obtener perfil del instructor:', error);
    res.status(500).json({ 
      message: 'Error al obtener el perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para obtener aprendices asignados al instructor
app.get('/aprendices-instructor/:instructorId', async (req, res) => {
  const { instructorId } = req.params;
  console.log('📋 Solicitando aprendices para instructor:', instructorId);

  try {
    const [fichas] = await pool.query(`
      SELECT 
        f.id,
        f.numero,
        pf.nombre as programa,
        f.estado
      FROM fichas f
      JOIN programas_formacion pf ON f.programa_id = pf.id
      WHERE f.instructor_id = ?
      AND f.estado = 'ACTIVO'
      ORDER BY f.numero
    `, [instructorId]);

    // Para cada ficha, obtener sus aprendices
    const fichasConAprendices = await Promise.all(fichas.map(async (ficha) => {
      const [aprendices] = await pool.query(`
        SELECT 
          u.id,
          u.tipo_documento,
          u.numero_documento,
          u.nombres,
          u.apellidos,
          u.email,
          u.estado,
          f.numero as ficha_numero,
          pf.nombre as programa,
          CONCAT(uj.nombres, ' ', uj.apellidos) as jefe_nombre,
          uj.email as jefe_email,
          (
            SELECT COUNT(*)
            FROM documentos d
            WHERE d.aprendiz_id = u.id
            AND d.estado IN ('ENVIADO', 'EN_REVISION')
          ) as documentos_pendientes
        FROM usuarios u
        JOIN aprendices_ficha af ON u.id = af.aprendiz_id
        JOIN fichas f ON af.ficha_id = f.id
        JOIN programas_formacion pf ON f.programa_id = pf.id
        LEFT JOIN usuarios uj ON uj.rol_id = 2 AND uj.estado = 'ACTIVO'
        WHERE af.ficha_id = ?
        AND af.estado = 'ACTIVO'
        ORDER BY u.apellidos, u.nombres
      `, [ficha.id]);

      return {
        ...ficha,
        aprendices
      };
    }));

    res.json(fichasConAprendices);
  } catch (error) {
    console.error('❌ Error al obtener aprendices:', error);
    res.status(500).json({ 
      message: 'Error al obtener los aprendices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para marcar todas las notificaciones como leídas
app.post('/marcar-todas-notificaciones-leidas', async (req, res) => {
  const { usuario_id } = req.body;
  console.log('📌 Marcando todas las notificaciones como leídas para usuario:', usuario_id);

  if (!usuario_id) {
    return res.status(400).json({
      success: false,
      message: 'Falta el ID de usuario'
    });
  }

  try {
    await pool.query(`
      UPDATE notificaciones 
      SET leida = true, 
          updated_at = NOW() 
      WHERE usuario_id = ? 
      AND leida = false
    `, [usuario_id]);

    res.json({ 
      success: true, 
      message: 'Todas las notificaciones marcadas como leídas' 
    });
  } catch (error) {
    console.error('❌ Error al marcar notificaciones:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al marcar las notificaciones como leídas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para obtener conteo de notificaciones no leídas
app.get('/notificaciones-no-leidas/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  console.log('🔢 Solicitando conteo de notificaciones no leídas para usuario:', usuarioId);

  try {
    const [result] = await pool.query(`
      SELECT COUNT(*) as total
      FROM notificaciones
      WHERE usuario_id = ?
      AND leida = false
    `, [usuarioId]);

    res.json({ 
      success: true,
      total: result[0].total
    });
  } catch (error) {
    console.error('❌ Error al obtener conteo de notificaciones:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener conteo de notificaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para obtener estadísticas generales
app.get('/estadisticas-generales', async (req, res) => {
  const { periodo = 'mes' } = req.query;
  console.log('📊 Solicitando estadísticas generales, periodo:', periodo);

  try {
    // Calcular fecha inicial según el periodo
    const fechaFin = new Date();
    const fechaInicio = new Date();
    
    switch (periodo) {
      case 'trimestre':
        fechaInicio.setMonth(fechaInicio.getMonth() - 3);
        break;
      case 'año':
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
      case 'semana':
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        break;
      default: // mes
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
    }

    // Obtener estadísticas generales
    const [estadisticas] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'APROBADO' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN estado = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
        SUM(CASE WHEN estado IN ('ENVIADO', 'EN_REVISION', 'REQUIERE_CORRECCION') THEN 1 ELSE 0 END) as pendientes
      FROM documentos
      WHERE created_at BETWEEN ? AND ?
    `, [fechaInicio, fechaFin]);

    // Obtener estadísticas por programa
    const [porPrograma] = await pool.query(`
      SELECT 
        pf.nombre,
        COUNT(*) as total,
        SUM(CASE WHEN d.estado = 'APROBADO' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN d.estado = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
        SUM(CASE WHEN d.estado IN ('ENVIADO', 'EN_REVISION', 'REQUIERE_CORRECCION') THEN 1 ELSE 0 END) as pendientes
      FROM documentos d
      JOIN fichas f ON d.ficha_id = f.id
      JOIN programas_formacion pf ON f.programa_id = pf.id
      WHERE d.created_at BETWEEN ? AND ?
      GROUP BY pf.id
      ORDER BY total DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);

    // Obtener estadísticas por instructor
    const [porInstructor] = await pool.query(`
      SELECT 
        CONCAT(u.nombres, ' ', u.apellidos) as nombre,
        u.id as instructor_id,
        COUNT(*) as total_documentos,
        SUM(CASE WHEN d.estado = 'APROBADO' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN d.estado = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
        SUM(CASE WHEN d.estado IN ('ENVIADO', 'EN_REVISION', 'REQUIERE_CORRECCION') THEN 1 ELSE 0 END) as pendientes
      FROM documentos d
      JOIN fichas f ON d.ficha_id = f.id
      JOIN usuarios u ON f.instructor_id = u.id
      WHERE d.created_at BETWEEN ? AND ?
      GROUP BY u.id
      ORDER BY total_documentos DESC
      LIMIT 5
    `, [fechaInicio, fechaFin]);

    // Obtener estadísticas por tipo de documento
    const [porTipoDocumento] = await pool.query(`
      SELECT 
        pd.titulo as tipo,
        COUNT(*) as total,
        SUM(CASE WHEN d.estado = 'APROBADO' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN d.estado = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
        SUM(CASE WHEN d.estado IN ('ENVIADO', 'EN_REVISION', 'REQUIERE_CORRECCION') THEN 1 ELSE 0 END) as pendientes
      FROM documentos d
      JOIN plantillas_documento pd ON d.plantilla_id = pd.id
      WHERE d.created_at BETWEEN ? AND ?
      GROUP BY pd.id
      ORDER BY total DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);

    // Obtener tendencia de documentos por día
    const [tendenciaDiaria] = await pool.query(`
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'APROBADO' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN estado = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
        SUM(CASE WHEN estado IN ('ENVIADO', 'EN_REVISION', 'REQUIERE_CORRECCION') THEN 1 ELSE 0 END) as pendientes
      FROM documentos
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY fecha ASC
    `, [fechaInicio, fechaFin]);

    res.json({
      ...estadisticas[0],
      porPrograma,
      porInstructor,
      porTipoDocumento,
      tendenciaDiaria,
      periodo,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para obtener reportes recientes
app.get('/reportes-recientes/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  console.log('📊 Solicitando reportes recientes para usuario:', usuarioId);

  try {
    const [reportes] = await pool.query(`
      SELECT 
        r.*,
        CONCAT(u.nombres, ' ', u.apellidos) as generado_por_nombre
      FROM reportes r
      JOIN usuarios u ON r.generado_por = u.id
      WHERE r.generado_por = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [usuarioId]);

    res.json(reportes);
  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    res.status(500).json({ 
      message: 'Error al obtener reportes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para generar reporte
app.post('/generar-reporte', async (req, res) => {
  const { fechaInicio, fechaFin, tipoReporte, usuario_id } = req.body;
  console.log('📊 Generando reporte:', { fechaInicio, fechaFin, tipoReporte });

  try {
    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: 'Las fechas son requeridas' });
    }

    // Obtener datos según el tipo de reporte
    let query = '';
    const queryParams = [fechaInicio, fechaFin];

    switch (tipoReporte) {
      case 'general':
        query = `
          SELECT 
            d.*,
            pd.titulo as tipo_documento,
            CONCAT(u.nombres, ' ', u.apellidos) as aprendiz_nombre,
            f.numero as ficha_numero,
            pf.nombre as programa_formacion
          FROM documentos d
          JOIN plantillas_documento pd ON d.plantilla_id = pd.id
          JOIN usuarios u ON d.aprendiz_id = u.id
          JOIN fichas f ON d.ficha_id = f.id
          JOIN programas_formacion pf ON f.programa_id = pf.id
          WHERE DATE(d.created_at) BETWEEN ? AND ?
          ORDER BY d.created_at DESC
        `;
        break;

      case 'aprobados':
        query = `
          SELECT 
            d.*,
            pd.titulo as tipo_documento,
            CONCAT(u.nombres, ' ', u.apellidos) as aprendiz_nombre,
            f.numero as ficha_numero,
            pf.nombre as programa_formacion
          FROM documentos d
          JOIN plantillas_documento pd ON d.plantilla_id = pd.id
          JOIN usuarios u ON d.aprendiz_id = u.id
          JOIN fichas f ON d.ficha_id = f.id
          JOIN programas_formacion pf ON f.programa_id = pf.id
          WHERE d.estado = 'APROBADO'
          AND DATE(d.created_at) BETWEEN ? AND ?
          ORDER BY d.created_at DESC
        `;
        break;

      case 'rechazados':
        query = `
          SELECT 
            d.*,
            pd.titulo as tipo_documento,
            CONCAT(u.nombres, ' ', u.apellidos) as aprendiz_nombre,
            f.numero as ficha_numero,
            pf.nombre as programa_formacion
          FROM documentos d
          JOIN plantillas_documento pd ON d.plantilla_id = pd.id
          JOIN usuarios u ON d.aprendiz_id = u.id
          JOIN fichas f ON d.ficha_id = f.id
          JOIN programas_formacion pf ON f.programa_id = pf.id
          WHERE d.estado = 'RECHAZADO'
          AND DATE(d.created_at) BETWEEN ? AND ?
          ORDER BY d.created_at DESC
        `;
        break;

      case 'pendientes':
        query = `
          SELECT 
            d.*,
            pd.titulo as tipo_documento,
            CONCAT(u.nombres, ' ', u.apellidos) as aprendiz_nombre,
            f.numero as ficha_numero,
            pf.nombre as programa_formacion
          FROM documentos d
          JOIN plantillas_documento pd ON d.plantilla_id = pd.id
          JOIN usuarios u ON d.aprendiz_id = u.id
          JOIN fichas f ON d.ficha_id = f.id
          JOIN programas_formacion pf ON f.programa_id = pf.id
          WHERE d.estado IN ('ENVIADO', 'EN_REVISION')
          AND DATE(d.created_at) BETWEEN ? AND ?
          ORDER BY d.created_at DESC
        `;
        break;

      default:
        return res.status(400).json({ message: 'Tipo de reporte no válido' });
    }

    // Obtener datos para el reporte
    const [datos] = await pool.query(query, queryParams);

    // Generar PDF
    const pdfDoc = await generarPDFReporte(datos, tipoReporte, fechaInicio, fechaFin);
    const pdfBytes = await pdfDoc.save();

    // Guardar registro del reporte
    const [resultado] = await pool.query(`
      INSERT INTO reportes (
        tipo,
        fecha_inicio,
        fecha_fin,
        generado_por,
        created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `, [tipoReporte, fechaInicio, fechaFin, usuario_id]);

    // Enviar PDF como respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${tipoReporte}-${fechaInicio}-${fechaFin}.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('❌ Error al generar reporte:', error);
    res.status(500).json({ 
      message: 'Error al generar el reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para descargar reporte
app.get('/descargar-reporte/:reporteId', async (req, res) => {
  const { reporteId } = req.params;
  console.log('📥 Descargando reporte:', reporteId);

  try {
    const [reporte] = await pool.query(`
      SELECT * FROM reportes WHERE id = ?
    `, [reporteId]);

    if (reporte.length === 0) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Regenerar el PDF con los datos originales
    const query = `
      SELECT 
        d.*,
        pd.titulo as tipo_documento,
        CONCAT(u.nombres, ' ', u.apellidos) as aprendiz_nombre,
        f.numero as ficha_numero,
        pf.nombre as programa_formacion
      FROM documentos d
      JOIN plantillas_documento pd ON d.plantilla_id = pd.id
      JOIN usuarios u ON d.aprendiz_id = u.id
      JOIN fichas f ON d.ficha_id = f.id
      JOIN programas_formacion pf ON f.programa_id = pf.id
      WHERE DATE(d.created_at) BETWEEN ? AND ?
    `;

    const [datos] = await pool.query(query, [reporte[0].fecha_inicio, reporte[0].fecha_fin]);
    const pdfDoc = await generarPDFReporte(datos, reporte[0].tipo, reporte[0].fecha_inicio, reporte[0].fecha_fin);
    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${reporteId}.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('❌ Error al descargar reporte:', error);
    res.status(500).json({ 
      message: 'Error al descargar el reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
