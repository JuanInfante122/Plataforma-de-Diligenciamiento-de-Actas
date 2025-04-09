import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AprobacionDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDocumentos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/documentos-aprobacion');
        setDocumentos(response.data);
      } catch (error) {
        console.error('Error al cargar documentos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDocumentos();
  }, []);

  const handleAprobar = async (documentoId, decision) => {
    try {
      await axios.post(`http://localhost:5000/aprobar-documento/${documentoId}`, { decision });
      setDocumentos(documentos.filter(doc => doc.id !== documentoId));
    } catch (error) {
      console.error('Error al aprobar documento:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando documentos...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Aprobación Final de Documentos</h2>
      
      <div className="grid gap-6">
        {documentos.map((documento) => (
          <div key={documento.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{documento.titulo}</h3>
                <p className="text-gray-600">Aprendiz: {documento.nombreAprendiz}</p>
                <p className="text-gray-600">Instructor: {documento.nombreInstructor}</p>
                <p className="text-gray-600">Estado: {documento.estado}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleAprobar(documento.id, 'aprobado')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Aprobar Final
                </button>
                <button
                  onClick={() => handleAprobar(documento.id, 'revision')}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Solicitar Cambios
                </button>
              </div>
            </div>
          </div>
        ))}

        {documentos.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No hay documentos pendientes de aprobación final</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AprobacionDocumentos;