// src/components/DownloadPdf.jsx
import React, { useContext } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PdfDocument from './PdfDocument';
import { AppContext } from '../context/AppContext';

const DownloadPdf = () => {
  const { formData } = useContext(AppContext);

  return (
    <PDFDownloadLink document={<PdfDocument data={formData} />} fileName="documento_evaluacion.pdf">
      {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar PDF')}
    </PDFDownloadLink>
  );
};

export default DownloadPdf;
