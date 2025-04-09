import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const Historial = ({ aprendizID }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.documentosAprendiz(aprendizID));
        setDocumentos(response.data);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        setError('Error al cargar el historial de documentos');
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, [aprendizID]);

  const getEstadoColor = (estado) => {
    const colors = {
      'ENVIADO': 'bg-blue-100 text-blue-800',
      'EN_REVISION': 'bg-yellow-100 text-yellow-800',
      'RECHAZADO': 'bg-red-100 text-red-800',
      'APROBADO': 'bg-green-100 text-green-800',
      'ARCHIVADO': 'bg-gray-100 text-gray-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const verDetalle = (documento) => {
    setDocumentoSeleccionado(documento);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Historial de Documentos</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jefe
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documentos.map((documento) => (
                <tr key={documento.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {documento.titulo}
                    </div>
                    <div className="text-xs text-gray-500">
                      {documento.descripcion}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(documento.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(documento.estado)}`}>
                      {documento.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {documento.instructor_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {documento.jefe_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => verDetalle(documento)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Ver
                    </button>
                    {documento.estado === 'RECHAZADO' && (
                      <button className="text-green-600 hover:text-green-900">
                        Corregir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documentos.length === 0 && (
          <div className="text-center p-8">
            <p className="text-gray-600">No hay documentos en el historial</p>
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
                  <p><strong>Estado:</strong> 
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(documentoSeleccionado.estado)}`}>
                      {documentoSeleccionado.estado}
                    </span>
                  </p>
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
              {documentoSeleccionado.firmas && (
                <section className="space-y-2">
                  <h4 className="font-semibold">Firmas</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {documentoSeleccionado.firmas.map((firma) => (
                      <div key={firma.id} className="text-center">
                        <p className="font-medium">{firma.tipo_firma}</p>
                        <p className="text-sm text-gray-500">
                          {firma.estado === 'FIRMADO' 
                            ? `Firmado el ${new Date(firma.fecha_firma).toLocaleDateString()}`
                            : 'Pendiente'
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Historial de cambios */}
              {documentoSeleccionado.historial && (
                <section className="space-y-2">
                  <h4 className="font-semibold">Historial de Cambios</h4>
                  <div className="space-y-2">
                    {documentoSeleccionado.historial.map((cambio) => (
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial;