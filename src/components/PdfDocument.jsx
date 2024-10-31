// src/components/PdfDocument.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  section: { marginBottom: 15, padding: 10, borderBottom: '1px solid #ccc' },
  title: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 5, textDecoration: 'underline' },
  text: { fontSize: 12 },
  signature: { width: 100, height: 50, marginTop: 10 },
});

const PdfDocument = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Formato de Planeación, Seguimiento y Evaluación de Etapa Productiva</Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>1. Información General</Text>
        <Text style={styles.text}>Regional: {data.regional}</Text>
        <Text style={styles.text}>Centro de Formación: {data.centroFormacion}</Text>
        <Text style={styles.text}>Programa de Formación: {data.programaFormacion}</Text>
        <Text style={styles.text}>No. Ficha: {data.noFicha}</Text>
        <Text style={styles.text}>Modalidad de Formación: {data.modalidadFormacion}</Text>
        <Text style={styles.text}>Nombre Completo: {data.nombreAprendiz}</Text>
        <Text style={styles.text}>Tipo de Documento: {data.tipoDocumento}</Text>
        <Text style={styles.text}>Número de Identificación: {data.noIdentificacion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Firma del Aprendiz</Text>
        {data.firmaAprendizURL ? (
          <Image src={data.firmaAprendizURL} style={styles.signature} />
        ) : (
          <Text style={styles.text}>Firma no registrada.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Firma del Jefe Inmediato</Text>
        {data.firmaJefeURL ? (
          <Image src={data.firmaJefeURL} style={styles.signature} />
        ) : (
          <Text style={styles.text}>Firma no registrada.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Firma del Instructor</Text>
        {data.firmaInstructorURL ? (
          <Image src={data.firmaInstructorURL} style={styles.signature} />
        ) : (
          <Text style={styles.text}>Firma no registrada.</Text>
        )}
      </View>
    </Page>
  </Document>
);

export default PdfDocument;
