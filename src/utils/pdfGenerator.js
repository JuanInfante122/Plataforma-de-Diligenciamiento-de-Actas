const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function generarPDFReporte(datos, tipoReporte, fechaInicio, fechaFin) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Tamaño carta
    const { width, height } = page.getSize();
    
    // Cargar fuentes
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Configuración inicial
    const margin = 50;
    let yOffset = height - margin;
    const lineHeight = 20;

    // Título del reporte
    page.drawText('SENA - Reporte de Documentos', {
      x: margin,
      y: yOffset,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0.3, 0.6),
    });
    yOffset -= lineHeight * 1.5;

    // Subtítulo con tipo de reporte
    page.drawText(`Tipo de Reporte: ${tipoReporte.toUpperCase()}`, {
      x: margin,
      y: yOffset,
      size: 12,
      font: helveticaBold,
    });
    yOffset -= lineHeight;

    // Período del reporte
    page.drawText(`Período: ${fechaInicio} al ${fechaFin}`, {
      x: margin,
      y: yOffset,
      size: 12,
      font: helvetica,
    });
    yOffset -= lineHeight * 2;

    // Encabezados de la tabla
    const headers = ['Documento', 'Aprendiz', 'Ficha', 'Estado', 'Fecha'];
    const columnWidths = [200, 150, 70, 80, 80];
    let xOffset = margin;

    // Dibujar fondo del encabezado
    page.drawRectangle({
      x: margin - 5,
      y: yOffset - 15,
      width: width - (margin * 2) + 10,
      height: 25,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Dibujar textos del encabezado
    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xOffset,
        y: yOffset,
        size: 10,
        font: helveticaBold,
      });
      xOffset += columnWidths[index];
    });
    yOffset -= lineHeight * 1.5;

    // Datos de la tabla
    let rowCount = 0;
    for (const item of datos) {
      // Nueva página si es necesario
      if (yOffset < margin + 50) {
        page = pdfDoc.addPage([612, 792]);
        yOffset = height - margin;
      }

      // Alternar color de fondo para las filas
      if (rowCount % 2 === 0) {
        page.drawRectangle({
          x: margin - 5,
          y: yOffset - 15,
          width: width - (margin * 2) + 10,
          height: 20,
          color: rgb(0.95, 0.95, 0.95),
        });
      }

      xOffset = margin;
      const row = [
        item.tipo_documento || '',
        item.aprendiz_nombre || '',
        item.ficha_numero || '',
        item.estado || '',
        new Date(item.created_at).toLocaleDateString() || '',
      ];

      row.forEach((text, index) => {
        // Truncar texto si es muy largo
        const displayText = String(text).length > 25 
          ? String(text).substring(0, 22) + '...'
          : String(text);

        page.drawText(displayText, {
          x: xOffset,
          y: yOffset,
          size: 9,
          font: helvetica,
        });
        xOffset += columnWidths[index];
      });

      yOffset -= lineHeight;
      rowCount++;
    }

    // Agregar pie de página
    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      page.drawText(`Página ${i + 1} de ${pageCount}`, {
        x: width - margin - 70,
        y: margin,
        size: 8,
        font: helvetica,
      });

      page.drawText(`Generado el ${new Date().toLocaleString()}`, {
        x: margin,
        y: margin,
        size: 8,
        font: helvetica,
      });
    }

    return pdfDoc;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('Error al generar el PDF del reporte');
  }
}

module.exports = { generarPDFReporte };
