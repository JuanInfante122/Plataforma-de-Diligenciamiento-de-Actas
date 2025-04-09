import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const VistaPreviaDocumento = ({ aprendizID }) => {
  const [documentos, setDocumentos] = useState([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDocumentos = async () => {
      try {
        setLoading(true);
        console.log('Solicitando documentos para aprendiz:', aprendizID); // Debug log
        const response = await axios.get(API_ENDPOINTS.documentosAprendiz(aprendizID));
        console.log('Documentos recibidos:', response.data); // Debug log
        setDocumentos(response.data);
      } catch (error) {
        console.error('Error al cargar documentos:', error);
        setError('Error al cargar los documentos. Por favor intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    if (aprendizID) {
      cargarDocumentos();
    }
  }, [aprendizID]);

  const getEstadoColor = (estado) => {
    const colores = {
      'BORRADOR': 'bg-gray-100 text-gray-800',
      'ENVIADO': 'bg-blue-100 text-blue-800',
      'EN_REVISION': 'bg-yellow-100 text-yellow-800',
      'RECHAZADO': 'bg-red-100 text-red-800',
      'APROBADO': 'bg-green-100 text-green-800',
      'ARCHIVADO': 'bg-purple-100 text-purple-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const verDetalle = (documento) => {
    setDocumentoSeleccionado(documento);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Mis Documentos</h2>
        <div className="text-sm text-gray-500">
          Total documentos: {documentos.length}
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documentos.map((documento) => (
          <div
            key={documento.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{documento.titulo}</h3>
                <p className="text-sm text-gray-500">
                  Creado: {new Date(documento.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(documento.estado)}`}>
                {documento.estado}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Instructor:</strong> {documento.instructor_nombre}</p>
              <p><strong>Jefe:</strong> {documento.jefe_nombre}</p>
            </div>

            <div className="mt-4 space-x-2">
              <button
                onClick={() => verDetalle(documento)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Ver Detalle
              </button>
            </div>
          </div>
        ))}

        {documentos.length === 0 && (
          <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay documentos disponibles</p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {documentoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">{documentoSeleccionado.titulo}</h3>
              <button
                onClick={() => setDocumentoSeleccionado(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Información del documento */}
              <section className="space-y-2">
                <h4 className="font-semibold">Información General</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>Estado:</strong> {documentoSeleccionado.estado}</p>
                  <p><strong>Fecha de creación:</strong> {new Date(documentoSeleccionado.created_at).toLocaleString()}</p>
                  <p><strong>Instructor:</strong> {documentoSeleccionado.instructor_nombre}</p>
                  <p><strong>Jefe:</strong> {documentoSeleccionado.jefe_nombre}</p>
                </div>
              </section>

              {/* Contenido del documento */}
              <section className="space-y-2">
                <h4 className="font-semibold">Contenido del Documento</h4>
                <div className="bg-gray-50 p-4 rounded">
                  {Object.entries(documentoSeleccionado.contenido).map(([campo, valor]) => (
                    <div key={campo} className="mb-2">
                      <strong className="text-gray-700">{campo}:</strong> {valor}
                    </div>
                  ))}
                </div>
              </section>

              {/* Firmas */}
              <section className="space-y-2">
                <h4 className="font-semibold">Firmas</h4>
                <div className="grid grid-cols-3 gap-4">
                  {documentoSeleccionado.firmas?.map((firma) => (
                    <div key={firma.id} className="text-center">
                      <p className="font-medium">{firma.tipo_firma}</p>
                      {firma.fecha_firma ? (
                        <>
                          <img
                            src={firma.firma_url}
                            alt={`Firma de ${firma.tipo_firma}`}
                            className="mx-auto border rounded"
                          />
                          <p className="text-xs text-gray-500">
                            {new Date(firma.fecha_firma).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">Pendiente</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Historial de cambios */}
              <section className="space-y-2">
                <h4 className="font-semibold">Historial</h4>
                <div className="space-y-2">
                  {documentoSeleccionado.historial?.map((cambio) => (
                    <div key={cambio.id} className="text-sm border-l-2 border-gray-200 pl-3">
                      <p className="font-medium">{cambio.tipo_cambio}</p>
                      <p className="text-gray-500">{cambio.descripcion}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(cambio.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaPreviaDocumento;
