// src/components/VistaPreviaDocumento.jsx
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const VistaPreviaDocumento = () => {
  const { formData } = useContext(AppContext);

  return (
    <div className="w-1/2 p-6 bg-gray-100 shadow-lg rounded-lg overflow-y-auto h-screen">
      <h2 className="text-2xl font-bold mb-6">Vista Previa del Documento</h2>

      <section className="mb-4">
        <h3 className="text-lg font-semibold mb-2">1. Información General</h3>
        <p><strong>Regional:</strong> {formData.regional}</p>
        <p><strong>Centro de Formación:</strong> {formData.centroFormacion}</p>
        <p><strong>Programa de Formación:</strong> {formData.programaFormacion}</p>
        <p><strong>Modalidad de Formación:</strong> {formData.modalidadFormacion}</p>
        <p><strong>No. de Ficha:</strong> {formData.noFicha}</p>
      </section>

      <section className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Datos del Aprendiz</h3>
        <p><strong>Nombre Completo:</strong> {formData.nombreAprendiz}</p>
        <p><strong>Tipo de Documento:</strong> {formData.tipoDocumento}</p>
        <p><strong>Número de Identificación:</strong> {formData.noIdentificacion}</p>
        {/* Agregar más campos... */}
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Firmas</h3>
        {['Aprendiz', 'Instructor', 'Jefe'].map((role) => (
          <div key={role} className="mb-4">
            <h4 className="font-semibold">{`Firma del ${role}`}</h4>
            {formData[`firma${role}URL`] ? (
              <img src={formData[`firma${role}URL`]} alt={`Firma del ${role}`} className="border border-gray-400" />
            ) : (
              <p>No se ha guardado la firma.</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default VistaPreviaDocumento;
