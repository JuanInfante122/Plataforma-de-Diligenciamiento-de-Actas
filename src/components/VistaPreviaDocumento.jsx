// src/components/VistaPreviaDocumento.jsx
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const VistaPreviaDocumento = () => {
  const { formData } = useContext(AppContext);

  return (
    <div className="w-full max-w-3xl p-8 bg-gray-50 shadow-lg rounded-lg overflow-y-auto h-full">
      <h2 className="text-3xl font-bold mb-4">Vista Previa del Documento</h2>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">1. Información General</h3>
        <p className="text-lg"><strong>Regional:</strong> {formData.regional || '---'}</p>
        <p className="text-lg"><strong>Centro de Formación:</strong> {formData.centroFormacion || '---'}</p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Datos del Aprendiz</h3>
        <p className="text-lg"><strong>Nombre Completo:</strong> {formData.nombreAprendiz || '---'}</p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Firmas</h3>
        <div className="space-y-4">
          {['Aprendiz', 'Instructor', 'Jefe'].map((role) => (
            <div key={role} className="mb-4">
              <h4 className="text-lg font-semibold">{`Firma del ${role}`}</h4>
              {formData[`firma${role}URL`] ? (
                <img src={formData[`firma${role}URL`]} alt={`Firma del ${role}`} className="border border-gray-400 rounded-lg" />
              ) : (
                <p className="text-lg text-gray-500">No se ha guardado la firma.</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default VistaPreviaDocumento;
